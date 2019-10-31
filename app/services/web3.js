import Web3 from 'web3-1';
import Web3_0 from 'web3';
import Web3WsProvider from 'web3-providers-ws';
import Bb from 'bluebird';
import { action, observable } from 'mobx';
import {
  Networks,
  DEFAULT_NETWORK_WHEN_NO_METAMASK,
  MAIN_NETWORK_ID
} from '../config/web3Config.js';
import { stripHexPrefixAndLower } from '../lib/signature.js';

let instance = null;

const SUPPORTS_INTERFACE_CALL_DATA = '0x01ffc9a7'; // bytes4(keccak256('supportsInterface(bytes4)'));

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
    return this.web3.utils.fromWei(wei);
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

  async waitForMining(hash) {
    let receipt;

    while (!receipt || !receipt.blockNumber) {
      await new Promise(resolve => {
        setTimeout(async () => {
          receipt = await this.fetchReceipt(hash);
          resolve();
        }, 500);
      });
    }

    return receipt;
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

  getTokenTransfers(address, fromBlock = 0) {
    const filter = this.web3.eth.getPastLogs({
      fromBlock,
      toBlock: 'latest',
      topics: [
        '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
        null, // from
        '0x' + '0'.repeat(24) + address.slice(2) // to
      ]
    });

    return new Promise(resolve => {
      filter.get((_, res) => {
        resolve(res);
      });
    });
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
      let web3_0;
      if (typeof window.web3 !== 'undefined') {
        web3 = new Web3(window.ethereum);
        web3_0 = new Web3_0(window.ethereum);
        this.connectedToMetaMask = true;
      } else {
        web3 = this.getWeb3FromProviderUrl(Networks[DEFAULT_NETWORK_WHEN_NO_METAMASK].httpEndpoint);
        web3_0 = this.getWeb3_0FromProviderUrl(
          Networks[DEFAULT_NETWORK_WHEN_NO_METAMASK].httpEndpoint
        );
        Object.assign(this, web3);
        this.connectedToMetaMask = false;
      }

      this.web3 = web3;
      this.web3_0 = web3_0;
    }

    const netId = await Bb.fromCallback(callback => web3.eth.net.getId(callback));

    if (this._keyModifier) {
      this._keyModifier.setNetworkId(netId);
    }

    this.network = Networks[netId];
    this.explorer = this.network.explorer;

    if (this.network && this.network.endpoint && this.connectedToMetaMask) {
      this._web3AlternativeToMetaMask = this.getWeb3FromProviderUrl(this.network.endpoint);
    }

    const isListening = await web3.eth.net.isListening();

    if (!this.connectedToMetaMask || !isListening) return;

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

  getWeb3FromProviderUrl(providerUrl) {
    return Web3Service.getWeb3FromProviderUrl(providerUrl);
  }

  getWeb3_0FromProviderUrl(providerUrl) {
    return Web3Service.getWeb3_0FromProviderUrl(providerUrl);
  }

  static getWeb3FromProviderUrl(providerUrl) {
    let provider;
    if (this.isHTTPConnection(providerUrl)) {
      provider = new Web3.providers.HttpProvider(providerUrl);
    } else if (this.isWSConnection(providerUrl)) {
      provider = new Web3WsProvider(providerUrl);
      provider.__proto__.sendAsync = provider.__proto__.sendAsync || provider.__proto__.send;
    }
    return new Web3(provider);
  }

  static getWeb3_0FromProviderUrl(providerUrl) {
    let provider;
    if (this.isHTTPConnection(providerUrl)) {
      provider = new Web3_0.providers.HttpProvider(providerUrl);
    } else if (this.isWSConnection(providerUrl)) {
      provider = new Web3WsProvider(providerUrl);
      provider.__proto__.sendAsync = provider.__proto__.sendAsync || provider.__proto__.send;
    }
    return new Web3_0(provider);
  }
  static isHTTPConnection(url) {
    return url.includes('http://') || url.includes('https://');
  }
  static isWSConnection(url) {
    return url.includes('ws://') || url.includes('wss://');
  }

  /**
   * Since there are problems with using filter for events
   * with array as an address parameter in MetaMask,
   * we're using custom HTTP provider for running filter query.
   *
   * @param {object} options
   */
  filter(options) {
    // const web3 = this._web3AlternativeToMetaMask || this.web3;

    return this.web3.eth.getPastLogs(options);
  }

  toBoolean(hexString) {
    if (hexString === '0x') hexString = '0x0';
    return this.web3.toBigNumber(hexString).toString() === '1';
  }

  supportsEIP165(address) {
    return this.supportsInterface(address, SUPPORTS_INTERFACE_CALL_DATA);
  }

  // checks using EIP165 if contract supports certain interface
  supportsInterface(address, interfaceToCheckFor) {
    return new Promise(resolve => {
      this.web3.eth.call(
        {
          to: address,
          data: SUPPORTS_INTERFACE_CALL_DATA + stripHexPrefixAndLower(interfaceToCheckFor)
        },
        (error, result) => {
          resolve(this.toBoolean(result));
        }
      );
    });
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
