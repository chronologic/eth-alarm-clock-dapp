import Web3 from 'web3/index';
// import eac from 'eac.js';
import Bb from 'bluebird';
import { action, observable, runInAction } from 'mobx';

// import dayTokenABI from './abi/dayTokenABI';
// import dayFaucetABI from './abi/dayFaucetABI';

import { Networks } from './config/web3Config.js'

let instance = null;

export default class Web3Service {
    web3 = null;
    tokenInstance = null;
    @observable initialized = false;
    @observable connectedToMetaMask = null;
    @observable accounts = null;
    @observable netId = null;

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
    async connect() {
        let {web3} = this;
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
        if (!this.connectedToMetaMask || !this.web3.isConnected())//Do not proceed if not connected to metamask
            return;

        this.accounts = web3.eth.accounts;
        web3.eth.defaultAccount = this.accounts[0];
        // console.log('accounts', this.accounts);

        const netId =
            await Bb.fromCallback(callback => web3.version.getNetwork(callback));
        runInAction(() => {
            this.netId = netId;
        });
        // console.log('netId', this.netId, this.network);

        //this.tokenInstance = web3.eth.contract(dayTokenABI).at(TOKEN_CONTRACT_ADDRESS);
        //this.deployerInstance = web3.eth.contract(Active_Deployer_ABI).at(DEPLOYER_ADDRESS);
        //this.deployerInstance = await Bb.fromCallback(callback => web3.eth.contract(deployerABI).at(DEPLOYER_ADDRESS
        //,callback) );
        //this.faucetInstance = web3.eth.contract(dayFaucetABI).at(FAUCET_ADDRESS);
        //this.debtTokenDeployerInstance = web3.eth.contract(debtTokenDeployerABI).at(DEBT_TOKEN_DEPLOYER_ADDRESS);

    }

    async awaitInitialized(){
        const that = this;
        if(!this.initialized){
            let Promises = new Promise((resolve/*, reject*/) => {
                setTimeout(async function () {
                    resolve(await that.awaitInitialized());
                }, 2000);
            })
            return Promises;
        }
        else
            return true;
    }

    get network(){
      if(typeof Networks[this.netId] === 'undefined')
        return Networks[0];
      else
        return Networks[this.netId];
    }

}

export function initWeb3Service(isServer, source) {
    if (isServer) {
        return new Web3Service(source);
    } else {
        if (instance === null) {
            instance = new Web3Service(source);
        }
        return instance;
    }
}
