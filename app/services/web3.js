/*eslint no-control-regex: "off"*/

import Web3 from 'web3/index';
import Bb from 'bluebird';
import { action, observable } from 'mobx';
import { Networks, DEFAULT_NETWORK_WHEN_NO_METAMASK } from '../config/web3Config.js';
import standardTokenAbi from '../abi/standardToken';
import Web3WsProvider from 'web3-providers-ws';

let instance = null;

function cleanAsciiText(text) {
  if (text) {
    return text.replace(/[\x00-\x09\x0b-\x1F]/g, '').trim();
  }
}

const getWeb3FromProviderUrl = providerUrl => {
  let provider;

  if (providerUrl.includes('http://') || providerUrl.includes('https://')) {
    provider = new Web3.providers.HttpProvider(providerUrl);
  } else if (providerUrl.includes('ws://') || providerUrl.includes('wss://')) {
    provider = new Web3WsProvider(providerUrl);
    provider.__proto__.sendAsync = provider.__proto__.sendAsync || provider.__proto__.send;
  }

  return new Web3(provider);
};

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

  _keyModifier = null;

  constructor(props, networkAwareKeyModifier) {
    Object.assign(this, props);

    this._keyModifier = networkAwareKeyModifier;
  }

  _initializationPromise;
  web3AlternativeToMetaMask;

  async _init() {
    if (this.initialized) {
      return;
    }

    await this.connect();

    this.initialized = true;
  }

  @action
  init() {
    if (!this._initializationPromise) {
      this._initializationPromise = this._init();
    }

    return this._initializationPromise;
  }

  toEth(_wei) {
    const _toWei = this.web3.toWei(_wei, 'gwei');
    const ethValue = this.web3.fromWei(_toWei, 'ether');
    return ethValue;
  }

  fromWei(wei) {
    return this.web3.fromWei(wei);
  }

  encodeFunctionName(functionName) {
    if (typeof functionName === 'undefined') {
      return;
    }
    const encoded = this.web3.sha3(functionName);
    return encoded.substring(0, 10);
  }

  encodeTransactionData(functionName, params) {
    if (typeof functionName === 'undefined' || params.length < 1) {
      return;
    }
    let types = [];
    let values = [];
    const Coder = require('web3/lib/solidity/coder');
    for (let p = 0; p < params.length; p++) {
      types.push(params[p].type);
      values.push(params[p].value);
    }
    const funcName = `${functionName}(${types.join(',')})`;
    const func = this.encodeFunctionName(funcName);
    const encoded = Coder.encodeParams(types, values);
    return func + encoded;
  }

  decodeTransactionData(callData, functionName, params) {
    if (typeof functionName === 'undefined' || params.length < 1) {
      return;
    }
    let types = [];
    const Coder = require('web3/lib/solidity/coder');
    for (let p = 0; p < params.length; p++) {
      types.push(params[p].type);
    }
    const funcName = `${functionName}(${types.join(',')})`;
    const func = this.encodeFunctionName(funcName);
    const preparedData = callData.substring(func.length);
    const decoded = Coder.decodeParams(types, preparedData);
    return decoded;
  }

  isTokenTransferTransaction(callData) {
    if (!callData) {
      return false;
    }
    const functionName = 'transferFrom(address,address,uint256)';
    const encodedFunction = this.encodeFunctionName(functionName);
    return new RegExp(encodedFunction).test(callData);
  }

  async isTokenTransferApproved(token, sender, value) {
    const contract = this.web3.eth.contract(standardTokenAbi).at(token);
    const owner = this.accounts[0];
    const allowance = await Bb.fromCallback(callback =>
      contract.allowance(owner, sender, callback)
    );
    return Number(allowance) >= Number(value);
  }

  async getTokenTransferInfoFromData(callData) {
    const functionName = 'transferFrom';
    const params = [
      { type: 'address', name: 'owner' },
      { type: 'address', name: 'sender' },
      { type: 'uint256', name: 'value' }
    ];

    const details = this.decodeTransactionData(callData, functionName, params);

    details.map((val, index) => (details[params[index].name] = val));

    return details;
  }

  async getTokenTransferData(token, receiver, amount) {
    const contract = this.web3.eth.contract(standardTokenAbi).at(token);
    const sender = this.accounts[0];

    return contract.transferFrom.getData(sender, receiver, amount);
  }

  async estimateTokenTransfer(token, receiver, amount) {
    if (Number(amount) === 0) {
      return 0;
    }
    const contract = this.web3.eth.contract(standardTokenAbi).at(token);
    const estimate = await Bb.fromCallback(callback =>
      contract.transfer.estimateGas(receiver, amount, callback)
    );
    return estimate;
  }

  async fetchTokenDetails(address) {
    const contract = this.web3.eth.contract(standardTokenAbi).at(address);

    return {
      address,
      name: await this.getTokenName(address),
      symbol: await this.getTokenSymbol(address),
      decimals: (await Bb.fromCallback(callback => contract.decimals.call(callback))).valueOf()
    };
  }

  async getTokenSymbol(address) {
    return new Promise(resolve => {
      const SYMBOL_CALL_DATA = '0x95d89b41';

      this.web3.eth.call(
        {
          to: address,
          data: SYMBOL_CALL_DATA
        },
        (error, result) => {
          resolve(cleanAsciiText(this.web3.toAscii(result)));
        }
      );
    });
  }

  async getTokenName(address) {
    return new Promise(resolve => {
      const NAME_CALL_DATA = '0x06fdde03';

      this.web3.eth.call(
        {
          to: address,
          data: NAME_CALL_DATA
        },
        (error, result) => {
          resolve(cleanAsciiText(this.web3.toAscii(result)));
        }
      );
    });
  }

  async fetchTokenBalance(address) {
    const contract = this.web3.eth.contract(standardTokenAbi).at(address);
    const balance =
      this.accounts && this.accounts[0]
        ? (await Bb.fromCallback(callback =>
            contract.balanceOf.call(this.accounts[0], callback)
          )).valueOf()
        : '-';
    return balance;
  }

  async fetchReceipt(hash) {
    let { web3 } = this;

    return await Bb.fromCallback(callback => web3.eth.getTransactionReceipt(hash, callback));
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
      const confirmations = new Promise(resolve => {
        setTimeout(async () => {
          resolve(await this.fetchConfirmations(transaction));
        }, 2000);
      });
      return confirmations;
    }

    return block - mined.blockNumber;
  }

  async fetchBlockNumber() {
    const { web3 } = this;

    const block = await Bb.fromCallback(callback => web3.eth.getBlockNumber(callback));
    this.latestBlockNumber = block;
    return block;
  }

  async hasCode(address) {
    const { web3 } = this;
    const code = await Bb.fromCallback(callback => web3.eth.getCode(address, callback));
    return code.toString() != '0x0';
  }

  async approveTokenTransfer(token, receiver, amount) {
    const contract = this.web3.eth.contract(standardTokenAbi).at(token);
    const approve = await Bb.fromCallback(callback =>
      contract.approve(receiver, amount, { from: this.defaultAccount }, callback)
    );
    return approve;
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
        web3 = getWeb3FromProviderUrl(Networks[DEFAULT_NETWORK_WHEN_NO_METAMASK].httpEndpoint);
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
      this.web3AlternativeToMetaMask = getWeb3FromProviderUrl(this.network.endpoint);
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

  humanizeCurrencyDisplay(priceInWei) {
    const ETHER_UNITS_VALUES_MAPPING = {
      WEI: 1,
      MWEI: 1000000,
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

  /**
   * Since there are problems with using filter for events
   * with array as an address parameter in MetaMask,
   * we're using custom HTTP provider for running filter query.
   *
   * @param {object} options
   */
  filter(options) {
    const web3 = this.web3AlternativeToMetaMask || this.web3;

    return web3.eth.filter(options);
  }
}

export function initWeb3Service(isServer, source, keyModifier) {
  if (isServer) {
    return new Web3Service(source, keyModifier);
  }

  if (instance === null) {
    instance = new Web3Service(source, keyModifier);
  }

  return instance;
}
