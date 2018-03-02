import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import PropTypes from 'prop-types';
import { Chart } from 'chart.js';

@inject('timeNodeStore')
@observer
class ExecutedGraph extends Component {
  constructor(props) {
    super(props);
    this.refreshChart = this.refreshChart.bind(this);
  }

  componentDidMount() {
    this.refreshChart();
    // Refreshes the graph every 5 seconds
    this.interval = setInterval(this.refreshChart, 5000);
  }

  componentWillUnmount() {
    clearInterval(this.interval);
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

    // Sort the time intervals by hour
    timeIntervals.sort(this.compareDates);

    const ctx = this.chartRef.getContext('2d');

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

  }

  compareDates(a, b) {
    if (a.datetime.getTime() < b.datetime.getTime()) return -1;
    if (a.datetime.getTime() > b.datetime.getTime()) return 1;
    return 0;
  }

  render() {
    return (
      <canvas ref={(el) => this.chartRef = el}/>
    );
  }
}

ExecutedGraph.propTypes = {
  timeNodeStore: PropTypes.any
};

export default ExecutedGraph;
