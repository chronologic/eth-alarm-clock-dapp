import React, { Component } from 'react';
import TransactionScanner from '../TransactionScanner/TransactionScanner';

export default class TransactionsCompleted extends Component {
  render() {
    return (
      <div className="container-fluid container-fixed-lg">
        <h1 className="view-title">Transaction Scanner - Completed</h1>
        <div className="widget-12 card no-border widget-loader-circle no-margin">
          <TransactionScanner showStatus={true} includeResolved={true} includeUnresolved={false} />
        </div>
      </div>
    );
  }
}