import Bb from 'bluebird';
import Loki from 'lokijs';
import LokiIndexedAdapter from 'lokijs/src/loki-indexed-adapter.js';
import { EAC_WORKER_MESSAGE_TYPES } from './eac-worker-message-types';
import WorkerLogger from '../lib/worker-logger';
import { getDAYBalance } from '../lib/timenode-util';
import BigNumber from 'bignumber.js';
import { Networks, CUSTOM_PROVIDER_NET_ID } from '../config/web3Config';
import moment from 'moment';

import BucketHelper from '../services/bucket-helper';
import FeaturesService from '../services/features';
import NetworkAwareKeyModifier from '../services/network-specific-key-modifier';
import NetworkAwareStorageService from '../services/network-aware-storage';
import TransactionFetcher from '../stores/TransactionFetcher';
import TransactionCache from '../stores/TransactionCache';
import { initWeb3Service } from '../services/web3';
import { W3Util } from '@ethereum-alarm-clock/timenode-core';
import { requestFactoryStartBlocks } from '../config/web3Config';

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

  _web3Service = null;

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
      providerUrls: [providerUrl],
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

    const networkAwareKeyModifier = new NetworkAwareKeyModifier();

    const web3Service = initWeb3Service(
      false,
      { web3: this.config.web3 },
      networkAwareKeyModifier,
      new W3Util()
    );
    web3Service.init();

    const networkAwareStorageService = new NetworkAwareStorageService(networkAwareKeyModifier);

    this._transactionFetcher = new TransactionFetcher(
      this.config.eac,
      new TransactionCache(networkAwareStorageService),
      web3Service,
      new FeaturesService(web3Service)
    );

    this._transactionFetcher.requestFactoryStartBlock =
      requestFactoryStartBlocks[this.network.id] || 0;

    this.bucketHelper = new BucketHelper();
    const requestFactory = await this.config.eac.requestFactory();
    this.bucketHelper.setRequestFactory(requestFactory);

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
    const balanceETH = this.config.web3.utils.fromWei(balance);
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
    const { statsDb, web3 } = this.config;

    const bounties = statsDb.totalBounty(this.myAddress);
    const costs = statsDb.totalCost(this.myAddress);
    const profit = bounties.minus(costs);

    const discovered = statsDb.getDiscovered(this.myAddress);

    const successfulClaims = statsDb.getSuccessfulClaims(this.myAddress);
    const failedClaims = statsDb.getFailedClaims(this.myAddress);

    const successfulExecutions = statsDb.getSuccessfulExecutions(this.myAddress);
    const failedExecutions = statsDb.getFailedExecutions(this.myAddress);

    const toEth = num => web3.utils.fromWei(num, 'ether');

    postMessage({
      type: EAC_WORKER_MESSAGE_TYPES.UPDATE_STATS,
      bounties: formatBN(toEth(bounties)),
      costs: formatBN(toEth(costs)),
      profit: formatBN(toEth(profit)),
      successfulClaims: this._rawStatsArray(successfulClaims),
      failedClaims: this._rawStatsArray(failedClaims),
      successfulExecutions: this._rawStatsArray(successfulExecutions),
      failedExecutions: this._rawStatsArray(failedExecutions),
      discovered: discovered.length
    });
  }

  _rawStatsArray(array) {
    let rawArray = [];

    const toNumberIfBN = num => (typeof num === 'object' ? num.toNumber() : num);

    // Convert BN objects to strings for sending
    array.forEach(entry => {
      rawArray.push({
        txAddress: entry.txAddress,
        from: entry.from,
        timestamp: entry.timestamp,
        bounty: toNumberIfBN(entry.bounty),
        cost: toNumberIfBN(entry.cost),
        result: entry.result,
        action: entry.action
      });
    });

    return rawArray;
  }

  clearStats() {
    this.config.statsDb.clearAll();
    postMessage({
      type: EAC_WORKER_MESSAGE_TYPES.CLEAR_STATS
    });
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
        this.config.web3.eth.net.getId(callback)
      );
    }
  }

  async getBountiesGraphData() {
    const labels = [],
      values = [],
      promises = [];

    const currentTime = moment().unix();

    const average = arr =>
      arr.reduce((accumulator, currentValue) => accumulator + currentValue) / arr.length;

    for (let i = 24; i > 0; i--) {
      const bucket = currentTime - 3600 * i;
      labels.push(`${moment.unix(bucket).hour()}:00`);

      let promise = this._getBountiesForTimestampBucket(bucket);
      promises.push(promise);
    }

    const bountyArrays = await Promise.all(promises);

    bountyArrays.forEach(bounties => {
      bounties = bounties.map(bn => bn.toNumber());
      const averageBounty = bounties.length > 0 ? average(bounties) : 0.0;
      values.push(averageBounty);
    });

    postMessage({
      type: EAC_WORKER_MESSAGE_TYPES.BOUNTIES_GRAPH_DATA,
      bountiesGraphData: { labels, values }
    });
  }

  async _getBountiesForTimestampBucket(windowStart) {
    const bucket = await this.bucketHelper.calcBucketForTimestamp(windowStart);

    this._transactionFetcher.startLazy();
    const transactions = await this._transactionFetcher.getTransactionsInBuckets(
      [bucket],
      true,
      false
    );

    const bounties = [];
    let bounty, bountyInEth;

    transactions.forEach(tx => {
      bounty = tx.data.paymentData.bounty;
      bountyInEth = new BigNumber(this.config.web3.utils.fromWei(bounty, 'ether'));
      bounties.push(bountyInEth);
    });

    return bounties;
  }

  async getProcessedTxs() {
    const labels = [],
      values = [],
      promises = [];

    const currentTime = moment().unix();

    for (let i = 24; i > 0; i--) {
      const bucketTime = currentTime - 3600 * i;
      const bucket = await this.bucketHelper.calcBucketForTimestamp(bucketTime);
      labels.push(`${moment.unix(bucket).hour()}:00`);

      let promise = this._transactionFetcher.getTransactionsInBuckets([bucket], false, false);
      promises.push(promise);
    }

    const processedTxsArrays = await Promise.all(promises);

    processedTxsArrays.forEach(processedTxs => {
      values.push(processedTxs.length);
    });
    postMessage({
      type: EAC_WORKER_MESSAGE_TYPES.PROCESSED_TXS,
      processedTxs: { labels, values }
    });
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

    case EAC_WORKER_MESSAGE_TYPES.BOUNTIES_GRAPH_DATA:
      await eacWorker.getBountiesGraphData();
      break;

    case EAC_WORKER_MESSAGE_TYPES.PROCESSED_TXS:
      await eacWorker.getProcessedTxs();
      break;
  }
};
