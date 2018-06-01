import { observable, computed } from 'mobx';
import Cookies from 'js-cookie';
import CryptoJS from 'crypto-js';
import Bb from 'bluebird';
import ethereumJsWallet from 'ethereumjs-wallet';

import EacWorker from 'worker-loader!../js/eac-worker.js';
import { EAC_WORKER_MESSAGE_TYPES } from '../js/eac-worker-message-types';
import { showNotification } from '../services/notification';
import { LOGGER_MSG_TYPES, LOG_TYPE } from '../lib/worker-logger.js';
import { isMyCryptoSigValid, isSignatureValid, parseSig, SIGNATURE_ERRORS } from '../lib/signature';

/*
 * TimeNode classification based on the number
 * of DAY tokens held by the owner.
 */
export class TIMENODE_STATUS {
  static MASTER_CHRONONODE = 'Master ChronoNode';
  static CHRONONODE = 'ChronoNode';
  static TIMENODE = 'TimeNode';
  static DISABLED = 'Disabled';
}

// 2 minute as milliseconds
const STATUS_UPDATE_INTERVAL = 2 * 60 * 1000;
const LOG_CAP = 1000;

export default class TimeNodeStore {
  @observable walletKeystore = '';
  @observable attachedDAYAccount = '';
  @observable scanningStarted = false;

  @observable basicLogs = [];
  @observable detailedLogs = [];

  @observable logType = LOG_TYPE.BASIC;
  @computed
  get logs() {
    return this.logType === LOG_TYPE.BASIC ? this.basicLogs : this.detailedLogs;
  }

  @observable executedTransactions = [];
  @observable balanceETH = null;
  @observable balanceDAY = null;

  @observable bounties = null;
  @observable costs = null;
  @observable profit = null;

  @observable nodeStatus = TIMENODE_STATUS.TIMENODE;

  // If a TimeNode has selected a custom provider URL
  // it will be stored in this variable
  @observable customProviderUrl = null;
  @observable providerBlockNumber = null;

  eacWorker = null;

  _keenStore = null;

  _timeNodeStatusCheckIntervalRef = null;

  constructor(eacService, web3Service, keenStore) {
    this._eacService = eacService;
    this._web3Service = web3Service;
    this._keenStore = keenStore;

    if (Cookies.get('attachedDAYAccount'))
      this.attachedDAYAccount = Cookies.get('attachedDAYAccount');
    if (Cookies.get('tn')) this.walletKeystore = Cookies.get('tn');
  }

  unlockTimeNode(password) {
    if (this.walletKeystore && password) {
      this.startClient(Cookies.get('tn'), password);
    } else {
      showNotification('Unable to unlock the TimeNode. Please try again');
    }
    return;
  }

  getWorkerOptions(keystore, keystorePassword) {
    return {
      network: this._web3Service.network,
      customProviderUrl: this.customProviderUrl,
      keystore: [this.decrypt(keystore)],
      keystorePassword,
      logfile: 'console',
      logLevel: 1,
      milliseconds: 15000,
      autostart: false,
      scan: 950, // ~65min on kovan
      repl: false,
      browserDB: true
    };
  }

  startWorker(options) {
    this.eacWorker = new EacWorker();

    this.eacWorker.onmessage = event => {
      const { type } = event.data;

      if (type === EAC_WORKER_MESSAGE_TYPES.LOG) {
        this.handleLogMessage(event.data.value);
      } else if (type === EAC_WORKER_MESSAGE_TYPES.UPDATE_STATS) {
        if (event.data.bounties !== null) this.bounties = event.data.bounties;
        if (event.data.costs !== null) this.costs = event.data.costs;
        if (event.data.profit !== null) this.profit = event.data.profit;
        this.executedTransactions = event.data.executedTransactions;
      } else if (type === EAC_WORKER_MESSAGE_TYPES.CLEAR_STATS) {
        if (event.data.result) {
          showNotification('Cleared the stats.', 'success');
          this.updateStats();
        } else {
          showNotification('Unable to clear the stats.', 'danger', 3000);
        }
      } else if (type === EAC_WORKER_MESSAGE_TYPES.GET_NETWORK_INFO) {
        this.providerBlockNumber = event.data.blockNumber;
      }
    };

    this.eacWorker.postMessage({
      type: EAC_WORKER_MESSAGE_TYPES.START,
      options
    });

    this.updateStats();
  }

