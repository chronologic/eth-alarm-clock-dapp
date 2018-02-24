import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { observer, inject } from 'mobx-react';
import TimeSettings from '../ScheduleWizard/TimeSettings';
import InfoSettings from '../ScheduleWizard/InfoSettings';
import BountySettings from '../ScheduleWizard/BountySettings';
import ConfirmSettings from '../ScheduleWizard/ConfirmSettings';
import PoweredByEAC from './PoweredByEAC';

@inject('web3Service')
@inject('scheduleStore')
@inject('transactionStore')
@observer
class ScheduleWizard extends Component {
  constructor(props){
    super(props);
    this.state = {};
    this.scheduleTransaction = this.scheduleTransaction.bind(this);
  }

  _validations = {
    TimeSettings: {
      TimeComponent: {
        timeZone: true,
        transactionDate: true,
        transactionTime: true,
        executionWindow: true,
        customWindow: true,
      },
      BlockComponent: {
        blockNumber: true,
        blockSize: true,
      }
    },
    BountySettings: {
      requireDeposit: true,
      timeBounty: true,
      deposit: true
    },
    InfoSettings: {
      toAddress: true,
      gasAmount: true,
      amountToSend: true,
      gasPrice: true,
      yourData: true
    },
    ConfirmSettings: {
      timeZone: true,
      transactionDate: true,
      transactionTime: true,
      executionWindow: true,
      customWindow: true,

      blockNumber: true,

      requireDeposit: true,
      timeBounty: true,
      deposit: true,

      toAddress: true,
      gasAmount: true,
      amountToSend: true,
      gasPrice: true,
      yourData: true,
    },
    Errors:{
      numeric: 'Please enter valid value/amount',
      minimum_numeric: 'Value/amount shall be greater or equal to minimum value of 1',
      minimum_decimal: 'Value/amount shall be greater or equal to minimum value of 0.0000000000000000001 '
    }
  }

  _validationsErrors = {
    TimeSettings: {
      TimeComponent: {
        timeZone: '',
        transactionDate: '',
        transactionTime: '',
        executionWindow: '',
        customWindow: '',
      },
      BlockComponent: {
        blockNumber: '',
        blockSize: '',
      }
    },
    BountySettings: {
      requireDeposit: '',
      timeBounty: '',
      deposit: ''
    },
    InfoSettings: {
      toAddress: '',
      gasAmount: '',
      amountToSend: '',
      gasPrice: '',
      yourData: ''
    }
  }

  async scheduleTransaction() {
    const { scheduleStore, transactionStore, web3Service: { web3 } , history } = this.props;
    let executionTime, executionWindow;

    if (scheduleStore.isUsingTime) {
      executionTime = scheduleStore.transactionTimestamp;
      executionWindow = scheduleStore.executionWindow * 60;
    } else {
      executionTime = scheduleStore.blockNumber;
      executionWindow = scheduleStore.blockSize;
    }

    let { toAddress, yourData, gasAmount, amountToSend, gasPrice, donation, timeBounty, deposit, isUsingTime } = scheduleStore;

    amountToSend = web3.toWei(amountToSend, 'ether');
    gasPrice = web3.toWei(gasPrice, 'gwei');
    donation = web3.toWei(donation, 'ether');
    timeBounty = web3.toWei(timeBounty, 'ether');
    deposit = web3.toWei(deposit, 'ether');

    const scheduled = await transactionStore.schedule(toAddress,
                                                    yourData,
                                                    gasAmount,
                                                    amountToSend,
                                                    executionWindow,
                                                    executionTime,
                                                    gasPrice,
                                                    donation,
                                                    timeBounty,
                                                    deposit,
                                                    false, //do not wait for mining to return values
                                                    isUsingTime
                                                  );
    if (scheduled) {
        history.push('/awaiting/scheduler/' + scheduled.transactionHash);
      }
  }

