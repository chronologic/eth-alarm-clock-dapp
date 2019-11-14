import { showNotification } from '../services/notification';
import moment from 'moment';
import BigNumber from 'bignumber.js';
import { requestFactoryStartBlocks } from '../config/web3Config';
import { W3Util as TNUtil } from '@ethereum-alarm-clock/timenode-core';
import { observable } from 'mobx';

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
  InsufficientEndowment:
    'Automatically calculated endowment is insufficient. Please contact developers.',
  ReservedWindowBiggerThanExecutionWindow: 'Reserved window is bigger than execution window.',
  InvalidTemporalUnit: 'Temporal unit is invalid. It should be either block or time.'
};

export class TransactionStore {
  @observable
  initialized = false;

  @observable
  info = {
    gettingTransactions: false
  };

  _eac;
  _web3;
  _fetcher;
  _eacScheduler;
  _cache;
  _features;
  _requestFactory;
  _helper;
  _bucketHelper;
  _util;

  scheduledTransactions = [];

  constructor(eac, web3, fetcher, cache, featuresService, helper, bucketHelper) {
    this._web3 = web3;
    this._eac = eac;
    this._fetcher = fetcher;
    this._cache = cache;
    this._features = featuresService;
    this._helper = helper;
    this._bucketHelper = bucketHelper;
    this._util = new TNUtil(this._web3);

    this.init();
  }

  get lastBlock() {
    return this._fetcher && this._fetcher.lastBlock;
  }

  async updateLastBlock() {
    return this._fetcher.updateLastBlock();
  }

  // Returns an array of only the addresses of all transactions
  get allTransactionsAddresses() {
    return this._fetcher.allTransactionsAddresses;
  }

  get requestFactoryStartBlock() {
    const { network } = this._web3;

    return (network && requestFactoryStartBlocks[network.id]) || 0;
  }

  _initializationPromise;

  init() {
    if (!this._initializationPromise) {
      this._initializationPromise = this._init();
    }

    return this._initializationPromise;
  }

  async _init() {
    if (this.initialized) {
      return;
    }

    await this._web3.init();
    await this._features.awaitInitialized();

    if (!this._features.isCurrentNetworkSupported) {
      return;
    }

    if (!this._requestFactory) {
      this._requestFactory = await this._eac.requestFactory();
    }

    this._bucketHelper.setRequestFactory(this._requestFactory);

    this._eacScheduler = this._eacScheduler || (await this._eac.scheduler());

    this._fetcher.requestFactoryStartBlock = this.requestFactoryStartBlock || 1;
    this._fetcher.startLazy();

    this.initialized = true;
  }

  async getTransactions({ startBlock, endBlock = 'latest' }, cached) {
    this.info.gettingTransactions = true;

    await this.init();

    startBlock = startBlock || this.requestFactoryStartBlock; // allow all components preload

    const transactions = await this._fetcher.getTransactions({ startBlock, endBlock }, cached);

    this.info.gettingTransactions = false;

    return transactions;
  }

  async getAllTransactions(cached) {
    const transactions = await this._fetcher.getAllTransactions(cached);
    const currentTimestamp = moment().unix();

    for (const transaction of transactions) {
      transaction.status = this.getTxStatus(transaction, currentTimestamp, this.lastBlock);
    }

    return transactions;
  }

  getTxStatus(transaction, currentTimestamp) {
    return this._helper.getTxStatus(transaction, currentTimestamp, this.lastBlock);
  }

  async getAllTransactionAddresses() {
    if (
      this._fetcher.allTransactionsAddresses &&
      this._fetcher.allTransactionsAddresses.length > 0
    ) {
      return this._fetcher.allTransactionsAddresses;
    }

    return this._fetcher.getTransactions({}, true, true);
  }

