import { observable } from 'mobx';
import MemoryLogger from '../lib/memory-logger';
import Cookies from 'js-cookie';
import CryptoJS from "crypto-js";

export default class TimeNodeStore {
  @observable verifiedWallet = false;
  @observable hasDayTokens = false;
  @observable scanningStarted = false;
  @observable logs = [];

  constructor(eacService, web3Service) {
    this._eacService = eacService;
    this._web3Service = web3Service;

    // This is fundamentally insecure - replace later
    if (Cookies.get("keystore") && Cookies.get("password")) {
      this.startClient(Cookies.get("keystore"), Cookies.get("password"))
    }
  }

  startScanning() {
    this.scanningStarted = true;
  }

  stopScanning() {
    this.scanningStarted = false;
  }

  encrypt(string) {
    return CryptoJS.AES.encrypt(string, "123456789");
  }

  decrypt(string) {
    const bytes = CryptoJS.AES.decrypt(string.toString(), "123456789")
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

}