import React, { Component } from 'react';
import PropTypes from 'prop-types';
import TransactionDetails from '../TransactionScanner/TransactionDetails';

class TransactionDetailsRoute extends Component {
  render() {
    const { txAddress } = this.props.match.params;

    return (
      <div>
        <h1 className="view-title">Transaction details <span className="view-subtitle">{txAddress}</span></h1>
        <div className="widget-12 card no-border widget-loader-circle no-margin">
          <div className="p-4">
            <TransactionDetails address={txAddress} />
          </div>
        </div>
      </div>
    );
  }
}

TransactionDetailsRoute.propTypes = {
  match: PropTypes.any
};

export default TransactionDetailsRoute;