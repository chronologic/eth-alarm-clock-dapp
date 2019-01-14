/*eslint no-control-regex: "off"*/
import Bb from 'bluebird';
import standardTokenAbi from '../abi/standardToken';
import cryptoKittiesTokenAbi from '../abi/cryptoKittiesToken';
import ERC721Abi from '../abi/ERC721';
import { PREDEFINED_TOKENS_FOR_NETWORK } from '../config/web3Config';

const cleanAsciiText = text => text && text.replace(/[\x00-\x09\x0b-\x1F]/g, '').trim();

export default class TokenHelper {
  _web3;
  _web3Service;

  constructor(web3Service) {
    this._web3Service = web3Service;
    this._web3 = web3Service.web3;
  }

  async approveTokenTransfer(token, receiver, amount) {
    const contract = this._web3.eth.contract(standardTokenAbi).at(token);

    return await Bb.fromCallback(callback =>
      contract.approve(receiver, amount, { from: this._defaultAccount }, callback)
    );
  }

  async approveERC721Transfer(token, spender, collectibleId) {
    const contract = this._web3.eth.contract(ERC721Abi).at(token);

    return await Bb.fromCallback(callback =>
      contract.approve(spender, collectibleId, { from: this._firstAccount }, callback)
    );
  }

  isTokenTransferTransaction(callData) {
    if (!callData) {
      return false;
    }

    const encodedTransferFrom = this._encodeFunctionName('transferFrom(address,address,uint256)');
    const encodedSafeTransferFrom = this._encodeFunctionName(
      'safeTransferFrom(address,address,uint256)'
    );

    return new RegExp(`${encodedTransferFrom}|${encodedSafeTransferFrom}`).test(callData);
  }

  async isTokenTransferApproved(token, owner, spender, value) {
    const contract = this._web3.eth.contract(standardTokenAbi).at(token);

    const allowance = await Bb.fromCallback(callback =>
      contract.allowance(owner, spender, callback)
    );

    return Number(allowance) >= Number(value);
  }

  async isERC721TransferApproved(address, scheduledTxAddress, tokenId, supportsGetApproved) {
    let approved = false;

    if (supportsGetApproved) {
      const contract = this._web3.eth.contract(ERC721Abi).at(address);

      approved = (await Bb.fromCallback(callback => {
        return contract.getApproved.call(tokenId, callback);
      })).valueOf();
    } else {
      const contract = this._web3.eth.contract(cryptoKittiesTokenAbi).at(address);

      approved = (await Bb.fromCallback(callback => {
        return contract.kittyIndexToApproved.call(tokenId, callback);
      })).valueOf();
    }

    return approved === scheduledTxAddress;
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
    const contract = this._web3.eth.contract(standardTokenAbi).at(token);

    return contract.transferFrom.getData(this._firstAccount, receiver, amount);
  }

  async estimateTokenTransfer(token, receiver, amount) {
    if (Number(amount) === 0) {
      return 0;
    }

    const contract = this._web3.eth.contract(standardTokenAbi).at(token);

    return await Bb.fromCallback(callback =>
      contract.transfer.estimateGas(receiver, amount, callback)
    );
  }

  async estimateERC721Transfer(tokenAddress, from, to, tokenId) {
    if (!from) {
      from = this._firstAccount;
    }

    if (!tokenId) {
      return 0;
    }

    const contract = this._web3.eth.contract(ERC721Abi).at(tokenAddress);

    const config = this.getTokenConfig(tokenAddress);

    if (config && config.supportedMethods && config.supportedMethods.safeTransferFrom) {
      return await Bb.fromCallback(callback =>
        contract.safeTransferFrom.estimateGas(from, to, tokenId, callback)
      );
    }

    return await Bb.fromCallback(callback =>
      contract.transferFrom.estimateGas(from, to, tokenId, callback)
    );
  }

