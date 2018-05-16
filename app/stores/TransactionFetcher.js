import { observable } from 'mobx';
import moment from 'moment';
import { TEMPORAL_UNIT } from './TransactionStore';
import { TRANSACTION_EVENT } from '../services/eac';

const BLOCK_BUCKET_SIZE = 240;
const TIMESTAMP_BUCKET_SIZE = 3600;

export const ABORTED_TOPIC = '0xc008bc849b42227c61d5063a1313ce509a6e99211bfd59e827e417be6c65c81b';
export const CANCELLED_TOPIC = '0xa761582a460180d55522f9f5fdc076390a1f48a7a62a8afbd45c1bb797948edb';
export const EXECUTED_TOPIC = '0x3e504bb8b225ad41f613b0c3c4205cdd752d1615b4d77cd1773417282fcfb5d9';

export default class TransactionFetcher {
  fetchInterval = 60 * 1000;
  fetcher = '';

  @observable requestFactoryStartBlock = 0;
  @observable running = false;
  @observable syncing = false;
  @observable cacheDefault = true;
  @observable lastBlock = '';
  @observable lastUpdate = '';

  _requestFactory;
  _features;

  constructor(eac, cache, web3, features) {
    this._eac = eac;
    this._cache = cache;
    this._web3 = web3;
    this._features = features;

    this.startLazy();
  }

  async startLazy() {
    await this._web3.awaitInitialized();

    if (!this._requestFactory && this._features.isCurrentNetworkSupported) {
      this._requestFactory = await this._eac.requestFactory();
    }

    if (this.running || !this.requestFactoryStartBlock) {
      return;
    }

    this.running = true;
    await this.runFetchTicker();
    this.watchRequests();
  }

  async runFetchTicker() {
    if (!this.running) {
      this.stopFetchTicker();
      return;
    }

    await this.getTransactions({}, true);
    this.lastUpdate = new Date();

    await this.updateLastBlock();
    this.setNextTicker();
  }

  setNextTicker() {
    this.fetcher = setTimeout(() => {
      this.runFetchTicker();
    }, this.fetchInterval);
  }

  stopFetchTicker() {
    this.running = false;
    if (this.fetcher) {
      clearTimeout(this.fetcher);
    }
    this.fetcher = false;
  }

  async stopWatcher() {
    if (this.requestWatcher) {
      await this._requestFactory.stopWatch(this.requestWatcher);
    }
    this.requestWatcher = null;
  }

  stopAll() {
    this.stopFetchTicker();
    this.stopWatcher();
  }

  async updateLastBlock() {
    const { getBlockNumber } = this._eac.Util;

    const result = await getBlockNumber();

    if (result) {
      this.lastBlock = result;
    }
  }

  async awaitSync() {
    if (this.syncing) {
      return await new Promise(resolve => {
        setTimeout(async () => {
          resolve(await this.awaitSync());
        }, 500);
      });
    }

    return true;
  }

  get allTransactionsAddresses() {
    return this._cache.allTransactionsAddresses;
  }

  async getRequestsByBuckets(buckets) {
    const logs = await this._requestFactory.getRequestCreatedLogs(
      {
        bucket: buckets
      },
      '',
      ''
    );

    const requests = [];
    logs.forEach(log => {
      requests.push({
        address: log.args.request,
        params: log.args.params
      });
    });

    return requests;
  }

  getDataForRequestParams(
    [
      fee,
      timeBounty,
      claimWindowSize,
      freezePeriod,
      reservedWindowSize,
      temporalUnit,
      windowSize,
      windowStart,
      callGas,
      callValue,
      gasPrice,
      requiredDeposit
    ],
    transaction
  ) {
    const data = new this._eac.RequestData(
      [[], [], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], []],
      transaction.instance
    );

