import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { inject,observer } from 'mobx-react';
import Alert from '../Common/Alert';

@inject('scheduleStore')
@inject('eacService')
@inject('web3Service')
@observer
class ConfirmSettings extends Component {

  constructor(props){
    super(props);
    this.infoSettingsValidations = this.infoSettingsValidations.bind(this);
    this.bountySettingsValidations = this.bountySettingsValidations.bind(this);
    this.timeSettingsValidations = this.timeSettingsValidations.bind(this);
    this.blockComponentValidations = this.blockComponentValidations.bind(this);
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

  tabValidations() {
    const errors = [];
    this.infoSettingsValidations() ? errors.push(this.infoSettingsValidations()) : null;
    this.bountySettingsValidations() ? errors.push(this.bountySettingsValidations()) : null;
    this.timeSettingsValidations() ? errors.push(this.timeSettingsValidations()) : null;
    this.blockComponentValidations() ? errors.push(this.blockComponentValidations()) : null;
    return errors.length > 0 ? <Alert {...{ msg: 'in tabs: ' + errors.join(', ') }}  /> : null;
  }

  render() {
    const { scheduleStore } = this.props;
    const emptyFieldSign = '-';
    return (
      <div id="confirmSettings" className="tab-pane">
        <h2>Summary</h2>
        {this.web3Error()}
        {this.tabValidations()}
        <div className="row">

          <div className="col-lg-8">
            <table className="table">
              <thead>
                <tr>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                <tr className="row m-0">
                  <td className="d-inline-block col-6 col-lg-4"><strong>To Address</strong></td>
                  <td className="d-inline-block col-6 col-sm-6 col-lg-8">{scheduleStore.toAddress ? <a href="#">{scheduleStore.toAddress}</a> : emptyFieldSign}</td>
                </tr>
                <tr className="row m-0">
                  <td className="d-inline-block col-6 col-lg-4"><strong>Amount to Send</strong></td>
                  <td className="d-inline-block col-6 col-lg-8">{scheduleStore.amountToSend ? scheduleStore.amountToSend + ' ETH' : emptyFieldSign}</td>
                </tr>
                <tr className="row m-0">
                  <td className="d-inline-block col-6 col-lg-4">Data</td>
                  <td className="d-inline-block col-6 col-lg-8">{scheduleStore.yourData ? scheduleStore.yourData : emptyFieldSign}</td>
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
