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

    const {
      maxDeposit,
      minProfitability,
      minBalance,
      maxGasSubsidy
    } = props.timeNodeStore.economicStrategy;

    const toEth = wei => this.props.timeNodeStore._web3Service.fromWei(wei, 'ether');
    const hasPropertyOrNotDefault = strategy => {
      if (!strategy) {
        return false;
      }
      const setStrategy = props.timeNodeStore.economicStrategy[strategy];
      const defaultStrategy = Config.DEFAULT_ECONOMIC_STRATEGY[strategy].toString();
      return setStrategy !== defaultStrategy;
    };

    this.state = {
      claiming: props.timeNodeStore.claiming,
      maxDeposit: hasPropertyOrNotDefault('maxDeposit') ? toEth(maxDeposit) : '',
      minProfitability: hasPropertyOrNotDefault('minProfitability') ? toEth(minProfitability) : '',
      minBalance: hasPropertyOrNotDefault('minBalance') ? toEth(minBalance) : '',
      maxGasSubsidy: hasPropertyOrNotDefault('maxGasSubsidy') ? maxGasSubsidy : '',
      defaultMaxDeposit: toEth(Config.DEFAULT_ECONOMIC_STRATEGY.maxDeposit),
      defaultMinProfitability: toEth(Config.DEFAULT_ECONOMIC_STRATEGY.minProfitability),
      defaultMinBalance: toEth(Config.DEFAULT_ECONOMIC_STRATEGY.minBalance),
      defaultMaxGasSubsidy: Config.DEFAULT_ECONOMIC_STRATEGY.maxGasSubsidy
    };

    this.handleChange = this.handleChange.bind(this);
    this.toggleClaiming = this.toggleClaiming.bind(this);
    this.hasUnsavedChanges = this.hasUnsavedChanges.bind(this);
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
    const attributesToCheck = ['maxDeposit', 'minProfitability', 'minBalance', 'maxGasSubsidy'];
    const { economicStrategy, _web3Service } = this.props.timeNodeStore;

    attributesToCheck.forEach(attr => {
      let value =
        attr === 'maxGasSubsidy'
          ? this.state[attr]
          : _web3Service.web3.toWei(this.state[attr], 'ether');

      if (value === '') value = Config.DEFAULT_ECONOMIC_STRATEGY[attr].toString();

      if (value != economicStrategy[attr]) unsavedChanges = true;
    });

    if (this.state.claiming !== this.props.timeNodeStore.claiming) unsavedChanges = true;

    return unsavedChanges;
  }

  render() {
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
                  <div className="form-group form-group-default">
                    <label>Require a deposit lower than</label>
                    <input
                      id="maxDeposit"
                      className="form-control"
                      type="number"
                      placeholder={`Default: ${this.state.defaultMaxDeposit} ETH`}
                      value={this.state.maxDeposit}
                      onChange={this.handleChange}
                    />
                  </div>
                </div>

                <div className="col-md-4">
                  <div className="form-group form-group-default">
                    <label>Bring a profit higher than</label>
                    <input
                      id="minProfitability"
                      className="form-control"
                      type="number"
                      placeholder={`Default: ${this.state.defaultMinProfitability} ETH`}
                      value={this.state.minProfitability}
                      onChange={this.handleChange}
                    />
                  </div>
                </div>

                <div className="col-md-4">
                  <div className="form-group form-group-default">
                    <label>My balance is higher than</label>
                    <input
                      id="minBalance"
                      className="form-control"
                      type="number"
                      placeholder={`Default: ${this.state.defaultMinBalance} ETH`}
                      value={this.state.minBalance}
                      onChange={this.handleChange}
                    />
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
                <div className="form-group form-group-default">
                  <label>Maximum Gas Subsidy</label>
                  <input
                    id="maxGasSubsidy"
                    className="form-control"
                    type="number"
                    placeholder={`Default: ${this.state.defaultMaxGasSubsidy}%`}
                    value={this.state.maxGasSubsidy}
                    onChange={this.handleChange}
                  />
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

        <TimeNodeDetachModal updateWalletUnlocked={this.props.updateWalletUnlocked} />
        <TimeNodeResetStatsModal />
        <ConfirmEconomicStrategyModal
          updateWalletUnlocked={this.props.updateWalletUnlocked}
          claiming={this.state.claiming}
          maxDeposit={this.state.maxDeposit}
          minProfitability={this.state.minProfitability}
          minBalance={this.state.minBalance}
          maxGasSubsidy={this.state.maxGasSubsidy}
        />
      </div>
    );
  }
}

TimeNodeSettings.propTypes = {
  timeNodeStore: PropTypes.any,
  updateWalletUnlocked: PropTypes.any
};

export default TimeNodeSettings;
