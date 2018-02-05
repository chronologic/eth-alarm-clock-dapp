import React, { Component } from 'react';
import TransactionsTable from './TransactionsTable';
import { inject } from 'mobx-react';

@inject('transactionStore')
class TransactionScanner extends Component {
  state = {}

componentDidMount() {}

render() {
  return (
    <div id="TransactionScanner">
      <TransactionsTable/>
    </div>
  );
}
}

export default TransactionScanner;