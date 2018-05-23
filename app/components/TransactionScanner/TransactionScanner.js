import React, { Component } from 'react';
import TransactionsTable from './TransactionsTable';
import { inject, observer } from 'mobx-react';
import PropTypes from 'prop-types';
import PoweredByEAC from '../Common/PoweredByEAC';
import { observe } from 'mobx';

const INITIAL_STATE = {
  transactions: [],
  fetchingTransactions: false,
  limit: 10,
  offset: 0,
  currentPage: 1
};

@inject('transactionStore')
@observer
class TransactionScanner extends Component {
  state = INITIAL_STATE;

  _isMounted = false;

  constructor() {
    super(...arguments);

    this.state = INITIAL_STATE;

    this.goToPage = this.goToPage.bind(this);
  }

  async fetchData({ owner, limit, offset }) {
    const options = {
      limit,
      offset,
      pastHours: this.props.pastHours
    };

    options.limit = owner ? 5000 : limit;
    options.resolved = this.props.includeResolved;
    options.unresolved = this.props.includeUnresolved;

    const matchingTxs = await this.props.transactionStore.getTransactionsFiltered(options);
    console.log(matchingTxs);

    if (owner) {
      let ownedTxs = [];
      let total = 0;

      for (let tx of matchingTxs.transactions) {
        await tx.fillData();
        if (tx.owner == owner.toLowerCase()) {
          ownedTxs.push(tx);
        }
      }

      total = ownedTxs.length;
      ownedTxs = ownedTxs.slice(offset, offset + limit);

      console.log(ownedTxs);
      return {
        transactions: ownedTxs,
        total
      };
    }

    return matchingTxs;
  }

  componentWillUnmount() {
    this._isMounted = false;

    if (this.cacheObserverDisposer) {
      this.cacheObserverDisposer();
    }
  }

  componentDidMount() {
    this._isMounted = true;

    if (!this.cacheObserverDisposer) {
      this.cacheObserverDisposer = observe(
        this.props.transactionStore._cache,
        'requestCreatedLogs',
        () => {
          this.loadPage(this.state.currentPage);
        }
      );
    }
  }

  async loadPage(page) {
    const offset = (page - 1) * this.state.limit;

    this.setState({
      fetchingTransactions: true
    });

    const { total, transactions } = await this.fetchData({
      limit: this.state.limit,
      offset,
      owner: this.props.owner
    });

    if (!this._isMounted) {
      return;
    }

    this.setState({
      currentPage: page,
      transactions,
      offset,
      total,
      fetchingTransactions: false
    });
  }

  async UNSAFE_componentWillMount() {
    await this.loadPage(1);
  }

  async goToPage(page) {
    await this.loadPage(page);
  }

  render() {
    console.log(this.state.transactions)
    return (
      <div className="tab-content p-4">
        <div className="tab-pane active">
          <TransactionsTable
            transactions={this.state.transactions}
            fetchingTransactions={this.state.fetchingTransactions}
            limit={this.state.limit}
            offset={this.state.offset}
            total={this.state.total}
            goToPage={this.goToPage}
            currentPage={this.state.currentPage}
            showStatus={this.props.showStatus}
          />
        </div>
        <div className="row">
          <PoweredByEAC className="col-md-2 mt-2" />
        </div>
      </div>
    );
  }
}

TransactionScanner.propTypes = {
  transactionStore: PropTypes.any,
  showStatus: PropTypes.bool,
  includeResolved: PropTypes.bool,
  includeUnresolved: PropTypes.bool,
  pastHours: PropTypes.number,
  resolveAll: PropTypes.bool,
  owner: PropTypes.string
};

export default TransactionScanner;
