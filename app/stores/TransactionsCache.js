import { observable } from 'mobx';
import { computed } from '../../node_modules/mobx/lib/mobx';
import DateTimeValidatorStore from './DateTimeValidatorStore';

export default class TransactionsCache {
    //Memebers
    @observable requestFactoryStartBlock = 0;
    @observable running = true;
    @observable cached = true;
    @observable lastBlock = '';
    @observable lastUpdate = '';
    @observable contracts = [];
    @observable transactions = [];

    constructor(eac,startBlock) {
        this._eac = eac;
        this.requestFactoryStartBlock = startBlock;
        if (this.requestFactoryStartBlock) {
            this.startLazy();
        }
    }

    startLazy () {
        this.running = true;
        //this.fetch
    }

    get allTransactions () {
        return this.transactions;
    }

    async getTransactions ({ startBlock = this.requestFactoryStartBlock, endBlock = 'latest' },cache = this.cached) {
        
        if (cache && this.running && this.contracts.length > 0) {
            return this.getCachedTransactions();
        } else {

            const requestFactory = await this._eac.requestFactory();

            let requestsCreated = await requestFactory.getRequests(startBlock, endBlock);
            console.log(requestFactory, requestsCreated)

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

    getCachedTransactions(){
        return this.allTransactions;
    }

    async getAllTransactions(cached = true) {
        if (cached){
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