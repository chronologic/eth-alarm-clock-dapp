import React, { Component } from 'react';
import PropTypes from 'prop-types';
import TransactionRow from './TransactionRow';

const INITIAL_STATE = {
  pages: [],
  currentPage: 1,
  lastPage: 1
};

class TransactionsTable extends Component {
  state = INITIAL_STATE

  constructor() {
    super(...arguments);

    this.state = INITIAL_STATE;
  }

  calculatePages(props = this.props) {
    const pages = [];
    let lastPage = 0;

    const { limit, total } = props;

    if (total <= limit) {
      pages.push(1);
    } else {
      for (let i = 0; i < total; i += limit) {
        pages.push(++lastPage);
      }
    }

    this.setState({
      lastPage: lastPage ? lastPage : 1,
      pages
    });
  }

  componentWillMount() {
    this.calculatePages();
  }

  componentWillReceiveProps(newProps) {
    this.calculatePages(newProps);

    this.setState(() => ({
      currentPage: newProps.currentPage 
    }));
  }

  get showPreviousPageButton() {
    return this.props.currentPage > 1;
  }

  get showNextPageButton() {
    return this.props.currentPage < this.state.lastPage;
  }

  goToPage(page) {
    if (page >= 1 && page !== this.state.currentPage && page <= this.state.lastPage) {
      this.props.goToPage(page);
    }
  }

  getNextPageButton() {
    return <i className="fa fa-angle-right"></i>;
  }

  getPreviousPageButton() {
    return <i className="fa fa-angle-left"></i>;
  }
  
  render() {
    const { offset, showStatus, transactions, total } = this.props;

    return (
      <div>
        <div className="table-responsive">
          <table className="table table-hover table-condensed">
            <thead>
              <tr>
                <th>Contract Address</th>
                <th>Time</th>
                <th>Bounty</th>
                <th>TxValue</th>
                <th>Deposit Amount</th>
                <th>Time Window</th>
                {showStatus && <th>Status</th>}
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction, index) => (
                <TransactionRow key={index} transaction={transaction} showStatus={showStatus} />
              ))}
            </tbody>
          </table>
        </div>

        <div className={this.props.fetchingTransactions ? 'd-none' : 'mt-4'}>
          <div className="row">
            <div className="col-md-6">
              Showing {offset + 1} to {offset + transactions.length} of {total} entries
            </div>
            {this.state.lastPage !== 1 &&
              <div className="col-md-6 text-right">
                <span className={this.showPreviousPageButton ? '' : 'd-none'} onClick={() => this.goToPage(this.props.currentPage - 1)}>{this.getPreviousPageButton()}&nbsp;</span>                

                {this.state.pages.map(page => (
                  <span key={page} className={page === this.state.currentPage ? 'bold' : ''} onClick={() => this.goToPage(page)}>{page}&nbsp;</span>
                ))}

                <span className={this.showNextPageButton ? '' : 'd-none'}onClick={() => this.goToPage(this.props.currentPage + 1)}>{this.getNextPageButton()}</span>
              </div>
            }
          </div>
        </div>

        <div className={this.props.fetchingTransactions ? 'mt-4' : 'd-none'}>
            Fetching transactions...
        </div>

      </div>
    );
  }
}

TransactionsTable.propTypes = {
  transactions: PropTypes.array,
  total: PropTypes.number,
  limit: PropTypes.number,
  offset: PropTypes.number,
  goToPage: PropTypes.any,
  currentPage: PropTypes.any,
  showStatus: PropTypes.bool,
  fetchingTransactions: PropTypes.bool
};

export default TransactionsTable;