import React, { Component } from 'react';
import TransactionsTable from './TransactionsTable';

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