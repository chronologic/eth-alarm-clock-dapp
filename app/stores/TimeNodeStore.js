import { observable } from 'mobx';
import MemoryLogger from '../lib/memory-logger';
import Cookies from 'js-cookie';
import CryptoJS from "crypto-js";
import ethJsUtil from 'ethereumjs-util';

export default class TimeNodeStore {
  @observable verifiedWallet = false;
  @observable hasDayTokens = false;
  @observable scanningStarted = false;
  @observable logs = [];

  constructor(eacService, web3Service) {
    this._eacService = eacService;
    this._web3Service = web3Service;

    if (Cookies.get("tn") && Cookies.get("tnp")) {
      this.startClient(Cookies.get("tn"), Cookies.get("tnp"))
    }
  }

  startScanning() {
    this.scanningStarted = true;
  }

  stopScanning() {
    this.scanningStarted = false;
  }

  encrypt(string) {
    return CryptoJS.AES.encrypt(string, "88e19245648ba7616099fbd6595d120d");
  }

  decrypt(string) {
    const bytes = CryptoJS.AES.decrypt(string.toString(), "88e19245648ba7616099fbd6595d120d")
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

    this.verifiedWallet = true;
    return true;
  }

  getMyAddress() {
    const ks = this.decrypt(Cookies.get("tn"));
    return "0x" + JSON.parse(ks).address;
  }

  checkHasDayTokens(sigObject) {
    const signature = JSON.parse(sigObject);
    const res = ethJsUtil.fromRpcSig(signature.sig);
    const msgBuffer = ethJsUtil.toBuffer(signature.msg)
    const msgHash = ethJsUtil.hashPersonalMessage(msgBuffer);
    const pub = ethJsUtil.ecrecover(msgHash, res.v, res.r, res.s);
    const addrBuf = ethJsUtil.pubToAddress(pub);
    const addr = ethJsUtil.bufferToHex(addrBuf);

    const hasTokens = (addr == this.getMyAddress());
    this.hasDayTokens = hasTokens;
    return hasTokens
  }

}