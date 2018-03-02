import React from 'react';
import PropTypes from 'prop-types';
import { inject } from 'mobx-react';
import ScrollbarComponent from '../Common/ScrollbarComponent';
import { ValueDisplay } from '../Common/ValueDisplay';
import { BlockOrTimeDisplay } from './BlockOrTimeDisplay';
import { TRANSACTION_STATUS } from '../../stores/TransactionStore';

const INITIAL_STATE = {
  callData: '',
  isTimestamp: false,
  status: '',
  transaction: {},
  executedAt: ''
};

@inject('transactionStore')
@inject('eacService')
@inject('web3Service')
class TransactionDetails extends ScrollbarComponent {
  state = INITIAL_STATE;

  _isMounted = false;

  constructor() {
    super(...arguments);

    this.state = INITIAL_STATE;
    this.cancelTransaction = this.cancelTransaction.bind(this);
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

    this.setState( {
      callData: await transaction.callData(),
      isTimestamp: transactionStore.isTxUnitTimestamp(transaction),
      status: await transactionStore.getTxStatus(transaction),
      transaction,
      executedAt,
      isFrozen: ''
    } );
  }

  async getFrozenStatus() {
    const { transactionStore } = this.props;
    const { transaction } = this.state;
    if (!transaction || !transaction.inFreezePeriod) {
      return;
    }
    const isFrozen = await transactionStore.isTransactionFrozen(transaction);
    this.setState( { isFrozen: isFrozen || transaction.isCancelled } );
  }

  async cancelTransaction() {
    const { transactionStore } = this.props;
    const { transaction } = this.state;
    await transactionStore.cancel(transaction);
    this.setState({
      status: TRANSACTION_STATUS.CANCELLED
    });
  }

  async componentWillMount() {
    await this.fetchData();
  }

  isOwner( transaction){
    const { owner } = transaction;
    const { web3Service: { eth: { accounts } } } = this.props;
    const isOwner = accounts[0] == owner;
    return isOwner;
  }

  componentDidMount() {
    super.componentDidMount();
    this._isMounted = true;
    this.getFrozenStatus();
  }

  componentWillUnmount() {
    super.componentWillUnmount();
    this._isMounted = false;
  }

  getCancelSection() {
    const { transaction, isFrozen, status } = this.state;

    const isOwner = this.isOwner(transaction);

    if (isOwner && !isFrozen && status !== TRANSACTION_STATUS.CANCELLED) {
      return (
        <div className="text-center mt-5">
          <button className="btn btn-danger btn-cons" disabled={ isFrozen } onClick={ this.cancelTransaction } type="button">
            <span>Cancel</span>
          </button>
          { isFrozen ? 'The transaction has been frozen.' : '' }
        </div>
      );
    }

    return <div></div>;
  }

  render() {
    const { callData, executedAt, isTimestamp, status, transaction } = this.state;
    const { bounty, callGas, callValue, fee, gasPrice, requiredDeposit, toAddress, windowStart, windowSize } = transaction;

    return (
      <div className="tab-pane slide active show">

        <table className="table">
          <tbody>
            <tr>
              <td>Status</td>
              <td>{status}<span className= { status !== TRANSACTION_STATUS.EXECUTED ? 'd-none' : '' } >&nbsp;at <a href="#"> { executedAt } </a></span></td>
            </tr>
            <tr>
              <td>To Address</td>
              <td><a href="#">{toAddress}</a></td>
            </tr>
            <tr>
              <td>Value/Amount</td>
              <td><ValueDisplay priceInWei= { callValue } /></td>
            </tr>
            <tr>
              <td>Data</td>
              <td>{callData}</td>
            </tr>
            <tr>
              <td>{ isTimestamp ? 'Time' : 'Block' }</td>
              <td><BlockOrTimeDisplay model= { windowStart } isTimestamp= { isTimestamp } /></td>
            </tr>
            <tr>
              <td>Window Size</td>
              <td><BlockOrTimeDisplay model= { windowSize } isTimestamp= { isTimestamp } duration= { true } /></td>
            </tr>
            <tr>
              <td>Gas Amount</td>
              <td> { callGas && callGas.toFixed() } </td>
            </tr>
            <tr>
              <td>Gas Price</td>
              <td><ValueDisplay priceInWei= { gasPrice } /></td>
            </tr>
            <tr>
              <td>Time Bounty</td>
              <td><ValueDisplay priceInWei= { bounty } /></td>
            </tr>
            <tr>
              <td>Fee</td>
              <td><ValueDisplay priceInWei= { fee } /></td>
            </tr>
            <tr>
              <td>Deposit</td>
              <td><ValueDisplay priceInWei= { requiredDeposit } /></td>
            </tr>
          </tbody>
        </table>

        {this.getCancelSection()}
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
