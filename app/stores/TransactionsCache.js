import { observable } from 'mobx';
import { computed } from '../../node_modules/mobx/lib/mobx';

export default class TransactionsCache {
    //Memebers
    fetchInterval = 60 * 1000;
    fetcher = '';
    @observable requestFactoryStartBlock = 0;
    @observable running = false;
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
        if (this.running || !this.requestFactoryStartBlock) {//If running do Nothing
            return;
        }
        this.running = true;
        this.runFetchTicker();
    }

    async runFetchTicker () {
        if (!this.running) {
            this.stopFetchTicker();
            return ;
        }
        await this.getTransactions({}, false);
        this.lastUpdate = new Date();
        this.updateLastBlock();
        this.setNextTicker();
    }

    setNextTicker () {
        this.fetcher = setInterval (() => {
            this.runFetchTicker();
        },this.fetchInterval);
    }

    stopFetchTicker() {
        this.running = false;
        if (this.fetcher) {
            clearInterval(this.fetcher);
        }
        this.fetcher = false;
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

    @computed get allTransactions () {
        return this.transactions;
    }

    @computed get allTransactionsAddresses() {
        return this.contracts;
    }

    async getTransactions({ startBlock = this.requestFactoryStartBlock, endBlock = 'latest' }, cache = this.cacheDefault) {
        
        if (cache && this.running && this.contracts.length > 0) {
            return this.allTransactions();
        } else {

            const requestFactory = await this._eac.requestFactory();

            let requestsCreated = await requestFactory.getRequests(startBlock, endBlock);
            console.log(requestFactory, requestsCreated, startBlock, endBlock, this.running , this.contracts.length)

            requestsCreated.reverse();//Switch to most recent block first
            const requestAddresses = requestsCreated;

            requestsCreated = requestsCreated.map(request => this._eac.transactionRequest(request));

            if (startBlock == this.requestFactoryStartBlock && endBlock == 'latest') {//cache new values if complete fetch
                console.log(requestAddresses, requestsCreated)
                //this.cacheContracts(requestAddresses);
                //this.cacheTransactions(requestsCreated);
            }

            return requestsCreated;
        }
    }

    async getAllTransactions(cached = this.cacheDefault) {
        if (cached) {
            return this.allTransactions;
        }

        this.allTransactions = await this.getTransactions({});

        for (let transaction of this.allTransactions) {
            await transaction.fillData();
            transaction.status = await this.getTxStatus(transaction);
        }
    }

    cacheContracts (requestContracts = [], updateType ) {
        const replace = updateType == 'replace';
        const append = updateType == 'append';
        if ( replace || this.contracts.length < requestContracts.length ) {
            this.contracts = requestContracts;
        } else if (append) {
            this.contracts.push(requestContracts);
        }
    }

    cacheTransactions(transactions = [], updateType) {
        const replace = updateType == 'replace';
        const append = updateType == 'append';
        if (this.transactions.length < transactions.length || replace) {
            this.transactions = transactions;
        } else if (append) {
            this.transactions.push(transactions);
        }
    }



}