import { observable, computed } from 'mobx';
import { showNotification } from '../services/notification';

const requestFactoryStartBlocks = {
  3: 2594245,
  42: 5555500
};

export const DEFAULT_LIMIT = 10;

export class TRANSACTION_STATUS {
  static SCHEDULED = 'Scheduled';
  static EXECUTED = 'Executed';
  static FAILED = 'Failed';
  static CANCELLED = 'Cancelled';
  static MISSED = 'Not executed';
}

export class TEMPORAL_UNIT {
  static BLOCK = 1;
  static TIMESTAMP = 2;
}

const PARAMS_ERROR_TO_MESSAGE_MAPPING = {
  EmptyToAddress: 'Please enter recipient address.',
  CallGasTooHigh: 'Call gas is too high.',
  ExecutionWindowTooSoon: 'Execution window too soon. Please choose later date.',
  InsufficientEndowment: 'Automatically calculated endowment is insufficient. Please contact developers.',
  ReservedWindowBiggerThanExecutionWindow: 'Reserved window is bigger than execution window.',
  InvalidTemporalUnit: 'Temporal unit is invalid. It should be either block or time.'
};

const SCHEDULING_GAS_LIMIT = 1500000;

export class TransactionStore {
  _eac = null;
  _web3 = null;
  _cache = null;
  _eacScheduler = null;
  isSetup = false;

  @observable filter = '';

  // Returns an array of transactions based on the current
  // state of the filter variable
  @computed get filteredTransactions() {
    const matchesFilter = new RegExp(this.filter, 'i');
    if (!this.filter && this.filter.length < 1) {
      return [];
    }

    if (this._cache.allTransactions) {
      return this._cache.allTransactions.filter(
        transaction => matchesFilter.test(transaction.address)
      );
    }
  }

  get allTransactions () {
    return this._cache.allTransactions;
  }

  // Returns an array of only the addresses of all transactions
  get allTransactionsAddresses() {
    return this._cache.allTransactionsAddresses;
  }

  get requestFactoryStartBlock () {
    const { netId } = this._web3;
    return requestFactoryStartBlocks[netId] || 0;
  }

  constructor(eac, web3, cache) {
    this._web3 = web3;
    this._eac = eac;
    this._cache = cache;

    this.setup();
  }

  async setup() {
    if (this.isSetup) {
      return;
    }

    this._eacScheduler = this._eacScheduler || await this._eac.scheduler();

    await this._web3.awaitInitialized();

    this._cache.requestFactoryStartBlock = this.requestFactoryStartBlock;
    this._cache.startLazy();

    this.isSetup = true;
  }

  async getTransactions({ startBlock, endBlock = 'latest' }, cached) {
    await this.setup();

    startBlock = startBlock || this.requestFactoryStartBlock;//allow all components preload
    return await this._cache.getTransactions({ startBlock , endBlock }, cached);
  }

  async getAllTransactions(cached) {
    const transactions =  await this._cache.getAllTransactions(cached);

    for (let transaction of transactions) {
      transaction.status = await this.getTxStatus(transaction);
    }

    return transactions;
  }

