import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import PropTypes from 'prop-types';
import Alert from '../Common/Alert';
import { TIMENODE_STATUS } from '../../stores/TimeNodeStore';
import ExecutedGraph from './ExecutedGraph';
import Cookies from 'js-cookie';

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
  }

  async componentWillMount() {
    await this.refreshBalances();
    this.setState({
      timeNodeDisabled: this.props.timeNodeStore.nodeStatus === TIMENODE_STATUS.DISABLED
    });
  }

  componentDidMount() {
    // Restarts the timenode in case the user refreshed the page with the timenode running
    if (Cookies.get('isTimenodeScanning') && !this.props.timeNodeStore.scanningStarted) {
      setTimeout(this.startTimeNode, 2000);
    }
  }

  getStopButton() {
    return <button className="btn btn-danger px-4" onClick={this.stopTimeNode} disabled={this.state.timeNodeDisabled}>Stop</button>;
  }

  getStartButton() {
    return <button className="btn btn-primary px-4" onClick={this.startTimeNode} disabled={this.state.timeNodeDisabled}>Start</button>;
  }

  startTimeNode() {
    this.props.timeNodeStore.startScanning();
    this.props.keenStore.activeTimeNodes += 1;
  }

  stopTimeNode() {
    this.props.timeNodeStore.stopScanning();
    this.props.keenStore.activeTimeNodes -= 1;
  }

  async refreshBalances() {
    await this.props.timeNodeStore.getBalance();
    await this.props.timeNodeStore.getDAYBalance();
  }

  refreshStats() {
    this.props.timeNodeStore.updateStats();
  }

  render() {
    let timeNodeStatus = null;
    if (this.state.timeNodeDisabled) {
      timeNodeStatus = TIMENODE_STATUS.DISABLED;
    } else {
      timeNodeStatus = this.props.timeNodeStore.scanningStarted ? 'running' : 'stopped';
    }

    const claimedEth = this.props.timeNodeStore.claimedEth;
    const claimedEthStatus = claimedEth !== null ? claimedEth + ' ETH' : 'Loading...';

    const dayTokenError = <Alert msg="Your DAY token balance is too low. Please make sure you have at least 333 DAY tokens."/>;

    return (
      <div id="timeNodeStatistics">
        {this.state.timeNodeDisabled ? dayTokenError : null}

        <h2 className="py-4">
          Your TimeNode is currently {timeNodeStatus}.
          <span className="ml-2">{this.props.timeNodeStore.scanningStarted ? this.getStopButton() : this.getStartButton()}</span>
        </h2>

        <div className="row">

          <div className="col-md-4">
            <div data-pages="card" className="card card-default">
              <div className="card-header">
                <div className="card-title">Claimed</div>
                <div className="card-controls">
                  <ul>
                    <li>
                      <a data-toggle="refresh" className="card-refresh" onClick={() => this.refreshStats()}><i className="card-icon card-icon-refresh"></i></a>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="card-body">
                <h1>{claimedEthStatus}</h1>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div data-pages="card" className="card card-default">
              <div className="card-header">
                <div className="card-title">Executed: {this.props.timeNodeStore.totalExecuted}</div>
                <div className="card-controls">
                  <ul>
                    <li>
                      <a data-toggle="refresh" className="card-refresh" onClick={() => this.refreshStats()}><i className="card-icon card-icon-refresh"></i></a>
                    </li>
                  </ul>
                </div>
              </div>
              <div ref={(el) => this.chartContainer = el} className="card-body no-padding">
                {this.props.timeNodeStore.executedTransactions.length > 0 ? <ExecutedGraph /> : <p className="my-5 text-center">No data yet.</p>}
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
                      <a data-toggle="refresh" className="card-refresh" onClick={() => this.refreshBalances()}><i className="card-icon card-icon-refresh"></i></a>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="card-body p-0 m-t-10">
                <div className="row px-4">
                  <div className="col-6 col-md-6">ETH</div>
                  <div className="col-6 col-md-6">{this.props.timeNodeStore.balanceETH}</div>
                </div>
                <hr className="mt-2 mb-2"/>
                <div className="row px-4 pb-2">
                  <div className="col-6 col-md-6">DAY</div>
                  <div className="col-6 col-md-6">{this.props.timeNodeStore.balanceDAY}</div>
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
