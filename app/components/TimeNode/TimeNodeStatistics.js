import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import PropTypes from 'prop-types';
import Alert from '../Common/Alert';
import { TIMENODE_STATUS } from '../../stores/TimeNodeStore';
import ExecutedGraph from './ExecutedGraph';
import { BeatLoader } from 'react-spinners';

@inject('timeNodeStore')
@inject('keenStore')
@observer
class TimeNodeStatistics extends Component {
  constructor(props) {
    super(props);
    this.state = {
      timeNodeDisabled: null
    };
    this.startTimeNode = this.startTimeNode.bind(this);
    this.stopTimeNode = this.stopTimeNode.bind(this);
    this.refreshStats = this.refreshStats.bind(this);
  }

  async UNSAFE_componentWillMount() {
    this.setState({
      timeNodeDisabled: this.props.timeNodeStore.nodeStatus === TIMENODE_STATUS.DISABLED
    });
  }

  componentDidMount() {
    // Restarts the timenode in case the user refreshed the page with the timenode running
    if (localStorage.getItem('isTimenodeScanning') && !this.props.timeNodeStore.scanningStarted) {
      this.startTimeNode();
    }

    this.refreshStats();
    // Refreshes the stats every 5 seconds
    this.interval = setInterval(this.refreshStats, 5000);
  }

  getStopButton() {
    return (
      <button
        className="btn btn-danger px-4"
        onClick={this.stopTimeNode}
        disabled={this.state.timeNodeDisabled}
      >
        Stop
      </button>
    );
  }

  getStartButton() {
    return (
      <button
        className="btn btn-primary px-4"
        onClick={this.startTimeNode}
        disabled={this.state.timeNodeDisabled}
      >
        Start
      </button>
    );
  }

  startTimeNode() {
    this.props.timeNodeStore.startScanning();
    this.props.keenStore.activeTimeNodes += 1;
  }

  stopTimeNode() {
    this.props.timeNodeStore.stopScanning();
    this.props.keenStore.activeTimeNodes =
      this.props.keenStore.activeTimeNodes > 0 ? this.props.keenStore.activeTimeNodes - 1 : 0;
  }

  async refreshStats() {
    this.props.timeNodeStore.updateStats();
  }

  getBalanceNotification() {
    return Number(this.props.timeNodeStore.balanceETH) > 0 ? null : (
      <Alert
        type="warning"
        close={false}
        msg="Your ETH balance is 0. You will be unable to claim or execute transactions."
      />
    );
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  render() {
    let timeNodeStatus = null;
    const {
      bounties,
      costs,
      profit,
      scanningStarted,
      balanceETH,
      balanceDAY,
      executedTransactions
    } = this.props.timeNodeStore;

    if (this.state.timeNodeDisabled) {
      timeNodeStatus = TIMENODE_STATUS.DISABLED;
    } else {
      timeNodeStatus = scanningStarted ? 'running' : 'stopped';
    }

    const profitStatus = profit !== null ? profit + ' ETH' : <BeatLoader />;
    const bountiesStatus =
      bounties !== null && costs !== null ? `${bounties} (bounties) - ${costs} (costs)` : '';

    const dayTokenError = (
      <Alert msg="Your DAY token balance is too low. Please make sure you have at least 333 DAY tokens." />
    );

    return (
      <div id="timeNodeStatistics">
        {this.state.timeNodeDisabled ? dayTokenError : null}
        {this.getBalanceNotification()}

        <h2 className="py-4">
          Your TimeNode is currently {timeNodeStatus}.
          <span className="ml-2">
            {this.props.timeNodeStore.scanningStarted
              ? this.getStopButton()
              : this.getStartButton()}
          </span>
        </h2>

        <div className="row">
          <div className="col-md-4">
            <div data-pages="card" className="card card-default">
              <div className="card-header">
                <div className="card-title">Claimed</div>
                <div className="card-controls">
                  <ul>
                    <li>
                      <a
                        data-toggle="refresh"
                        className="card-refresh"
                        onClick={() => this.refreshStats()}
                      >
                        <i className="card-icon card-icon-refresh" />
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="card-body">
                <h2>{profitStatus}</h2>
                <small>{bountiesStatus}</small>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div data-pages="card" className="card card-default">
              <div className="card-header">
                <div className="card-title">Executed: {executedTransactions.length}</div>
                <div className="card-controls">
                  <ul>
                    <li>
                      <a
                        data-toggle="refresh"
                        className="card-refresh"
                        onClick={() => this.refreshStats()}
                      >
                        <i className="card-icon card-icon-refresh" />
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
              <div ref={el => (this.chartContainer = el)} className="card-body no-padding">
                {executedTransactions.length > 0 ? (
                  <ExecutedGraph />
                ) : (
                  <p className="my-5 text-center">No data yet.</p>
                )}
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div data-pages="card" className="card card-default">
              <div className="card-header">
                <div className="card-title">Balance</div>
                <div className="card-controls">
                  <ul>
                    <li>
                      <a
                        data-toggle="refresh"
                        className="card-refresh"
                        onClick={() => this.refreshStats()}
                      >
                        <i className="card-icon card-icon-refresh" />
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="card-body p-0 m-t-10">
                <div className="row px-4">
                  <div className="col-6 col-md-6">ETH</div>
                  <div className="col-6 col-md-6">
                    {balanceETH !== null ? balanceETH : <BeatLoader size={6} />}
                  </div>
                </div>
                <hr className="mt-2 mb-2" />
                <div className="row px-4 pb-2">
                  <div className="col-6 col-md-6">DAY</div>
                  <div className="col-6 col-md-6">
                    {balanceDAY !== null ? balanceDAY : <BeatLoader size={6} />}
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

TimeNodeStatistics.propTypes = {
  timeNodeStore: PropTypes.any,
  keenStore: PropTypes.any
};

export default TimeNodeStatistics;
