import { observable, computed } from 'mobx';
import CryptoJS from 'crypto-js';
import ethereumJsWallet from 'ethereumjs-wallet';

import EacWorker from 'worker-loader!../js/eac-worker.js';
import { EAC_WORKER_MESSAGE_TYPES } from '../js/eac-worker-message-types';
import { showNotification } from '../services/notification';
import { LOGGER_MSG_TYPES, LOG_TYPE } from '../lib/worker-logger.js';
import { isMyCryptoSigValid, isSignatureValid, parseSig, SIGNATURE_ERRORS } from '../lib/signature';
import { getDAYBalance } from '../lib/timenode-util';

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
  isTimeMint = null;

  @computed
  get nodeStatus() {
    if (this.balance >= 3333) {
      return TIMENODE_STATUS.MASTER_CHRONONODE;
    } else if (this.balance >= 888) {
      return TIMENODE_STATUS.CHRONONODE;
    } else if (this.balance >= 333 || this.isTimeMint) {
      return TIMENODE_STATUS.TIMENODE;
    } else {
      return TIMENODE_STATUS.DISABLED;
    }
  }

  @observable bounties = null;
  @observable costs = null;
  @observable profit = null;

  @computed
  get economicStrategy() {
    return {
      maxDeposit: this._storageService.load('maxDeposit'),
      minBalance: this._storageService.load('minBalance'),
      minProfitability: this._storageService.load('minProfitability')
    };
  }

  @observable nodeStatus = TIMENODE_STATUS.TIMENODE;

  // If a TimeNode has selected a custom provider URL
  // it will be stored in this variable
  @observable customProviderUrl = null;
  @observable providerBlockNumber = null;

  eacWorker = null;

  _keenStore = null;

  _timeNodeStatusCheckIntervalRef = null;

  _storageService = null;

  constructor(eacService, web3Service, keenStore, storageService) {
    this._eacService = eacService;
    this._web3Service = web3Service;
    this._keenStore = keenStore;
    this._storageService = storageService;

    if (this._storageService.load('attachedDAYAccount') !== null)
      this.attachedDAYAccount = this._storageService.load('attachedDAYAccount');
    if (this._storageService.load('tn') !== null)
      this.walletKeystore = this._storageService.load('tn');
  }

  unlockTimeNode(password) {
    if (this.walletKeystore && password) {
      this.startClient(this._storageService.load('tn'), password);
    } else {
      showNotification('Unable to unlock the TimeNode. Please try again');
    }
  }

  getWorkerOptions(keystore, keystorePassword) {
    return {
      network: this._web3Service.network,
      customProviderUrl: this.customProviderUrl,
      keystore: [this.decrypt(keystore)],
      keystorePassword,
      dayAccountAddress: this.getAttachedDAYAddress(),
      logfile: 'console',
      logLevel: 1,
      milliseconds: 15000,
      autostart: false,
      scan: 950, // ~65min on kovan
      repl: false,
      browserDB: true,
      economicStrategy: this.economicStrategy
    };
  }

  startWorker(options) {
    this.eacWorker = new EacWorker();

    this.eacWorker.onmessage = event => {
      const { type, value } = event.data;
      const getValuesIfInMessage = values => {
        values.forEach(value => {
          if (event.data[value] !== null) {
            this[value] = event.data[value];
          }
        });
      };

      if (type === EAC_WORKER_MESSAGE_TYPES.LOG) {
        this.handleLogMessage(value);
      } else if (type === EAC_WORKER_MESSAGE_TYPES.UPDATE_STATS) {
        getValuesIfInMessage(['bounties', 'costs', 'profit', 'executedTransactions']);
      } else if (type === EAC_WORKER_MESSAGE_TYPES.UPDATE_BALANCES) {
        getValuesIfInMessage(['balanceETH', 'balanceDAY', 'isTimeMint']);
      } else if (type === EAC_WORKER_MESSAGE_TYPES.CLEAR_STATS) {
        if (event.data.clearedStats) {
          showNotification('Cleared the stats.', 'success');
          this.updateStats();
        } else {
          showNotification('Unable to clear the stats.', 'danger', 3000);
        }
      } else if (type === EAC_WORKER_MESSAGE_TYPES.GET_NETWORK_INFO) {
        getValuesIfInMessage(['providerBlockNumber']);
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
    this._keenStore.sendActiveTimeNodeEvent(this.getMyAddress(), this.getAttachedDAYAddress());
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
    this._storageService.save('isTimenodeScanning', true);
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
    this._storageService.remove('isTimenodeScanning');
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
    this._storageService.save('tn', keystore);
  }

  getMyAddress() {
    if (this.walletKeystore) {
      const ks = this.decrypt(this.walletKeystore);
      return '0x' + JSON.parse(ks).address;
    } else {
      return '';
    }
  }

  getAttachedDAYAddress() {
    const encryptedAddress = this._storageService.load('attachedDAYAccount');
    if (encryptedAddress) {
      return this.decrypt(encryptedAddress);
    } else {
      return '';
    }
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

      const { balanceDAY, mintingPower } = await getDAYBalance(
        this._web3Service.network,
        this._web3Service.web3,
        signature.address
      );

      this.balanceDAY = balanceDAY.toNumber();
      this.isTimeMint = mintingPower > 0;

      const encryptedAttachedAddress = this.encrypt(signature.address);

      if (this.nodeStatus !== TIMENODE_STATUS.DISABLED) {
        this._storageService.save('attachedDAYAccount', encryptedAttachedAddress);
        this.attachedDAYAccount = encryptedAttachedAddress;
        showNotification('Success.', 'success');
      } else {
        showNotification('Not enough DAY tokens. Current balance: ' + balanceDAY.toString());
      }
    } catch (error) {
      showNotification(error);
    }
  }

  setEconomicStrategy(maxDeposit, minBalance, minProfitability) {
    const numberFromString = string => {
      if (string === '') {
        return null;
      }
      return parseFloat(string);
    };

    this._storageService.save('maxDeposit', numberFromString(maxDeposit));
    this._storageService.save('minBalance', numberFromString(minBalance));
    this._storageService.save('minProfitability', numberFromString(minProfitability));
  }

  hasStorageItems(itemList) {
    for (let item of itemList) {
      if (!this._storageService.load(item)) {
        return false;
      }
    }
    return true;
  }

  restart(password) {
    this.stopScanning();
    this.eacWorker = null;
    this.startClient(this.walletKeystore, password);
  }

  resetWallet() {
    this._storageService.remove('tn');
    this._storageService.remove('attachedDAYAccount');
    this.attachedDAYAccount = '';
    this.walletKeystore = '';
    this.stopScanning();
    this.eacWorker = null;
    showNotification('Your wallet has been reset.', 'success');
  }

  passwordMatchesKeystore(password) {
    try {
      ethereumJsWallet.fromV3(this.decrypt(this.walletKeystore), password, true);
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
