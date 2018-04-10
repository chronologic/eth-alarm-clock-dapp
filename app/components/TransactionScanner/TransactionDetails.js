import React from 'react';
import PropTypes from 'prop-types';
import { inject } from 'mobx-react';
import ScrollbarComponent from '../Common/ScrollbarComponent';
import { ValueDisplay } from '../Common/ValueDisplay';
import { BlockOrTimeDisplay } from './BlockOrTimeDisplay';
import { TRANSACTION_STATUS } from '../../stores/TransactionStore';
import { showNotification } from '../../services/notification';

const INITIAL_STATE = {
  callData: '',
  isTimestamp: false,
  status: '',
  transaction: {},
  executedAt: '',
  token: {},
  isTokenTransfer: false
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
    this.approveTokenTransfer = this.approveTokenTransfer.bind(this);
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

    this.getFrozenStatus();
    this.testToken();
    
  }

  async testToken() {
    const { web3Service } = this.props;
    const { address, toAddress } = this.state.transaction;

    let tokenTransferapproved;
    const isTokenTransfer = web3Service.isTokenTransferTransaction(this.state.callData);

    if (isTokenTransfer) {
      await this.fetchTokenTransferInfo();

      const info = await web3Service.getTokenTransferInfoFromData(this.state.callData);
      this.setState({ token: Object.assign(this.state.token, { info }) });

      tokenTransferapproved = await web3Service.isTokenTransferApproved(toAddress, address, this.state.token.info.value);
    }
    this.setState({ isTokenTransfer, tokenTransferapproved });

    if (isTokenTransfer && !tokenTransferapproved) {
      showNotification('Kindly approve token transfer.', 'warning');
    }
  }

  async fetchTokenTransferInfo () {
    const { web3Service } = this.props;
    const { toAddress } = this.state.transaction;
    const tokenDetails = await web3Service.fetchTokenDetails(toAddress);
    this.setState({ token: tokenDetails });
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

    const originalBodyCss = document.body.className;
    document.body.className += ' fade-me';
    this.cancelBtn.innerHTML = 'Canceling...';

    try {
      const success = await transactionStore.cancel(transaction);
      if (success) {
        this.setState({
          status: TRANSACTION_STATUS.CANCELLED
        });
      }
    } catch (error) {
      showNotification('Action cancelled by the user.', 'danger', 4000);
      this.cancelBtn.innerHTML = 'Cancel';
    }
    document.body.className = originalBodyCss;
  }

  async approveTokenTransfer(event) {
    const { target } = event;
    const { web3Service } = this.props;
    const { address, toAddress } = this.state.transaction;

    const originalBodyCss = document.body.className;
    document.body.className += ' fade-me';
    target.innerHTML = 'Approving...';

    try{
      const approved = await web3Service.approveTokenTransfer(toAddress, address, this.state.token.info.value);
      if (approved) {
        this.setState({ tokenTransferapproved : true });
      }

     } catch (error) {
      showNotification('Action cancelled by the user.', 'danger', 4000);
      target.innerHTML = 'Approve';
    }
    document.body.className = originalBodyCss;
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
  }

  componentWillUnmount() {
    super.componentWillUnmount();
    this._isMounted = false;
  }

  getCancelSection() {
    const { transaction, isFrozen, status } = this.state;

    const isOwner = this.isOwner(transaction);

    if (isOwner && !isFrozen && status === TRANSACTION_STATUS.SCHEDULED) {
      return (
        <div className='d-inline-block text-center mt-2 mt-sm-5 col-12 col-sm-6'>
          <button className='btn btn-danger btn-cons'
            disabled={ isFrozen }
            onClick={ this.cancelTransaction }
            type='button'
            ref={(el) => this.cancelBtn = el}>
            <span>Cancel</span>
          </button>
        </div>
      );
    }

    return <div className='col-6'></div>;
  }

  getApproveSection() {
    const { transaction, status, isTokenTransfer } = this.state;

    const isOwner = this.isOwner(transaction);

    if (isTokenTransfer && isOwner && status === TRANSACTION_STATUS.SCHEDULED) {
      return (
        <div className='d-inline-block text-center mt-2 mt-sm-5 col-12 col-sm-6'>
          <button className='btn btn-defaukt btn-cons'
            onClick={this.approveTokenTransfer}
            type='button' >
            <span>Approve</span>
          </button>
        </div>
      );
    }

    return <div className='col-6'></div>;
  }

  getInfoMessage () {
    const { transaction, status, isFrozen, isTokenTransfer, tokenTransferapproved } = this.state;
    const isOwner = this.isOwner(transaction);

    let messages = [];
    if (isOwner && !isFrozen && status === TRANSACTION_STATUS.SCHEDULED) {
      messages.push('The transaction has been frozen.');
    }
    if (isTokenTransfer && !tokenTransferapproved && (isFrozen || status === TRANSACTION_STATUS.SCHEDULED) ) {
      messages.push('Kindly approve token transfer.');
    }
    return (
      <div>
        {messages.map(msg => <div key={msg}>{msg}</div>)}
      </div>
    )
  }

  render() {
    const { callData, executedAt, isTimestamp, status, transaction } = this.state;
    const { bounty, callGas, callValue, fee, gasPrice, requiredDeposit, toAddress, windowStart, windowSize } = transaction;

    return (
      <div className='tab-pane slide active show'>

        <table className='table d-block'>
          <tbody className='d-block'>
            <tr className='row'>
              <td className='d-inline-block col-5 col-md-3'>Status</td>
              <td className='d-inline-block col-7 col-md-9'>{status}<span className= { status !== TRANSACTION_STATUS.EXECUTED ? 'd-none' : '' } >&nbsp;at <a href={ this.props.web3Service.explorer + 'tx/' + executedAt }  target='_blank' rel='noopener noreferrer'>{ executedAt }</a></span></td>
            </tr>
            <tr className='row'>
              <td className='d-inline-block col-5 col-md-3'>{ !this.state.isTokenTransfer ? 'To Address' : 'Token Address' }</td>
              <td className='d-inline-block col-7 col-md-9'><a href={this.props.web3Service.explorer + 'address/' + toAddress} target='_blank' rel='noopener noreferrer'>{toAddress}</a></td>
            </tr>
            { this.state.isTokenTransfer &&
              <tr className='row'>
                <td className='d-inline-block col-5 col-md-3'>To Address</td>
              <td className='d-inline-block col-7 col-md-9'><a href={this.props.web3Service.explorer + 'address/' + this.state.token.info.sender} target='_blank' rel='noopener noreferrer'>{this.state.token.info.sender}</a></td>
              </tr>
            }
            <tr className='row'>
              <td className='d-inline-block col-5 col-md-3'>Value/Amount</td>
              <td className='d-inline-block col-7 col-md-9'>{ !this.state.isTokenTransfer ? <ValueDisplay priceInWei= { callValue } /> : `${(this.state.token.info.value / 10**this.state.token.decimals)} ${this.state.token.symbol}`}</td>
            </tr>
            <tr className='row'>
              <td className='d-inline-block col-5 col-md-3'>Data</td>
              <td className='d-inline-block col-7 col-md-9' title={callData} >{callData}</td>
            </tr>
            <tr className='row'>
              <td className='d-inline-block col-5 col-md-3'>{ isTimestamp ? 'Time' : 'Block' }</td>
              <td className='d-inline-block col-7 col-md-9'><BlockOrTimeDisplay model= { windowStart } isTimestamp= { isTimestamp } /></td>
            </tr>
            <tr className='row'>
              <td className='d-inline-block col-5 col-md-3'>Window Size</td>
              <td className='d-inline-block col-7 col-md-9'><BlockOrTimeDisplay model= { windowSize } isTimestamp= { isTimestamp } duration= { true } /></td>
            </tr>
            <tr className='row'>
              <td className='d-inline-block col-5 col-md-3'>Gas Amount</td>
              <td className='d-inline-block col-7 col-md-9'> { callGas && callGas.toFixed() } </td>
            </tr>
            <tr className='row'>
              <td className='d-inline-block col-5 col-md-3'>Gas Price</td>
              <td className='d-inline-block col-7 col-md-9'><ValueDisplay priceInWei= { gasPrice } /></td>
            </tr>
            <tr className='row'>
              <td className='d-inline-block col-5 col-md-3'>Time Bounty</td>
              <td className='d-inline-block col-7 col-md-9'><ValueDisplay priceInWei= { bounty } /></td>
            </tr>
            <tr className='row'>
              <td className='d-inline-block col-5 col-md-3'>Fee</td>
              <td className='d-inline-block col-7 col-md-9'><ValueDisplay priceInWei= { fee } /></td>
            </tr>
            <tr className='row'>
              <td className='d-inline-block col-5 col-md-3'>Deposit</td>
              <td className='d-inline-block col-7 col-md-9'><ValueDisplay priceInWei= { requiredDeposit } /></td>
            </tr>
          </tbody>
        </table>
        <div className='row'>
          <div className='col-2 col-sm-4 col-md-6 col-lg-8'>
          </div>
          <div className='col-10 col-sm-8 col-md-6 col-lg-4'>
            <div className='row'>
              {this.getApproveSection()}
              {this.getCancelSection()}
            </div>
          </div>
          <div className='col-12'>
            {this.getInfoMessage()}
          </div>
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
