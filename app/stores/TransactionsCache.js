import { observable } from 'mobx';

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

    constructor(eac,startBlock) {
        this._eac = eac;
        this.requestFactoryStartBlock = startBlock;
        this.startLazy();
    }

    startLazy () {
        if (this.running || !this.requestFactoryStartBlock) {
            return;
        }

        this.running = true;
        this.runFetchTicker();
        this.watchRequests();
    }

    async runFetchTicker () {
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

    setNextTicker () {
        this.fetcher = setTimeout (() => {
            this.runFetchTicker();
        },this.fetchInterval);
    }

    stopFetchTicker() {
        this.running = false;
        if (this.fetcher) {
            clearTimeout(this.fetcher);
        }
        this.fetcher = false;
    }

    async stopWatcher () {
        if (this.requestWatcher) {
            const requestFactory = await this._eac.requestFactory();
            await requestFactory.stopWatch(this.requestWatcher);
        }
        this.requestWatcher = null;
    }

    stopAll () {
        this.stopFetchTicker();
        this.stopWatcher();
    }

    updateLastBlock() {
        const { getBlockNumber } = this._eac.Util;
        getBlockNumber()
        .then((r)=> {
            if (r) {
                this.lastBlock = r;
            }
        });
    }

    async awaitSync() {
      if (this.syncing) {
        return await setTimeout( () => this.awaitSync(),500);
      }

      return true;
    }

    get allTransactions () {
      return this.transactions;
    }

    get allTransactionsAddresses() {
      return this.contracts;
    }

    async getTransactions({ startBlock = this.requestFactoryStartBlock, endBlock = 'latest' }, cache = this.cacheDefault) {

        if (this.running && (cache || endBlock == 'latest')) {
            if (this.allTransactionsAddresses.length > 0) {
                return this.allTransactions;
            } else if (this.syncing) {
                await this.awaitSync();
                return this.allTransactions;
            }
        }

        const requestFactory = await this._eac.requestFactory();

        let requestsCreated = await requestFactory.getRequests(startBlock, endBlock);

        requestsCreated.reverse(); //Switch to most recent block first
        const requestAddresses = requestsCreated;

        requestsCreated = requestsCreated.map(request => this._eac.transactionRequest(request));

        if (startBlock == this.requestFactoryStartBlock && endBlock == 'latest') {//cache new values if complete fetch
          this.cacheContracts(requestAddresses);
          this.cacheTransactions(requestsCreated);
        }

        return requestsCreated;
    }

    async watchRequests( ) {
        const requestFactory = await this._eac.requestFactory();

        this.requestWatcher = await requestFactory.watchRequests(this.requestFactoryStartBlock, request => {
            const exists = this.allTransactionsAddresses.find(cachedRequest => cachedRequest === request);
            if (!exists) {
                const txRequest = this._eac.transactionRequest(request);
                this.cacheContracts([request], 'top');
                this.cacheTransactions([txRequest], 'top');
            }
        });
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

    async fillUpTransactions (transactions) {
        for (let transaction of transactions) {
            if (transaction.fillData) {
                await transaction.fillData();
            }
        }
    }

    fetchCachedTransaction (transaction) {
        this.allTransactions.find( (cachedTransaction) => {
            if (cachedTransaction.address == transaction.address && cachedTransaction.instance) {
                return cachedTransaction;
            }
        });

        return false;
    }

    cacheContracts (requestContracts = [], updateType ) {
        const replace = updateType == 'replace';
        const append = updateType == 'append';
        const unshift = updateType == 'top';
        if ( replace || this.contracts.length < requestContracts.length ) {
            this.contracts = requestContracts;
        } else {
            requestContracts.forEach ( request => {
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