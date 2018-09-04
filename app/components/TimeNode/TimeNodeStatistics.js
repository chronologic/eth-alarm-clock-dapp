import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import PropTypes from 'prop-types';
import Alert from '../Common/Alert';
import { TIMENODE_STATUS } from '../../stores/TimeNodeStore';
import ExecutedGraph from './ExecutedGraph';
import { BeatLoader } from 'react-spinners';
import moment from 'moment';

@inject('timeNodeStore')
@inject('keenStore')
@inject('transactionStore')
@inject('dateTimeValidatorStore')
@observer
class TimeNodeStatistics extends Component {
  constructor(props) {
    super(props);

    const { scanningStarted } = props.timeNodeStore;

    this.state = {
      scanning: scanningStarted,
      lastStarted: moment()
    };

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
        className="btn btn-danger btn-lg px-5"
        onClick={this.shouldShowClaimedWarning}
        disabled={disabled}
      >
        Stop
      </button>
    );
  }

  getStartButton(disabled) {
    return (
      <button
        className="btn btn-primary btn-lg px-5"
        onClick={this.startTimeNode}
        disabled={disabled}
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

  static getDerivedStateFromProps(props, state) {
    const { scanningStarted } = props.timeNodeStore;

    if (state.scanning !== scanningStarted) {
      state.scanning = scanningStarted;

      if (scanningStarted) {
        state.lastStarted = moment();
      }
    }
    return state;
  }

  showLoaderIfNull(opts) {
    if (opts.value === undefined) {
      throw Error('Value needed.');
    }

    const options = {
      value: opts.value,
      loaderSize: opts.loaderSize || 8,
      alt: opts.alt || opts.value,
      array: opts.array || false
    };

    if (options.value !== null) {
      return options.array ? options.value.length : options.alt;
    }

    return <BeatLoader size={options.loaderSize} />;
  }

  render() {
    let {
      bounties,
      costs,
      profit,
      scanningStarted,
      balanceETH,
      balanceDAY,
      nodeStatus,
      successfulClaims,
      failedClaims,
      successfulExecutions,
      failedExecutions,
      discovered
    } = this.props.timeNodeStore;

    const { scanning, lastStarted } = this.state;

    const { DISABLED, LOADING } = TIMENODE_STATUS;
    const timeNodeDisabled = nodeStatus === DISABLED || nodeStatus === LOADING;
    const scanningStatus = scanningStarted ? 'running' : 'stopped';

    bounties =
      bounties !== null && costs !== null ? `${bounties} (bounties) - ${costs} (costs)` : '';

    const runningTime = scanning ? moment().to(lastStarted, true) : 'stopped';

    const graph =
      successfulExecutions !== null ? (
        successfulExecutions.length > 0 ? (
          <ExecutedGraph />
        ) : (
          <p className="my-5 text-center">No data yet.</p>
        )
      ) : (
        <BeatLoader size={12} />
      );

    const isNotNull = value => value !== null;

    let allActions;
    if (
      isNotNull(successfulClaims) &&
      isNotNull(failedClaims) &&
      isNotNull(successfulExecutions) &&
      isNotNull(failedExecutions)
    ) {
      allActions = successfulClaims.concat(failedClaims, successfulExecutions, failedExecutions);
    } else {
      allActions = null;
    }

    return (
      <div id="timeNodeStatistics">
        {nodeStatus !== LOADING && this.getDAYBalanceNotification(timeNodeDisabled)}
        {balanceETH !== null && this.getBalanceNotification()}
        {this.getClaimingNotification()}

        <div data-pages="card" className="card card-default">
          <div className="card-body">
            <h2>
              Your TimeNode is {timeNodeDisabled ? DISABLED.toLowerCase() : scanningStatus}.
              <span className="ml-2 pull-right">
                {scanningStarted
                  ? this.getStopButton(timeNodeDisabled)
                  : this.getStartButton(timeNodeDisabled)}
              </span>
            </h2>
          </div>
        </div>

        <div className="row">
          <div className="col-md-4">
            <div data-pages="card" className="card card-default">
              <div className="card-header">
                <div className="card-title">Profit</div>
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
                <h2>
                  {this.showLoaderIfNull({
                    value: profit,
                    loaderSize: 10,
                    alt: `${profit} ETH`
                  })}
                </h2>
                <small>{bounties}</small>
              </div>
            </div>

            <div data-pages="card" className="card card-default">
              <div className="card-header">
                <div className="card-title">Summary</div>
                <div className="card-controls">
                  <ul>
                    <li>
                      <a data-toggle="refresh" className="card-refresh text-black" href="#">
                        <i className="card-icon card-icon-refresh" />
                      </a>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="card-body p-0 m-t-10">
                <div className="row px-4">
                  <div className="col-7">Running time</div>
                  <div className="col-5">{runningTime}</div>
                </div>
                <hr className="mt-2 mb-2" />
                <div className="row px-4 pb-2">
                  <div className="col-7">Discovered transactions</div>
                  <div className="col-5">
                    {this.showLoaderIfNull({ value: discovered, loaderSize: 6 })}
                  </div>
                </div>
                <hr className="mt-2 mb-2" />
                <div className="row px-4 pb-2">
                  <div className="col-7">Pending bounties</div>
                  <div className="col-5">1 000 000 ETH</div>
                </div>
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
                  <div className="col-6">ETH</div>
                  <div className="col-6">
                    {this.showLoaderIfNull({ value: balanceETH, loaderSize: 6 })}
                  </div>
                </div>
                <hr className="mt-2 mb-2" />
                <div className="row px-4 pb-2">
                  <div className="col-6">DAY</div>
                  <div className="col-6">
                    {this.showLoaderIfNull({ value: balanceDAY, loaderSize: 6 })}
                  </div>
                </div>
              </div>
            </div>

            <div data-pages="card no-border no-margin" className="card card-default">
              <div className="card-header">
                <div className="card-title">Actions</div>
                <div className="card-controls">
                  <ul>
                    <li>
                      <a data-toggle="refresh" className="card-refresh text-black" href="#">
                        <i className="card-icon card-icon-refresh" />
                      </a>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="auto-overflow">
                <table className="table table-condensed">
                  <thead>
                    <tr>
                      <th />
                      <th className="font-montserrat all-caps text-warning">
                        <i className="fas fa-exclamation-triangle" title="Failed execution." />
                      </th>
                      <th className="font-montserrat all-caps text-success">
                        <i className="fa fa-check" title="Successful execution." />
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    <tr>
                      <td style={{ width: '50%' }} className="all-caps">
                        Executions
                      </td>
                      <td style={{ width: '25%' }} className="b-r b-dashed b-grey hint-text small">
                        {this.showLoaderIfNull({
                          value: failedExecutions,
                          loaderSize: 6,
                          array: true
                        })}
                      </td>
                      <td style={{ width: '25%' }} className="font-montserrat">
                        {this.showLoaderIfNull({
                          value: successfulExecutions,
                          loaderSize: 6,
                          array: true
                        })}
                      </td>
                    </tr>

                    <tr>
                      <td className="all-caps">Claims</td>
                      <td className="b-r b-dashed b-grey hint-text small">
                        {this.showLoaderIfNull({ value: failedClaims, loaderSize: 6, array: true })}
                      </td>
                      <td className="font-montserrat">
                        {this.showLoaderIfNull({
                          value: successfulClaims,
                          loaderSize: 6,
                          array: true
                        })}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div data-pages="card" className="card card-default" style={{ height: '326px' }}>
              <div className="card-header">
                <div className="card-title">
                  Executed:{' '}
                  {this.showLoaderIfNull({
                    value: successfulExecutions,
                    loaderSize: 6,
                    array: true
                  })}
                </div>
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
              <div className="card-body no-padding">{graph}</div>
            </div>
          </div>
        </div>

        <div className="card no-border no-margin widget-loader-bar">
          <div className="card-header">
            <div className="card-title">Details</div>
            <div className="card-controls">
              <ul>
                <li>
                  <a data-toggle="refresh" className="card-refresh text-black" href="#">
                    <i className="card-icon card-icon-refresh" />
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="auto-overflow" style={{ height: '200px' }}>
            <table className="table table-condensed">
              <thead>
                <tr>
                  <th className="font-montserrat">Time</th>
                  <th className="font-montserrat">Action</th>
                  <th className="font-montserrat">Transaction</th>
                  <th className="font-montserrat">Bounty</th>
                  <th className="font-montserrat">Cost</th>
                  <th className="font-montserrat">Outcome</th>
                </tr>
              </thead>
              <tbody>
                {allActions !== null
                  ? allActions.map((action, i) => {
                      switch (action.action) {
                        case 1:
                          action.action = 'Claim';
                          break;
                        case 2:
                          action.action = 'Execute';
                      }

                      switch (action.result) {
                        case 0:
                          action.result = 'Failed';
                          break;
                        case 1:
                          action.result = 'Success';
                      }

                      return (
                        <tr key={i}>
                          <td>{action.timestamp}</td>
                          <td className="font-montserrat all-caps">{action.action}</td>
                          <td className="hint-text small">
                            <a href="#">{action.txAddress}</a>
                          </td>
                          <td className="">{action.bounty} wei</td>
                          <td className="">{action.cost} wei</td>
                          <td className="font-montserrat all-caps b-l b-dashed b-grey">
                            {action.result}
                          </td>
                        </tr>
                      );
                    })
                  : null}
              </tbody>
            </table>
          </div>
          <div className="padding-25">
            <p className="small no-margin">
              <a href="#">
                <i className="fa fs-16 fa-arrow-circle-o-down text-success m-r-10" />
              </a>
              <span className="hint-text ">For more details, see the LOGS tab.</span>
            </p>
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
  keenStore: PropTypes.any,
  dateTimeValidatorStore: PropTypes.any
};

export default TimeNodeStatistics;
