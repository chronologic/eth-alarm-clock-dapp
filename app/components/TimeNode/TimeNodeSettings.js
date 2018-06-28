import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { inject } from 'mobx-react';

@inject('timeNodeStore')
class TimeNodeSettings extends Component {
  constructor(props) {
    super(props);
    this.resetWallet = this.resetWallet.bind(this);
    this._handleEconomicStrategyChange = this._handleEconomicStrategyChange.bind(this);
  }

  resetWallet() {
    this.props.timeNodeStore.resetWallet();
    this.props.timeNodeStore.clearStats();
    this.props.updateWalletUnlocked(false);
  }

  _handleEconomicStrategyChange() {
    this.props.timeNodeStore.setEconomicStrategy(
      this.maxDeposit.value,
      this.minProfitability.value,
      this.minBalance.value
    );
  }

  render() {
    const { maxDeposit, minProfitability, minBalance } = this.props.timeNodeStore.economicStrategy;

    return (
      <div id="timeNodeSettings">
        <div className="card card-transparent">
          <div className="card-header separator">
            <div className="card-title">Economic Strategy</div>
          </div>
          <div className="card-block p-3">
            <div className="mb-3">
              You can fine tune which transactions you would like to claim and which you would avoid
              claiming.<br />
              <strong>Only claim transactions that</strong>:
            </div>

            <div className="row vertical-align">
              <div className="col-md-4">
                <div className="form-group form-group-default">
                  <label>Require a deposit lower than</label>
                  <input
                    className="form-control"
                    type="number"
                    placeholder="Max Deposit in ETH"
                    defaultValue={maxDeposit ? maxDeposit : ''}
                    ref={el => (this.maxDeposit = el)}
                  />
                </div>
              </div>

              <div className="col-md-4">
                <div className="form-group form-group-default">
                  <label>Bring a profit higher than</label>
                  <input
                    className="form-control"
                    type="number"
                    placeholder="Profit in ETH"
                    defaultValue={minProfitability ? minProfitability : ''}
                    ref={el => (this.minProfitability = el)}
                  />
                </div>
              </div>

              <div className="col-md-4">
                <div className="form-group form-group-default">
                  <label>My balance is higher than</label>
                  <input
                    className="form-control"
                    type="number"
                    placeholder="Balance in ETH"
                    defaultValue={minBalance ? minBalance : ''}
                    ref={el => (this.minBalance = el)}
                  />
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-md-3 offset-md-9 col-lg-2 offset-lg-10">
                <button
                  className="btn btn-primary btn-block mt-3"
                  onClick={this._handleEconomicStrategyChange}
                >
                  Save
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

        <div
          className="modal fade stick-up"
          id="timeNodeDetachModal"
          tabIndex="-1"
          role="dialog"
          aria-labelledby="timeNodeDetachModalLabel"
          aria-hidden="true"
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header clearfix text-left separator">
                <button type="button" className="close" data-dismiss="modal" aria-hidden="true">
                  <i className="pg-close fs-14" />
                </button>
                <h3 className="timenode-modal-title m-0">
                  Detach wallet from <span className="semi-bold">TimeNode</span>
                </h3>
              </div>
              <div className="modal-body">
                <hr />
                <p>Are you sure you want to do this?</p>
                <span className="semi-bold">This will erase your TimeNode statistics.</span>
              </div>
              <div className="modal-footer">
                <div className="row">
                  <div className="col-md-6">
                    <button className="btn btn-light btn-block" type="button" data-dismiss="modal">
                      Cancel
                    </button>
                  </div>
                  <div className="col-md-6">
                    <button
                      className="btn btn-danger btn-block"
                      type="button"
                      data-dismiss="modal"
                      onClick={this.resetWallet}
                    >
                      <strong>Detach</strong>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

TimeNodeSettings.propTypes = {
  timeNodeStore: PropTypes.any,
  updateWalletUnlocked: PropTypes.any
};

export default TimeNodeSettings;