  pushToLog(logs, log) {
    if (logs.length === LOG_CAP) logs.shift();
    logs.push(log);
  }

  handleLogMessage(log) {
    if (log.type === LOGGER_MSG_TYPES.CACHE) return;
    if (log.type !== LOGGER_MSG_TYPES.DEBUG) {
      this.pushToLog(this.basicLogs, log);
    }

    this.pushToLog(this.detailedLogs, log);
  }

  sendActiveTimeNodeEvent() {
    this._keenStore.sendActiveTimeNodeEvent(this.getMyAddress(), this.getMyAttachedAddress());
  }

  async awaitScanReady() {
    if (
      !this.eacWorker ||
      this.eacWorker === null ||
      !this._keenStore ||
      this._keenStore === null
    ) {
      return new Promise(resolve => {
        setTimeout(async () => {
          resolve(await this.awaitScanReady());
        }, 500);
      });
    }
    return true;
  }

  async startScanning() {
    if (this.nodeStatus === TIMENODE_STATUS.DISABLED) {
      return;
    }

    this.scanningStarted = true;

    await this.awaitScanReady();

    this.sendActiveTimeNodeEvent();

    this._timeNodeStatusCheckIntervalRef = setInterval(
      () => this.sendActiveTimeNodeEvent(),
      STATUS_UPDATE_INTERVAL
    );

    this.eacWorker.postMessage({
      type: EAC_WORKER_MESSAGE_TYPES.START_SCANNING
    });

    this.updateStats();
    Cookies.set('isTimenodeScanning', true, { expires: 30 });
  }

  stopScanning() {
    this.scanningStarted = false;

    if (this._timeNodeStatusCheckIntervalRef) {
      clearInterval(this._timeNodeStatusCheckIntervalRef);
    }

    if (this.eacWorker) {
      this.eacWorker.postMessage({
        type: EAC_WORKER_MESSAGE_TYPES.STOP_SCANNING
      });
    }
    Cookies.remove('isTimenodeScanning');
  }

  encrypt(message) {
    return CryptoJS.AES.encrypt(message, '88e19245648ba7616099fbd6595d120d');
  }

  decrypt(message) {
    if (typeof message !== 'string') {
      message = message.toString();
    }
    const bytes = CryptoJS.AES.decrypt(message, '88e19245648ba7616099fbd6595d120d');
    return bytes.toString(CryptoJS.enc.Utf8);
  }

  /*
   * Starts the timenode client.
   * Immediately starts executing transactions and outputting logs.
   */
  async startClient(keystore, password) {
    await this._web3Service.init();

    this.startWorker(this.getWorkerOptions(keystore, password));
  }

  setKeyStore(keystore) {
    this.walletKeystore = keystore;
    this.setCookie('tn', keystore);
  }

  getMyAddress() {
    if (this.walletKeystore) {
      const ks = this.decrypt(this.walletKeystore);
      return '0x' + JSON.parse(ks).address;
    } else {
      return '';
    }
  }

  getMyAttachedAddress() {
    const encryptedAddress = Cookies.get('attachedDAYAccount');
    if (encryptedAddress) {
      return this.decrypt(encryptedAddress);
    } else {
      return '';
    }
  }

  async getBalance(address = this.getMyAddress()) {
    const balance = await this._eacService.Util.getBalance(address);

    this.balanceETH = balance
      .div(10 ** 18)
      .toNumber()
      .toFixed(2);

    return this.balanceETH;
  }