  /**
   * @private
   * @returns Promise<{ transactions: Array }>
   */
  async _queryTransactions({
    transactions,
    offset,
    limit,
    pastHours,
    resolved,
    unresolved,
    sortByTimestampAscending
  }) {
    let processed = [];
    let total = 0;
    let buckets;

    if (pastHours) {
      buckets = await this._bucketHelper.getBucketsForLastHours(pastHours, this.lastBlock);
    }

    const currentTimestamp = moment().unix();

    for (const transaction of transactions) {
      let isResolved = this._helper.isTransactionResolved(
        transaction,
        currentTimestamp,
        this.lastBlock
      );
      let includeTransaction = false;

      if ((resolved && unresolved) || (isResolved && resolved) || (!isResolved && unresolved)) {
        includeTransaction = true;
      }

      if (pastHours && includeTransaction) {
        includeTransaction = buckets.includes(transaction.getBucket());
      }

      if (includeTransaction) {
        processed.push(transaction);
      }
    }

    if (unresolved) {
      const transactionsToCheck = [];
      const transactionsToExclude = [];

      for (const transaction of processed) {
        const isAfterWindowStart = this._helper.isTransactionAfterWindowStart(
          transaction,
          currentTimestamp,
          this.lastBlock
        );
        const isResolved = this._helper.isTransactionResolved(
          transaction,
          currentTimestamp,
          this.lastBlock
        );

        if (isAfterWindowStart && !isResolved) {
          transactionsToCheck.push(transaction);
        }
      }

      if (transactionsToCheck.length > 0) {
        await this._fetcher.fillUpTransactions(transactions);

        for (const transaction of transactionsToCheck) {
          if (this._helper.isTransactionResolved(transaction, currentTimestamp, this.lastBlock)) {
            transactionsToExclude.push(transaction);
          }
        }

        if (transactionsToExclude.length > 0) {
          processed = processed.filter(item => !transactionsToExclude.includes(item));
        }
      }
    }

    transactions = processed;

    if (sortByTimestampAscending) {
      const currentBlockTimestamp = await this._eac.Util.getTimestampForBlock(this.lastBlock);

      transactions = transactions.sort((a, b) => {
        const aTimestamp = this._helper.getTxTimestampEstimation(
          a,
          currentBlockTimestamp,
          this.lastBlock
        );
        const bTimestamp = this._helper.getTxTimestampEstimation(
          b,
          currentBlockTimestamp,
          this.lastBlock
        );

        if (aTimestamp > bTimestamp) {
          return 1;
        }

        if (aTimestamp < bTimestamp) {
          return -1;
        }

        return 0;
      });
    }

    total = transactions.length;
    transactions = transactions.slice(offset, offset + limit);

    return {
      transactions,
      total
    };
  }

  async getTransactionsFiltered({
    startBlock,
    endBlock,
    limit = DEFAULT_LIMIT,
    offset = 0,
    pastHours,
    resolved,
    unresolved,
    sortByTimestampAscending = true
  }) {
    let transactions = await this.getTransactions({ startBlock, endBlock });

    if (resolved || unresolved) {
      return this._queryTransactions({
        transactions,
        offset,
        limit,
        pastHours,
        resolved,
        unresolved,
        sortByTimestampAscending
      });
    }

    const total = transactions.length;

    transactions = transactions.slice(offset, offset + limit);

    return {
      transactions,
      total
    };
  }

  async getRequestsByOwner(ownerAddress, { limit = DEFAULT_LIMIT, offset = 0 }) {
    await this.init();

    const transactionsAddresses = await this._requestFactory.getRequestsByOwner(ownerAddress);
    let transactions = [];

    for (let address of transactionsAddresses) {
      const tx = await this._eac.transactionRequest(address);
      await tx.fillData();
      transactions.push(tx);
    }

    return {
      transactions: transactions.slice(offset, offset + limit),
      total: transactions.length
    };
  }

  async getTransactionByAddress(address) {
    await this._web3.init();

    return this._eac.transactionRequest(address, this._web3);
  }

  async isTransactionFrozen(transaction) {
    return transaction.inFreezePeriod();
  }

  isTxUnitTimestamp(transaction) {
    return this._helper.isTxUnitTimestamp(transaction);
  }

  async cancel(transaction, txParameters) {
    return transaction.cancel(txParameters);
  }

  async refund(transaction, txParameters) {
    return transaction.sendOwnerEther(txParameters);
  }

  async getBountiesForBucket(windowStart, isUsingTime) {
    await this.init();

    let bucket;
    if (isUsingTime) {
      bucket = await this._bucketHelper.calcBucketForTimestamp(windowStart, this.lastBlock);
    } else {
      bucket = await this._bucketHelper.calcBucketForBlock(windowStart, this.lastBlock);
    }
    const transactions = await this._fetcher.getTransactionsInBuckets([bucket]);

    const { web3 } = this._web3;

    const bounties = [];
    let bounty, bountyInEth;

    transactions.forEach(tx => {
      bounty = tx.data.paymentData.bounty;
      bountyInEth = new BigNumber(web3.utils.fromWei(bounty, 'ether'));
      bounties.push(bountyInEth);
    });

    return bounties;
  }

