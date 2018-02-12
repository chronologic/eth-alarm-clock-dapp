import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { inject } from 'mobx-react';
import { ValueDisplay } from '../Common/ValueDisplay';
import { BlockOrTimeDisplay } from '../Common/BlockOrTimeDisplay';
import { TRANSACTION_STATUS } from '../../stores/TransactionStore';
import PoweredByEAC from '../Common/PoweredByEAC';

const INITIAL_STATE = {
  callData: '',
  isTimestamp: false,
  status: '',
  transaction: {},
  executedAt: ''
};

@inject('transactionStore')
@inject('eacService')
class TransactionDetails extends Component {
  state = INITIAL_STATE;

  _isMounted = false;

  constructor() {
    super(...arguments);

    this.state = INITIAL_STATE;
  }

  getExecutedEvents(requestLib) {
    return new Promise(resolve => {
      requestLib.Executed({}, { fromBlock: 0, toBlock: 'latest' }).get((error, events) => {
        resolve(events);
      });
    });
  }

  async fetchData() {
    const { address, transactionStore } = this.props;

    const transaction = await transactionStore.getTransactionByAddress(address);

    await transaction.fillData();

    if (!this._isMounted) {
      return;
    }

    const requestLib = this.props.eacService.getRequestLibInstance(address);

    const events = await this.getExecutedEvents(requestLib);

    let executedAt = '';

    if (events[0]) {
      executedAt = events[0].transactionHash;
    }

    this.setState({
      callData: await transaction.callData(),
      isTimestamp: transactionStore.isTxUnitTimestamp(transaction),
      status: await transactionStore.getTxStatus(transaction),
      transaction,
      executedAt
    });
  }

  async componentWillMount() {
    await this.fetchData();
  }

  componentDidMount() {
    this._isMounted = true;
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  render() {
    const { callData, executedAt, isTimestamp, status, transaction } = this.state;
    const { bounty, callGas, callValue, fee, gasPrice, requiredDeposit, toAddress, windowStart, windowSize } = transaction;

    return (
      <div>
        <div className="row">
          <div className="col-md-8">

            <table className="table">
              <tbody>
                <tr>
                  <td>Status</td>
                  <td>{status}<span className={status !== TRANSACTION_STATUS.EXECUTED ? 'd-none' : ''}>&nbsp;at <a href="#">{executedAt}</a></span></td>
                </tr>
                <tr>
                  <td>To Address</td>
                  <td><a href="#">{toAddress}</a></td>
                </tr>
                <tr>
                  <td>Value/Amount</td>
                  <td><ValueDisplay priceInWei={callValue} /></td>
                </tr>
                <tr>
                  <td>Data</td>
                  <td>{callData}</td>
                </tr>
                <tr>
                  <td>Block or Time</td>
                  <td><BlockOrTimeDisplay model={windowStart} isTimestamp={isTimestamp} /></td>
                </tr>
                <tr>
                  <td>Window Size</td>
                  <td><BlockOrTimeDisplay model={windowSize} isTimestamp={isTimestamp} duration={true} /></td>
                </tr>
                <tr>
                  <td>Gas Amount</td>
                  <td>{callGas && callGas.toFixed()}</td>
                </tr>
                <tr>
                  <td>Gas Price</td>
                  <td><ValueDisplay priceInWei={gasPrice} /></td>
                </tr>
                <tr>
                  <td>Time Bounty</td>
                  <td><ValueDisplay priceInWei={bounty} /></td>
                </tr>
                <tr>
                  <td>Donation</td>
                  <td><ValueDisplay priceInWei={fee} /></td>
                </tr>
                <tr>
                  <td>Deposit</td>
                  <td><ValueDisplay priceInWei={requiredDeposit} /></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div className="row">
          <PoweredByEAC className="col-md-2 mt-2" />
        </div>
      </div>
    );
  }
}

TransactionDetails.propTypes = {
  address: PropTypes.string,
  eacService: PropTypes.any,
  transactionStore: PropTypes.any
};

export default TransactionDetails;