  componentDidMount() {
    const { jQuery } = window;
    jQuery('#scheduleWizard').bootstrapWizard({
      onTabShow: function (tab, navigation, index) {
        var $total = navigation.find('li').length;
        var $current = index + 1;

          // If it's the last tab then hide the last button and show the finish instead
          if ($current >= $total) {
            jQuery('#scheduleWizard').find('.pager .next').hide();
            jQuery('#scheduleWizard').find('.pager .finish').show();
            jQuery('#scheduleWizard').find('.pager .finish').removeClass('disabled');
          } else {
            jQuery('#scheduleWizard').find('.pager .next').show();
            jQuery('#scheduleWizard').find('.pager .finish').hide();
          }
        }
      });
  }

  render() {
    const _validationProps = { _validations:this._validations,_validationsErrors:this._validationsErrors };

    return (
      <div id="scheduleWizard" className="subsection">
        <ul className="row nav nav-tabs nav-tabs-linetriangle nav-tabs-separator">
          <li className="col-3 col-md-3">
            <a data-toggle="tab" href="#timeSettings" onClick={ this.initiateScrollbar }>
              <div className="d-none d-md-block">
                <i className="far fa-clock tab-icon"></i>&nbsp;
                <span>Date & Time</span>
              </div>
              <div className="d-sm-block d-md-none">
                <i className="far fa-clock tab-icon"></i>
              </div>
            </a>
          </li>
          <li className="col-3 col-md-3">
            <a data-toggle="tab" href="#infoSettings" onClick={ this.initiateScrollbar }>
              <div className="d-none d-md-block">
                <i className="fas fa-info tab-icon"></i>&nbsp;
                <span>Information</span>
              </div>
              <div className="d-sm-block d-md-none">
                <i className="fas fa-info tab-icon"></i>
              </div>
            </a>
          </li>
          <li className="col-3 col-md-3">
            <a data-toggle="tab" href="#bountySettings" onClick={ this.initiateScrollbar }>
              <div className="d-none d-md-block">
                <i className="fab fa-ethereum tab-icon"></i>&nbsp;
                <span>Bounty</span>
              </div>
              <div className="d-sm-block d-md-none">
                <i className="fab fa-ethereum tab-icon"></i>
              </div>
            </a>
          </li>
          <li className="col-3 col-md-3">
            <a data-toggle="tab" href="#confirmSettings" onClick={ this.initiateScrollbar }>
              <div className="d-none d-md-block">
                <i className="fas fa-cloud-upload-alt tab-icon"></i>&nbsp;
                <span>Confirm</span>
              </div>
              <div className="d-sm-block d-md-none">
                <i className="fas fa-cloud-upload-alt tab-icon"></i>
              </div>
            </a>
          </li>
        </ul>

        <div className="tab-content">
          <TimeSettings {..._validationProps}/>
          <InfoSettings {..._validationProps}/>
          <BountySettings {..._validationProps}/>
          <ConfirmSettings/>

          <div className="row">
            <div className="d-none d-md-block">
              <PoweredByEAC className="col-md-2 footer-buttons"/>
            </div>

            <div className="footer-buttons col-md-10">
              <ul className="pager wizard no-style">
                <li className="next">
                  <button className="btn btn-primary btn-cons pull-right" onClick={ this.initiateScrollbar } type="button">
                    <span>Next</span>
                  </button>
                </li>
                <li className="next finish" style={{ display: 'none' }}>
                <button className="btn btn-primary btn-cons pull-right" type="button" onClick={ this.scheduleTransaction}>
                  <span>Schedule</span>
                </button>
                </li>
                <li className="previous first" style={{ display: 'none' }}>
                  <button className="btn btn-white btn-cons pull-right" onClick={ this.initiateScrollbar } type="button">
                    <span>First</span>
                  </button>
                  </li>
                <li className="previous">
                  <button className="btn btn-white btn-cons pull-right" onClick={ this.initiateScrollbar } type="button">
                    <span>Previous</span>
                  </button>
                </li>
              </ul>
            </div>
          </div>

          <div className="d-sm-block d-md-none">
            <PoweredByEAC className="col-md-2 footer-buttons mt-5"/>
          </div>
        </div>
      </div>
    );
  }
}

ScheduleWizard.propTypes = {
  web3Service: PropTypes.any,
  scheduleStore: PropTypes.any,
  transactionStore: PropTypes.any,
  history: PropTypes.any,
};

export default ScheduleWizard;
