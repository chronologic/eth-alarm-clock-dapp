import { observable } from 'mobx';

export class TransactionStatistics {
  @observable
  efficiency = null;

  @observable
  transactionsScheduledInNextHoursAmount = null;

  nextHours = 24;
  pastHours = 24;

  _transactionHelper;
  _transactionStore;

  constructor(transactionHelper, transactionStore) {
    this._transactionHelper = transactionHelper;
    this._transactionStore = transactionStore;

    this._initialize();
  }

  /**
   * @private
   */
  async _initialize() {
    await this._transactionStore.init();

    await this._transactionStore.updateLastBlock();

    const {
      total: transactionsScheduledInNextHoursAmount
    } = await this._transactionStore.getTransactionsFiltered({
      resolved: false,
      unresolved: true
    });

    this.transactionsScheduledInNextHoursAmount = transactionsScheduledInNextHoursAmount;

    const {
      transactions: pastTransactions,
      total
    } = await this._transactionStore.getTransactionsFiltered({
      pastHours: this.pastHours,
      resolved: true,
      unresolved: true
    });

    const executedTransactions = pastTransactions.filter(tx =>
      this._transactionHelper.isTransactionExecuted(tx)
    );

    this.efficiency = total === 0 ? 100 : Math.ceil((executedTransactions.length / total) * 100);
  }
}
