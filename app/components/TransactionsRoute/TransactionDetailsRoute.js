import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';
import TransactionDetails from '../TransactionScanner/TransactionDetails';
import TransactionNotFound from '../TransactionScanner/TransactionNotFound';
import { BeatLoader } from 'react-spinners';
import PoweredByEAC from '../Common/PoweredByEAC';

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

    let content = <div></div>;

    // If the list of transactions has been fetched
    if (this.state.fetchedTransactions) {
      // Check if the address exists in the transactions list
      if (this.props.transactionStore.allTransactionsAddresses.includes(txAddress)) {
        content = <TransactionDetails address={txAddress} />;
      } else {
        // Throw a 404 if the transaction with that address does not exist
        content = <TransactionNotFound address={txAddress}/>;
      }
    }

    return (
      <div className="container">
        <h1 className="view-title">Transaction details <span className="view-subtitle">{txAddress}</span></h1>
        <div className="widget-12 card no-border widget-loader-circle no-margin">
          <div className="tab-content p-4">
            { !this.state.fetchedTransactions &&
              <div className='sweet-loading horizontal-center my-5'>
                <BeatLoader loading={true} />
              </div>
            }
            {content}
          </div>
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