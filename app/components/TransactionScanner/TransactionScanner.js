import React, { Component } from 'react';
import TransactionsTable from './TransactionsTable';
import { inject } from 'mobx-react';
import PropTypes from 'prop-types';

const INITIAL_STATE = {
  transactions: [],
  limit: 10,
  offset: 0,
  currentPage: 1
};

@inject('transactionStore')
class TransactionScanner extends Component {
  state = INITIAL_STATE

  constructor() {
    super(...arguments);

    this.state = INITIAL_STATE;

    this.goToPage = this.goToPage.bind(this);
  }

  async loadPage(page) {
    const offset = (page - 1) * this.state.limit;

    const { total, transactions } = await this.props.transactionStore.getTransactionsProcessed({
      limit: this.state.limit,
      offset
    });

    this.setState({
      currentPage: page,
      transactions,
      offset,
      total
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
      <div id="TransactionScanner">
        <TransactionsTable
          transactions={this.state.transactions}
          limit={this.state.limit}
          offset={this.state.offset}
          total={this.state.total}
          goToPage={this.goToPage}
          currentPage={this.state.currentPage}
        />
      </div>
    );
  }
}

TransactionScanner.propTypes = {
  transactionStore: PropTypes.any
};

export default TransactionScanner;