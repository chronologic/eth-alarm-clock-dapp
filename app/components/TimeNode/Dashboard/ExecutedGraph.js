import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import PropTypes from 'prop-types';
import { Chart } from 'chart.js';

@inject('timeNodeStore')
@observer
class ExecutedGraph extends Component {
  constructor(props) {
    super(props);
    this.state = {
      chart: null
    };
    this.setChart = this.setChart.bind(this);
    this.updateChart = this.updateChart.bind(this);
    this.refreshChart = this.refreshChart.bind(this);
  }

  componentDidMount() {
    this.props.onRef(this);
    this.refreshChart();
    // Refreshes the graph every 5 seconds
    this.interval = setInterval(this.refreshChart, 5000);
  }

  componentWillUnmount() {
    this.props.onRef(undefined);
    clearInterval(this.interval);
  }

  refreshChart() {
    const successfulExecutions = this.props.timeNodeStore.successfulExecutions;

    // We will not be taking any transactions before this date into consideration
    // Equals: NOW - 24h
    const lastValidTime = new Date().getTime() - 24 * 60 * 60 * 1000;

    let timeIntervals = [];

    // This section sorts the executed transactions by hour into an array.
    // Note: It discards transactions older than 24h.
    for (let transaction of successfulExecutions) {
      // If the transaction was made in the last 24h
      if (transaction.timestamp > lastValidTime) {
        const transactionDate = new Date(transaction.timestamp);
        transactionDate.setHours(transactionDate.getHours(), 0, 0, 0);

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
          timeIntervals.push({ datetime: transactionDate, executed: 1 });
        }
      }
    }

    // Sort the time intervals by hour
    timeIntervals.sort(this.compareDates);

    const data = {
      labels: timeIntervals.map(interval => interval.datetime.getHours() + ':00'),
      values: timeIntervals.map(interval => interval.executed)
    };

    if (this.state.chart !== null) {
      this.updateChart(data);
    } else {
      this.setChart(this.executedGraph.getContext('2d'), data);
    }
  }

  setChart(ctx, data) {
    const chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: data.labels,
        datasets: [
          {
            data: data.values,
            backgroundColor: 'rgba(33, 255, 255, 0.2)',
            borderColor: 'rgba(33, 255, 255, 1)',
            borderWidth: 2,
            datalabels: {
              align: 'start',
              anchor: 'start'
            }
          }
        ]
      },
      options: {
        animation: {
          duration: 1,
          onComplete: function() {
            const chartInstance = this.chart;
            const ctx = this.chart.ctx;
            ctx.fillStyle = 'black';
            ctx.textAlign = 'left';
            ctx.textBaseline = 'bottom';

            this.data.datasets.forEach((dataset, i) => {
              const meta = chartInstance.controller.getDatasetMeta(i);
              meta.data.forEach((bar, index) => {
                const data = dataset.data[index];
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
          yAxes: [
            {
              display: false,
              gridLines: {
                tickMarkLength: 0
              }
            }
          ],
          xAxes: [
            {
              display: true
            }
          ]
        },
        layout: {
          padding: {
            top: 20
          }
        },
        responsive: true,
        maintainAspectRatio: false
      }
    });

    this.setState({ chart });
  }

  updateChart(data) {
    const { chart } = this.state;
    chart.data.labels = data.labels;
    chart.data.datasets[0].data = data.values;
    chart.update();
  }

  compareDates(a, b) {
    if (a.datetime < b.datetime) return -1;
    if (a.datetime > b.datetime) return 1;
    return 0;
  }

  render() {
    return <canvas id="executedGraph" ref={el => (this.executedGraph = el)} />;
  }
}

ExecutedGraph.propTypes = {
  onRef: PropTypes.any,
  timeNodeStore: PropTypes.any
};

export { ExecutedGraph };
