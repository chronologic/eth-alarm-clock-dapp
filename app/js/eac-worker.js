import Web3 from 'web3/index';
import Web3WsProvider from 'web3-providers-ws';
import EAC from 'eac.js-lib';
import Bb from 'bluebird';
import Loki from 'lokijs';
import LokiIndexedAdapter from 'lokijs/src/loki-indexed-adapter.js';
import { EAC_WORKER_MESSAGE_TYPES } from './eac-worker-message-types';
import WorkerLogger from '../lib/worker-logger';

import { TimeNode, Config, StatsDB } from 'eac.js-client';

class EacWorker {
  timenode = null;

  async start(options) {
    const { customProviderUrl, network } = options;

    const providerUrl = customProviderUrl !== null ? customProviderUrl : network.endpoint;
    let provider = null;

    if (network) {
      provider = (() => {
        if (new RegExp('ws://').test(providerUrl) || new RegExp('wss://').test(providerUrl)) {
          const ws = new Web3WsProvider(`${providerUrl}`);
          ws.__proto__.sendAsync = ws.__proto__.send;
          return ws;
        } else if (
          new RegExp('http://').test(providerUrl) ||
          new RegExp('https://').test(providerUrl)
        ) {
          return new Web3.providers.HttpProvider(`${providerUrl}`);
        }
      })();
    } else {
      provider = new Web3.providers.HttpProvider(process.env.HTTP_PROVIDER);
    }

    this.web3 = new Web3(provider);
    const eac = EAC(this.web3);

    const logger = new WorkerLogger(options.logLevel, this.logs);

    const netId = await Bb.fromCallback(callback => this.web3.version.getNetwork(callback));
    const persistenceAdapter = new LokiIndexedAdapter(netId);
    const browserDB = new Loki('stats.db', {
      adapter: persistenceAdapter,
      autoload: true,
      autosave: true,
      autosaveInterval: 4000
    });

    const configOptions = {
      web3: this.web3,
      eac,
      provider,
      scanSpread: options.scan,
      logfile: options.logfile,
      logLevel: options.logLevel,
      walletStores: options.keystore,
      password: options.keystorePassword,
      autostart: options.autostart,
      logger,
      factory: await eac.requestFactory()
    };

    this.config = new Config(configOptions);

    this.config.logger = logger;
    this.config.statsDb = new StatsDB(this.web3, browserDB);
    const addresses = await this.config.wallet.getAddresses();

    this.config.statsDb.initialize(addresses);
    this.timenode = new TimeNode(this.config);

    this.updateStats();
    this.getNetworkInfo();
  }

  async awaitTimeNodeInitialized() {
    if (
      !this.timenode ||
      !this.timenode.startScanning ||
      typeof this.timenode.startScanning !== 'function'
    ) {
      return new Promise(resolve => {
        setTimeout(async () => {
          resolve(await this.awaitTimeNodeInitialized());
        }, 500);
      });
    }
    return true;
  }

  async startScanning() {
    await this.awaitTimeNodeInitialized();
    this.timenode.startScanning();
  }

  stopScanning() {
    if (this.timenode) {
      this.timenode.stopScanning();
    }
  }

  /*
   * Fetches info about the network provider
   * to which the worker is connected to.
   */
  async getNetworkInfo() {
    const blockNumber = await Bb.fromCallback(callback => this.web3.eth.getBlockNumber(callback));

    postMessage({
      type: EAC_WORKER_MESSAGE_TYPES.GET_NETWORK_INFO,
      blockNumber
    });
  }

  /*
   * Fetches the current stats of the Alarm Client
   * and updates the TimeNodeStore.
   */
  updateStats() {
    const empty = {
      bounties: null,
      costs: null,
      executedTransactions: []
    };

    let { bounties, costs, executedTransactions } = this.config
      ? this.config.statsDb.getStats()[0]
      : empty;

    let profit = null;

    if (bounties !== null && costs !== null) {
      const weiToEth = amount => {
        const amountEth = this.web3.fromWei(amount, 'ether');
        return Math.round(amountEth * 1000) / 1000;
      };

      profit = weiToEth(bounties.minus(costs));
      bounties = weiToEth(bounties);
      costs = weiToEth(costs);
    }

    postMessage({
      type: EAC_WORKER_MESSAGE_TYPES.UPDATE_STATS,
      bounties,
      costs,
      profit,
      executedTransactions: executedTransactions
    });
  }

  /*
   * Resets the stats saved in the IndexedDB.
   */
  clearStats() {
    const DBDeleteRequest = indexedDB.deleteDatabase('LokiAKV');

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

    DBDeleteRequest.onblocked = function() {
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

    case EAC_WORKER_MESSAGE_TYPES.GET_NETWORK_INFO:
      await eacWorker.getNetworkInfo();
      break;

    case EAC_WORKER_MESSAGE_TYPES.UPDATE_STATS:
      eacWorker.updateStats();
      break;

    case EAC_WORKER_MESSAGE_TYPES.CLEAR_STATS:
      eacWorker.clearStats();
      break;
  }
};
