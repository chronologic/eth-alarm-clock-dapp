import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';
import Alert from '../Common/Alert';
import { BlockOrTimeDisplay } from './BlockOrTimeDisplay';
import { TRANSACTION_STATUS } from '../../stores/TransactionStore';
import { showNotification } from '../../services/notification';
import moment from 'moment';
import { ValueDisplay } from '../Common/ValueDisplay';
import * as ethUtil from 'ethereumjs-util';
import { BeatLoader } from 'react-spinners';

import CancelSection from './TransactionDetails/CancelSection';
import ProxySection from './TransactionDetails/ProxySection';

const INITIAL_STATE = {
  callData: '',
  customProxyData: '',
  executedAt: '',
  isTokenTransfer: false,
  isFrozen: '',
  proxyDataCheckBox: false,
  status: '',
  token: {},
  tokenTransferDetails: []
};

@inject('loadingStateStore')
@inject('tokenHelper')
@inject('transactionStore')
@inject('eacService')
@inject('web3Service')
@observer
class TransactionDetails extends Component {
  state = INITIAL_STATE;

  _isMounted = false;

  constructor() {
    super();

    this.state = INITIAL_STATE;

    this.approveTokenTransfer = this.approveTokenTransfer.bind(this);
    this.cancelTransaction = this.cancelTransaction.bind(this);
    this.customProxySend = this.customProxySend.bind(this);
    this.handleProxyDataClick = this.handleProxyDataClick.bind(this);
    this.proxyInputOnChange = this.proxyInputOnChange.bind(this);
    this.refundBalance = this.refundBalance.bind(this);
    this.sendTokensToOwner = this.sendTokensToOwner.bind(this);
  }

