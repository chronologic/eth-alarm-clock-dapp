import { observable } from 'mobx';
import MemoryLogger from '../lib/memory-logger';
import Cookies from 'js-cookie';
import CryptoJS from "crypto-js";
import ethJsUtil from 'ethereumjs-util';

export default class TimeNodeStore {
  @observable hasWallet = false;
  @observable attachedDayAccount = false;
  @observable hasDayTokens = false;
  @observable scanningStarted = false;
  @observable logs = [];

  constructor(eacService, web3Service) {
    this._eacService = eacService;
    this._web3Service = web3Service;

    if (Cookies.get("attachedDayAccount")) this.attachedDayAccount = true;
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

    Cookies.set('tn', keystore);
    Cookies.set('tnp', password);
    Cookies.set('hasWallet', true);
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

  checkSignature(sigObject) {
    const signature = JSON.parse(sigObject);
    const res = ethJsUtil.fromRpcSig(signature.sig);
    const msgBuffer = ethJsUtil.toBuffer(signature.msg)
    const msgHash = ethJsUtil.hashPersonalMessage(msgBuffer);
    const pub = ethJsUtil.ecrecover(msgHash, res.v, res.r, res.s);
    const addrBuf = ethJsUtil.pubToAddress(pub);
    const addr = ethJsUtil.bufferToHex(addrBuf);

    return (addr == signature.address);
  }

  attachDayAccount(sigObject) {
    const attached = this.checkSignature(sigObject)
    Cookies.set('attachedDayAccount', attached);
    this.attachedDayAccount = attached;
  }

  hasCookies(cookiesList) {
    for (let cookie in cookiesList) {
      if (!Cookies.get(cookie)) return false;
    }
    return true;
  }

}