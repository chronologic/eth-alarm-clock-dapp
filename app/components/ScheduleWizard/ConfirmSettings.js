import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { action } from 'mobx';
import { inject,observer } from 'mobx-react';
import Alert from '../Common/Alert';

@inject('scheduleStore')
@inject('eacService')
@inject('web3Service')
@observer
class ConfirmSettings extends Component {

  constructor(props){
    super(props);
    this.state = {
      errors: {}
    };
  }

  totalCost() {
    const { scheduleStore, eacService,web3Service: { web3 } } = this.props;
    let { gasAmount, amountToSend, gasPrice, fee, timeBounty } = scheduleStore;

    amountToSend = web3.toWei(amountToSend, 'ether');
    gasPrice = web3.toWei(gasPrice, 'gwei');
    fee = web3.toWei(fee, 'ether');
    timeBounty = web3.toWei(timeBounty,'ether');

    const endowment = eacService.calcEndowment(gasAmount, amountToSend, gasPrice, fee, timeBounty);

    return Number(web3.fromWei(endowment, 'ether')); // Only for display purposes
  }

  get executionWindow() {
    const { scheduleStore, isCustomWindow } = this.props;
    if (scheduleStore.isUsingTime){
      return `${(isCustomWindow ? scheduleStore.customWindow : scheduleStore.executionWindow)} mins`;
    }
      return `${scheduleStore.blockSize} blocks`;
  }

  blockOrTime(){
    const { scheduleStore } = this.props;
    if (scheduleStore.isUsingTime){
      return scheduleStore.transactionTzTime;
    }
    return scheduleStore.blockNumber ? scheduleStore.blockNumber : '-';
  }

  web3Error() {
    return !this.props.isWeb3Usable ? <Alert {...{ msg: 'You need Metamask installed and accounts Unlocked to continue' }} /> : null;
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
      this.setState(Object.assign( this.state.errors, errors ));
    }
  }

  componentDidMount () {
    this._mounted = true;
    this.tabValidations();
  }

  componentDidUpdate () {
    this.tabValidations();
  }

  componentWillUnmount () {
    this._mounted = false;
  }

  render() {
    const { scheduleStore } = this.props;
    const emptyFieldSign = '-';
    let errMsg = [];
    Object.keys(this.state.errors).map(section => { this.state.errors[section] ? errMsg.push(section) : null; } );
    return (
      <div id="confirmSettings" className="tab-pane">
        <h2>Summary</h2>
        { this.web3Error() }
        { errMsg.length > 0 &&
          <Alert {...{ msg: 'in tabs: ' + errMsg.join(',') }} />
        }
        { scheduleStore.isTokenTransfer &&
          <Alert {...{ type: 'info', close: false, msg: ': Please note that you will be prompted to send additional transaction to set token allowance required to complete tokens transfer scheduling, after successful deployment' }} />
        }
        <div className="row">

          <div className="col-lg-8">
            <table className="table d-block">
              <thead className="d-block">
                <tr className="d-block">
                  <th className="d-block"></th>
                </tr>
              </thead>
              <tbody className="d-block">
                <tr className="row m-0">
                  <td className="d-inline-block col-6 col-lg-4"><strong>{ !scheduleStore.isTokenTransfer ? 'To Address' : 'Token Address' }</strong></td>
                  <td className="d-inline-block col-6 col-sm-6 col-lg-8">{scheduleStore.toAddress ? <a href={this.props.web3Service.explorer + 'address/' + scheduleStore.toAddress } target='_blank' rel='noopener noreferrer'>{ scheduleStore.toAddress }</a> : emptyFieldSign}</td>
                </tr>
                {scheduleStore.isTokenTransfer &&
                  <tr className="row m-0">
                    <td className="d-inline-block col-6 col-lg-4">To address</td>
                  <td className="d-inline-block col-6 col-lg-8" >{scheduleStore.receiverAddress}</td>
                  </tr>
                }
                <tr className="row m-0">
                  <td className="d-inline-block col-6 col-lg-4"><strong>Amount to Send</strong></td>
                  {!scheduleStore.isTokenTransfer &&
                    <td className="d-inline-block col-6 col-lg-8">{scheduleStore.amountToSend ? scheduleStore.amountToSend + ' ETH' : emptyFieldSign}</td>
                  }
                  {scheduleStore.isTokenTransfer &&
                    <td className="d-inline-block col-6 col-lg-8">{scheduleStore.tokenToSend ? scheduleStore.tokenToSend + ' ' + scheduleStore.tokenSymbol : emptyFieldSign}</td>
                  }
                </tr>
                <tr className="row m-0">
                  <td className="d-inline-block col-6 col-lg-4">Data</td>
                  {!scheduleStore.isTokenTransfer &&
                    <td className="d-inline-block col-6 col-lg-8 data-field" title={scheduleStore.tokenData}>{scheduleStore.yourData ? scheduleStore.yourData : emptyFieldSign}</td>
                  }
                  {scheduleStore.isTokenTransfer &&
                    <td className="d-inline-block col-6 col-lg-8" title={scheduleStore.tokenData}>{scheduleStore.tokenData}</td>
                  }
                </tr>
                <tr className="row m-0">
                  <td className="d-inline-block col-6 col-lg-4">{scheduleStore.isUsingTime ? 'Time' : 'Block Number'}</td>
                  <td className="d-inline-block col-6 col-lg-8">{this.blockOrTime()}</td>
                </tr>
                <tr className="row m-0">
                  <td className="d-inline-block col-6 col-lg-4">Window Size</td>
                  <td className="d-inline-block col-6 col-lg-8">{this.executionWindow || emptyFieldSign}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="col-lg-4">
            <table className="table">
              <thead>
                <tr className="row m-0 d-none d-lg-table-row">
                  <th></th>
                </tr>
              </thead>
              <tbody>
                <tr className="row m-0">
                  <td className="d-inline-block col-6">Gas Amount</td>
                  <td className="d-inline-block col-6">{scheduleStore.gasAmount ? scheduleStore.gasAmount : emptyFieldSign}</td>
                </tr>
                <tr className="row m-0">
                  <td className="d-inline-block col-6">Gas Price</td>
                  <td className="d-inline-block col-6">{scheduleStore.gasPrice ? scheduleStore.gasPrice + ' Gwei' : emptyFieldSign}</td>
                </tr>
                <tr className="row m-0">
                  <td className="d-inline-block col-6">Fee</td>
                  <td className="d-inline-block col-6">{scheduleStore.fee ? scheduleStore.fee : emptyFieldSign}</td>
                </tr>
                <tr className="row m-0">
                  <td className="d-inline-block col-6">Time Bounty</td>
                  <td className="d-inline-block col-6">{scheduleStore.timeBounty ? scheduleStore.timeBounty + ' ETH' : emptyFieldSign}</td>
                </tr>
                <tr className="row m-0">
                  <td className="d-inline-block col-6">Deposit</td>
                  <td className="d-inline-block col-6">{scheduleStore.deposit ? scheduleStore.deposit + ' ETH' : emptyFieldSign}</td>
                </tr>
              </tbody>
            </table>
          </div>

        </div>
        <h3 className="text-right m-t-20">Total amount: <strong>{ this.totalCost() } ETH</strong></h3>
      </div>
        );
      }
  }

ConfirmSettings.propTypes = {
  scheduleStore: PropTypes.any,
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
