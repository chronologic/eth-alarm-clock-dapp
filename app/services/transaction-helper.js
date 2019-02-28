import { TEMPORAL_UNIT, TRANSACTION_STATUS } from '../stores/TransactionStore';
import { TRANSACTION_EVENT } from './eac';
import { CONFIG } from '../lib/consts';

export default class TransactionHelper {
  _cache;

  constructor(cache) {
    this._cache = cache;
  }

  isTransactionMissed(transaction, currentTimestamp, currentBlock) {
    let afterExecutionWindow;

    if (this.isTxUnitTimestamp(transaction)) {
      afterExecutionWindow = transaction.executionWindowEnd.lt(currentTimestamp);
    } else {
      if (currentBlock) {
        afterExecutionWindow = transaction.executionWindowEnd.lt(currentBlock);
      }
    }

    return Boolean(afterExecutionWindow && !transaction.wasCalled);
  }

  isTxUnitTimestamp(transaction) {
    if (!transaction || !transaction.temporalUnit) {
      return false;
    }

    let temporalUnit = transaction.temporalUnit;

    if (transaction.temporalUnit.toNumber) {
      temporalUnit = transaction.temporalUnit.toNumber();
    }

    return temporalUnit === TEMPORAL_UNIT.TIMESTAMP;
  }

  getTxStatus(transaction, currentTimestamp, currentBlock) {
    let status = TRANSACTION_STATUS.SCHEDULED;

    if (transaction.wasCalled) {
      status = transaction.data.meta.wasSuccessful
        ? TRANSACTION_STATUS.EXECUTED
        : TRANSACTION_STATUS.FAILED;
    }

    if (transaction.isCancelled) {
      status = TRANSACTION_STATUS.CANCELLED;
    } else if (this.isTransactionMissed(transaction, currentTimestamp, currentBlock)) {
      status = TRANSACTION_STATUS.MISSED;
    }

    return status;
  }

  isTransactionResolved(transaction, currentTimestamp, currentBlock) {
    const isMissed = this.isTransactionMissed(transaction, currentTimestamp, currentBlock);

    if (isMissed || transaction.wasCalled || transaction.isCancelled) {
      return true;
    }

    return this.isTransactionExecuted(transaction) || this.isTransactionCancelled(transaction);
  }

  isTransactionExecuted(transaction) {
    const TX_EVENTS_MAP = this._cache.addressesEvents || {};

    const txEvent = TX_EVENTS_MAP[transaction.address];

    return txEvent === TRANSACTION_EVENT.EXECUTED;
  }

  isTransactionCancelled(transaction) {
    const TX_EVENTS_MAP = this._cache.addressesEvents || {};

    const txEvent = TX_EVENTS_MAP[transaction.address];

    return txEvent === TRANSACTION_EVENT.CANCELLED;
  }

  isTransactionAfterWindowStart(transaction, currentTimestamp, currentBlock) {
    return transaction.windowStart.lessThan(
      this.isTxUnitTimestamp(transaction) ? currentTimestamp : currentBlock
    );
  }

  getTxTimestampEstimation(transaction, currentBlockTimestamp, currentBlock) {
    const isTimestamp = this.isTxUnitTimestamp(transaction);

    const windowStart = transaction.windowStart.toNumber
      ? transaction.windowStart.toNumber()
      : transaction.windowStart;

    if (isTimestamp) {
      return windowStart;
    }

    let time;

    if (currentBlock > windowStart) {
      time = windowStart;
    } else {
      const difference = windowStart - currentBlock;

      time = currentBlockTimestamp + difference * CONFIG.averageBlockTime;
    }

    return time;
  }
}
