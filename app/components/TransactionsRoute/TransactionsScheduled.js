import React, { Component } from 'react';
import TransactionScanner from '../TransactionScanner/TransactionScanner';

export default class TransactionsScheduled extends Component {
  render() {
    return (
      <div className="container-fluid container-fixed-lg">
        <h1 className="view-title">Transaction Scanner - Scheduled</h1>
        <div className="widget-12 card no-border widget-loader-circle no-margin">
          <TransactionScanner showStatus={false} includeResolved={false} includeUnresolved={true} />
        </div>
      </div>
    );
  }
}