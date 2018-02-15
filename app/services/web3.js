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
} from '../config/web3Config.js'

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

    @action
    async trackTransaction(hash) {
        if (!(await this.fetchReceipt(hash))) {
            const txReceipt = new Promise((resolve) => {
                setTimeout(async () => {
                    resolve(await this.trackTransaction(hash));
                }, 2000);

            });
            return txReceipt;
        }
    }

    @action
    async fetchConfirmations(transaction) {
        const mined = await this.trackTransaction(transaction);
        const block = await this.fetchBlockNumber();
        if (!mined.blockNumber) {
            const confirmations = new Promise((resolve, reject) => {
                setTimeout(async () => {
                    resolve(await this.fetchConfirmations(transaction));
                }, 2000);
                reject();
            });
            return confirmations;
        } else {
            return (block - mined.blockNumber);
        }
    }

    @action
    async fetchBlockNumber() {
        const {
            web3
        } = this;
        const block = await Bb.fromCallback(callback =>
            web3.eth.getBlockNumber(callback));
        return block;
    }

    async hasCode ( address ) {
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
                web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));
                this.connectedToMetaMask = false;
            }
            window.web3 = web3;
            this.web3 = web3;
        }
        if (!this.connectedToMetaMask || !this.web3.isConnected()) return;
        this.accounts = web3.eth.accounts;
        web3.eth.defaultAccount = this.accounts[0];
        const netId = await Bb.fromCallback(callback => web3.version.getNetwork(callback));
        runInAction(() => {
            this.netId = netId;
            this.explorer = Explorers[this.netId]
        });
    }

    async awaitInitialized() {
        const that = this;
        if (!this.initialized) {
            let Promises = new Promise((resolve /*, reject*/ ) => {
                setTimeout(async function() {
                    resolve(await that.awaitInitialized());
                }, 2000);
            })
            return Promises;
        } else
            return true;
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

        if (priceAsNumber < ETHER_UNITS_VALUES_MAPPING.MWEI) {
            unit = 'WEI';
        } else if (priceAsNumber < ETHER_UNITS_VALUES_MAPPING.FINNEY) {
            display = priceInWei.div(ETHER_UNITS_VALUES_MAPPING.MWEI).toFixed();
            unit = 'MWEI';
        } else if (priceAsNumber < ETHER_UNITS_VALUES_MAPPING.ETH) {
            display = priceInWei.div(ETHER_UNITS_VALUES_MAPPING.FINNEY).toFixed();
            unit = 'FINNEY';
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
