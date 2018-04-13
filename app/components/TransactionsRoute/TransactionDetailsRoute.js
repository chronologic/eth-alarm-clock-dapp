import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';
import TransactionDetails from '../TransactionScanner/TransactionDetails';
import TransactionNotFound from '../TransactionScanner/TransactionNotFound';
import { PropagateLoader } from 'react-spinners';
import PoweredByEAC from '../Common/PoweredByEAC';

@inject('transactionStore')
@observer
class TransactionDetailsRoute extends Component {
  async componentDidMount() {
    // This has to be changed after we implement a data layer (cache or db)
    // For now it always fetches all the transactions from eac.js on each page load
    await this.props.transactionStore.getAllTransactions();
  }

  render() {
    const { txAddress } = this.props.match.params;

    let content = <div />;

    // If the list of transactions has been fetched
    if (this.props.transactionStore.allTransactionsAddresses.length > 0) {
      // Check if the address exists in the transactions list
      if (this.props.transactionStore.allTransactionsAddresses.includes(txAddress)) {
        content = <TransactionDetails address={txAddress} />;
      } else {
        // Throw a 404 if the transaction with that address does not exist
        content = <TransactionNotFound address={txAddress} />;
      }
    } else {
      content = (
        <div className="loading-icon">
          <PropagateLoader loading={true} color="#21FFFF" />
        </div>
      );
    }

    return (
      <div className="container">
        <h1 className="view-title">
          Transaction details <span className="view-subtitle">{txAddress}</span>
        </h1>
        <div className="widget-12 card no-border widget-loader-circle no-margin">
          <div className="tab-content p-4">{content}</div>
          <PoweredByEAC className="mb-4 ml-4" />
        </div>
      </div>
    );
  }
}

TransactionDetailsRoute.propTypes = {
  match: PropTypes.any,
  transactionStore: PropTypes.any
};

export default TransactionDetailsRoute;
