import { observable } from 'mobx';
import MemoryLogger from '../lib/memory-logger';

export default class TimeNodeStore {
  @observable verifiedWallet = false;
  @observable hasDayTokens = false;
  @observable scanningStarted = false;
  @observable logs = [];

  _eacService
  _web3Service

  startScanning() {
    this.scanningStarted = true;
  }

  stopScanning() {
    this.scanningStarted = false;
  }

  async startClient(keystore, password) {
    await this._web3Service.init();

    const web3 = this._web3Service.web3;

    const AlarmClient = this._eacService.AlarmClient;

    const program = {
      wallet: keystore,
      password: password,
      provider: 'http://localhost:8545',
      logfile: 'console',
      milliseconds: 4000,
      autostart: false,
      scan: 75,
      repl: false,
      browserDB: true
    }

    const logger = new MemoryLogger(program.logLevel);

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

  constructor(eacService, web3Service) {
    this._eacService = eacService;
    this._web3Service = web3Service;
  }
}