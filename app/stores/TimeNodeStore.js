import { observable } from 'mobx';
import MemoryLogger from '../lib/memory-logger';
import Cookies from 'js-cookie';
import CryptoJS from "crypto-js";
import ethJsUtil from 'ethereumjs-util';
import dayTokenABI from '../abi/dayTokenABI';
import Bb from 'bluebird';

export class TIMENODE_STATUS {
  static MASTER_CHRONONODE  = 'Master ChronoNode';
  static CHRONONODE = 'ChronoNode';
  static TIMENODE = 'TimeNode';
  static DISABLED = 'Disabled';
}

export default class TimeNodeStore {
  @observable hasWallet = false;
  @observable attachedDAYAccount = '';
  @observable hasDayTokens = false;
  @observable scanningStarted = false;
  @observable logs = [];

  @observable balanceETH = 0;
  @observable balanceDAY = 0;

  @observable nodeStatus = null;

  constructor(eacService, web3Service) {
    this._eacService = eacService;
    this._web3Service = web3Service;

    if (Cookies.get("attachedDAYAccount")) this.attachedDAYAccount = true;
    if (Cookies.get("hasWallet")) this.hasWallet = true;

    if (this.hasCookies(["tn", "tnp"])) this.startClient(Cookies.get("tn"), Cookies.get("tnp"));
  }

  startScanning() {
    this.scanningStarted = true;
  }

  stopScanning() {
    this.scanningStarted = false;
  }

  encrypt(message) {
    return CryptoJS.AES.encrypt(message, "88e19245648ba7616099fbd6595d120d");
  }

  decrypt(message) {
    if (typeof message !== "string") {
      message = message.toString();
    }
    const bytes = CryptoJS.AES.decrypt(message, "88e19245648ba7616099fbd6595d120d")
    return bytes.toString(CryptoJS.enc.Utf8);
  }

  async startClient(keystore, password) {
    await this._web3Service.init();

    const web3 = this._web3Service.web3;

    const AlarmClient = this._eacService.AlarmClient;

    const program = {
      wallet: this.decrypt(keystore),
      password: this.decrypt(password),
      provider: 'http://localhost:8545',
      logfile: 'console',
      logLevel: 1,
      milliseconds: 4000,
      autostart: false,
      scan: 75,
      repl: false,
      browserDB: true
    }

    const logger = new MemoryLogger(program.logLevel, this.logs);

    await AlarmClient(
      web3,
      this._eacService,
      program.provider,
      program.scan,
      program.milliseconds,
      program.logfile,
      program.logLevel,
      program.wallet,
      program.password,
      program.autostart,
      logger,
      program.repl,
      program.browserDB
    ).catch((err) => {
      throw err
    });

    this.setCookie('tn', keystore);
    this.setCookie('tnp', password);
    this.setCookie('hasWallet', true);
    this.hasWallet = true;
  }

  getMyAddress() {
    const encryptedAddress = Cookies.get("tn");
    if (encryptedAddress) {
      const ks = this.decrypt(encryptedAddress);
      return "0x" + JSON.parse(ks).address;
    } else {
      return "Unable to fetch the address."
    }
  }

  async getBalance(address = this.cookieToAddress()) {
    await this._web3Service.init();
    const web3 = this._web3Service.web3;

    const balanceNum = await Bb.fromCallback((callback) => {
      web3.eth.getBalance(address, callback);
    });

    const balance = parseInt(balanceNum);
    this.balanceETH = balance;

    return balance;
  }

  async getDAYBalance(address = this.cookieToAddress()) {
    await this._web3Service.init();
    const web3 = this._web3Service.web3;

    const contract = web3.eth.contract(dayTokenABI).at(contract);
    const balanceNum = await Bb.fromCallback((callback) => {
      contract.balanceOf.call(address, callback);
    });

    const balance = parseInt(balanceNum);

    this.updateNodeStatus(balance)
    this.balanceDAY = balance;

    return balance;
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
  }

  isSignatureValid(sigObject) {
    const signature = JSON.parse(sigObject);
    const res = ethJsUtil.fromRpcSig(signature.sig);
    const msgBuffer = ethJsUtil.toBuffer(signature.msg)
    const msgHash = ethJsUtil.hashPersonalMessage(msgBuffer);
    const pub = ethJsUtil.ecrecover(msgHash, res.v, res.r, res.s);
    const addrBuf = ethJsUtil.pubToAddress(pub);
    const addr = ethJsUtil.bufferToHex(addrBuf);

    const isValid = (addr == signature.address);
    return { isValid, addr };
  }

  async attachDayAccount(sigObject) {
    const { isValid, addr } = this.isSignatureValid(sigObject)
    const numDAYTokens = await this.getDAYBalance(addr);
    const encryptedAttachedAddress = this.encrypt(addr);

    if (isValid && numDAYTokens > 0) {
      this.setCookie('attachedDAYAccount', encryptedAttachedAddress);
      this.attachedDAYAccount = encryptedAttachedAddress;
    } else {
      alert("Not enough DAY tokens. Current balance: " + numDAYTokens.toString());
    }
  }

  hasCookies(cookiesList) {
    for (let cookie in cookiesList) {
      if (!Cookies.get(cookie)) return false;
    }
    return true;
  }

  setCookie(key, value) {
    Cookies.set(key, value, { expires: 30 });
  }

  cookieToAddress() {
    return "0x" + JSON.parse(this.decrypt(Cookies.get("tn"))).address;
  }

}