  async validateRequestParams(
    toAddress,
    callGas,
    callValue,
    windowSize,
    windowStart,
    gasPrice,
    fee,
    timeBounty,
    requiredDeposit,
    isTimestamp,
    endowment
  ) {
    await this.init();

    const temporalUnit = isTimestamp ? 2 : 1;
    const freezePeriod = isTimestamp ? 3 * 60 : 10; // 3 minutes or 10 blocks
    const reservedWindowSize = isTimestamp ? 5 * 60 : 16; // 5 minutes or 16 blocks
    const claimWindowSize = isTimestamp ? 60 * 60 : 255; // 60 minutes or 255 blocks
    const feeRecipient = '0x0'; // stub
    const fromAddress = this._web3.eth.defaultAccount;

    const serializedParams = [
      [fromAddress, feeRecipient, toAddress],
      [
        fee,
        timeBounty,
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
      endowment
    ];

    let paramsValid = false;
    let errors = [];

    try {
      const paramsValidBooleans = await this._requestFactory.validateRequestParams(
        ...serializedParams
      );

      errors = this._requestFactory.parseIsValid(paramsValidBooleans);

      paramsValid = errors.length === 0;
    } catch (error) {
      errors.push(error);
    }

    return {
      paramsValid,
      errors
    };
  }

  async schedule(
    toAddress,
    callData = '',
    callGas,
    callValue,
    windowSize,
    windowStart,
    gasPrice,
    fee,
    payment,
    requiredDeposit,
    waitForMined,
    isTimestamp
  ) {
    const endowment = this._eac.calcEndowment(callGas, callValue, gasPrice, fee, payment);

    const { paramsValid, errors } = await this.validateRequestParams(
      toAddress,
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
      errors.forEach(
        error => error && showNotification(PARAMS_ERROR_TO_MESSAGE_MAPPING[error], 'danger', 4000)
      );

      return;
    }

    if (typeof this._eacScheduler === 'undefined') {
      this._eacScheduler = await this._eac.scheduler();
    }

    await this._eacScheduler.initSender({
      from: this._web3.eth.defaultAccount,
      value: endowment
    });

    const sendGasPrice = (await this._util.getAdvancedNetworkGasPrice()).average;

    let receipt;

    if (isTimestamp) {
      receipt = await this._eacScheduler.timestampSchedule(
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
        waitForMined,
        sendGasPrice
      );
    } else {
      receipt = await this._eacScheduler.blockSchedule(
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
        waitForMined,
        sendGasPrice
      );
    }

    if (receipt && receipt.transactionHash) {
      this.scheduledTransactions.push({
        transactionHash: receipt.transactionHash,
        toAddress: toAddress.toLowerCase(),
        callData: callData || '0x',
        callGas,
        callValue,
        windowSize,
        windowStart,
        gasPrice,
        fee,
        payment,
        requiredDeposit
      });
    }

    return receipt;
  }

  getAndSaveRequestFromLogs(logs) {
    const requestCreatedEventABI = {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          name: 'request',
          type: 'address'
        },
        {
          indexed: true,
          name: 'owner',
          type: 'address'
        },
        {
          indexed: true,
          name: 'bucket',
          type: 'int256'
        },
        {
          indexed: false,
          name: 'params',
          type: 'uint256[12]'
        }
      ],
      name: 'RequestCreated',
      type: 'event'
    };

    const signature = this._web3.web3.eth.abi.encodeEventSignature(requestCreatedEventABI);

    const parsedLogs = logs
      .map(log => {
        if (signature === log.topics[0]) {
          const decoded = this._web3.web3.eth.abi.decodeLog(
            requestCreatedEventABI.inputs,
            log.data,
            log.topics.slice(1)
          );
          decoded.blockNumber = log.blockNumber;
          return decoded;
        }
      })
      .filter(parsedLog => parsedLog);

    const requestCreatedLog = parsedLogs[0];

    if (!requestCreatedLog) {
      throw new Error('RequestCreated log has not been found.');
    }

    this._cache.addRequestCreatedLogToCache(requestCreatedLog, true);

    const transactionAddress = requestCreatedLog.request;

    const scheduledTx = this.scheduledTransactions.find(
      tx => tx.transactionHash === requestCreatedLog.transactionHash
    );

    if (scheduledTx) {
      scheduledTx.address = transactionAddress;
    }

    return transactionAddress;
  }

  fillTransactionDataFromRequestCreatedEvent(transaction, requestCreatedEvent) {
    const locallyStoredTx = this.scheduledTransactions.find(
      tx => tx.address === transaction.address
    );

    let toAddress = '';

    if (locallyStoredTx) {
      toAddress = locallyStoredTx.toAddress;
      transaction.callData = () => Promise.resolve(locallyStoredTx.callData);
    }

    const data = new this._eac.RequestData(
      [
        [
          '', // self.claimData.claimedBy,
          requestCreatedEvent.owner, // self.meta.createdBy,
          requestCreatedEvent.owner, // self.meta.owner,
          '', // self.paymentData.feeRecipient,
          '', // self.paymentData.bountyBenefactor,
          toAddress // self.txnData.toAddress
        ],
        [false, false, false],
        [
          0, // self.claimData.claimDeposit,
          requestCreatedEvent.params[0], // self.paymentData.fee,
          0, // self.paymentData.feeOwed,
          requestCreatedEvent.params[1], // self.paymentData.bounty,
          0, // self.paymentData.bountyOwed,
          requestCreatedEvent.params[2], // self.schedule.claimWindowSize,
          requestCreatedEvent.params[3], // self.schedule.freezePeriod,
          requestCreatedEvent.params[4], // self.schedule.reservedWindowSize,
          requestCreatedEvent.params[5], // uint(self.schedule.temporalUnit),
          requestCreatedEvent.params[6], // self.schedule.windowSize,
          requestCreatedEvent.params[7], // self.schedule.windowStart,
          requestCreatedEvent.params[8], // self.txnData.callGas,
          requestCreatedEvent.params[9], // self.txnData.callValue,
          requestCreatedEvent.params[10], // self.txnData.gasPrice,
          requestCreatedEvent.params[11] // self.claimData.requiredDeposit
        ],
        []
      ],
      transaction.instance
    );

    transaction.data = data;
  }
}
