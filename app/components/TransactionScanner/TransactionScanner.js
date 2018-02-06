import React, { Component } from 'react';
import TransactionsTable from './TransactionsTable';
import { inject } from 'mobx-react';
import PropTypes from 'prop-types';

const INITIAL_STATE = {
  transactions: [],
  limit: 10,
  offset: 0
};

@inject('transactionStore')
class TransactionScanner extends Component {
  state = INITIAL_STATE

  constructor() {
    super(...arguments);

    this.state = INITIAL_STATE;
  }

  async componentWillMount() {
    const { total, transactions } = await this.props.transactionStore.getTransactionsProcessed({
      limit: this.state.limit,
      offset: this.state.offset
    });

    this.setState({
      transactions,
      total
    });
  }

  render() {
    return (
      <div id="TransactionScanner">
        <TransactionsTable
          transactions={this.state.transactions}
          transactionsLimit={this.state.limit}
          transactionsOffset={this.state.offset}
          transactionsTotal={this.state.total}
        />
      </div>
    );
  }
}

TransactionScanner.propTypes = {
  transactionStore: PropTypes.any
};

export default TransactionScanner;