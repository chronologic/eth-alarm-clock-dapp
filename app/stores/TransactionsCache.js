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

    constructor(eac,startBlock){
        this._eac = eac;
        this.requestFactoryStartBlock = startBlock;
        this.startLazy();
    }

    startLazy(){
        this.running = true;
        this.fetch
    }

    async getTransactions({ startBlock = this.requestFactoryStartBlock, endBlock = 'latest' },cache = this.cached) {
        if(cache)
            return this.getCachedTransactions();

        const requestFactory = await this._eac.requestFactory();

        let requestsCreated = await requestFactory.getRequests(startBlock, endBlock);

        requestsCreated.reverse();//Switch to most recent block first

        this.contracts = 

        requestsCreated = requestsCreated.map(request => this._eac.transactionRequest(request));

        return requestsCreated;
    }

    getCachedTransactions(){

    }


}