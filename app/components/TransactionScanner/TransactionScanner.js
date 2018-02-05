import React, { Component } from 'react';
import TransactionsTable from './TransactionsTable';
import { inject } from 'mobx-react';
import PropTypes from 'prop-types';

@inject('transactionStore')
class TransactionScanner extends Component {
  state = {}

  async componentDidMount() {
   this.transactions = await this.props.transactionStore.getTransactions();
  }

  render() {
    return (
      <div id="TransactionScanner">
        <TransactionsTable/>
      </div>
    );
  }
}

TransactionScanner.propTypes = {
  transactionStore: PropTypes.any
};

export default TransactionScanner;