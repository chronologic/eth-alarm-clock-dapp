import Bb from 'bluebird';
import Loki from 'lokijs';
import LokiIndexedAdapter from 'lokijs/src/loki-indexed-adapter.js';
import { EAC_WORKER_MESSAGE_TYPES } from './eac-worker-message-types';
import WorkerLogger from '../lib/worker-logger';
import { getDAYBalance } from '../lib/timenode-util';
import BigNumber from 'bignumber.js';
import { Networks, CUSTOM_PROVIDER_NET_ID } from '../config/web3Config';

import { TimeNode, Config } from '@ethereum-alarm-clock/timenode-core';

const STATS_SAVE_INTERVAL = 2000;
const STATS_NUM_DECIMALS = 5;

const formatBN = num => {
  return (
    Math.round(num.toNumber() * Math.pow(10, STATS_NUM_DECIMALS)) / Math.pow(10, STATS_NUM_DECIMALS)
  );
};

class EacWorker {
  timenode = null;
  network = null;
  dayAccountAddress = null;
  keystore = null;
  detectedNetId = null;

  async start(options) {
    const { customProviderUrl, network, dayAccountAddress } = options;
    this.network = network;
    this.dayAccountAddress = dayAccountAddress;
    this.keystore = options.keystore;

    const providerUrl = customProviderUrl !== null ? customProviderUrl : this.network.endpoint;

    const logger = new WorkerLogger(options.logLevel, this.logs);

    const persistenceAdapter = new LokiIndexedAdapter(options.network.id);
    const browserDB = new Loki('timenode-stats.db', {
      adapter: persistenceAdapter,
      autosave: true,
      autosaveInterval: STATS_SAVE_INTERVAL
    });

    for (let key of Object.keys(options.economicStrategy)) {
      if (options.economicStrategy[key]) {
        options.economicStrategy[key] = new BigNumber(options.economicStrategy[key]);
      }
    }

    this.config = new Config({
      providerUrl,
      claiming: options.claiming,
      scanSpread: options.scan,
      logfile: options.logfile,
      logLevel: options.logLevel,
      walletStores: this.keystore,
      password: options.keystorePassword,
      autostart: options.autostart,
      logger,
      economicStrategy: options.economicStrategy,
      statsDb: browserDB
    });

    await this.config.statsDbLoaded;

    this.myAddress = await this.config.wallet.getAddresses()[0];

    this.timenode = new TimeNode(this.config);

    await this._detectNetworkId();

    postMessage({
      type: EAC_WORKER_MESSAGE_TYPES.STARTED
    });
  }

  async startScanning() {
    await this.timenode.startScanning();
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
    const providerBlockNumber = await Bb.fromCallback(callback =>
      this.config.web3.eth.getBlockNumber(callback)
    );

    await this._detectNetworkId();

    postMessage({
      type: EAC_WORKER_MESSAGE_TYPES.GET_NETWORK_INFO,
      providerBlockNumber,
      netId: this.detectedNetId || this.network.id
    });
  }

  async getBalances() {
    const balance = await this.config.eac.Util.getBalance(this.myAddress);
    const balanceETH = this.config.web3.fromWei(balance);
    let network = this.network;

    if (this.detectedNetId) {
      network = Networks[this.detectedNetId];
    }

    const { balanceDAY, mintingPower } = await getDAYBalance(
      network,
      this.config.web3,
      this.dayAccountAddress
    );

    postMessage({
      type: EAC_WORKER_MESSAGE_TYPES.UPDATE_BALANCES,
      balanceETH: formatBN(balanceETH),
      balanceDAY: formatBN(balanceDAY),
      isTimeMint: mintingPower > 0
    });
  }

  /*
   * Fetches the current stats of the Alarm Client
   * and updates the TimeNodeStore.
   */
  async updateStats() {
    const bounties = this.config.statsDb.totalBounty(this.myAddress);
    const costs = this.config.statsDb.totalCost(this.myAddress);
    const profit = bounties.minus(costs);

    const executedTransactions = this.config.statsDb.getSuccessfulExecutions(this.myAddress);
    let executedTransactionsTimestamps = [];

    executedTransactions.forEach(tx => {
      executedTransactionsTimestamps.push({ timestamp: tx.timestamp });
    });

    const toEth = num => this.config.web3.fromWei(num, 'ether');

    postMessage({
      type: EAC_WORKER_MESSAGE_TYPES.UPDATE_STATS,
      bounties: formatBN(toEth(bounties)),
      costs: formatBN(toEth(costs)),
      profit: formatBN(toEth(profit)),
      executedTransactions: executedTransactionsTimestamps
    });
  }

  clearStats() {
    this.config.statsDb.clearAll();
  }

  async getClaimedNotExecutedTransactions() {
    postMessage({
      type: EAC_WORKER_MESSAGE_TYPES.RECEIVED_CLAIMED_NOT_EXECUTED_TRANSACTIONS,
      transactions: await this.timenode.getClaimedNotExecutedTransactions()
    });
  }

  async _detectNetworkId() {
    if (this.network.id === CUSTOM_PROVIDER_NET_ID) {
      this.detectedNetId = await Bb.fromCallback(callback =>
        this.config.web3.version.getNetwork(callback)
      );
    }
  }
}

let eacWorker = null;

onmessage = async function(event) {
  const type = event.data.type;

  switch (type) {
    case EAC_WORKER_MESSAGE_TYPES.START:
      eacWorker = new EacWorker();
      await eacWorker.start(event.data.options);
      break;

    case EAC_WORKER_MESSAGE_TYPES.START_SCANNING:
      await eacWorker.startScanning();
      break;

    case EAC_WORKER_MESSAGE_TYPES.STOP_SCANNING:
      eacWorker.stopScanning();
      break;

    case EAC_WORKER_MESSAGE_TYPES.GET_NETWORK_INFO:
      await eacWorker.getNetworkInfo();
      break;

    case EAC_WORKER_MESSAGE_TYPES.UPDATE_STATS:
      await eacWorker.updateStats();
      break;

    case EAC_WORKER_MESSAGE_TYPES.UPDATE_BALANCES:
      await eacWorker.getBalances();
      break;

    case EAC_WORKER_MESSAGE_TYPES.CLEAR_STATS:
      eacWorker.clearStats();
      break;

    case EAC_WORKER_MESSAGE_TYPES.GET_CLAIMED_NOT_EXECUTED_TRANSACTIONS:
      eacWorker.getClaimedNotExecutedTransactions();
      break;
  }
};
