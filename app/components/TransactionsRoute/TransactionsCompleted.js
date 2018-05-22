import React, { Component } from 'react';
import TransactionScanner from '../TransactionScanner/TransactionScanner';
import { inject } from 'mobx-react';
import PropTypes from 'prop-types';
import NetworkUnsupported from '../Common/NetworkUnsupported';

@inject('featuresService')
export default class TransactionsCompleted extends Component {
  render() {
    const { isCurrentNetworkSupported } = this.props.featuresService;

    return (
      <div className="container-fluid container-fixed-lg">
        <h1 className="view-title">Transaction Scanner - Completed</h1>
        <div className="widget-12 card no-border widget-loader-circle no-margin">
          {isCurrentNetworkSupported !== false ? (
            <TransactionScanner
              showStatus
              includeResolved
              pastHours={24}
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

TransactionsCompleted.propTypes = {
  featuresService: PropTypes.any
};
