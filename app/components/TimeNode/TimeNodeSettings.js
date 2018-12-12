import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { inject } from 'mobx-react';
import TimeNodeDetachModal from './Modals/TimeNodeDetachModal';
import TimeNodeResetStatsModal from './Modals/TimeNodeResetStatsModal';
import ConfirmEconomicStrategyModal from './Modals/ConfirmEconomicStrategyModal';
import Switch from 'react-switch';
import { Config } from '@ethereum-alarm-clock/timenode-core';

@inject('timeNodeStore')
class TimeNodeSettings extends Component {
  constructor(props) {
    super(props);

    this.state = {
      claiming: props.timeNodeStore.claiming,
      maxDepositDefault: this._toEth(Config.DEFAULT_ECONOMIC_STRATEGY.maxDeposit),
      minProfitabilityDefault: this._toEth(Config.DEFAULT_ECONOMIC_STRATEGY.minProfitability),
      minBalanceDefault: this._toEth(Config.DEFAULT_ECONOMIC_STRATEGY.minBalance),
      maxGasSubsidyDefault: Config.DEFAULT_ECONOMIC_STRATEGY.maxGasSubsidy,
      maxDeposit: this._initField('maxDeposit'),
      minProfitability: this._initField('minProfitability'),
      minBalance: this._initField('minBalance'),
      maxGasSubsidy: this._initField('maxGasSubsidy')
    };

    this._toEth = this._toEth.bind(this);

    this.handleChange = this.handleChange.bind(this);
    this.toggleClaiming = this.toggleClaiming.bind(this);
    this.hasUnsavedChanges = this.hasUnsavedChanges.bind(this);
    this.refreshChanges = this.refreshChanges.bind(this);
  }

  _toEth(wei) {
    return this.props.timeNodeStore._web3Service.web3.utils.fromWei(wei, 'ether');
  }

  _initField(field) {
    const hasPropertyOrNotDefault = strategy => {
      if (!strategy) {
        return false;
      }
      const setStrategy = this.props.timeNodeStore.economicStrategy[strategy];
      const defaultStrategy = Config.DEFAULT_ECONOMIC_STRATEGY[strategy].toString();
      return setStrategy !== defaultStrategy;
    };

    if (hasPropertyOrNotDefault(field)) {
      const setValue = this.props.timeNodeStore.economicStrategy[field];
      return field !== 'maxGasSubsidy' ? this._toEth(setValue) : setValue;
    }

    return '';
  }

  handleChange(event) {
    this.setState({
      [event.target.id]: event.target.value
    });
  }

  toggleClaiming() {
    this.setState({
      claiming: !this.state.claiming
    });
  }

  hasUnsavedChanges() {
    let unsavedChanges = false;
    const fieldsToCheck = ['maxDeposit', 'minProfitability', 'minBalance', 'maxGasSubsidy'];
    const { economicStrategy, _web3Service } = this.props.timeNodeStore;

    fieldsToCheck.forEach(field => {
      let detectedValue = this.state[field];
      const defaultValue = this.state[`${field}Default`].toString();
      const currentSetField =
        field === 'maxGasSubsidy'
          ? economicStrategy[field]
          : _web3Service.web3.utils.fromWei(economicStrategy[field], 'ether');

      if (detectedValue === '') detectedValue = defaultValue;
      if (detectedValue != currentSetField) unsavedChanges = true;
    });

    if (this.state.claiming !== this.props.timeNodeStore.claiming) unsavedChanges = true;

    return unsavedChanges;
  }

  resetFields() {
    this.setState({
      claiming: this.props.timeNodeStore.claiming,
      maxDeposit: this._initField('maxDeposit'),
      minProfitability: this._initField('minProfitability'),
      minBalance: this._initField('minBalance'),
      maxGasSubsidy: this._initField('maxGasSubsidy')
    });
  }

  refreshChanges() {
    this.setState({});
  }

  isPositiveFloatOrEmpty(str) {
    if (str === '') {
      return true;
    }
    return parseFloat(str) >= 0;
  }

  isPercentageOrEmpty(str) {
    if (str === '') {
      return true;
    }
    const percentage = parseInt(str);
    return percentage >= 0 && percentage <= 100;
  }

