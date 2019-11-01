import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { action } from 'mobx';
import { inject, observer } from 'mobx-react';
import Alert from '../Common/Alert';
import CollectibleDisplay from '../Common/CollectibleDisplay';

const EMPTY_FIELD_SIGN = '-';

@inject('tokenHelper')
@inject('scheduleStore')
@inject('eacService')
@inject('web3Service')
@observer
class ConfirmSettings extends Component {
  constructor(props) {
    super(props);
    this.state = {
      errors: {}
    };
  }

  totalCost() {
    const {
      scheduleStore,
      eacService,
      web3Service: { web3 }
    } = this.props;
    let { gasAmount, amountToSend, gasPrice, fee, timeBounty } = scheduleStore;

    amountToSend = web3.utils.toWei(String(amountToSend) || '0', 'ether');
    gasPrice = web3.utils.toWei(String(gasPrice) || '0', 'gwei');
    fee = web3.utils.toWei(String(fee) || '0', 'ether');
    timeBounty = web3.utils.toWei(String(timeBounty) || '0', 'ether');

    const endowment = eacService.calcEndowment(gasAmount, amountToSend, gasPrice, fee, timeBounty);

    return Number(web3.utils.fromWei(String(endowment), 'ether')); // Only for display purposes
  }

  get executionWindow() {
    const { scheduleStore, isCustomWindow } = this.props;
    if (scheduleStore.isUsingTime) {
      return `${isCustomWindow ? scheduleStore.customWindow : scheduleStore.executionWindow} mins`;
    }
    return `${scheduleStore.blockSize} blocks`;
  }

  blockOrTime() {
    const { scheduleStore } = this.props;
    if (scheduleStore.isUsingTime) {
      return scheduleStore.transactionTzTime;
    }
    return scheduleStore.blockNumber ? scheduleStore.blockNumber : '-';
  }

  web3Error() {
    return !this.props.isWeb3Usable ? (
      <Alert {...{ msg: 'You need Metamask installed and accounts Unlocked to continue' }} />
    ) : null;
  }

  infoSettingsValidations() {
    return !this.props.infoTabValidator ? 'info' : null;
  }

  bountySettingsValidations() {
    return !this.props.bountyTabValidator ? 'bounty' : null;
  }

  timeSettingsValidations() {
    const { scheduleStore } = this.props;
    return scheduleStore.isUsingTime && !this.props.timeTabValidator ? 'time' : null;
  }

  blockComponentValidations() {
    const { scheduleStore } = this.props;
    return !scheduleStore.isUsingTime && !this.props.blockTabValidator ? 'block' : null;
  }

  @action
  tabValidations() {
    let errors = {};
    errors.info = this.infoSettingsValidations() ? true : false;
    errors.time = this.timeSettingsValidations() ? true : false;
    errors.bounty = this.bountySettingsValidations() ? true : false;
    errors.block = this.blockComponentValidations() ? true : false;

    if (this._mounted && JSON.stringify(this.state.errors) !== JSON.stringify(errors)) {
      this.setState(Object.assign(this.state.errors, errors));
    }
  }

  componentDidMount() {
    this._mounted = true;
    this.tabValidations();
  }

  componentDidUpdate() {
    this.tabValidations();
  }

  componentWillUnmount() {
    this._mounted = false;
  }

  isCollectibleTransfer() {
    const { scheduleStore, tokenHelper } = this.props;

    return scheduleStore && tokenHelper.isCollectible(scheduleStore.toAddress);
  }

  getAmountToSendDisplay() {
    const { scheduleStore } = this.props;

    if (scheduleStore.isTokenTransfer) {
      if (this.isCollectibleTransfer() && scheduleStore.collectibleIdToTransfer) {
        return (
          <td className="d-inline-block col-6 col-lg-8">
            <CollectibleDisplay
              tokenAddress={scheduleStore.toAddress}
              collectibleId={scheduleStore.collectibleIdToTransfer}
              tokenName={scheduleStore.tokenName}
              onlyText={true}
            />
          </td>
        );
      }

      return (
        <td className="d-inline-block col-6 col-lg-8">
          {scheduleStore.tokenToSend
            ? scheduleStore.tokenToSend + ' ' + scheduleStore.tokenSymbol
            : EMPTY_FIELD_SIGN}
        </td>
      );
    }

    return (
      <td className="d-inline-block col-6 col-lg-8">
        {scheduleStore.amountToSend ? scheduleStore.amountToSend + ' ETH' : EMPTY_FIELD_SIGN}
      </td>
    );
  }

