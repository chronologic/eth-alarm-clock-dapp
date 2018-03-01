import Web3 from 'web3/index';
import EAC from 'eac.js-lib';
import EACJSClient from 'eac.js-client';
import { EAC_WORKER_MESSAGE_TYPES } from './eac-worker-message-types';
import WorkerLogger from '../lib/worker-logger';
import Loki from 'lokijs';

const { Config, Scanner, StatsDB } = EACJSClient;

class EacWorker {
  alarmClient = null;
  browserDB = null;

  async start(options) {
    const provider = new Web3.providers.HttpProvider(process.env.HTTP_PROVIDER);

    const web3 = new Web3(provider);

    const eac = EAC(web3);

    const logger = new WorkerLogger(options.logLevel, this.logs);

    this.browserDB = new Loki('stats.db');

    const statsDB = new StatsDB(web3, this.browserDB);

    const configOptions = {
      web3,
      eac,
      provider,
      scanSpread: options.scan,
      logfile: options.logfile,
      logLevel: options.logLevel,
      walletFile: JSON.parse(options.keystore.toLowerCase()),
      password: options.keystorePassword,
      autostart: options.autostart,
      logger,
      factory: await eac.requestFactory(),
      tracker: await eac.requestTracker()
    };

    this.config = await Config.create(configOptions);

    this.config.logger = logger;
    this.config.statsdb = statsDB;

    this.config.statsdb.initialize(this.config.wallet.getAddresses());
    this.alarmClient = new Scanner(
      options.milliseconds,
      this.config
    );
  }

  startScanning() {
    this.alarmClient.start();
  }

  stopScanning() {
    this.alarmClient.stop();
  }

  /*
   * Fetches the current stats of the Alarm Client
   * And updates the TimeNodeStore.
   */
  updateStats() {
    const stats = this.browserDB.getCollection('stats');

    let etherGain;
    let executedTransactions;

    // If it finds any data
    if (stats && stats.data && stats.data[0]) {
      const accountStats = stats.data[0];
      etherGain = accountStats.currentEther.minus(accountStats.startingEther).toNumber();
      executedTransactions = accountStats.executedTransactions;

    // Otherwise report the value as a zero
    } else {
      etherGain = 0;
      executedTransactions = [];
    }

    postMessage({
      type: EAC_WORKER_MESSAGE_TYPES.UPDATE_STATS,
      etherGain: etherGain,
      executedTransactions: executedTransactions
    });
  }
}

let eacWorker = null;

onmessage = async function(event) {
  const type = event.data.type;

  switch (type) {
    case EAC_WORKER_MESSAGE_TYPES.START:
      eacWorker = new EacWorker();
      eacWorker.start(event.data.options);
      break;

    case EAC_WORKER_MESSAGE_TYPES.START_SCANNING:
      eacWorker.startScanning();
      break;

    case EAC_WORKER_MESSAGE_TYPES.STOP_SCANNING:
      eacWorker.stopScanning();
      break;

    case EAC_WORKER_MESSAGE_TYPES.UPDATE_STATS:
      eacWorker.updateStats();
      break;
  }
};