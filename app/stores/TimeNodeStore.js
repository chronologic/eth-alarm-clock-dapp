import { observable } from 'mobx';
import Cookies from 'js-cookie';
import CryptoJS from 'crypto-js';
import ethJsUtil from 'ethereumjs-util';
import Bb from 'bluebird';
import ethereumJsWallet from 'ethereumjs-wallet';

import dayTokenABI from '../abi/dayTokenABI';
import EacWorker from 'worker-loader!../js/eac-worker.js';
import { EAC_WORKER_MESSAGE_TYPES } from '../js/eac-worker-message-types';

/*
 * TimeNode classification based on the number
 * of DAY tokens held by the owner.
 */
export class TIMENODE_STATUS {
  static MASTER_CHRONONODE  = 'Master ChronoNode';
  static CHRONONODE = 'ChronoNode';
  static TIMENODE = 'TimeNode';
  static DISABLED = 'Disabled';
}

// 1 minute as milliseconds
const STATUS_UPDATE_INTERVAL = 60 * 1000;

export default class TimeNodeStore {
  @observable hasWallet = false;
  @observable attachedDAYAccount = '';
  @observable scanningStarted = false;
  @observable executedCounters = [];
  @observable logs = [];

  @observable balanceETH = null;
  @observable balanceDAY = null;
  @observable claimedEth = null;

  @observable nodeStatus = TIMENODE_STATUS.TIMENODE;

  eacWorker = null;

  _keenStore = null;

  _timeNodeStatusCheckIntervalRef = null;

  constructor(eacService, web3Service, keenStore) {
    window.tnstore = this;
    this._eacService = eacService;
    this._web3Service = web3Service;
    this._keenStore = keenStore;

    if (Cookies.get('attachedDAYAccount')) this.attachedDAYAccount = Cookies.get('attachedDAYAccount');
    if (Cookies.get('hasWallet')) this.hasWallet = true;

    if (this.hasCookies(['tn', 'tnp'])) this.startClient(Cookies.get('tn'), Cookies.get('tnp'));
  }

  startWorker(keystore, password) {
    this.eacWorker = new EacWorker();

    const options = {
      wallet: this.decrypt(keystore),
      password: this.decrypt(password),
      logfile: 'console',
      logLevel: 1,
      milliseconds: 4000,
      autostart: false,
      scan: 75,
      repl: false,
      browserDB: true,
    };

    this.eacWorker.onmessage = (event) => {
      const { type } = event.data;

      if (type === EAC_WORKER_MESSAGE_TYPES.LOG) {
        this.logs.push(event.data.value);
      } else if (type === EAC_WORKER_MESSAGE_TYPES.UPDATE_STATS) {
        this.claimedEth = event.data.etherGain;
        this.executedCounters.push(event.data.executedCounter);
      }
    };

    this.eacWorker.postMessage({
      type: EAC_WORKER_MESSAGE_TYPES.START,
      options
    });

    this.updateStats();
  }

  sendActiveTimeNodeEvent() {
    this._keenStore.sendActiveTimeNodeEvent(this.getMyAddress(), this.getMyAttachedAddress());
  }

  startScanning() {
    this.scanningStarted = true;

    this.sendActiveTimeNodeEvent();

    this._timeNodeStatusCheckIntervalRef = setInterval(() => this.sendActiveTimeNodeEvent(), STATUS_UPDATE_INTERVAL);

    this.eacWorker.postMessage({
      type: EAC_WORKER_MESSAGE_TYPES.START_SCANNING
    });

    this.updateStats();
  }

  stopScanning() {
    this.scanningStarted = false;

    clearInterval(this._timeNodeStatusCheckIntervalRef);

    this.eacWorker.postMessage({
      type: EAC_WORKER_MESSAGE_TYPES.STOP_SCANNING
    });
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

    this.startWorker(keystore, password);

    this.setCookie('tn', keystore);
    this.setCookie('tnp', password);
    this.setCookie('hasWallet', true);
    this.hasWallet = true;
  }

  getMyAddress() {
    const encryptedAddress = Cookies.get('tn');
    if (encryptedAddress) {
      const ks = this.decrypt(encryptedAddress);
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
    const web3 = this._web3Service.web3;

    const balance = await this._eacService.Util.getBalance(address);
    const balanceEther = parseInt(web3.fromWei(balance, 'ether'));

    this.balanceETH = balanceEther;
    return balanceEther;
  }


  async getDAYBalance(address = this.getMyAttachedAddress()) {
    await this._web3Service.init();
    const web3 = this._web3Service.web3;

    const contract = web3.eth.contract(dayTokenABI).at(process.env.DAY_FAUCET_ADDRESS);
    const balanceNum = await Bb.fromCallback((callback) => {
      contract.balanceOf.call(address, callback);
    });

    const balance = balanceNum.div(10**18).toNumber().toFixed(2);

    this.updateNodeStatus(balance);
    this.balanceDAY = balance;

    return balance;
  }

  updateStats() {
    this.eacWorker.postMessage({
      type: EAC_WORKER_MESSAGE_TYPES.UPDATE_STATS
    });
  }

  updateNodeStatus(balance) {
    if (balance >= 3333) {
      this.nodeStatus = TIMENODE_STATUS.MASTER_CHRONONODE;
    } else if (balance >= 888) {
      this.nodeStatus = TIMENODE_STATUS.CHRONONODE;
    } else if (balance >= 333) {
      this.nodeStatus = TIMENODE_STATUS.TIMENODE;
    } else {
      this.nodeStatus = TIMENODE_STATUS.DISABLED;
    }

    // TO-DO: TimeMint check
  }

  /*
   * Checks if the signature from MyEtherWallet
   * (inputted by the user) is valid.
   */
  isSignatureValid(sigObject) {
    const signature = JSON.parse(sigObject);

    const message = Buffer.from(signature.msg);

    const msgHash = ethJsUtil.hashPersonalMessage(message);
    const res = ethJsUtil.fromRpcSig(signature.sig);
    const pub = ethJsUtil.ecrecover(msgHash, res.v, res.r, res.s);
    const addrBuf = ethJsUtil.pubToAddress(pub);
    const addr = ethJsUtil.bufferToHex(addrBuf);

    const isValid = (addr === signature.address) && this._eacService.Util.checkValidAddress(addr);
    return { isValid, addr };
  }

  /*
   * Attaches a DAY-token-holding account to the session
   * as a proof-of-ownership of DAY tokens.
   * If it contains DAY tokens, it allows the usage of TimeNodes.
   */
  async attachDayAccount(sigObject) {
    const { isValid, addr } = this.isSignatureValid(sigObject);
    const numDAYTokens = await this.getDAYBalance(addr);
    const encryptedAttachedAddress = this.encrypt(addr);

    if (isValid) {
      if (this.nodeStatus !== TIMENODE_STATUS.DISABLED) {
        this.setCookie('attachedDAYAccount', encryptedAttachedAddress);
        this.attachedDAYAccount = encryptedAttachedAddress;
        alert('Success.');
      } else {
        alert('Not enough DAY tokens. Current balance: ' + numDAYTokens.toString());
      }
    } else {
      alert('Invalid signature.');
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

  checkPasswordMatchesKeystore(keystore, password) {
    try {
      ethereumJsWallet.fromV3(this.decrypt(keystore), this.decrypt(password), true);
      return { matches: true, msg: 'Success.' };
    } catch (e) {
      return { matches: false, msg: e };
    }
  }

}