  render() {
    const { maxDeposit, minProfitability, minBalance, maxGasSubsidy } = this.state;

    const validation = {
      maxDeposit: this.isPositiveFloatOrEmpty(maxDeposit),
      minProfitability: this.isPositiveFloatOrEmpty(minProfitability),
      minBalance: this.isPositiveFloatOrEmpty(minBalance),
      maxGasSubsidy: this.isPercentageOrEmpty(maxGasSubsidy)
    };

    const allFieldsValid = Object.keys(validation).every(k => validation[k]);

    return (
      <div id="timeNodeSettings">
        <div className="card card-transparent">
          <div className="card-header separator">
            <div className="row">
              <div className="col-6 col-md-6 vertical-align">
                <div className="card-title">Claiming mode</div>
              </div>
              <div className="col-6 col-md-6 text-right">
                <Switch
                  onChange={this.toggleClaiming}
                  checked={this.state.claiming}
                  onHandleColor="#21ffff"
                  offColor="#ddd"
                  onColor="#000"
                  uncheckedIcon={false}
                  checkedIcon={false}
                />
              </div>
            </div>
          </div>
          <div className="card-block p-3">
            <div className="mb-3">
              Enables claiming transactions. Claiming helps you secure the execution of certain
              transactions.
              <br />
              <strong>Claiming transactions might cause a loss of funds.</strong>
            </div>
          </div>
        </div>

        {this.state.claiming && (
          <div className="card card-transparent">
            <div className="card-header separator">
              <div className="card-title">Economic Strategy - Claiming</div>
            </div>
            <div className="card-block p-3">
              <div className="mb-3">
                You can fine tune which transactions you would like to claim and which you would
                avoid claiming. Fine tuning your settings lowers the risk of losing funds when
                claiming, so we highly advise the usage of these features.
                <br />
                <strong>Only claim transactions that</strong>:
              </div>

              <div className="row vertical-align">
                <div className="col-md-4">
                  <div
                    className={`form-group form-group-default ${
                      !validation.maxDeposit ? 'has-error' : ''
                    }`}
                  >
                    <label>Require a deposit lower than</label>
                    <input
                      id="maxDeposit"
                      className="form-control"
                      type="number"
                      placeholder={`Default: ${this.state.maxDepositDefault} ETH`}
                      value={this.state.maxDeposit}
                      onChange={this.handleChange}
                    />
                  </div>
                  <div className={`invalid-feedback ${!validation.maxDeposit ? 'd-block' : ''}`}>
                    Please provide a valid deposit.
                  </div>
                </div>

                <div className="col-md-4">
                  <div
                    className={`form-group form-group-default ${
                      !validation.minProfitability ? 'has-error' : ''
                    }`}
                  >
                    <label>Bring a profit higher than</label>
                    <input
                      id="minProfitability"
                      className="form-control"
                      type="number"
                      placeholder={`Default: ${this.state.minProfitabilityDefault} ETH`}
                      value={this.state.minProfitability}
                      onChange={this.handleChange}
                    />
                  </div>
                  <div
                    className={`invalid-feedback ${!validation.minProfitability ? 'd-block' : ''}`}
                  >
                    Please provide a valid profitability.
                  </div>
                </div>

                <div className="col-md-4">
                  <div
                    className={`form-group form-group-default ${
                      !validation.minBalance ? 'has-error' : ''
                    }`}
                  >
                    <label>My balance is higher than</label>
                    <input
                      id="minBalance"
                      className="form-control"
                      type="number"
                      placeholder={`Default: ${this.state.minBalanceDefault} ETH`}
                      value={this.state.minBalance}
                      onChange={this.handleChange}
                    />
                  </div>
                  <div className={`invalid-feedback ${!validation.minBalance ? 'd-block' : ''}`}>
                    Please provide a valid balance.
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="card card-transparent">
          <div className="card-header separator">
            <div className="card-title">Execution gas subsidization</div>
          </div>
          <div className="card-block p-3">
            <div className="mb-3">
              In order to guarantee transaction execution in cases of peaking gas prices, TimeNodes
              can choose to subsidize a part of the gas costs in cases where the gas price goes up
              too high. By setting this the TimeNode commits to subsidize gas costs up to a certain
              percentage higher.
            </div>

            <div className="row vertical-align">
              <div className="col-md-4">
                <div
                  className={`form-group form-group-default ${
                    !validation.maxGasSubsidy ? 'has-error' : ''
                  }`}
                >
                  <label>Maximum Gas Subsidy</label>
                  <input
                    id="maxGasSubsidy"
                    className="form-control"
                    type="number"
                    placeholder={`Default: ${this.state.maxGasSubsidyDefault}%`}
                    value={this.state.maxGasSubsidy}
                    onChange={this.handleChange}
                  />
                </div>
                <div className={`invalid-feedback ${!validation.maxGasSubsidy ? 'd-block' : ''}`}>
                  Please provide a valid percentage between 0 and 100.
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="row mx-3">
          <div className="col-md-9 col-lg-10">
            {this.hasUnsavedChanges() && (
              <div className="pull-right mt-1 text-danger">You have unsaved changes.</div>
            )}
          </div>
          <div className="col-md-3 col-lg-2 px-0">
            <button
              className="btn btn-primary px-5 btn-block pull-right"
              data-toggle="modal"
              data-target="#confirmClaimingModal"
              disabled={!allFieldsValid}
            >
              Save
            </button>
          </div>
        </div>

        <div className="card card-transparent">
          <div className="card-header separator">
            <div className="card-title">Reset Statistics</div>
          </div>
          <div className="card-block p-3">
            <div className="row vertical-align">
              <div className="col-md-9 col-lg-10 my-2">
                <p className="m-0">
                  You have the option of resetting the statistics of your TimeNode.
                </p>
              </div>
              <div className="col-md-3 col-lg-2">
                <button
                  className="btn btn-secondary btn-block"
                  data-toggle="modal"
                  data-target="#timeNodeResetStatsModal"
                >
                  Reset stats
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="card card-transparent">
          <div className="card-header separator">
            <div className="card-title">Detach Wallet</div>
          </div>
          <div className="card-block p-3">
            <div className="row vertical-align">
              <div className="col-md-9 col-lg-10 my-2">
                <p className="m-0">
                  If you wish to run a TimeNode using a different wallet, you can detach this wallet
                  and recreate the TimeNode.
                </p>
              </div>
              <div className="col-md-3 col-lg-2">
                <button
                  className="btn btn-danger btn-block"
                  data-toggle="modal"
                  data-target="#timeNodeDetachModal"
                >
                  Detach wallet
                </button>
              </div>
            </div>
          </div>
        </div>

        <TimeNodeDetachModal />
        <TimeNodeResetStatsModal />
        <ConfirmEconomicStrategyModal
          valid={allFieldsValid}
          claiming={this.state.claiming}
          maxDeposit={this.state.maxDeposit}
          minProfitability={this.state.minProfitability}
          minBalance={this.state.minBalance}
          maxGasSubsidy={this.state.maxGasSubsidy}
          refreshParent={this.refreshChanges}
        />
      </div>
    );
  }
}

TimeNodeSettings.propTypes = {
  timeNodeStore: PropTypes.any
};

export default TimeNodeSettings;
