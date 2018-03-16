import Web3 from 'web3/index';
import EAC from 'eac.js-lib';
import EACJSClient from 'eac.js-client';
import { EAC_WORKER_MESSAGE_TYPES } from './eac-worker-message-types';
import WorkerLogger from '../lib/worker-logger';
import Loki from 'lokijs';
import LokiIndexedAdapter from 'lokijs/src/loki-indexed-adapter.js';
import BigNumber from 'bignumber.js';

const { Config, Scanner, StatsDB } = EACJSClient;

class EacWorker {
  alarmClient = null;
  browserDB = null;

  async start(options) {
    const provider = new Web3.providers.HttpProvider(process.env.HTTP_PROVIDER);

    const web3 = new Web3(provider);

    const eac = EAC(web3);

    const logger = new WorkerLogger(options.logLevel, this.logs);

    const persistenceAdapter = new LokiIndexedAdapter();
    this.browserDB = new Loki('stats.db', {
      adapter: persistenceAdapter,
      autoload: true,
      autosave: true,
      autosaveInterval: 4000
    });

    const statsDB = new StatsDB(web3, this.browserDB);

    const configOptions = {
      web3,
      eac,
      provider,
      scanSpread: options.scan,
      logfile: options.logfile,
      logLevel: options.logLevel,
      walletStore: JSON.parse(options.keystore.toLowerCase()),
      password: options.keystorePassword,
      autostart: options.autostart,
      logger,
      factory: await eac.requestFactory(),
      tracker: await eac.requestTracker()
    };

    this.config = await Config.create(configOptions);

    this.config.logger = logger;
    this.config.statsdb = statsDB;
    const addresses = await this.config.wallet.getAddresses();

    this.config.statsdb.initialize(addresses);
    this.alarmClient = new Scanner(
      options.milliseconds,
      this.config
    );

    this.updateStats();
  }

  async awaitAlarmClientInitialized () {
    if (!this.alarmClient || !this.alarmClient.start || typeof this.alarmClient.start !== 'function') {
      return new Promise((resolve) => {
        setTimeout(async () => {
          resolve(await this.awaitAlarmClientInitialized());
        }, 500);
      });
    }
    return true;
  }

  async startScanning() {
    await this.awaitAlarmClientInitialized();
    this.alarmClient.start();
  }

  stopScanning() {
    if (this.alarmClient) {
      this.alarmClient.stop();
    }
  }

  /*
   * Fetches the current stats of the Alarm Client
   * and updates the TimeNodeStore.
   */
  updateStats() {
    const stats = this.browserDB.getCollection('stats');

    let etherGain;
    let executedTransactions;

    // If it finds any data
    if (stats && stats.data && stats.data[0]) {
      const accountStats = stats.data[0];
      const startingEth = BigNumber(accountStats.startingEther);
      const currentEth = BigNumber(accountStats.currentEther);
      etherGain = currentEth.minus(startingEth).toString();
      executedTransactions = accountStats.executedTransactions;

    // Otherwise report the value as a zero
    } else {
      etherGain = null;
      executedTransactions = [];
    }

    postMessage({
      type: EAC_WORKER_MESSAGE_TYPES.UPDATE_STATS,
      etherGain: etherGain,
      executedTransactions: executedTransactions
    });
  }

  /*
   * Resets the stats saved in the IndexedDB.
   */
  clearStats() {
    var DBDeleteRequest = indexedDB.deleteDatabase('LokiAKV');

    DBDeleteRequest.onerror = function() {
      postMessage({
        type: EAC_WORKER_MESSAGE_TYPES.CLEAR_STATS,
        result: false
      });
    };

    DBDeleteRequest.onsuccess = function() {
      postMessage({
        type: EAC_WORKER_MESSAGE_TYPES.CLEAR_STATS,
        result: true
      });
    };

    DBDeleteRequest.onblocked = function () {
      postMessage({
        type: EAC_WORKER_MESSAGE_TYPES.CLEAR_STATS,
        result: false
      });
    };
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

    case EAC_WORKER_MESSAGE_TYPES.CLEAR_STATS:
      eacWorker.clearStats();
      break;
  }
};