  render() {
    const Tabs = {
      info: ' INFORMATION',
      time: ' DATE & TIME',
      bounty: ' BOUNTY',
      block: ' DATE & TIME'
    };
    const { scheduleStore } = this.props;
    let errMsg = [];
    Object.keys(this.state.errors).map(section => {
      this.state.errors[section] ? errMsg.push(section) : null;
    });
    return (
      <div id="confirmSettings" className="tab-pane">
        <h2>Summary</h2>
        {this.web3Error()}
        {errMsg.length > 0 && (
          <Alert
            {...{
              msg: `Please check:  ${errMsg
                .map(err => Tabs[err])
                .join(',')} tab(s) for correct input values`,
              close: false
            }}
          />
        )}
        {scheduleStore.isTokenTransfer && (
          <Alert
            {...{
              type: 'info',
              close: false,
              msg:
                'Please note that you will be prompted to send additional transaction to set token allowance required to complete tokens transfer scheduling, after successful deployment'
            }}
          />
        )}
        <div className="row">
          <div className="col-lg-8">
            <table className="table d-block">
              <thead className="d-block">
                <tr className="d-block">
                  <th className="d-block" />
                </tr>
              </thead>
              <tbody className="d-block">
                <tr className="row m-0">
                  <td className="d-inline-block col-6 col-lg-4">
                    <strong>
                      {!scheduleStore.isTokenTransfer ? 'To Address' : 'Token Address'}
                    </strong>
                  </td>
                  <td className="d-inline-block col-6 col-sm-6 col-lg-8">
                    {scheduleStore.toAddress ? (
                      <a
                        href={
                          this.props.web3Service.explorer + 'address/' + scheduleStore.toAddress
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {scheduleStore.toAddress}
                      </a>
                    ) : (
                      EMPTY_FIELD_SIGN
                    )}
                  </td>
                </tr>
                {scheduleStore.isTokenTransfer && (
                  <tr className="row m-0">
                    <td className="d-inline-block col-6 col-lg-4">To address</td>
                    <td className="d-inline-block col-6 col-sm-6 col-lg-8">
                      <a
                        href={
                          this.props.web3Service.explorer +
                          'address/' +
                          scheduleStore.receiverAddress
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {scheduleStore.receiverAddress}
                      </a>
                    </td>
                  </tr>
                )}
                <tr className="row m-0">
                  <td className="d-inline-block col-6 col-lg-4">
                    <strong>Amount to Send</strong>
                  </td>
                  {this.getAmountToSendDisplay()}
                </tr>
                <tr className="row m-0">
                  <td className="d-inline-block col-6 col-lg-4">Data</td>
                  {!scheduleStore.isTokenTransfer && (
                    <td
                      className="d-inline-block col-6 col-lg-8 data-field"
                      title={scheduleStore.tokenData}
                    >
                      {scheduleStore.yourData ? scheduleStore.yourData : EMPTY_FIELD_SIGN}
                    </td>
                  )}
                  {scheduleStore.isTokenTransfer && (
                    <td className="d-inline-block col-6 col-lg-8" title={scheduleStore.tokenData}>
                      {scheduleStore.tokenData}
                    </td>
                  )}
                </tr>
                <tr className="row m-0">
                  <td className="d-inline-block col-6 col-lg-4">
                    {scheduleStore.isUsingTime ? 'Time' : 'Block Number'}
                  </td>
                  <td className="d-inline-block col-6 col-lg-8">{this.blockOrTime()}</td>
                </tr>
                <tr className="row m-0">
                  <td className="d-inline-block col-6 col-lg-4">Window Size</td>
                  <td className="d-inline-block col-6 col-lg-8">
                    {this.executionWindow || EMPTY_FIELD_SIGN}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="col-lg-4">
            <table className="table">
              <thead>
                <tr className="row m-0 d-none d-lg-table-row">
                  <th />
                </tr>
              </thead>
              <tbody>
                <tr className="row m-0">
                  <td className="d-inline-block col-6">Gas Amount</td>
                  <td className="d-inline-block col-6">
                    {scheduleStore.gasAmount ? scheduleStore.gasAmount : EMPTY_FIELD_SIGN}
                  </td>
                </tr>
                <tr className="row m-0">
                  <td className="d-inline-block col-6">Gas Price</td>
                  <td className="d-inline-block col-6">
                    {scheduleStore.gasPrice ? scheduleStore.gasPrice + ' Gwei' : EMPTY_FIELD_SIGN}
                  </td>
                </tr>
                <tr className="row m-0">
                  <td className="d-inline-block col-6">Fee</td>
                  <td className="d-inline-block col-6">
                    {scheduleStore.fee ? scheduleStore.fee : EMPTY_FIELD_SIGN}
                  </td>
                </tr>
                <tr className="row m-0">
                  <td className="d-inline-block col-6">Time Bounty</td>
                  <td className="d-inline-block col-6">
                    {scheduleStore.timeBounty
                      ? scheduleStore.timeBounty + ' ETH'
                      : EMPTY_FIELD_SIGN}
                  </td>
                </tr>
                <tr className="row m-0">
                  <td className="d-inline-block col-6">Deposit</td>
                  <td className="d-inline-block col-6">
                    {scheduleStore.deposit ? scheduleStore.deposit + ' ETH' : EMPTY_FIELD_SIGN}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <h3 className="text-right m-t-20">
          Total amount: <strong>{this.totalCost()} ETH</strong>
        </h3>
      </div>
    );
  }
}

ConfirmSettings.propTypes = {
  scheduleStore: PropTypes.any,
  tokenHelper: PropTypes.any,
  web3Service: PropTypes.any,
  eacService: PropTypes.any,
  isWeb3Usable: PropTypes.any,
  isCustomWindow: PropTypes.any,
  TimeComponentValidations: PropTypes.any,
  bountyTabValidator: PropTypes.any,
  infoTabValidator: PropTypes.any,
  timeTabValidator: PropTypes.any,
  blockTabValidator: PropTypes.any
};

export default ConfirmSettings;
