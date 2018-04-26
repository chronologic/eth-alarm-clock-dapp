import { observable } from 'mobx';
import moment from 'moment';
import { TEMPORAL_UNIT } from './TransactionStore';

const BLOCK_BUCKET_SIZE = 240;
const TIMESTAMP_BUCKET_SIZE = 3600;

export default class TransactionsCache {
  fetchInterval = 60 * 1000;
  fetcher = '';

  @observable requestFactoryStartBlock = 0;
  @observable running = false;
  @observable syncing = false;
  @observable cacheDefault = true;
  @observable lastBlock = '';
  @observable lastUpdate = '';
  @observable contracts = [];
  @observable transactions = [];

  constructor(eac, startBlock) {
    this._eac = eac;
    this.requestFactoryStartBlock = startBlock;
    this.startLazy();
  }

  startLazy() {
    if (this.running || !this.requestFactoryStartBlock) {
      return;
    }

    this.running = true;
    this.runFetchTicker();
    this.watchRequests();
  }

  async runFetchTicker() {
    if (!this.running) {
      this.stopFetchTicker();
      return;
    }

    this.syncing = true;

    await this.getTransactions({}, false);

    this.lastUpdate = new Date();
    this.updateLastBlock();
    this.setNextTicker();
    this.syncing = false;
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
      const requestFactory = await this._eac.requestFactory();
      await requestFactory.stopWatch(this.requestWatcher);
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

  get allTransactions() {
    return this.transactions;
  }

  get allTransactionsAddresses() {
    return this.contracts;
  }

  async getRequestsByBuckets(buckets) {
    const requestFactory = await this._eac.requestFactory();

    const logs = await requestFactory.getRequestCreatedLogs(
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

  async getTransactionsInBuckets(buckets) {
    const requestFactory = await this._eac.requestFactory();

    let transactions = await requestFactory.getRequestsByBucket(buckets);

    transactions.reverse(); // Switch to most recent block first

    const addresses = [];

    transactions = transactions.map(
      ({
        address,
        params: [
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
        ]
      }) => {
        const request = this._eac.transactionRequest(address);

        request.data = {
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
        };

        addresses.push(address);

        return request;
      }
    );

    return {
      addresses,
      transactions
    };
  }

  async getTransactionsInLastHours(hours) {
    const requestFactory = await this._eac.requestFactory();

    const currentTimestamp = moment().unix();

    await this.updateLastBlock();

    let timestampBucket = requestFactory.calcBucket(currentTimestamp, TEMPORAL_UNIT.TIMESTAMP);
    let blockBucket = requestFactory.calcBucket(this.lastBlock, TEMPORAL_UNIT.BLOCK);

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

  async getTransactionsByBlocks(startBlock, endBlock) {
    const requestFactory = await this._eac.requestFactory();

    let transactions = await requestFactory.getRequests(startBlock, endBlock);

    transactions.reverse();

    const addresses = transactions;

    transactions = transactions.map(request => this._eac.transactionRequest(request));

    return {
      addresses,
      transactions
    };
  }

  async getTransactions(
    { startBlock = this.requestFactoryStartBlock, endBlock = 'latest', pastHours },
    cache = this.cacheDefault,
    onlyAddresses = false
  ) {
    if (this.running && (cache || endBlock == 'latest')) {
      if (this.allTransactionsAddresses.length > 0) {
        return onlyAddresses ? this.allTransactionsAddresses : this.allTransactions;
      } else if (this.syncing) {
        await this.awaitSync();
        return onlyAddresses ? this.allTransactionsAddresses : this.allTransactions;
      }
    }

    let transactionsGetResult = {};

    if (pastHours) {
      transactionsGetResult = await this.getTransactionsInLastHours(pastHours);
    } else {
      transactionsGetResult = await this.getTransactionsByBlocks(startBlock, endBlock);
    }

    let { addresses, transactions } = transactionsGetResult;

    if (startBlock == this.requestFactoryStartBlock && endBlock == 'latest') {
      this.cacheContracts(addresses);
      this.cacheTransactions(transactions);
    }

    return onlyAddresses ? this.allTransactionsAddresses : transactions;
  }

  async watchRequests() {
    const requestFactory = await this._eac.requestFactory();

    this.requestWatcher = await requestFactory.watchRequests(
      this.requestFactoryStartBlock,
      request => {
        const exists = this.allTransactionsAddresses.find(
          cachedRequest => cachedRequest === request
        );
        if (!exists) {
          const txRequest = this._eac.transactionRequest(request);
          this.cacheContracts([request], 'top');
          this.cacheTransactions([txRequest], 'top');
        }
      }
    );
  }

  async getAllTransactions(cached = this.cacheDefault) {
    if (this.syncing) {
      await this.awaitSync();
    } else if (!cached || !this.running || this.allTransactions.length == 0) {
      return await this.getTransactions({});
    }

    await this.queryTransactions(this.allTransactions);

    return this.allTransactions;
  }

  async queryTransactions(transactions) {
    for (let transaction of transactions) {
      let cached = this.fetchCachedTransaction(transaction);
      if (cached) {
        transaction = cached;
        transaction.refreshData();
      } else {
        await transaction.fillData();
      }
    }
    return transactions;
  }

  async fillUpTransactions(transactions) {
    for (let transaction of transactions) {
      if (transaction.fillData) {
        await transaction.fillData();
      }
    }
  }

  fetchCachedTransaction(transaction) {
    this.allTransactions.find(cachedTransaction => {
      if (cachedTransaction.address == transaction.address && cachedTransaction.instance) {
        return cachedTransaction;
      }
    });

    return false;
  }

  async fetchCachedTransactionByAddress(address) {
    const cached = this.allTransactions.find(
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

  cacheContracts(requestContracts = [], updateType) {
    const replace = updateType == 'replace';
    const append = updateType == 'append';
    const unshift = updateType == 'top';
    if (replace || this.contracts.length < requestContracts.length) {
      this.contracts = requestContracts;
    } else {
      requestContracts.forEach(request => {
        if (append) {
          this.contracts.push(request);
        } else if (unshift) {
          this.contracts.unshift(request);
        }
      });
    }
  }

  cacheTransactions(transactions = [], updateType) {
    const replace = updateType == 'replace';
    const append = updateType == 'append';
    const unshift = updateType == 'top';

    this.fillUpTransactions(transactions);

    if (this.transactions.length < transactions.length || replace) {
      this.transactions = transactions;
    } else {
      transactions.forEach(transaction => {
        if (append) {
          this.transactions.push(transaction);
        } else if (unshift) {
          this.transactions.unshift(transaction);
        }
      });
    }
  }
}