  async queryTransactions( { transactions, offset, limit, resolved } ) {
    const processed = [];

    await this._cache.queryTransactions (transactions);

    for (let transaction of transactions) {

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

  async getTransactionsFiltered( { startBlock, endBlock, limit = DEFAULT_LIMIT, offset = 0, resolved } ) {
    let transactions = await this.getTransactions( { startBlock, endBlock } );

    if (typeof(resolved) !== 'undefined') {
      return this.queryTransactions( {
        transactions,
        offset,
        limit,
        resolved
      } );
    }

    const total = transactions.length;

    transactions = transactions.slice(offset, offset + limit);

    return {
      transactions,
      total
    };
  }

  async getTxStatus(transaction) {
    let status = TRANSACTION_STATUS.SCHEDULED;

    if (transaction.wasCalled) {
      status = transaction.data.meta.wasSuccessful ? TRANSACTION_STATUS.EXECUTED : TRANSACTION_STATUS.FAILED;
    }

    if (transaction.isCancelled) {
      status = TRANSACTION_STATUS.CANCELLED;
    }

    if (await this.isTransactionMissed(transaction)) {
      status = TRANSACTION_STATUS.MISSED;
    }

    return status;
  }

  async getTransactionByAddress(address) {
    const txRequest = await this._eac.transactionRequest(address, this._web3);
    return txRequest;
  }

  async isTransactionResolved(transaction) {
    const isMissed = await this.isTransactionMissed(transaction);

    return isMissed || transaction.wasCalled || transaction.isCancelled;
  }

  async isTransactionMissed(transaction) {
    const executionWindowClosed = await transaction.afterExecutionWindow();

    return executionWindowClosed && !transaction.wasCalled;
  }

  async isTransactionFrozen(transaction) {
    return await transaction.inFreezePeriod();
  }

  isTxUnitTimestamp(transaction) {
    return transaction.temporalUnit === TEMPORAL_UNIT.TIMESTAMP;
  }

  async cancel(transaction,txParameters) {
    return await transaction.cancel(txParameters);
  }

  async validateRequestParams(toAddress, callData = '', callGas, callValue, windowSize, windowStart, gasPrice, fee, payment, requiredDeposit, isTimestamp, endowment) {
    const requestFactory = await this._eac.requestFactory();
    const temporalUnit = isTimestamp ? 2 : 1;
    const freezePeriod = isTimestamp ? 3 * 60 : 10; // 3 minutes or 10 blocks
    const reservedWindowSize = isTimestamp ? 5 * 60 : 16; // 5 minutes or 16 blocks
    const claimWindowSize = isTimestamp ? 60 * 60 : 255; // 60 minutes or 255 blocks
    const feeRecipient = '0x0'; // stub
    const fromAddress = this._web3.eth.defaultAccount;

    const serializedParams = [
      [
        fromAddress,
        feeRecipient,
        toAddress
      ],
      [
        fee,
        payment,
        claimWindowSize,
        freezePeriod,
        reservedWindowSize,
        temporalUnit,
        windowSize,
        windowStart,
        callGas,
        callValue,
        gasPrice,
        requiredDeposit
      ],
      callData,
      endowment
    ];

    let paramsValid = false;
    let errors = [];

    try {
      const paramsValidBooleans = await requestFactory.validateRequestParams(...serializedParams);

      errors = requestFactory.parseIsValid(paramsValidBooleans);

      paramsValid = errors.length === 0;
    } catch (error) {
      errors.push(error);
    }

    return {
      paramsValid,
      errors
    };
  }

  async schedule(toAddress, callData = '', callGas, callValue, windowSize, windowStart, gasPrice, fee, payment, requiredDeposit, waitForMined, isTimestamp) {
    const endowment = this._eac.calcEndowment(callGas, callValue, gasPrice, fee, payment);

    const { paramsValid, errors } = await this.validateRequestParams(
      toAddress,
      callData,
      callGas,
      callValue,
      windowSize,
      windowStart,
      gasPrice,
      fee,
      payment,
      requiredDeposit,
      isTimestamp,
      endowment
    );

    if (!paramsValid && errors.length > 0) {
      errors.forEach(error => error && showNotification(PARAMS_ERROR_TO_MESSAGE_MAPPING[error], 'danger', 4000));

      return;
    }

    await this._eacScheduler.initSender({
      from: this._web3.eth.defaultAccount,
      gas: SCHEDULING_GAS_LIMIT,
      value: endowment
    });

    if (isTimestamp) {
      const receipt = await this._eacScheduler.timestampSchedule(
        toAddress,
        callData,
        callGas,
        callValue,
        windowSize,
        windowStart,
        gasPrice,
        fee,
        payment,
        requiredDeposit,
        waitForMined
      );

      return receipt;
    }

    const receipt = await this._eacScheduler.blockSchedule(
      toAddress,
      callData,
      callGas,
      callValue,
      windowSize,
      windowStart,
      gasPrice,
      fee,
      payment,
      requiredDeposit,
      waitForMined
    );

    return receipt;
  }
}
