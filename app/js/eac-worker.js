import Web3 from 'web3/index';
import Web3WsProvider from 'web3-providers-ws';
import EAC from 'eac.js-lib';
import EACJSClient from 'eac.js-client';
import Loki from 'lokijs';
import LokiIndexedAdapter from 'lokijs/src/loki-indexed-adapter.js';
import BigNumber from 'bignumber.js';
import { EAC_WORKER_MESSAGE_TYPES } from './eac-worker-message-types';
import WorkerLogger from '../lib/worker-logger';

const { Config, Scanner, StatsDB } = EACJSClient;

class EacWorker {
  alarmClient = null;
  statsDB = null;

  async start(options) {
    const network = options.network;
    let provider = null;

    if (network) {
      provider = (() => {
        if ( new RegExp('ws://').test(network.endpoint) || new RegExp('wss://').test(network.endpoint)) {
          const ws = new Web3WsProvider(`${network.endpoint}`);
          ws.__proto__.sendAsync = ws.__proto__.send;
          return ws;
        } else if ( new RegExp('http://').test(network.endpoint) || new RegExp('https://').test(network.endpoint)) {
          return new Web3.providers.HttpProvider(`${network.endpoint}`);
        }
      })();
    } else {
      provider = new Web3.providers.HttpProvider(process.env.HTTP_PROVIDER);
    }

    const web3 = new Web3(provider);

    const eac = EAC(web3);

    const logger = new WorkerLogger(options.logLevel, this.logs);

    const persistenceAdapter = new LokiIndexedAdapter(options.network.id);
    const browserDB = new Loki('stats.db', {
      adapter: persistenceAdapter,
      autoload: true,
      autosave: true,
      autosaveInterval: 4000
    });

    const configOptions = {
      web3,
      eac,
      provider,
      scanSpread: options.scan,
      logfile: options.logfile,
      logLevel: options.logLevel,
      walletStores: options.keystore,
      password: options.keystorePassword,
      autostart: options.autostart,
      logger,
      factory: await eac.requestFactory(),
      tracker: await eac.requestTracker()
    };

    this.config = await Config.create(configOptions);

    this.config.logger = logger;
    this.config.statsdb = new StatsDB(web3, browserDB);
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
    let etherGain;
    let executedTransactions;

    if (this.config) {
      const stats = this.config.statsdb.getStats();

      const accountStats = stats[0];
      const startingEth = BigNumber(accountStats.startingEther);
      const currentEth = BigNumber(accountStats.currentEther);
      etherGain = currentEth.minus(startingEth).toString();
      executedTransactions = accountStats.executedTransactions;
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