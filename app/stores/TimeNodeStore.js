import { observable, computed } from 'mobx';
import CryptoJS from 'crypto-js';
import ethereumJsWallet from 'ethereumjs-wallet';
import EacWorker from 'worker-loader!../js/eac-worker.js';
import { EAC_WORKER_MESSAGE_TYPES } from '../js/eac-worker-message-types';
import { showNotification } from '../services/notification';
import { LOGGER_MSG_TYPES, LOG_TYPE } from '../lib/worker-logger.js';
import { isMyCryptoSigValid, isSignatureValid, parseSig, SIGNATURE_ERRORS } from '../lib/signature';
import { getDAYBalance } from '../lib/timenode-util';
import { Config } from '@ethereum-alarm-clock/timenode-core';
import { isRunningInElectron } from '../lib/electron-util';
import { Networks } from '../config/web3Config';

/*
 * TimeNode classification based on the number
 * of DAY tokens held by the owner.
 */
export class TIMENODE_STATUS {
  static MASTER_CHRONONODE = {
    name: 'Master ChronoNode',
    minBalance: 3333
  };
  static CHRONONODE = {
    name: 'ChronoNode',
    minBalance: 888
  };
  static TIMENODE = {
    name: 'TimeNode',
    minBalance: 333
  };
  static DISABLED = 'Disabled';
  static LOADING = 'Loading';
}

// 2 minute as milliseconds
const STATUS_UPDATE_INTERVAL = 2 * 60 * 1000;
const LOG_CAP = 1000;

export default class TimeNodeStore {
  @observable
  walletKeystore = '';
  @observable
  attachedDAYAccount = '';
  @observable
  scanningStarted = false;
  @observable
  claiming = false;

  @observable
  unlocked = false;

  @observable
  basicLogs = [];
  @observable
  detailedLogs = [];

  @observable
  logType = LOG_TYPE.BASIC;
  @computed
  get logs() {
    return this.logType === LOG_TYPE.BASIC ? this.basicLogs : this.detailedLogs;
  }

  @observable
  successfulExecutions = null;
  @observable
  failedExecutions = null;
  @observable
  successfulClaims = null;
  @observable
  failedClaims = null;
  @observable
  discovered = null;

  @observable
  balanceETH = null;
  @observable
  balanceDAY = null;
  @observable
  isTimeMint = null;

  @computed
  get nodeStatus() {
    const { MASTER_CHRONONODE, CHRONONODE, TIMENODE, DISABLED, LOADING } = TIMENODE_STATUS;

    if (this.balanceDAY === null) {
      return LOADING;
    }

    if (this.balanceDAY >= MASTER_CHRONONODE.minBalance) {
      return MASTER_CHRONONODE.name;
    } else if (this.balanceDAY >= CHRONONODE.minBalance) {
      return CHRONONODE.name;
    } else if (this.balanceDAY >= TIMENODE.minBalance || this.isTimeMint) {
      return TIMENODE.name;
    } else {
      return DISABLED;
    }
  }

  @observable
  bounties = null;
  @observable
  costs = null;
  @observable
  profit = null;

  @computed
  get economicStrategy() {
    const load = strategy => {
      const loaded = this._storageService.load(strategy);
      return loaded ? loaded : Config.DEFAULT_ECONOMIC_STRATEGY[strategy].toString();
    };

    return {
      maxDeposit: load('maxDeposit'),
      minBalance: load('minBalance'),
      minProfitability: load('minProfitability'),
      maxGasSubsidy: load('maxGasSubsidy')
    };
  }

  // If a TimeNode has selected a custom provider URL
  // it will be stored in this variable
  @observable
  customProviderUrl = null;
  @observable
  providerBlockNumber = null;

  netId = null;

  get network() {
    const customNetId = this.getCustomProvider().id;
    const currentNetId = customNetId ? customNetId : this._web3Service.network.id;
    if (!Networks[currentNetId]) {
      return this.getCustomProvider();
    }
    return Networks[currentNetId];
  }

