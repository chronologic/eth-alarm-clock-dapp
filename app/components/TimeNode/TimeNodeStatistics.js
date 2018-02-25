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

    this.refreshChart = this.refreshChart.bind(this);
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

  componentDidMount() {
    // Refreshes the graph every 5 seconds
    this.interval = setInterval(this.refreshChart, 5000);
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  getStopButton() {
    return <button className="btn btn-danger px-4" onClick={this.stopTimeNode} disabled={this.state.timeNodeDisabled}>Stop</button>;
  }

  getStartButton() {
    return <button className="btn btn-primary px-4" onClick={this.startTimeNode} disabled={this.state.timeNodeDisabled}>Start</button>;
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
    const data = this.props.timeNodeStore.executedTransactions;

    let timeIntervals = [];

    // This section sorts the executed transactions by hour into an array
    for (let transaction of data) {
      const transactionDate = new Date(transaction.timestamp);
      transactionDate.setHours(transactionDate.getUTCHours(),0,0,0);

      let timeIntervalExists = false;

      // Check if that time interval already exists in the array
      for (let i = 0; i < timeIntervals.length; i++) {
        // If so, add the transaction to that array
        if (timeIntervals[i].datetime.getTime() === transactionDate.getTime()) {
          timeIntervals[i].executed += 1;
          timeIntervalExists = true;
        }
      }

      // If the time interval doesn't exist already
      if (!timeIntervalExists) {
        // Create the time interval and bump the executed flag
        timeIntervals.push({ 'datetime': transactionDate, 'executed': 1 });
      }
    }

    const ctx = this.chartRef.getContext('2d');
    timeIntervals.sort(this.compareDates);

    if (timeIntervals.length > 0) {
      const dataLabels = timeIntervals.map(interval => interval.datetime.getHours() + ':00');
      const dataExecuted = timeIntervals.map(interval => interval.executed);

      new Chart(ctx, {
        type: 'line',
        data: {
          labels: dataLabels,
          datasets: [{
            data: dataExecuted,
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
              display: false,
              gridLines: {
                tickMarkLength: 0
              }
            }],
            xAxes: [{
              display: true
            }],
          },
          layout: {
            padding: {
              top: 20
            }
          }
        }
      });
    } else {
      ctx.font = '20px Helvetica';
      ctx.textAlign='center';
      ctx.fillText('No data yet.',150,65);
    }
  }

  compareDates(a, b) {
    if (a.datetime.getTime() < b.datetime.getTime()) return -1;
    if (a.datetime.getTime() > b.datetime.getTime()) return 1;
    return 0;
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
  timeNodeStore: PropTypes.any
};

export default TimeNodeStatistics;
