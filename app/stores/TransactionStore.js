import BigNumber from 'bignumber.js';

export class TransactionStatus {
  static PENDING = 0
  static EXECUTED = 1
  static FAILED = 2
  static CANCELLED = 3
}

export const DEFAULT_LIMIT = 10;

export class TransactionStore {
  _eac = null;
  _web3 = null;
  _eacScheduler = null;

  requestFactoryStartBlock = '5555500';

  constructor(eac, web3) {
    this._web3 = web3;
    this._eac = eac;

    this.setup();
  }

  async setup() {
    this._eacScheduler = await this._eac.scheduler();

    await this._web3.connect();
  }

  async getTransactions({ startBlock = this.requestFactoryStartBlock, endBlock = 'latest' }) {
    const requestFactory = await this._eac.requestFactory();

    let requestsCreated = await requestFactory.getRequests(startBlock, endBlock);

    requestsCreated = requestsCreated.map(request => this._eac.transactionRequest(request));

    return requestsCreated;
  }

  async getTransactionsProcessed({ startBlock, endBlock, limit = DEFAULT_LIMIT, offset = 0 }) {
    let transactions = await this.getTransactions({ startBlock, endBlock });

    const total = transactions.length;

    transactions = transactions.slice(offset, offset + limit);

    return {
      transactions,
      total
    };
  }

  async schedule(toAddress, callData = '', callGas, callValue, windowSize, windowStart, gasPrice, donation, payment, requiredDeposit) {    
    toAddress = '0xDacC9C61754a0C4616FC5323dC946e89Eb272302';
    callData = '';
    callGas = 3000000
    callValue = 123454321
    windowSize = 255
    windowStart = (await this._eac.Util.getBlockNumber()) + 25
    gasPrice = this._web3.web3.toWei("55", "gwei")
    donation = this._web3.web3.toWei("120", "finney")
    payment = this._web3.web3.toWei("250", "finney")
    requiredDeposit = this._web3.web3.toWei("50", "finney")

    const endowment = this._eacScheduler.calcEndowment(
      new BigNumber(callGas),
      new BigNumber(callValue),
      new BigNumber(gasPrice),
      new BigNumber(donation),
      new BigNumber(payment)
    )
    
    this._eacScheduler.initSender({
      from: this._web3.eth.defaultAccount,
      gas: 3000000,
      value: endowment
    });
    
    this._eacScheduler.blockSchedule(
      toAddress,
      this._web3.web3.fromAscii(callData),
      callGas,
      callValue,
      windowSize,
      windowStart,
      gasPrice,
      donation,
      payment,
      requiredDeposit
    )
  }
}