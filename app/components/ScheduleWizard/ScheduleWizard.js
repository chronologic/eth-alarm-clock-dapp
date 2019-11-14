import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { observer, inject } from 'mobx-react';
import TimeSettings from './TimeSettings';
import InfoSettings from './InfoSettings';
import BountySettings from './BountySettings';
import ConfirmSettings from './ConfirmSettings';
import PoweredByEAC from '../Common/PoweredByEAC';
import ConfirmValueModal from './Modal/ConfirmValueModal';
import { showNotification } from '../../services/notification';

@inject('web3Service')
@inject('scheduleStore')
@inject('transactionStore')
@inject('featuresService')
@observer
class ScheduleWizard extends Component {
  constructor(props) {
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
        customWindow: true
      },
      BlockComponent: {
        blockNumber: true,
        blockSize: true
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
      yourData: true,
      receiverAddress: true,
      tokenToSend: true
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
      yourData: true
    },
    Errors: {
      numeric: 'Please enter valid value/amount',
      minimum_numeric: 'Value/amount should be greater or equal to minimum value of 1',
      minimum_decimal:
        'Value/amount should be greater or equal to minimum value of 0.0000000000000000001 '
    }
  };

  _validationsErrors = {
    TimeSettings: {
      TimeComponent: {
        timeZone: '',
        transactionDate: '',
        transactionTime: '',
        executionWindow: '',
        customWindow: ''
      },
      BlockComponent: {
        blockNumber: '',
        blockSize: ''
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
  };

  get isCustomWindow() {
    const { scheduleStore } = this.props;
    return scheduleStore.customWindow && this._validations.TimeSettings.TimeComponent.customWindow;
  }
  get TimeComponentValidations() {
    const { scheduleStore } = this.props;
    const _timeZone =
      Boolean(scheduleStore.timeZone) && this._validations.TimeSettings.TimeComponent.timeZone;
    const _transactionDate =
      Boolean(scheduleStore.transactionDate) &&
      this._validations.TimeSettings.TimeComponent.transactionDate;
    const _transactionTime =
      Boolean(scheduleStore.transactionTime) &&
      this._validations.TimeSettings.TimeComponent.transactionTime;
    const _executionWindow =
      (Boolean(scheduleStore.customWindow) &&
        this._validations.TimeSettings.TimeComponent.customWindow) ||
      (Boolean(scheduleStore.executionWindow) &&
        this._validations.TimeSettings.TimeComponent.executionWindow);
    return _timeZone && _transactionDate && _transactionTime && _executionWindow;
  }
  get blockComponentValidations() {
    const { scheduleStore } = this.props;
    const _blockNumber =
      Boolean(scheduleStore.blockNumber) &&
      this._validations.TimeSettings.BlockComponent.blockNumber;
    const _blockSize =
      Boolean(scheduleStore.blockSize) && this._validations.TimeSettings.BlockComponent.blockSize;
    return _blockNumber && _blockSize;
  }
  get bountySettingsValidation() {
    const { scheduleStore } = this.props;
    const _timeBounty =
      Boolean(scheduleStore.timeBounty) && this._validations.BountySettings.timeBounty;
    const _deposit =
      !scheduleStore.requireDeposit ||
      (Boolean(scheduleStore.deposit) && this._validations.BountySettings.deposit);
    return _timeBounty && _deposit;
  }

  get infoSettingsValidations() {
    const { scheduleStore } = this.props;
    const _addr = Boolean(scheduleStore.toAddress) && this._validations.InfoSettings.toAddress;
    const _receiverAddress =
      !scheduleStore.isTokenTransfer ||
      (Boolean(scheduleStore.receiverAddress) && this._validations.InfoSettings.receiverAddress);
    const _amountToSend =
      !scheduleStore.isTokenTransfer &&
      Number(scheduleStore.amountToSend) >= 0 &&
      this._validations.InfoSettings.amountToSend;
    const _tokenToSend =
      scheduleStore.isTokenTransfer &&
      Boolean(scheduleStore.tokenToSend) &&
      this._validations.InfoSettings.tokenToSend;
    const _gasAmount = Boolean(scheduleStore.gasAmount) && this._validations.InfoSettings.gasAmount;
    const _gasPrice = Boolean(scheduleStore.gasPrice) && this._validations.InfoSettings.gasPrice;
    const _yourData =
      !scheduleStore.useData ||
      (Boolean(scheduleStore.yourData) && this._validations.InfoSettings.yourData);
    const _tokenData = scheduleStore.isTokenTransfer && Boolean(scheduleStore.tokenData);
    return (
      _addr &&
      _receiverAddress &&
      _gasAmount &&
      (_amountToSend || _tokenToSend) &&
      _gasPrice &&
      (_yourData || _tokenData)
    );
  }

  get scheduleDisabled() {
    const { featuresService, scheduleStore } = this.props;

    return (
      !featuresService.enabled.scheduling ||
      !this.bountySettingsValidation ||
      !this.props.isWeb3Usable ||
      !this.infoSettingsValidations ||
      !(
        (scheduleStore.isUsingTime && this.TimeComponentValidations) ||
        this.blockComponentValidations
      )
    );
  }

  get isZeroValueAndNoData() {
    const { scheduleStore } = this.props;
    return (
      !scheduleStore.isTokenTransfer &&
      Number(scheduleStore.amountToSend) === 0 &&
      !scheduleStore.yourData
    );
  }

  async scheduleTransaction() {
    this.scheduleBtn.innerHTML = 'Scheduling...';
    const originalBodyCss = document.body.className;
    document.body.className += ' fade-me';

    const {
      scheduleStore,
      transactionStore,
      web3Service: { web3 },
      history
    } = this.props;
    let executionTime, executionWindow;

    if (scheduleStore.isUsingTime) {
      executionTime = scheduleStore.transactionTimestamp;
      executionWindow = this.isCustomWindow
        ? scheduleStore.customWindow
        : scheduleStore.executionWindow;
      executionWindow = executionWindow * 60;
    } else {
      executionTime = scheduleStore.blockNumber;
      executionWindow = scheduleStore.blockSize;
    }

    let {
      toAddress,
      yourData,
      tokenData,
      gasAmount,
      amountToSend,
      gasPrice,
      fee,
      timeBounty,
      deposit,
      isUsingTime,
      isTokenTransfer
    } = scheduleStore;

    amountToSend = web3.utils.toWei(String(amountToSend || 0), 'ether');
    gasPrice = web3.utils.toWei(String(gasPrice), 'gwei');
    fee = web3.utils.toWei(String(fee), 'ether');
    timeBounty = web3.utils.toWei(String(timeBounty), 'ether');
    deposit = web3.utils.toWei(String(deposit), 'ether');
    const data = isTokenTransfer ? tokenData : yourData;

    try {
      const scheduled = await transactionStore.schedule(
        toAddress,
        data,
        gasAmount,
        amountToSend,
        executionWindow,
        executionTime,
        gasPrice,
        fee,
        timeBounty,
        deposit,
        false, //do not wait for mining to return values
        isUsingTime
      );

      if (scheduled) {
        scheduleStore.reset();
        history.push('/awaiting/scheduler/' + scheduled.transactionHash);
        document.body.className = originalBodyCss;
      }
    } catch (error) {
      showNotification('Transaction cancelled by the user.', 'danger', 4000);
      document.body.className = originalBodyCss;
      this.scheduleBtn.innerHTML = 'Schedule';
    }
  }

  componentDidMount() {
    const { jQuery } = window;

    if (!jQuery) {
      return;
    }

    jQuery('#scheduleWizard').bootstrapWizard({
      onTabShow: function(tab, navigation, index) {
        var $total = navigation.find('li').length;
        var $current = index + 1;

        // If it's the last tab then hide the last button and show the finish instead
        if ($current >= $total) {
          jQuery('#scheduleWizard')
            .find('.pager .next')
            .hide();
          jQuery('#scheduleWizard')
            .find('.pager .finish')
            .show();
          jQuery('#scheduleWizard')
            .find('.pager .finish')
            .removeClass('disabled');
        } else {
          jQuery('#scheduleWizard')
            .find('.pager .next')
            .show();
          jQuery('#scheduleWizard')
            .find('.pager .finish')
            .hide();
        }
      }
    });
  }

  render() {
    const _validationProps = {
      _validations: this._validations,
      _validationsErrors: this._validationsErrors
    };

    const { enabled } = this.props.featuresService;

    return (
      <div id="scheduleWizard" className="subsection">
        <ul className="row nav nav-tabs nav-tabs-linetriangle nav-tabs-separator p-b-10">
          <li className="col-3 col-md-3">
            <a data-toggle="tab" href="#timeSettings">
              <div className="row">
                <div className="col-md-4 text-right tab-icon-wrapper">
                  <i className="far fa-clock tab-icon" />
                </div>
                <div className="col-md-8 text-left">
                  <span className="d-none d-md-inline">Date & Time</span>
                </div>
              </div>
            </a>
          </li>
          <li className="col-3 col-md-3">
            <a data-toggle="tab" href="#infoSettings">
              <div className="row">
                <div className="col-md-4 text-right tab-icon-wrapper">
                  <i className="fas fa-info tab-icon" />
                </div>
                <div className="col-md-8 text-left">
                  <span className="d-none d-md-inline">Information</span>
                </div>
              </div>
            </a>
          </li>
          <li className="col-3 col-md-3">
            <a data-toggle="tab" href="#bountySettings">
              <div className="row">
                <div className="col-md-4 text-right tab-icon-wrapper">
                  <i className="fab fa-ethereum tab-icon" />
                </div>
                <div className="col-md-8 text-left">
                  <span className="d-none d-md-inline">Bounty</span>
                </div>
              </div>
            </a>
          </li>
          <li className="col-3 col-md-3">
            <a data-toggle="tab" href="#confirmSettings">
              <div className="row">
                <div className="col-md-4 text-right tab-icon-wrapper">
                  <i className="fas fa-cloud-upload-alt tab-icon" />
                </div>
                <div className="col-md-8 text-left">
                  <span className="d-none d-md-inline">Confirm</span>
                </div>
              </div>
            </a>
          </li>
        </ul>

        <div className="tab-content">
          <TimeSettings {..._validationProps} />
          <InfoSettings {..._validationProps} />
          <BountySettings {..._validationProps} />
          <ConfirmSettings
            infoTabValidator={this.infoSettingsValidations}
            timeTabValidator={this.TimeComponentValidations}
            blockTabValidator={this.blockComponentValidations}
            bountyTabValidator={this.bountySettingsValidation}
            {...{ isWeb3Usable: this.props.isWeb3Usable, isCustomWindow: this.isCustomWindow }}
          />

          <div className="row">
            <div className="d-none d-md-block col-md-2">
              <PoweredByEAC className="footer-buttons" />
            </div>

            <div className="footer-buttons col-md-10">
              <ul className="pager wizard no-style">
                <li className="next">
                  <button
                    className="btn btn-primary btn-cons pull-right"
                    type="button"
                    disabled={!enabled.scheduling}
                  >
                    Next
                  </button>
                </li>
                <li className="next finish" style={{ display: 'none' }}>
                  {!this.isZeroValueAndNoData && (
                    <button
                      className="btn btn-primary btn-cons pull-right"
                      type="button"
                      ref={el => (this.scheduleBtn = el)}
                      onClick={this.scheduleTransaction}
                    >
                      Schedule
                    </button>
                  )}
                  {this.isZeroValueAndNoData && (
                    <button
                      className="btn btn-primary btn-cons pull-right"
                      type="button"
                      data-toggle="modal"
                      data-target="#confirmValueModal"
                      ref={el => (this.scheduleBtn = el)}
                      disabled={this.scheduleDisabled}
                    >
                      Schedule
                    </button>
                  )}
                </li>
                <li className="previous first" style={{ display: 'none' }}>
                  <button className="btn btn-white btn-cons pull-right" type="button">
                    First
                  </button>
                </li>
                <li className="previous">
                  <button className="btn btn-white btn-cons pull-right" type="button">
                    Previous
                  </button>
                </li>
              </ul>
            </div>
          </div>

          <div className="d-sm-inline d-md-none">
            <PoweredByEAC className="col-md-2 footer-buttons mt-5" />
          </div>
        </div>
        <ConfirmValueModal scheduleTransaction={this.scheduleTransaction} />
      </div>
    );
  }
}

ScheduleWizard.propTypes = {
  featuresService: PropTypes.any,
  web3Service: PropTypes.any,
  scheduleStore: PropTypes.any,
  transactionStore: PropTypes.any,
  history: PropTypes.any,
  isWeb3Usable: PropTypes.any
};

export { ScheduleWizard };
