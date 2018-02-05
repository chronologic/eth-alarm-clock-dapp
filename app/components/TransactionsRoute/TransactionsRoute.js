import React, { Component } from 'react';
import TransactionScanner from '../TransactionScanner/TransactionScanner';

export class TransactionsRoute extends Component {
  render() {
    return (
      <div className="container-fluid padding-25 sm-padding-10">
        <h1 className="view-title">Transactions</h1>
        <div className="widget-12 card no-border widget-loader-circle no-margin">
          <div className="card-body">
            <TransactionScanner/>
          </div>
        </div>
      </div>
    );
  }
}