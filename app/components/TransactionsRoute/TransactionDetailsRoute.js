import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';
import TransactionDetails from '../TransactionScanner/TransactionDetails';
import TransactionNotFound from '../TransactionScanner/TransactionNotFound';
import { BeatLoader } from 'react-spinners';

@inject('transactionStore')
@observer
class TransactionDetailsRoute extends Component {
  constructor(props) {
    super(props);
    this.state = {
      fetchedTransactions: false
    };
  }

  async componentDidMount() {
    // This has to be changed after we implement a data layer (cache or db)
    // For now it always fetches all the transactions from eac.js on each page load
    await this.props.transactionStore.getAllTransactions();

    this.setState({
      fetchedTransactions: true
    });
  }

  render() {
    const { txAddress } = this.props.match.params;

    let content = null;
    if (!this.state.fetchedTransactions) {
      content = <div className='sweet-loading horizontal-center'>
          <BeatLoader loading={!this.state.fetchedTransactions}/>
        </div>;
    } else {
      if (this.props.transactionStore.allTransactionsAddresses.includes(txAddress)) {
        content = <TransactionDetails address={txAddress} />;
      } else {
        content = <TransactionNotFound address={txAddress}/>
      }
    }
    window.transactionStore = this.props.transactionStore;

    return (
      <div>
        <h1 className="view-title">Transaction details <span className="view-subtitle">{txAddress}</span></h1>
        <div className="widget-12 card no-border widget-loader-circle no-margin">
          <div className="p-4">
            {content}
          </div>
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