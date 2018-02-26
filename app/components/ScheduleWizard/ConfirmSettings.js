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
  }

  totalCost() {
    const { scheduleStore, eacService,web3Service: { web3 } } = this.props;
    let { gasAmount, amountToSend, gasPrice, fee, timeBounty, deposit } = scheduleStore;

    amountToSend = web3.toWei(amountToSend, 'ether');
    gasPrice = web3.toWei(gasPrice, 'gwei');
    fee = web3.toWei(fee, 'ether');
    deposit = web3.toWei(deposit,'ether');

    const endowment = eacService.calcEndowment(gasAmount, amountToSend, gasPrice, fee, deposit);

    return Number(web3.fromWei(endowment, 'ether'))+Number(timeBounty); // Only for display purposes
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
      return scheduleStore.blockNumber;
  }

  web3Error() {
    return !this.props.isWeb3Usable ? <Alert {...{ msg: 'You need Metamask installed and accounts Unlocked to continue' }} /> : null;
  }

  render() {
    const { scheduleStore } = this.props;
    return (
      <div id="confirmSettings" className="tab-pane">
        <div className="d-sm-block d-md-none">
          <h2 className="m-b-20">Confirm</h2>
          <hr/>
        </div>
        <div className="row">
          <div className="col-md-10">
            {this.web3Error()}
            <table className="table">
              <thead>
                <tr>
                  <th><strong>Summary</strong></th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>To Address</td>
                  <td><a href="#">{scheduleStore.toAddress}</a></td>
                </tr>
                <tr>
                  <td>Data</td>
                  <td>{scheduleStore.yourData}</td>
                </tr>
                <tr>
                  <td>Block or Time</td>
                  <td>{this.blockOrTime()}</td>
                </tr>
                <tr>
                  <td>Window Size</td>
                  <td>{this.executionWindow}</td>
                </tr>
                <tr>
                  <td>Gas Amount</td>
                  <td>{scheduleStore.gasAmount}</td>
                </tr>
                <tr>
                  <td>Gas Price</td>
                  <td>{scheduleStore.gasPrice}</td>
                </tr>
                <tr>
                  <td>Fee</td>
                  <td>{scheduleStore.fee}</td>
                </tr>
                <tr>
                  <td>Time Bounty</td>
                  <td>{scheduleStore.timeBounty}</td>
                </tr>
                <tr>
                  <td>Deposit</td>
                  <td>{scheduleStore.deposit}</td>
                </tr>
                <tr>
                  <td><strong>Total cost</strong></td>
                  <td><strong> { this.totalCost() } ETH </strong></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
        );
      }
  }

ConfirmSettings.propTypes = {
  scheduleStore: PropTypes.any,
  web3Service: PropTypes.any,
  eacService: PropTypes.any,
  isWeb3Usable: PropTypes.any,
  isCustomWindow: PropTypes.any
};

export default ConfirmSettings;
