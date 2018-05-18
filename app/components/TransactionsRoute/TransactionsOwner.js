import React, { Component } from 'react';
import TransactionScanner from '../TransactionScanner/TransactionScanner';
import { inject } from 'mobx-react';
import PropTypes from 'prop-types';
import NetworkUnsupported from '../Common/NetworkUnsupported';

@inject('featuresService')
export default class TransactionsOwner extends Component {
  render() {
    const { isCurrentNetworkSupported } = this.props.featuresService;
    const { ownerAddress } = this.props.match.params;

    return (
      <div className="container-fluid container-fixed-lg">
        <h1 className="view-title">Transaction Scanner - {ownerAddress}</h1>
        <div className="widget-12 card no-border widget-loader-circle no-margin">
          {isCurrentNetworkSupported !== false ? (
            <TransactionScanner
              showStatus={true}
              includeResolved={true}
              includeUnresolved={true}
              owner={ownerAddress}
            />
          ) : (
              <div className="tab-content p-1 pl-4 pt-4">
                <div className="tab-pane active">
                  <NetworkUnsupported />
                </div>
              </div>
            )}
        </div>
      </div>
    );
  }
}

TransactionsOwner.propTypes = {
  featuresService: PropTypes.any,
  match: PropTypes.any
};