    Object.assign(data, {
      claimData: {
        requiredDeposit
      },
      paymentData: {
        bounty: timeBounty,
        fee
      },
      schedule: {
        claimWindowSize,
        freezePeriod,
        reservedWindowSize,
        temporalUnit,
        windowSize,
        windowStart
      },
      txData: {
        callGas,
        callValue,
        gasPrice
      }
    });

    return data;
  }

  async getTransactionsInBuckets(buckets) {
    let transactions = await this._requestFactory.getRequestsByBucket(buckets);

    transactions.reverse(); // Switch to most recent block first

    transactions = transactions.map(({ address, params }) => {
      const request = this._eac.transactionRequest(address);

      request.data = this.getDataForRequestParams(params, request);

      return request;
    });

    return transactions;
  }

  async getTransactionsInLastHours(hours) {
    const currentTimestamp = moment().unix();

    await this.updateLastBlock();

    let timestampBucket = this.calcBucketForTimestamp(currentTimestamp);
    let blockBucket = this.calcBucketForBlock(this.lastBlock);

    const buckets = [];

    // Adding 0.5, because for each hour we fetch 2 buckets: timestamp, block.
    for (let i = 0; i < hours; i += 0.5) {
      // First, we fetch timestamp bucket, then block bucket.
      const isTimestampBucket = i % 1 === 0;

      buckets.push(isTimestampBucket ? timestampBucket : blockBucket);

      if (isTimestampBucket) {
        timestampBucket -= TIMESTAMP_BUCKET_SIZE;
      } else {
        /*
         * Since blockBucket is negative number we should add it to block bucket size,
         * if we want to go back in time.
         */
        blockBucket += BLOCK_BUCKET_SIZE;
      }
    }

    return await this.getTransactionsInBuckets(buckets);
  }

  async getRequestCreatedLogs(startBlock, endBlock) {
    const cachedLogs = this._cache.requestCreatedLogs;

    if (cachedLogs && cachedLogs.length > 0) {
      return cachedLogs;
    }

    const logs = await this._requestFactory.getRequestCreatedLogs({}, startBlock, endBlock);

    this._cache.cacheRequestCreatedLogs(logs, endBlock);

    return logs;
  }

  async getTransactionsByBlocks(startBlock, endBlock) {
    if (endBlock === 'latest') {
      await this.updateLastBlock();

      endBlock = this.lastBlock;
    }

    const logs = await this.getRequestCreatedLogs(startBlock, endBlock);

    const transactions = logs.map(({ args: { request: address, params } }) => {
      const request = this._eac.transactionRequest(address);

      request.data = this.getDataForRequestParams(params, request);

      return request;
    });

    return transactions;
  }

  async getTransactions(
    { startBlock = this.requestFactoryStartBlock, endBlock = 'latest', pastHours },
    cache = this.cacheDefault,
    onlyAddresses = false
  ) {
    if (this.running && (cache || endBlock == 'latest')) {
      if (this.allTransactionsAddresses.length > 0) {
        return onlyAddresses ? this.allTransactionsAddresses : this._cache.transactions;
      }

      if (this.syncing) {
        await this.awaitSync();
        return onlyAddresses ? this.allTransactionsAddresses : this._cache.transactions;
      }
    }

    this.syncing = true;

    let transactions;

    if (pastHours) {
      if (typeof pastHours !== 'number') {
        throw new Error('pastHours parameter in getTransactions must be a number.');
      }

      transactions = await this.getTransactionsInLastHours(pastHours);
    } else {
      transactions = await this.getTransactionsByBlocks(startBlock, endBlock);
    }

    await this.fillUpTransactions(transactions);

    if (startBlock == this.requestFactoryStartBlock && endBlock === 'latest') {
      this._cache.cacheTransactions(transactions, 'replace');
    }

    this.syncing = false;

    return onlyAddresses ? this.allTransactionsAddresses : transactions;
  }

  async watchRequests() {
    if (this.requestWatcher) {
      return;
    }

    this.requestWatcher = await this._requestFactory.watchRequestCreatedLogs(
      {},
      this._cache.requestCreatedLogsLastBlockFetched,
      async (error, log) => {
        if (log) {
          const address = log.args.request;
          const exists = this.allTransactionsAddresses.find(
            cachedRequest => cachedRequest === address
          );

          if (!exists) {
            const txRequest = this._eac.transactionRequest(address);

            await txRequest.fillData();

            this._cache.addRequestCreatedLogToCache(log);

            this._cache.cacheTransactions([txRequest], 'append');
          }
        }
      }
    );
  }

  async getAllTransactions(cached = this.cacheDefault) {
    if (this.syncing) {
      await this.awaitSync();
    } else if (!cached || !this.running || this._cache.transactions.length === 0) {
      return await this.getTransactions({});
    }

    return this._cache.transactions;
  }

  async fillUpTransactions(transactions) {
    const addresses = transactions.map(t => t.address);

    const transactionsEventsMap = await this.getEventsMapForAddresses(addresses);

    for (const transaction of transactions) {
      this.updateTransactionDataBasedOnEvents(
        transaction,
        transactionsEventsMap[transaction.address] === TRANSACTION_EVENT.CANCELLED,
        transactionsEventsMap[transaction.address] === TRANSACTION_EVENT.EXECUTED
      );
    }
  }

  async getTransactionsEventsForAddresses(addresses) {
    return new Promise(resolve => {
      this._web3
        .filter({
          address: addresses,
          topics: [[ABORTED_TOPIC, CANCELLED_TOPIC, EXECUTED_TOPIC]],
          fromBlock: 0,
          toBlock: 'latest'
        })
        .get((error, events) => {
          resolve(events);
        });
    });
  }

  async getEventsMapForAddresses(addresses) {
    const events = await this.getTransactionsEventsForAddresses(addresses);

    const TX_EVENTS_MAP = {};

    for (const event of events) {
      let eventType;

      switch (event.topics[0]) {
        case EXECUTED_TOPIC:
          eventType = TRANSACTION_EVENT.EXECUTED;
          break;
        case CANCELLED_TOPIC:
          eventType = TRANSACTION_EVENT.CANCELLED;
          break;
        case ABORTED_TOPIC:
          eventType = TRANSACTION_EVENT.ABORTED;
          break;
      }

      TX_EVENTS_MAP[event.address] = eventType;
    }

    return TX_EVENTS_MAP;
  }

  updateTransactionDataBasedOnEvents(transaction, cancelled, executed) {
    const data = new this._eac.RequestData(
      [[], [], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], []],
      transaction.instance
    );

    const meta = {
      isCancelled: false,
      wasCalled: false,
      wasSuccessful: false
    };

    if (cancelled) {
      meta.isCancelled = true;
    }

    if (executed) {
      meta.wasCalled = true;
      meta.wasSuccessful = true;
    }

    if (!transaction.data) {
      transaction.data = data;
    }

    transaction.data.meta = meta;
  }

  fetchCachedTransaction(transaction) {
    this._cache.transactions.find(cachedTransaction => {
      if (cachedTransaction.address == transaction.address && cachedTransaction.instance) {
        return cachedTransaction;
      }
    });

    return false;
  }

  async fetchCachedTransactionByAddress(address) {
    const cached = this._cache.transactions.find(
      cachedTransaction => cachedTransaction.address == address
    );

    if (!cached) {
      return null;
    }

    if (cached.instance) {
      cached.refreshData();
    } else {
      await cached.fillData();
    }

    return cached;
  }

  // ------ UTILS ------
  calcBucketForTimestamp(timestamp) {
    return this._requestFactory.calcBucket(
      timestamp,
      TEMPORAL_UNIT.TIMESTAMP
    );
  }

  calcBucketForBlock(blockNumber) {
    return this._requestFactory.calcBucket(blockNumber, TEMPORAL_UNIT.BLOCK);
  }
}
