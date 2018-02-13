import React, { Component } from 'react';
import TransactionsTable from './TransactionsTable';
import { inject } from 'mobx-react';
import PropTypes from 'prop-types';
import PoweredByEAC from '../Common/PoweredByEAC';

const INITIAL_STATE = {
  transactions: [],
  fetchingTransactions: false,
  limit: 10,
  offset: 0,
  currentPage: 1
};

@inject('transactionStore')
class TransactionScanner extends Component {
  state = INITIAL_STATE

  _isMounted = false;

  constructor() {
    super(...arguments);

    this.state = INITIAL_STATE;

    this.goToPage = this.goToPage.bind(this);
  }

  async fetchData({ limit, offset }) {
    const options = {
      limit,
      offset
    };

    if (this.props.includeResolved) {
      options.resolved = true;
    }

    if (this.props.includeUnresolved) {
      options.resolved = false;
    }

    if (!this.props.includeResolved && !this.props.includeUnresolved) {
      options.resolved = null;
    }

    return await this.props.transactionStore.getTransactionsFiltered(options);
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  componentDidMount() {
    this._isMounted = true;
  }

  async loadPage(page) {
    const offset = (page - 1) * this.state.limit;

    this.setState({
      fetchingTransactions: true
    });

    const { total, transactions } = await this.fetchData({
      limit: this.state.limit,
      offset
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

  async componentWillMount() {
    await this.loadPage(1);
  }

  async goToPage(page) {
    await this.loadPage(page);
  }

  render() {
    return (
      <div className="tab-pane slide active show">
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
  includeUnresolved: PropTypes.bool
};

export default TransactionScanner;