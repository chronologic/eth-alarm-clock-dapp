import Web3 from 'web3/index';
import Bb from 'bluebird';
import {
    action,
    observable,
    runInAction
} from 'mobx';
import {
    Networks,
    Explorers
} from '../config/web3Config.js';

let instance = null;

export default class Web3Service {
    web3 = null;
    tokenInstance = null;
    @observable initialized = false;
    @observable connectedToMetaMask = null;
    @observable accounts = null;
    @observable netId = null;
    @observable explorer = null;

    constructor(props) {
        Object.assign(this, props);
    }

    @action
    async init() {
        if (!this.initialized) {
            await this.connect();
            this.initialized = true;
            return true;
        } else {
            return false;
        }
    }

     toEth(_wei){
        const _toWei = this.web3.toWei(_wei,'gwei') ;
        const ethValue = this.web3.fromWei(_toWei,'ether');
        return ethValue;
    }

    fromWei(wei) {
        return this.web3.fromWei(wei);
    }

    async fetchReceipt(hash) {
        let { web3 } = this;
        let receipt = await Bb.fromCallback(callback =>
            web3.eth.getTransactionReceipt(hash, callback));
        return receipt;
    }

    async fetchLog(hash,event) {
        const receipt = await this.trackTransaction(hash);
        let Log;
        receipt.logs.map( (log) => {
            if (log.topics[0] == event){
                Log = log;
                return;
            }
        } );
        return Log;
    }

    async trackTransaction(hash) {
        let receipt;
        if (!(receipt = await this.fetchReceipt(hash))) {
            const txReceipt = new Promise((resolve) => {
                setTimeout(async () => {
                    resolve(await this.trackTransaction(hash));
                }, 2000);
            });
            return txReceipt;
        } else {
            return receipt;
        }
    }

    async fetchConfirmations(transaction) {
        const mined = await this.trackTransaction(transaction);
        const block = await this.fetchBlockNumber();
        if (!mined || !mined.blockNumber) {
            const confirmations = new Promise((resolve) => {
                setTimeout(async () => {
                    resolve(await this.fetchConfirmations(transaction));
                }, 2000);
            });
            return confirmations;
        } else {
            return (block - mined.blockNumber);
        }
    }

    async fetchBlockNumber() {
        const {
            web3
        } = this;
        const block = await Bb.fromCallback(callback =>
            web3.eth.getBlockNumber(callback));
        return block;
    }

    async hasCode ( address ) {
        const { web3 } = this;
        const code = await Bb.fromCallback(callback => web3.eth.getCode(address,callback) );
        return code.toString() != '0x0';
    }

    @action
    async connect() {
        let {
            web3
        } = this;
        if (!web3) {
            if (typeof window.web3 !== 'undefined') {
                web3 = new Web3(window.web3.currentProvider);
                this.connectedToMetaMask = true;
            } else {
                web3 = new Web3(new Web3.providers.HttpProvider(process.env.HTTP_PROVIDER));
                Object.assign(this, web3);
                this.connectedToMetaMask = false;
            }

            this.web3 = web3;
        }

        const netId = await Bb.fromCallback(callback => web3.version.getNetwork(callback));
        runInAction(() => {
            this.netId = netId;
            this.explorer = Explorers[this.netId];
        });

        if (!this.connectedToMetaMask || !this.web3.isConnected()) return;

        this.accounts = web3.eth.accounts;
        web3.eth.defaultAccount = this.accounts[0];
    }

    async awaitInitialized() {
        const that = this;
        if (!this.initialized) {
            let Promises = new Promise((resolve /*, reject*/ ) => {
                setTimeout(async function() {
                    resolve(await that.awaitInitialized());
                }, 2000);
            });
            return Promises;
        } else
            return true;
    }

    @action
    async getAccountUpdates () {
        const accounts = await Bb.fromCallback( callback =>this.web3.eth.getAccounts(callback) );
        const accountChanged = this.accounts.length !== accounts.length || (this.accounts.length > 0 && this.accounts[0] !== accounts[0]);

        if (accountChanged) {
            this.accounts = accounts;
            this.web3.eth.defaultAccount = this.accounts[0];
        }
    }

    get network() {
        if (typeof Networks[this.netId] === 'undefined')
            return Networks[0];
        else
            return Networks[this.netId];
    }

    humanizeCurrencyDisplay(priceInWei) {
        const ETHER_UNITS_VALUES_MAPPING = {
            WEI: 1,
            MWEI: 1000000,
            FINNEY: 1000000000000000,
            ETH: 1000000000000000000
        };

        let unit = 'ETH';

        if (!priceInWei) {
            return null;
        }

        const priceAsNumber = priceInWei.toNumber();

        let display = priceAsNumber;

        if (priceAsNumber < ETHER_UNITS_VALUES_MAPPING.MWEI && priceAsNumber > 0) {
            unit = 'WEI';
        } else {
            display = priceInWei.div(ETHER_UNITS_VALUES_MAPPING.ETH).toFixed();
            unit = 'ETH';
        }

        return `${display} ${unit}`;
    }
}

export function initWeb3Service(isServer, source) {
    if (isServer) {
        return new Web3Service(source);
    }

    if (instance === null) {
        instance = new Web3Service(source);
    }

    return instance;
}
