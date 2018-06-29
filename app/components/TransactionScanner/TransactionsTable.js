import React, { Component } from 'react';
import PropTypes from 'prop-types';
import TransactionRow from './TransactionRow';
import { PropagateLoader } from 'react-spinners';

const INITIAL_STATE = {
  pages: [],
  currentPage: 1,
  lastPage: 1
};

export const TRANSACTIONS_TABLE_TEST_ATTRS = {
  INFO_NO_TRANSACTIONS: 'info-no-transactions',
  INFO_TOTAL_ENTRIES: 'info-total-entries',
  CURRENT_PAGE: 'btn-current-page',
  NEXT_PAGE: 'btn-next-page'
};

class TransactionsTable extends Component {
  state = INITIAL_STATE;

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

  UNSAFE_componentWillMount() {
    this.calculatePages();
  }

  UNSAFE_componentWillReceiveProps(newProps) {
    this.calculatePages(newProps);

    this.setState(() => ({
      currentPage: newProps.currentPage
    }));
  }

  get showPreviousPageButton() {
    return this.state.currentPage > 1;
  }

  get showNextPageButton() {
    return this.state.currentPage < this.state.lastPage;
  }

  goToPage(page) {
    if (page >= 1 && page !== this.state.currentPage && page <= this.state.lastPage) {
      this.props.goToPage(page);
    }
  }

  getNextPageButton() {
    return <i className="fa fa-angle-right" />;
  }

  getPreviousPageButton() {
    return <i className="fa fa-angle-left" />;
  }

  render() {
    const { fetchingTransactions, offset, showStatus, transactions, total } = this.props;
    const { currentPage } = this.state;

    return (
      <div>
        <div className="table-responsive">
          <table className="table">
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

        <div className={fetchingTransactions ? 'd-none' : 'mt-4'}>
          <div className="row">
            <div
              className={transactions.length ? 'col-md-6' : 'd-none'}
              data-test={TRANSACTIONS_TABLE_TEST_ATTRS.INFO_TOTAL_ENTRIES}
            >
              Showing {offset + 1} to {offset + transactions.length} of {total} entries
            </div>
            {this.state.lastPage !== 1 && (
              <div className="col-md-6 text-right">
                <span
                  className={['pagination-arrow', this.showPreviousPageButton ? '' : 'd-none'].join(
                    ' '
                  )}
                  onClick={() => this.goToPage(currentPage - 1)}
                >
                  {this.getPreviousPageButton()}&nbsp;
                </span>

                {this.state.pages.map(page => (
                  <span
                    key={page}
                    className={['pagination-entry', page === currentPage ? 'bold' : ''].join(' ')}
                    onClick={() => this.goToPage(page)}
                    data-test={TRANSACTIONS_TABLE_TEST_ATTRS.CURRENT_PAGE}
                  >
                    {page}&nbsp;
                  </span>
                ))}

                <span
                  className={['pagination-arrow', this.showNextPageButton ? '' : 'd-none'].join(
                    ' '
                  )}
                  onClick={() => this.goToPage(currentPage + 1)}
                  data-test={TRANSACTIONS_TABLE_TEST_ATTRS.NEXT_PAGE}
                >
                  {this.getNextPageButton()}
                </span>
              </div>
            )}
          </div>
        </div>

        {fetchingTransactions && (
          <div className="loading-icon">
            <PropagateLoader loading={fetchingTransactions} color="#21FFFF" />
          </div>
        )}

        <div
          className={transactions.length || fetchingTransactions ? 'd-none' : 'mt-4'}
          data-test={TRANSACTIONS_TABLE_TEST_ATTRS.INFO_NO_TRANSACTIONS}
        >
          No transactions.
        </div>
      </div>
    );
  }
}

TransactionsTable.propTypes = {
  transactions: PropTypes.any,
  total: PropTypes.number,
  limit: PropTypes.number,
  offset: PropTypes.number,
  goToPage: PropTypes.any,
  currentPage: PropTypes.any,
  showStatus: PropTypes.bool,
  fetchingTransactions: PropTypes.bool,
  ownerAddress: PropTypes.string
};

export default TransactionsTable;