  async componentDidMount() {
    this._isMounted = true;

    await this.setupDetails();
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  async approveTokenTransfer(event) {
    const { target } = event;
    const { transaction, tokenHelper } = this.props;
    const { address, toAddress } = transaction;

    const originalBodyCss = document.body.className;
    document.body.className += ' fade-me';
    target.innerHTML = 'Approving...';

    try {
      const approved = await tokenHelper.approveTokenTransfer(
        toAddress,
        address,
        this.state.token.info.value
      );
      if (approved) {
        showNotification(`Token Transfer approved: ${approved}`, 'success');
        this.setState({ tokenTransferApproved: true });
      }
    } catch (error) {
      showNotification('Action cancelled by the user.', 'danger', 4000);
      target.innerHTML = 'Approve';
    }
    document.body.className = originalBodyCss;
  }

  async cancelTransaction() {
    const { transaction, transactionStore } = this.props;

    const originalBodyCss = document.body.className;
    document.body.className += ' fade-me';
    this.cancelBtn.innerHTML = 'Canceling...';

    try {
      const success = await transactionStore.cancel(transaction);
      if (success) {
        this.setState({
          status: TRANSACTION_STATUS.CANCELLED
        });
        this.checkContractBalance();
      }
    } catch (error) {
      showNotification('Action cancelled by the user.', 'danger', 4000);
      this.cancelBtn.innerHTML = 'Cancel';
    }
    document.body.className = originalBodyCss;
  }

  async checkContractBalance() {
    const {
      transaction: { address },
      web3Service
    } = this.props;
    const balance = await web3Service.getAddressBalance(address);
    this.setState({ balance });
  }

  async customProxySend() {
    const { transaction } = this.props;
    const { customProxyData } = this.state;

    const validate = proxyCallData => {
      const split = proxyCallData.split(',');
      if (split.length !== 2) {
        throw new Error('Provide the two arguments separated by a comma!');
      }
      // Remove quotations if they are there. Using template string quotes bc eslint.
      if (
        (split[0][0] === `"` && split[0][split[0].length - 1] === `"`) ||
        (split[0][0] === `'` && split[0][split[0].length - 1] === `'`)
      ) {
        split[0] = split[0].slice(1, split[0].length - 1);
      }
      if (!ethUtil.isValidAddress(split[0])) {
        throw new Error(
          `First argument provided is not a valid Ethereum address! Got: ${split[0]}`
        );
      }
      if (split[1].startsWith(' ')) {
        split[1] = split[1].slice(1);
      }
      // Remove quotations if they are there. Using template string quotes bc eslint.
      if (
        (split[1][0] === `"` && split[1][split[1].length - 1] === `"`) ||
        (split[1][0] === `'` && split[1][split[1].length - 1] === `'`)
      ) {
        split[1] = split[1].slice(1, split[1].length - 1);
      }
      if (!split[1].startsWith('0x')) {
        throw new Error(`Please pass a valid hex string as the second argument! Got: ${split[1]}`);
      }

      return {
        destination: split[0],
        data: split[1]
      };
    };

    const { destination, data } = validate(customProxyData);

    await transaction.proxy(destination, data);
  }

  async executedAt(transaction, status, transactionStore) {
    const requestLib = this.props.eacService.getRequestLibInstance(transaction.address);
    let executedAt = '';

    if (status === TRANSACTION_STATUS.EXECUTED || status === TRANSACTION_STATUS.FAILED) {
      const events = await this.getExecutedEvents(
        requestLib,
        transactionStore.requestFactoryStartBlock
      );

      if (events.length > 0) {
        executedAt = events[0].transactionHash;
      }
    }

    this.setState({ executedAt });
  }

  async fetchTokenTransferEvents() {
    const {
      tokenHelper,
      transaction: { address, executionWindowEnd, temporalUnit },
      web3Service
    } = this.props;

    if (!this.state.executedAt) {
      return;
    }

    const fromBlock = await web3Service.getBlockNumberFromTxHash(this.state.executedAt);

    let afterExecutionWindow;
    if (temporalUnit === 1) {
      afterExecutionWindow = (await web3Service.fetchBlockNumber()) >= executionWindowEnd;
    } else if (temporalUnit === 2) {
      afterExecutionWindow = Date.now() >= executionWindowEnd;
    }

    if (afterExecutionWindow) {
      const tokenTransferEvents = await web3Service.getTokenTransfers(address, fromBlock);
      const tokenTransferDetails = await Promise.all(
        tokenTransferEvents.map(async event => {
          const details = await tokenHelper.fetchTokenDetails(event.address);

          return Object.assign(details, {
            balance: await tokenHelper.getTokenBalanceOf(event.address, address)
          });
        })
      );
      this.setState({
        afterExecutionWindow,
        tokenTransferDetails
      });
    }
  }

  async fetchTokenTransferInfo() {
    const { tokenHelper, transaction } = this.props;
    const { toAddress } = transaction;
    const tokenDetails = await tokenHelper.fetchTokenDetails(toAddress);

    this.setState({ token: tokenDetails });
  }

  getExecutedEvents(requestLib, fromBlock = 0) {
    return new Promise(resolve => {
      requestLib.Executed({}, { fromBlock, toBlock: 'latest' }).get((error, events) => {
        resolve(events);
      });
    });
  }

  async getFrozenStatus() {
    const { transaction, transactionStore } = this.props;

    if (!transaction || !transaction.inFreezePeriod) {
      return;
    }

    const isFrozen = await transactionStore.isTransactionFrozen(transaction);
    this.setState({ isFrozen: isFrozen || transaction.isCancelled });
  }

  getTransactionPropertyTimeDisplay(transaction, property) {
    let display = '';

    if (transaction[property] && transaction[property].toString) {
      const parsedUnixTime = moment.unix(transaction[property].toString());

      display = parsedUnixTime.format('YYYY/MM/DD HH:mm:ss');
    }

    return display;
  }

  handleProxyDataClick() {
    this.setState({
      proxyDataCheckBox: !this.state.proxyDataCheckBox
    });
  }

  isOwner(transaction) {
    const { owner } = transaction;
    const {
      web3Service: {
        eth: { accounts }
      }
    } = this.props;

    return accounts[0] == owner;
  }

  proxyInputOnChange(e) {
    this.setState({ customProxyData: e.target.value });
  }

  async refundBalance(event) {
    const { target } = event;
    const { transaction, transactionStore } = this.props;

    const originalBodyCss = document.body.className;

    document.body.className += ' fade-me';
    target.innerHTML = 'Refunding...';

    try {
      const success = await transactionStore.refund(transaction);
      if (success) {
        showNotification(`Funds successfully refunded: ${success.transactionHash}`, 'success');
        this.setState({ balance: 0 });
        this.checkContractBalance();
      }
    } catch (error) {
      showNotification('Action cancelled by the user.', 'danger', 4000);
    }
    target.innerHTML = 'Refund Balance';
    document.body.className = originalBodyCss;
  }

  async sendTokensToOwner(token, amount) {
    const { tokenHelper, transaction } = this.props;
    const { owner } = transaction;

    const data = await tokenHelper.sendTokensData(token, owner, amount);
    await transaction.proxy(token, data);
  }

  async setupDetails() {
    const { transaction, transactionStore } = this.props;

    const status = await transactionStore.getTxStatus(transaction, moment().unix());

    this.setState({
      callData: await transaction.callData(),
      status
    });

    await this.getFrozenStatus();
    await this.testToken();
    await this.executedAt(transaction, status, transactionStore);
    await this.fetchTokenTransferEvents();
  }

  async testToken() {
    const { tokenHelper, transaction } = this.props;
    const { address, toAddress } = transaction;

    let tokenTransferApproved;
    const isTokenTransfer = tokenHelper.isTokenTransferTransaction(this.state.callData);

    if (isTokenTransfer) {
      await this.fetchTokenTransferInfo();

      const info = await tokenHelper.getTokenTransferInfoFromData(this.state.callData);
      this.setState({ token: Object.assign(this.state.token, { info }) });

      tokenTransferApproved = await tokenHelper.isTokenTransferApproved(
        toAddress,
        address,
        this.state.token.info.value
      );
    }
    this.setState({ isTokenTransfer, tokenTransferApproved });
  }

  /** TODO: These `get*Section()` function can be refactored into stateless components
   and moved to individual files in the TransactionDetails folder. Note for future work. */

  getApproveSection() {
    const { status, isFrozen, isTokenTransfer, tokenTransferApproved } = this.state;
    const { transaction } = this.props;

    const isOwner = this.isOwner(transaction);

    if (
      isOwner &&
      isTokenTransfer &&
      !tokenTransferApproved &&
      (isFrozen || status === TRANSACTION_STATUS.SCHEDULED)
    ) {
      return (
        <div className="d-inline-block text-center mt-2 mt-sm-5 col-12 col-sm-6">
          <button
            className="btn btn-default btn-cons"
            onClick={this.approveTokenTransfer}
            type="button"
          >
            <span>Approve</span>
          </button>
        </div>
      );
    }

    return <div className="col-6" />;
  }

  getInfoMessage() {
    const { status, isFrozen } = this.state;
    const { transaction } = this.props;

    const isOwner = this.isOwner(transaction);

    let messages = [];
    if (isOwner && isFrozen && status === TRANSACTION_STATUS.SCHEDULED) {
      messages.push('The transaction has been frozen.');
    }
    return (
      <div>
        {messages.map(msg => (
          <div key={msg}>{msg}</div>
        ))}
      </div>
    );
  }

  getRefundSection() {
    const { status, balance } = this.state;
    const { transaction } = this.props;

    const isOwner = this.isOwner(transaction);

    if (
      isOwner &&
      balance > 0 &&
      (status === TRANSACTION_STATUS.CANCELLED ||
        status === TRANSACTION_STATUS.EXECUTED ||
        status === TRANSACTION_STATUS.FAILED ||
        status === TRANSACTION_STATUS.MISSED)
    ) {
      return (
        <div className="d-inline-block text-center mt-2 mt-sm-5 col-12 col-sm-6">
          <button className="btn btn-default btn-cons" onClick={this.refundBalance} type="button">
            <span>Refund Balance</span>
          </button>
        </div>
      );
    }

    return <div className="col-6" />;
  }

  getTokenNotificationSection() {
    const { status, isFrozen, isTokenTransfer, tokenTransferApproved } = this.state;
    const { transaction } = this.props;

    const isOwner = this.isOwner(transaction);
    const approve = (
      <button className="btn btn-default" onClick={this.approveTokenTransfer}>
        Approve Now
      </button>
    );

    if (
      isOwner &&
      isTokenTransfer &&
      !tokenTransferApproved &&
      (isFrozen || status === TRANSACTION_STATUS.SCHEDULED)
    ) {
      return (
        <Alert
          {...{
            type: 'warning',
            close: false,
            action: approve,
            msg: `: This transaction schedules a token transfer. A minimum allowance of ${this.state
              .token.info.value /
              10 ** this.state.token.decimals} ${
              this.state.token.symbol
            } tokens is required to be approved to complete the scheduling.`
          }}
        />
      );
    }
    return null;
  }

  render() {
    const { transaction } = this.props;
    const { callData, executedAt, isFrozen, status } = this.state;
    const {
      bounty,
      callGas,
      callValue,
      fee,
      gasPrice,
      owner,
      requiredDeposit,
      toAddress,
      windowStart,
      windowSize
    } = transaction;

    const isOwner = this.isOwner(transaction);
    const isTimestamp = transaction.temporalUnit === 2;

    return (
      <div className="tab-pane slide active show">
        <div>{this.getTokenNotificationSection()}</div>
        <table className="table d-block">
          <tbody className="d-block">
            <tr className="row">
              <td className="d-inline-block col-5 col-md-3">Status</td>
              <td className="d-inline-block col-7 col-md-9">
                {status ? status : <BeatLoader size={6} color="#aaa" />}
                {executedAt && (
                  <span>
                    {` at `}
                    <a
                      href={this.props.web3Service.explorer + 'tx/' + executedAt}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {executedAt}
                    </a>
                  </span>
                )}
              </td>
            </tr>
            <tr className="row">
              <td className="d-inline-block col-5 col-md-3">
                {!this.state.isTokenTransfer ? 'To Address' : 'Token Address'}
              </td>
              <td className="d-inline-block col-7 col-md-9">
                <a
                  href={this.props.web3Service.explorer + 'address/' + toAddress}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {toAddress}
                </a>
              </td>
            </tr>
            {this.state.isTokenTransfer && (
              <tr className="row">
                <td className="d-inline-block col-5 col-md-3">To Address</td>
                <td className="d-inline-block col-7 col-md-9">
                  <a
                    href={
                      this.props.web3Service.explorer + 'address/' + this.state.token.info.sender
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {this.state.token.info.sender}
                  </a>
                </td>
              </tr>
            )}
            <tr className="row">
              <td className="d-inline-block col-5 col-md-3">Value/Amount</td>
              <td className="d-inline-block col-7 col-md-9">
                {!this.state.isTokenTransfer ? (
                  <ValueDisplay priceInWei={callValue} />
                ) : (
                  `${this.state.token.info.value / 10 ** this.state.token.decimals} ${
                    this.state.token.symbol
                  }`
                )}
              </td>
            </tr>
            <tr className="row">
              <td className="d-inline-block col-5 col-md-3">Data</td>
              <td className="d-inline-block col-7 col-md-9" title={callData}>
                {callData ? callData : <BeatLoader size={6} color="#aaa" />}
              </td>
            </tr>
            <tr className="row">
              <td className="d-inline-block col-5 col-md-3">{isTimestamp ? 'Time' : 'Block'}</td>
              <td className="d-inline-block col-7 col-md-9">
                <BlockOrTimeDisplay model={windowStart} isTimestamp={isTimestamp} />
              </td>
            </tr>
            <tr className="row">
              <td className="d-inline-block col-5 col-md-3">Window Size</td>
              <td className="d-inline-block col-7 col-md-9">
                <BlockOrTimeDisplay model={windowSize} isTimestamp={isTimestamp} duration={true} />
              </td>
            </tr>
            <tr className="row">
              <td className="d-inline-block col-5 col-md-3">Gas Amount</td>
              <td className="d-inline-block col-7 col-md-9"> {callGas && callGas.toFixed()} </td>
            </tr>
            <tr className="row">
              <td className="d-inline-block col-5 col-md-3">Gas Price</td>
              <td className="d-inline-block col-7 col-md-9">
                <ValueDisplay priceInWei={gasPrice} />
              </td>
            </tr>
            <tr className="row">
              <td className="d-inline-block col-5 col-md-3">Time Bounty</td>
              <td className="d-inline-block col-7 col-md-9">
                <ValueDisplay priceInWei={bounty} />
              </td>
            </tr>
            <tr className="row">
              <td className="d-inline-block col-5 col-md-3">Fee</td>
              <td className="d-inline-block col-7 col-md-9">
                <ValueDisplay priceInWei={fee} />
              </td>
            </tr>
            <tr className="row">
              <td className="d-inline-block col-5 col-md-3">Deposit</td>
              <td className="d-inline-block col-7 col-md-9">
                <ValueDisplay priceInWei={requiredDeposit} />
              </td>
            </tr>
          </tbody>
        </table>
        <div className="row">
          <div className="col-2 col-sm-4 col-md-6 col-lg-8" />
          <div className="col-10 col-sm-8 col-md-6 col-lg-4">
            <div className="row">
              {this.getApproveSection()}
              {this.getRefundSection()}
            </div>
          </div>
          <div className="col-12">{this.getInfoMessage()}</div>
        </div>
        <CancelSection
          cancelButtonEnabled={
            isOwner &&
            !isFrozen &&
            (status === TRANSACTION_STATUS.SCHEDULED || status === TRANSACTION_STATUS.MISSED)
          }
          cancelBtnRef={el => (this.cancelBtn = el)}
          cancelTransaction={this.cancelTransaction}
          claimWindowStart={this.getTransactionPropertyTimeDisplay(transaction, 'claimWindowStart')}
          executionWindowEnd={this.getTransactionPropertyTimeDisplay(
            transaction,
            'executionWindowEnd'
          )}
          isOwner={isOwner}
          owner={owner}
        />
        <ProxySection
          afterExecutionWindow={this.state.afterExecutionWindow}
          customProxyData={this.state.customProxyData}
          customProxySend={this.customProxySend}
          handleProxyDataClick={this.handleProxyDataClick}
          isOwner={isOwner}
          proxyDataCheckBox={this.state.proxyDataCheckBox}
          proxyInputOnChange={this.proxyInputOnChange}
          sendTokensToOwner={this.sendTokensToOwner}
          tokenTransferDetails={this.state.tokenTransferDetails}
        />
      </div>
    );
  }
}

TransactionDetails.propTypes = {
  address: PropTypes.string,
  eacService: PropTypes.any,
  loadingStateStore: PropTypes.any,
  tokenHelper: PropTypes.any,
  transaction: PropTypes.any,
  transactionStore: PropTypes.any,
  web3Service: PropTypes.any
};

export default TransactionDetails;
