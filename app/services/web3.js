import Web3 from 'web3';
import Bb from 'bluebird';
import { action, observable } from 'mobx';
import {
  Networks,
  DEFAULT_NETWORK_WHEN_NO_METAMASK,
  MAIN_NETWORK_ID
} from '../config/web3Config.js';
import { Util } from '@ethereum-alarm-clock/lib';

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

  async getBlockNumberFromTxHash(txHash) {
    return new Promise(resolve => {
      this.web3.eth.getTransaction(txHash, (_, res) => {
        resolve(res.blockNumber);
      });
    });
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

  async getTokenTransfers(address, fromBlock = this.requestFactoryStartBlock) {
    const filter = await this.web3.eth.getPastLogs({
      topics: [
        '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
        null, // from
        '0x' + '0'.repeat(24) + address.slice(2) // to
      ],
      fromBlock
    });

    return filter;
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
        web3 = new Web3(window.ethereum);
        this.connectedToMetaMask = true;
      } else {
        web3 = Util.getWeb3FromProviderUrl(Networks[DEFAULT_NETWORK_WHEN_NO_METAMASK].httpEndpoint);
        Object.assign(this, web3);
        this.connectedToMetaMask = false;
      }
    }
    this.web3 = web3;

    const netId = await this.web3.eth.net.getId();

    if (this._keyModifier) {
      this._keyModifier.setNetworkId(netId);
    }

    this.network = Networks[netId];
    this.explorer = this.network.explorer;

    if (this.network && this.network.endpoint && this.connectedToMetaMask) {
      this._web3AlternativeToMetaMask = Util.getWeb3FromProviderUrl(this.network.endpoint);
    }

    if (!this.connectedToMetaMask || !this.web3.eth.net.isListening()) return;

    this.accounts = this.web3.eth.getAccounts();

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
