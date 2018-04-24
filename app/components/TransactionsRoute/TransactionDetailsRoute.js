import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';
import TransactionDetails from '../TransactionScanner/TransactionDetails';
import TransactionNotFound from '../TransactionScanner/TransactionNotFound';
import { PropagateLoader } from 'react-spinners';
import PoweredByEAC from '../Common/PoweredByEAC';

@inject('eacService')
@inject('transactionStore')
@observer
class TransactionDetailsRoute extends Component {
  state = {
    transaction: null,
    transactionNotFound: false
  };

  async componentDidMount() {
    const { txAddress } = this.props.match.params;

    this.getTransactionData(txAddress);
  }

  transactionInvalid(transaction) {
    return transaction.temporalUnit === 0;
  }

  async getTransactionData(address) {
    const { transactionStore } = this.props;

    const transaction = await transactionStore.getTransactionByAddress(address);

    await transaction.fillData();

    this.setState({
      transaction,
      transactionNotFound: this.transactionInvalid(transaction)
    });
  }

  render() {
    const { txAddress } = this.props.match.params;

    const { transaction, transactionNotFound } = this.state;

    let content = <div />;

    if (transaction) {
      if (transactionNotFound) {
        content = <TransactionNotFound address={txAddress} />;
      } else {
        content = <TransactionDetails transaction={transaction} />;
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
  eacService: PropTypes.any,
  match: PropTypes.any,
  transactionStore: PropTypes.any
};

export default TransactionDetailsRoute;