  eacWorker = null;

  _keenStore = null;
  _storageService = null;
  _timeNodeStatusCheckIntervalRef = null;

  updateStatsInterval = null;
  updateBalancesInterval = null;
  getNetworkInfoInterval = null;

  constructor(eacService, web3Service, keenStore, storageService) {
    this._eacService = eacService;
    this._web3Service = web3Service;
    this._keenStore = keenStore;
    this._storageService = storageService;

    if (this._storageService.load('attachedDAYAccount') !== null)
      this.attachedDAYAccount = this._storageService.load('attachedDAYAccount');
    if (this._storageService.load('tn') !== null)
      this.walletKeystore = this._storageService.load('tn');
    if (this._storageService.load('claiming')) this.claiming = true;

    this.updateStats = this.updateStats.bind(this);
    this.updateBalances = this.updateBalances.bind(this);
    this.getNetworkInfo = this.getNetworkInfo.bind(this);
  }

  async unlockTimeNode(password) {
    if (this.walletKeystore && password) {
      this.unlocked = true;
      await this.startClient(this.walletKeystore, password);
      if (localStorage.getItem('isTimenodeScanning')) {
        await this.startScanning();
      }
    } else {
      this.unlocked = false;
      showNotification('Unable to unlock the TimeNode. Please try again');
    }
  }

  getWorkerOptions(keystore, keystorePassword) {
    return {
      network: this.network,
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
      economicStrategy: this.economicStrategy,
      claiming: this.claiming
    };
  }

  stopIntervals() {
    clearInterval(this.updateStatsInterval);
    clearInterval(this.updateBalancesInterval);
    clearInterval(this.getNetworkInfoInterval);
  }

  startIntervals() {
    this.updateStats();
    this.updateStatsInterval = setInterval(this.updateStats, 5000);

    this.updateBalances();
    this.updateBalancesInterval = setInterval(this.updateBalances, 15000);

    this.getNetworkInfo();
    this.getNetworkInfoInterval = setInterval(this.getNetworkInfo, 15000);
  }

  startWorker(options) {
    return new Promise(resolve => {
      this.eacWorker = new EacWorker();

      this.eacWorker.onmessage = async event => {
        const { type, value } = event.data;
        const getValuesIfInMessage = values => {
          values.forEach(value => {
            if (event.data[value] !== null) {
              this[value] = event.data[value];
            }
          });
        };

        switch (type) {
          case EAC_WORKER_MESSAGE_TYPES.STARTED:
            this.stopIntervals();
            this.startIntervals();

            resolve();
            break;

          case EAC_WORKER_MESSAGE_TYPES.LOG:
            this.handleLogMessage(value);
            break;

          case EAC_WORKER_MESSAGE_TYPES.UPDATE_STATS:
            getValuesIfInMessage([
              'bounties',
              'costs',
              'profit',
              'successfulClaims',
              'failedClaims',
              'successfulExecutions',
              'failedExecutions',
              'discovered'
            ]);
            break;

          case EAC_WORKER_MESSAGE_TYPES.UPDATE_BALANCES:
            getValuesIfInMessage(['balanceETH', 'balanceDAY', 'isTimeMint']);
            break;

          case EAC_WORKER_MESSAGE_TYPES.CLEAR_STATS:
            showNotification('Cleared the stats.', 'success');
            this.updateStats();
            break;

          case EAC_WORKER_MESSAGE_TYPES.GET_NETWORK_INFO:
            getValuesIfInMessage(['providerBlockNumber', 'netId']);
            if (this._keenStore.timeNodeSpecificProviderNetId != this.netId) {
              this._keenStore.setTimeNodeSpecificProviderNetId(this.netId);
              await this._keenStore.refreshActiveTimeNodesCount();
            }
            break;

          case EAC_WORKER_MESSAGE_TYPES.RECEIVED_CLAIMED_NOT_EXECUTED_TRANSACTIONS:
            this._getClaimedNotExecutedTransactionsPromiseResolver(event.data['transactions']);
            break;
        }
      };

      this.eacWorker.postMessage({
        type: EAC_WORKER_MESSAGE_TYPES.START,
        options
      });
    });
  }

