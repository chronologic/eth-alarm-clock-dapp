import Web3 from 'web3/index';
import Bb from 'bluebird';
import { action, observable } from 'mobx';
import {
  Networks,
  DEFAULT_NETWORK_WHEN_NO_METAMASK,
  MAIN_NETWORK_ID
} from '../config/web3Config.js';

let instance = null;

export default class Web3Service {
  web3 = null;
  tokenInstance = null;
  network = null;

  @observable
  initialized = false;
  @observable
  connectedToMetaMask = null;
  @observable
  accounts = null;
  @observable
  explorer = null;
  @observable
  latestBlockNumber = null;

  _keyModifier;
  _w3Util;

  constructor(props, networkAwareKeyModifier, w3Util) {
    Object.assign(this, props);

    this._keyModifier = networkAwareKeyModifier;
    this._w3Util = w3Util;
  }

  _initializationPromise;
  _web3AlternativeToMetaMask;

  @action
  init() {
    if (!this._initializationPromise) {
      this._initializationPromise = this._init();
    }

    return this._initializationPromise;
  }

  fromWei(wei) {
    return this.web3.fromWei(wei);
  }

  async fetchReceipt(hash) {
    return await Bb.fromCallback(callback => this.web3.eth.getTransactionReceipt(hash, callback));
  }

  async fetchLog(hash, event) {
    const receipt = await this.trackTransaction(hash);
    let Log;

    receipt.logs.map(log => {
      if (log.topics[0] == event) {
        Log = log;
        return;
      }
    });

    return Log;
  }

  async trackTransaction(hash) {
    let receipt = await this.fetchReceipt(hash);

    if (!receipt) {
      receipt = new Promise(resolve => {
        setTimeout(async () => {
          resolve(await this.trackTransaction(hash));
        }, 2000);
      });
    }

    return receipt;
  }

  async fetchConfirmations(transaction) {
    const mined = await this.trackTransaction(transaction);
    const block = await this.fetchBlockNumber();

    if (!mined || !mined.blockNumber) {
      return new Promise(resolve => {
        setTimeout(async () => {
          resolve(await this.fetchConfirmations(transaction));
        }, 2000);
      });
    }

    return block - mined.blockNumber;
  }

  async fetchBlockNumber() {
    const { web3 } = this;

    const block = await Bb.fromCallback(callback => web3.eth.getBlockNumber(callback));
    this.latestBlockNumber = block;

    return block;
  }

  async getAddressBalance(address) {
    const { web3 } = this;
    const balance = await Bb.fromCallback(callback => web3.eth.getBalance(address, callback));

    return balance.valueOf();
  }

  @action
  async connect() {
    let { web3 } = this;
    if (!web3) {
      if (typeof window.web3 !== 'undefined') {
        web3 = new Web3(window.web3.currentProvider);
        this.connectedToMetaMask = true;
      } else {
        web3 = this.getWeb3FromProviderUrl(Networks[DEFAULT_NETWORK_WHEN_NO_METAMASK].httpEndpoint);
        Object.assign(this, web3);
        this.connectedToMetaMask = false;
      }

      this.web3 = web3;
    }

    const netId = await Bb.fromCallback(callback => web3.version.getNetwork(callback));
    this._keyModifier.setNetworkId(netId);

    this.network = Networks[netId];
    this.explorer = this.network.explorer;

    if (this.network && this.network.endpoint && this.connectedToMetaMask) {
      this._web3AlternativeToMetaMask = this.getWeb3FromProviderUrl(this.network.endpoint);
    }

    if (!this.connectedToMetaMask || !this.web3.isConnected()) return;

    this.accounts = web3.eth.accounts;

    if (this.accounts && this.accounts.length > 0) {
      web3.eth.defaultAccount = this.accounts[0];
    }
  }

  @action
  async getAccountUpdates() {
    const accounts = await Bb.fromCallback(callback => this.web3.eth.getAccounts(callback));
    const accountChanged =
      (this.accounts !== null && this.accounts.length) !== accounts.length ||
      (this.accounts.length > 0 && this.accounts[0] !== accounts[0]);

    if (accountChanged) {
      this.accounts = accounts;
      this.web3.eth.defaultAccount = this.accounts[0];
    }
  }

  isOnMainnet() {
    return this.network === Networks[MAIN_NETWORK_ID];
  }

  getWeb3FromProviderUrl(url) {
    return this._w3Util.getWeb3FromProviderUrl(url);
  }

  /**
   * Since there are problems with using filter for events
   * with array as an address parameter in MetaMask,
   * we're using custom HTTP provider for running filter query.
   *
   * @param {object} options
   */
  filter(options) {
    const web3 = this._web3AlternativeToMetaMask || this.web3;

    return web3.eth.filter(options);
  }

  /**
   * @private
   */
  async _init() {
    if (this.initialized) {
      return;
    }

    await this.connect();

    this.initialized = true;
  }
}

export function initWeb3Service(isServer, source, keyModifier, w3Util) {
  if (isServer) {
    return new Web3Service(source, keyModifier, w3Util);
  }

  if (instance === null) {
    instance = new Web3Service(source, keyModifier, w3Util);
  }

  return instance;
}