  async getDAYBalance(address = this.getMyAttachedAddress()) {
    await this._web3Service.init();
    const web3 = this._web3Service.web3;

    const dayTokenAddress = this._web3Service.network.dayTokenAddress;
    const dayTokenAbi = this._web3Service.network.dayTokenAbi;

    const contract = web3.eth.contract(dayTokenAbi).at(dayTokenAddress);

    const balanceNum = await Bb.fromCallback(callback => contract.balanceOf(address, callback));
    const balance = balanceNum
      .div(10 ** 18)
      .toNumber()
      .toFixed(2);

    const mintingPower =
      process.env.NODE_ENV === 'docker'
        ? 0
        : await Bb.fromCallback(callback => {
            contract.getMintingPowerByAddress(address, callback);
          });

    this.nodeStatus = this.getNodeStatus(balance, mintingPower > 0);
    this.balanceDAY = balance;

    if (this.nodeStatus === TIMENODE_STATUS.DISABLED) {
      this.stopScanning();
    }

    return balance;
  }

  sendMessageWorker(messageType) {
    if (this.eacWorker) {
      this.eacWorker.postMessage({
        type: messageType
      });
    }
  }

  getNetworkInfo() {
    this.sendMessageWorker(EAC_WORKER_MESSAGE_TYPES.GET_NETWORK_INFO);
  }

  updateStats() {
    this.sendMessageWorker(EAC_WORKER_MESSAGE_TYPES.UPDATE_STATS);
  }

  clearStats() {
    this.sendMessageWorker(EAC_WORKER_MESSAGE_TYPES.CLEAR_STATS);
    this.basicLogs = [];
    this.detailedLogs = [];
  }

  getNodeStatus(balance, isTimeMint) {
    if (balance >= 3333) {
      return TIMENODE_STATUS.MASTER_CHRONONODE;
    } else if (balance >= 888) {
      return TIMENODE_STATUS.CHRONONODE;
    } else if (balance >= 333 || isTimeMint) {
      return TIMENODE_STATUS.TIMENODE;
    } else {
      return TIMENODE_STATUS.DISABLED;
    }
  }

  /*
   * Attaches a DAY-token-holding account to the session
   * as a proof-of-ownership of DAY tokens.
   * If it contains DAY tokens, it allows the usage of TimeNodes.
   */
  async attachDayAccount(sigObject) {
    try {
      const signature = parseSig(sigObject);

      // First check using default sig check - if doesn't work use MyCrypto's
      const validSig = isSignatureValid(signature) ? true : isMyCryptoSigValid(signature);

      if (!validSig) throw SIGNATURE_ERRORS.INVALID_SIG;

      const numDAYTokens = await this.getDAYBalance(signature.address);
      const encryptedAttachedAddress = this.encrypt(signature.address);

      if (this.nodeStatus !== TIMENODE_STATUS.DISABLED) {
        this.setCookie('attachedDAYAccount', encryptedAttachedAddress);
        this.attachedDAYAccount = encryptedAttachedAddress;
        showNotification('Success.', 'success');
      } else {
        showNotification('Not enough DAY tokens. Current balance: ' + numDAYTokens.toString());
      }
    } catch (error) {
      showNotification(error);
    }
  }

  hasCookies(cookiesList) {
    for (let cookie of cookiesList) {
      if (!Cookies.get(cookie)) {
        return false;
      }
    }
    return true;
  }

  setCookie(key, value) {
    Cookies.set(key, value, { expires: 30 });
  }

  resetWallet() {
    Cookies.remove('tn');
    Cookies.remove('attachedDAYAccount');
    this.attachedDAYAccount = '';
    this.walletKeystore = '';
    showNotification('Your wallet has been reset.', 'success');
  }

  passwordMatchesKeystore(password) {
    try {
      ethereumJsWallet.fromV3(this.decrypt(this.walletKeystore), this.decrypt(password), true);
      showNotification('Success.', 'success');
      return true;
    } catch (e) {
      if (e.message === 'Key derivation failed - possibly wrong passphrase') {
        showNotification('Please enter a valid password.');
      } else {
        showNotification(e);
      }
      return false;
    }
  }
}
