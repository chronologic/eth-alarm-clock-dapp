import React, { Component } from 'react';
import PropTypes from 'prop-types';
import TransactionRow from './TransactionRow';

class TransactionsTable extends Component {
  pages = [1, 2, 3]
  
  render() {
    return (
      <div>
        <div className="table-responsive">
          <table className="table table-hover table-condensed" id="detailedTable">
            <thead>
              <tr>
                <th>Contract Address</th>
                <th>Time</th>
                <th>Bounty</th>
                <th>TxValue</th>
                <th>Deposit Amount</th>
                <th>Time Window</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {this.props.transactions.map((transaction, index) => (
                <TransactionRow key={index} transaction={transaction} />
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4">
          <div className="row">
            <div className="col-md-6">
              Showing {this.props.transactionsOffset + 1} to {this.props.transactions.length} of {this.props.transactionsTotal} entries
            </div>
            <div className="col-md-6 text-right">
            <i className="fas fa-angle-left"></i>
            &nbsp;
            {this.pages.map(page => (
              <span key={page}>{page}&nbsp;</span>
            ))}
            <i className="fas fa-angle-right"></i>
            </div>
          </div>
        </div>

      </div>
    );
  }
}

TransactionsTable.propTypes = {
  transactions: PropTypes.array,
  transactionsTotal: PropTypes.number,
  transactionsLimit: PropTypes.number,
  transactionsOffset: PropTypes.number
};

export default TransactionsTable;