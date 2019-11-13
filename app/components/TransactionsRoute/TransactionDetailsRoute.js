import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';
import TransactionDetails from '../TransactionScanner/TransactionDetails';
import TransactionNotFound from '../TransactionScanner/TransactionNotFound';
import { PropagateLoader } from 'react-spinners';
import PoweredByEAC from '../Common/PoweredByEAC';
import InformativeLoader from '../Common/InformativeLoader';

const MAXIMUM_TRIES_FOR_FETCHING_DATA = 40;
const FETCHING_DATA_ATTEMPT_INTERVAL = 1200;

@inject('transactionCache')
@inject('loadingStateStore')
@inject('eacService')
@inject('transactionStore')
@observer
class TransactionDetailsRoute extends Component {
  _isMounted = false;

  state = {
    transaction: null,
    transactionNotFound: false,
    transactionMissingData: true
  };

  async componentDidMount() {
    this._isMounted = true;

    this.props.loadingStateStore.reset();

    const { txAddress } = this.props.match.params;

    await this.getTransactionData(txAddress);

    let i = 0;

    while (
      this.state.transactionMissingData &&
      i < MAXIMUM_TRIES_FOR_FETCHING_DATA &&
      this._isMounted
    ) {
      i++;

      await new Promise(resolve => {
        setTimeout(resolve, FETCHING_DATA_ATTEMPT_INTERVAL);
      });

      await this.getTransactionData(txAddress);
    }
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  transactionHasNoBasicData(transaction) {
    return !transaction.data || transaction.temporalUnit === 0;
  }

  transactionMissingData(transaction) {
    return this.transactionHasNoBasicData(transaction) || !transaction.toAddress;
  }

  async getTransactionData(address) {
    const { transactionStore, transactionCache } = this.props;

    await transactionCache.waitForInitialization();

    const transaction = await transactionStore.getTransactionByAddress(address);

    try {
      await transaction.fillData();
    } catch (error) {
      this.setState({
        transaction,
        transactionNotFound: true,
        transactionMissingData: false
      });

      return;
    }

    let transactionHasNoBasicData = this.transactionHasNoBasicData(transaction);
    let transactionMissingData = false;

    if (transactionHasNoBasicData) {
      const requestCreatedLog = transactionCache.requestCreatedLogs.find(
        l => l.request === transaction.address
      );

      if (requestCreatedLog) {
        transactionStore.fillTransactionDataFromRequestCreatedEvent(transaction, requestCreatedLog);

        transactionHasNoBasicData = this.transactionHasNoBasicData(transaction);
        transactionMissingData = true;
      }
    }

    if (!this._isMounted) {
      return;
    }

    this.setState({
      transaction,
      transactionNotFound: transactionHasNoBasicData,
      transactionMissingData
    });
  }

  render() {
    const { txAddress } = this.props.match.params;

    const { transaction, transactionNotFound, transactionMissingData } = this.state;

    let content = <div />;

    if (transaction) {
      if (transactionNotFound) {
        content = <TransactionNotFound address={txAddress} />;
      } else {
        content = (
          <TransactionDetails
            transaction={transaction}
            transactionMissingData={transactionMissingData}
          />
        );
      }
    } else {
      content = (
        <>
          <div className="loading-icon">
            <PropagateLoader loading={true} color="#21FFFF" />
          </div>
          <br />
          <br />
          <InformativeLoader />
        </>
      );
    }

    return (
      <div className="container">
        <h1 className="view-title">
          Transaction details <span className="view-subtitle">{txAddress}</span>
        </h1>
        <div className="widget-12 card no-border widget-loader-circle no-margin">
          <div className="tab-content p-4">{content}</div>
          <PoweredByEAC className="m-4" />
        </div>
      </div>
    );
  }
}

TransactionDetailsRoute.propTypes = {
  eacService: PropTypes.any,
  loadingStateStore: PropTypes.any,
  transactionCache: PropTypes.any,
  match: PropTypes.any,
  transactionStore: PropTypes.any
};

export default TransactionDetailsRoute;