  async isERC721(address) {
    const config = this.getTokenConfig(address);

    if (config && config.supportedMethods) {
      return {
        ERC721: config.type === 'erc721',
        getApproved: config.supportedMethods.getApproved,
        safeTransferFrom: config.supportedMethods.safeTransferFrom
      };
    }

    const supportsEIP165 = await this._web3Service.supportsEIP165(address);

    if (!supportsEIP165) {
      return false;
    }

    const INTERFACE_ERC_721 = '0x80ac58cd'; // ERC721 with safeTransferFrom and getApproved

    const supportsFullERC721 = await this._web3Service.supportsInterface(
      address,
      INTERFACE_ERC_721
    );

    if (supportsFullERC721) {
      return {
        ERC721: true,
        safeTransferFrom: true,
        getApproved: true
      };
    }

    const INTERFACE_ERC_721_INCOMPLETE = '0x9a20483d';
    // NO safeTransferFrom and getApproved

    const supportsIncompleteERC721 = await this._web3Service.supportsInterface(
      address,
      INTERFACE_ERC_721_INCOMPLETE
    );

    if (supportsIncompleteERC721) {
      return {
        ERC721: true,
        safeTransferFrom: false,
        getApproved: false
      };
    }

    return {
      ERC721: false,
      safeTransferFrom: false,
      getApproved: false
    };
  }

  async getERC721TransferData(tokenAddress, from, to, tokenId) {
    if (!from) {
      from = this._firstAccount;
    }

    const contract = this._web3.eth.contract(ERC721Abi).at(tokenAddress);

    const config = this.getTokenConfig(tokenAddress);

    if (config && config.supportedMethods && config.supportedMethods.safeTransferFrom) {
      return contract.safeTransferFrom.getData(from, to, tokenId);
    }

    return contract.transferFrom.getData(from, to, tokenId);
  }

  async fetchTokenDetails(address) {
    const contract = this._web3.eth.contract(standardTokenAbi).at(address);

    const details = {
      address,
      name: await this.getTokenName(address),
      symbol: await this.getTokenSymbol(address)
    };

    try {
      details.decimals = (await Bb.fromCallback(callback =>
        contract.decimals.call(callback)
      )).valueOf();
    } catch (error) {
      console.error(
        'Trying to call token decimals() function failed. Falling back to decimals: 0.',
        error
      );
      details.decimals = 0;
    }

    return details;
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
    const contract = this._web3.eth.contract(standardTokenAbi).at(token);

    return contract.transfer.getData(destination, amount);
  }

  async getTokenBalanceOf(tokenAddress, targetAddress) {
    const contract = this._web3.eth.contract(standardTokenAbi).at(tokenAddress);

    return (await Bb.fromCallback(callback => {
      return contract.balanceOf.call(targetAddress, callback);
    })).valueOf();
  }

  async fetchTokenBalance(address) {
    return this._firstAccount ? await this.getTokenBalanceOf(address, this._firstAccount) : '-';
  }

  /**
   * Helper method for contracts such as CryptoKitties
   */
  async getTokensOfOwner(tokenAddress, addressToCheck = this._firstAccount) {
    const contract = this._web3.eth.contract(cryptoKittiesTokenAbi).at(tokenAddress);

    const tokenConfig = this.getTokenConfig(tokenAddress);

    if (tokenConfig && tokenConfig.customGetTokensForOwner) {
      return tokenConfig.customGetTokensForOwner(tokenAddress);
    }

    return (await Bb.fromCallback(callback => {
      return contract.tokensOfOwner.call(addressToCheck, callback);
    })).valueOf();
  }

  getTokenConfig(address) {
    if (!address) {
      return;
    }

    const networkTokens = PREDEFINED_TOKENS_FOR_NETWORK[this._web3Service.network.id];

    address = address.toLowerCase();

    if (networkTokens) {
      return networkTokens.find(t => t.address.toLowerCase() === address);
    }
  }

  getTokenImagePath(token, tokenId) {
    if (!token || !tokenId || !token.imagePath) {
      return;
    }

    return token.imagePath.replace('{TOKEN_ID}', tokenId);
  }

  getPredefinedTokenSymbols() {
    const predefinedTokens =
      this._web3Service.network && PREDEFINED_TOKENS_FOR_NETWORK[this._web3Service.network.id];

    return predefinedTokens && predefinedTokens.map(t => t.symbol);
  }

  isCollectible(tokenAddress) {
    if (!tokenAddress) {
      return false;
    }

    const config = this.getTokenConfig(tokenAddress);

    return config && config.type === 'erc721';
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
    const Coder = require('web3/lib/solidity/coder');
    for (let p = 0; p < params.length; p++) {
      types.push(params[p].type);
    }
    const funcName = `${functionName}(${types.join(',')})`;
    const preparedData = callData.substring(this._encodeFunctionName(funcName).length);

    return Coder.decodeParams(types, preparedData);
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
