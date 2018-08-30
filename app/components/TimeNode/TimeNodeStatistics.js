import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import PropTypes from 'prop-types';
import Alert from '../Common/Alert';
import { TIMENODE_STATUS } from '../../stores/TimeNodeStore';
import ExecutedGraph from './ExecutedGraph';
import { BeatLoader } from 'react-spinners';

@inject('timeNodeStore')
@inject('keenStore')
@inject('transactionStore')
@observer
class TimeNodeStatistics extends Component {
  constructor(props) {
    super(props);

    this.startTimeNode = this.startTimeNode.bind(this);
    this.stopTimeNode = this.stopTimeNode.bind(this);
    this.refreshStats = this.refreshStats.bind(this);
    this.shouldShowClaimedWarning = this.shouldShowClaimedWarning.bind(this);
  }

  componentDidMount() {
    if (!window.indexedDB) {
      throw Error(
        `Your browser doesn't support a stable version of IndexedDB. Statistics will not be available.`
      );
    }

    // Restarts the timenode in case the user refreshed the page with the timenode running
    if (localStorage.getItem('isTimenodeScanning') && !this.props.timeNodeStore.scanningStarted) {
      this.startTimeNode();
    }

    this.refreshStats();
  }

  getStopButton(disabled) {
    return (
      <button
        className="btn btn-danger px-4"
        onClick={this.shouldShowClaimedWarning}
        disabled={disabled}
      >
        Stop
      </button>
    );
  }

  getStartButton(disabled) {
    return (
      <button className="btn btn-primary px-4" onClick={this.startTimeNode} disabled={disabled}>
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

  getClaimingNotification() {
    return this.props.timeNodeStore.claiming ? null : (
      <Alert
        type="warning"
        close={false}
        msg={`You are not using the Claiming Mode. This might make your TimeNode unprofitable. Please enable Claiming Mode in TimeNode Settings.\nFor more info on claiming, see: https://blog.chronologic.network/how-to-mitigate-timenode-risks-b8551bb28f9d`}
      />
    );
  }

  getDAYBalanceNotification(disabled) {
    return !disabled ? null : (
      <Alert
        type="danger"
        close={false}
        msg={`Your DAY token balance is insufficient to start a TimeNode. Make sure you have at least ${
          TIMENODE_STATUS.TIMENODE.minBalance
        } DAY.`}
      />
    );
  }

  async shouldShowClaimedWarning() {
    const claimed = await this.props.timeNodeStore.getClaimedNotExecutedTransactions();
    if (claimed > 0) {
      const { jQuery } = window;

      if (jQuery) {
        jQuery('#claimedTxWarningModal').modal('show');
      }
    } else {
      this.stopTimeNode();
    }
  }

  render() {
    const {
      bounties,
      costs,
      profit,
      scanningStarted,
      balanceETH,
      balanceDAY,
      executedTransactions,
      nodeStatus
    } = this.props.timeNodeStore;

    const { DISABLED, LOADING } = TIMENODE_STATUS;
    const timeNodeDisabled = nodeStatus === DISABLED || nodeStatus === LOADING;
    const scanningStatus = scanningStarted ? 'running' : 'stopped';

    const profitStatus = profit !== null ? profit + ' ETH' : <BeatLoader />;
    const bountiesStatus =
      bounties !== null && costs !== null ? `${bounties} (bounties) - ${costs} (costs)` : '';

    return (
      <div id="timeNodeStatistics">
        {nodeStatus !== LOADING && this.getDAYBalanceNotification(timeNodeDisabled)}
        {balanceETH !== null && this.getBalanceNotification()}
        {this.getClaimingNotification()}

        <h2 className="py-4">
          Your TimeNode is {timeNodeDisabled ? DISABLED.toLowerCase() : scanningStatus}.
          <span className="ml-2">
            {scanningStarted
              ? this.getStopButton(timeNodeDisabled)
              : this.getStartButton(timeNodeDisabled)}
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

        <div
          className="modal fade stick-up"
          id="claimedTxWarningModal"
          tabIndex="-1"
          role="dialog"
          aria-labelledby="claimedTxWarningModalLabel"
          aria-hidden="true"
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header clearfix text-left separator">
                <button type="button" className="close" data-dismiss="modal" aria-hidden="true">
                  <i className="pg-close fs-14" />
                </button>
                <h3 className="timenode-modal-title m-0">
                  You have <span className="semi-bold">claimed transactions</span>!
                </h3>
              </div>
              <div className="modal-body">
                <hr />
                <span className="semi-bold">
                  If the claimed transactions are not executed you will lose your deposit.
                </span>
                <p>Are you sure you want to stop the TimeNode?</p>
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
                      onClick={this.stopTimeNode}
                    >
                      <strong>Stop</strong>
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

TimeNodeStatistics.propTypes = {
  timeNodeStore: PropTypes.any,
  keenStore: PropTypes.any
};

export default TimeNodeStatistics;
