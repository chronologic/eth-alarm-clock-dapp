import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { inject } from 'mobx-react';
import TimeNodeDetachModal from './Modals/TimeNodeDetachModal';
import ConfirmEconomicStrategyModal from './Modals/ConfirmEconomicStrategyModal';

@inject('timeNodeStore')
class TimeNodeSettings extends Component {
  constructor(props) {
    super(props);

    const { maxDeposit, minProfitability, minBalance } = props.timeNodeStore.economicStrategy;
    this.state = {
      maxDeposit: maxDeposit ? maxDeposit : '',
      minProfitability: minProfitability ? minProfitability : '',
      minBalance: minBalance ? minBalance : ''
    };
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(event) {
    this.setState({
      [event.target.id]: event.target.value
    });
  }

  render() {
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
                    id="maxDeposit"
                    className="form-control"
                    type="number"
                    placeholder="Max Deposit in ETH"
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
                    placeholder="Profit in ETH"
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
                    placeholder="Balance in ETH"
                    value={this.state.minBalance}
                    onChange={this.handleChange}
                  />
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-md-3 offset-md-9 col-lg-2 offset-lg-10">
                <button
                  className="btn btn-primary btn-block mt-3"
                  data-toggle="modal"
                  data-target="#confirmEconomicStrategyModal"
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

        <TimeNodeDetachModal updateWalletUnlocked={this.props.updateWalletUnlocked} />
        <ConfirmEconomicStrategyModal
          updateWalletUnlocked={this.props.updateWalletUnlocked}
          maxDeposit={this.state.maxDeposit}
          minProfitability={this.state.minProfitability}
          minBalance={this.state.minBalance}
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
