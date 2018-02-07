import BigNumber from 'bignumber.js';
import { observable } from 'mobx';

export const DEFAULT_LIMIT = 10;

export class TransactionStore {
  _eac = null;
  _web3 = null;
  _eacScheduler = null;

  @observable allTransactions;

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

  async getAllTransactions() {
    this.allTransactions = await this.getTransactions({});

    for (let transaction of this.allTransactions) {
      await transaction.fillData();
      transaction.resolved = await this.isTransactionResolved(transaction);
    }
  }

  async queryTransactions({ transactions, offset, limit, resolved }) {
    const processed = [];

    for (let transaction of transactions) {
      await transaction.fillData();

      const isResolved = await this.isTransactionResolved(transaction);

      if (isResolved === resolved) {
        processed.push(transaction);
      }
    }

    transactions = processed;

    const total = transactions.length;

    transactions = transactions.slice(offset, offset + limit);

    return {
      transactions,
      total
    };
  }

  async getTransactionsFiltered({ startBlock, endBlock, limit = DEFAULT_LIMIT, offset = 0, resolved }) {
    let transactions = await this.getTransactions({ startBlock, endBlock });

    if (typeof(resolved) !== 'undefined') {
      return this.queryTransactions({
        transactions,
        offset,
        limit,
        resolved
      });
    }

    const total = transactions.length;

    transactions = transactions.slice(offset, offset + limit);

    return {
      transactions,
      total
    };
  }

  async getTxStatus(transaction) {
    let status = 'Scheduled';

    if (transaction.wasCalled) {
      status = transaction.data.meta.wasSuccessful ? 'Executed' : 'Failed';
    }

    if (transaction.isCancelled) {
      status = 'Cancelled';
    }

    if (await this.isTransactionMissed(transaction)) {
      status = 'Not executed';
    }

    return status;
  }

  async isTransactionResolved(transaction) {
    const isMissed = await this.isTransactionMissed(transaction);

    return isMissed || transaction.wasCalled || transaction.isCancelled;
  }

  async isTransactionMissed(transaction) {
    const executionWindowClosed = await transaction.afterExecutionWindow();

    return executionWindowClosed && !transaction.wasCalled;
  }

  async schedule(toAddress, callData = '', callGas, callValue, windowSize, windowStart, gasPrice, donation, payment, requiredDeposit) {    
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