  async getClaimedNotExecutedTransactions() {
    this.eacWorker.postMessage({
      type: EAC_WORKER_MESSAGE_TYPES.GET_CLAIMED_NOT_EXECUTED_TRANSACTIONS
    });

    return new Promise(resolve => {
      this._getClaimedNotExecutedTransactionsPromiseResolver = resolve;
    });
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
    if (this.scanningStarted) {
      this._keenStore.sendActiveTimeNodeEvent(this.getMyAddress(), this.getAttachedDAYAddress());
    }
  }

  async startScanning() {
    if (this.nodeStatus === TIMENODE_STATUS.DISABLED) {
      return;
    }

    this.scanningStarted = true;

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

    await this.startWorker(this.getWorkerOptions(keystore, password));
  }

  setKeyStore(keystore) {
    this.walletKeystore = keystore;
    this._storageService.save('tn', keystore);
  }

  setCustomProvider(id, endpoint) {
    this.customProviderUrl = endpoint;
    this._storageService.save('selectedProviderId', id);
    this._storageService.save('selectedProviderEndpoint', endpoint);

    this.stopScanning();

    // Reload the page so that the changes are refreshed
    if (isRunningInElectron()) {
      // Workaround for getting the Electron app to reload
      // since the regular reload results in a blank screen
      window.location.href = '/index.html';
    } else {
      window.location.reload();
    }
  }

  getCustomProvider() {
    return {
      id: parseInt(this._storageService.load('selectedProviderId')),
      endpoint: this._storageService.load('selectedProviderEndpoint')
    };
  }

  getMyAddress() {
    if (this.walletKeystore) {
      const ks = this.decrypt(this.walletKeystore);
      const address = JSON.parse(ks).address;

      if (address && address.indexOf('0x') === -1) {
        return '0x' + address;
      }

      return address;
    }

    return '';
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

  updateBalances() {
    this.sendMessageWorker(EAC_WORKER_MESSAGE_TYPES.UPDATE_BALANCES);
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
        this.network,
        this._web3Service.getWeb3FromProviderUrl(this.network.endpoint),
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
      if (error == `TypeError: Cannot read property 'dayTokenAddress' of undefined`) {
        showNotification('Unsupported custom provider.');
      } else {
        showNotification(error);
      }
    }
  }

  saveClaimingStrategy(economicStrategy) {
    if (this.claiming) {
      this._storageService.save('claiming', true);
    } else {
      this._storageService.remove('claiming');
    }

    const numberFromString = string => this._web3Service.web3.toWei(string, 'ether');
    for (let key of Object.keys(economicStrategy)) {
      if (economicStrategy[key]) {
        const value =
          key === 'maxGasSubsidy' ? economicStrategy[key] : numberFromString(economicStrategy[key]);
        this._storageService.save(key, value);
      } else {
        this._storageService.remove(key);
      }
    }
  }

  hasStorageItems(itemList) {
    for (let item of itemList) {
      if (!this._storageService.load(item)) {
        return false;
      }
    }
    return true;
  }

  async restart(password) {
    this.stopScanning();
    this.stopIntervals();
    this.eacWorker = null;
    await this.startClient(this.walletKeystore, password);
    await this.startScanning();
  }

  detachWallet() {
    this._storageService.remove('tn');
    this._storageService.remove('attachedDAYAccount');
    this.attachedDAYAccount = '';
    this.walletKeystore = '';
    this.stopScanning();
    this.eacWorker = null;
    showNotification('Your wallet has been detached.', 'success');
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
