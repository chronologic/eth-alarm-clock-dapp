import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import PropTypes from 'prop-types';
import { Chart } from 'chart.js';

import Alert from '../Common/Alert';
import { TIMENODE_STATUS } from '../../stores/TimeNodeStore';

@inject('timeNodeStore')
@observer
class TimeNodeStatistics extends Component {
  constructor(props) {
    super(props);
    this.state = {
      timeNodeDisabled: TIMENODE_STATUS.DISABLED
    };

    this.startTimeNode = this.startTimeNode.bind(this);
    this.stopTimeNode = this.stopTimeNode.bind(this);
  }

  async componentWillMount() {
    await this.refreshBalances();
    this.setState({
      timeNodeDisabled: this.props.timeNodeStore.nodeStatus === TIMENODE_STATUS.DISABLED
    });

    this.refreshChart();
  }

  getStopButton() {
    return <button className="btn btn-danger" onClick={this.stopTimeNode} disabled={this.state.timeNodeDisabled}>Stop</button>;
  }

  getStartButton() {
    return <button className="btn btn-primary" onClick={this.startTimeNode} disabled={this.state.timeNodeDisabled}>Start</button>;
  }

  startTimeNode() {
    this.props.timeNodeStore.startScanning();
  }

  stopTimeNode() {
    this.props.timeNodeStore.stopScanning();
  }

  async refreshBalances() {
    await this.props.timeNodeStore.getBalance();
    await this.props.timeNodeStore.getDAYBalance();
  }

  refreshStats() {
    this.props.timeNodeStore.updateStats();
    this.refreshChart();
  }

  refreshChart() {
    const data = this.props.timeNodeStore.executedCounters.slice(-5);
    const ctx = this.chartRef.getContext('2d');

    if (data.length > 0) {
      const labels = Array(data.length).fill('');
      new Chart(ctx, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [{
            data: data,
            backgroundColor:'rgba(33, 255, 255, 0.2)',
            borderColor: 'rgba(33, 255, 255, 1)',
            borderWidth: 2,
            datalabels: {
              align: 'start',
              anchor: 'start'
            }
          }]
        },
        options: {
          animation: {
            duration: 1,
            onComplete: function () {
              const chartInstance = this.chart;
              const ctx = this.chart.ctx;
              ctx.fillStyle = 'black';
              ctx.textAlign = 'left';
              ctx.textBaseline = 'bottom';

              this.data.datasets.forEach(function (dataset, i) {
                  const meta = chartInstance.controller.getDatasetMeta(i);
                  meta.data.forEach(function (bar, index) {
                      var data = dataset.data[index];
                      ctx.fillText(data, bar._model.x, bar._model.y - 5);
                  });
              });
            }
          },
          elements: {
            line: {
              tension: 0
            }
          },
          legend: {
            display: false
          },
          scales: {
            yAxes: [{
              display: false
            }],
            xAxes: [{
              display: false
            }],
          }
        }
      });
    } else {
      ctx.font = '20px Helvetica';
      ctx.textAlign='center';
      ctx.fillText('No data yet.',150,65);
    }
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

          <div className="col-md-3">
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

          <div className="col-md-3">
            <div data-pages="card" className="card card-default">
              <div className="card-header">
                <div className="card-title">Executed: {this.props.timeNodeStore.totalExecuted}</div>
                <div className="card-controls">
                  <ul>
                    <li>
                      <a data-toggle="refresh" className="card-refresh" onClick={() => this.refreshChart()}><i className="card-icon card-icon-refresh"></i></a>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="card-body no-padding">
                <canvas id="myChart" ref={(el) => this.chartRef = el}></canvas>
              </div>
            </div>
          </div>

          <div className="col-md-3">
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
              <div className="card-body">
                <div className="row">
                  <div className="col-md-6">ETH</div>
                  <div className="col-md-6">{this.props.timeNodeStore.balanceETH}</div>
                </div>
                <hr className="mt-2 mb-2"/>
                <div className="row">
                  <div className="col-md-6">DAY</div>
                  <div className="col-md-6">{this.props.timeNodeStore.balanceDAY}</div>
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
  timeNodeStore: PropTypes.any
};

export default TimeNodeStatistics;
