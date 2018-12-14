/*eslint no-control-regex: "off"*/
import Bb from 'bluebird';
import standardTokenAbi from '../abi/standardToken';

const cleanAsciiText = text => text && text.replace(/[\x00-\x09\x0b-\x1F]/g, '').trim();

export default class TokenHelper {
  _web3;
  _web3Service;

  constructor(web3Service) {
    this._web3Service = web3Service;
    this._web3 = web3Service.web3;
  }

  async approveTokenTransfer(token, receiver, amount) {
    const contract = new this._web3.eth.Contract(standardTokenAbi, token);

    return await Bb.fromCallback(callback =>
      contract.approve(receiver, amount, { from: this.defaultAccount }, callback)
    );
  }

  isTokenTransferTransaction(callData) {
    if (!callData) {
      return false;
    }

    const functionName = 'transferFrom(address,address,uint256)';
    const encodedFunction = this._encodeFunctionName(functionName);

    return new RegExp(encodedFunction).test(callData);
  }

  async isTokenTransferApproved(token, sender, value) {
    const contract = new this._web3.eth.Contract(standardTokenAbi, token);

    const allowance = await Bb.fromCallback(callback =>
      contract.allowance(this._firstAccount, sender, callback)
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

    const details = this._decodeTransactionData(callData, functionName, params);

    details.map((val, index) => (details[params[index].name] = val));

    return details;
  }

  async getTokenTransferData(token, receiver, amount) {
    const contract = new this._web3.eth.Contract(standardTokenAbi, token);

    return contract.transferFrom.getData(this._firstAccount, receiver, amount);
  }

  async estimateTokenTransfer(token, receiver, amount) {
    if (Number(amount) === 0) {
      return 0;
    }

    const contract = new this._web3.eth.Contract(standardTokenAbi, token);

    return await Bb.fromCallback(callback =>
      contract.transfer.estimateGas(receiver, amount, callback)
    );
  }

  async fetchTokenDetails(address) {
    const contract = new this._web3.eth.Contract(standardTokenAbi, address);

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

      this._web3.eth.call(
        {
          to: address,
          data: SYMBOL_CALL_DATA
        },
        (error, result) => {
          resolve(cleanAsciiText(this._web3.toAscii(result)));
        }
      );
    });
  }

  async getTokenName(address) {
    return new Promise(resolve => {
      const NAME_CALL_DATA = '0x06fdde03';

      this._web3.eth.call(
        {
          to: address,
          data: NAME_CALL_DATA
        },
        (error, result) => {
          resolve(cleanAsciiText(this._web3.toAscii(result)));
        }
      );
    });
  }

  sendTokensData(token, destination, amount) {
    const contract = new this._web3.eth.Contract(standardTokenAbi, token);

    return contract.transfer.getData(destination, amount);
  }

  async getTokenBalanceOf(tokenAddress, targetAddress) {
    const contract = new this._web3.eth.Contract(standardTokenAbi, tokenAddress);

    return (await Bb.fromCallback(callback => {
      return contract.balanceOf.call(targetAddress, callback);
    })).valueOf();
  }

  async fetchTokenBalance(address) {
    return this._firstAccount ? await this.getTokenBalanceOf(address, this._firstAccount) : '-';
  }

  /**
   * @private
   *
   * @param {string} callData
   * @param {string} functionName
   * @param {any[]} params
   */
  _decodeTransactionData(callData, functionName, params) {
    if (typeof functionName === 'undefined' || params.length < 1) {
      return;
    }

    let types = [];
    // const Coder = require('web3/lib/solidity/coder');
    for (let p = 0; p < params.length; p++) {
      types.push(params[p].type);
    }
    const funcName = `${functionName}(${types.join(',')})`;
    const preparedData = callData.substring(this._encodeFunctionName(funcName).length);

    return preparedData; //Coder.decodeParams(types, preparedData);
  }

  /**
   * @private
   *
   * @param {string} functionName
   */
  _encodeFunctionName(functionName) {
    if (typeof functionName === 'undefined') {
      return;
    }

    return this._web3.sha3(functionName).substring(0, 10);
  }

  /**
   * @private
   */
  get _defaultAccount() {
    return this._web3Service.defaultAccount;
  }

  /**
   * @private
   */
  get _firstAccount() {
    return this._web3Service.accounts && this._web3Service.accounts[0];
  }
}
