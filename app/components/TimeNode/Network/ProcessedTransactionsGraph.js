import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import PropTypes from 'prop-types';
import { Chart } from 'chart.js';

@inject('timeNodeStore')
@observer
class ProcessedTransactionsGraph extends Component {
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
    this.refreshChart();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.data !== this.props.data) {
      this.refreshChart();
    }
  }

  refreshChart() {
    if (this.props.data) {
      let { labels, values } = this.props.data;

      const data = {
        labels,
        values
      };

      if (this.state.chart !== null) {
        this.updateChart(data);
      } else {
        this.setChart(this.processedTransactionsGraph.getContext('2d'), data);
      }
    }
  }

  setChart(ctx, data) {
    this.setState({
      chart: new Chart(ctx, {
        type: 'bar',
        data: {
          labels: data.labels,
          datasets: [
            {
              label: 'Processed Transactions',
              data: data.values,
              backgroundColor: 'rgba(33, 255, 255, 0.2)',
              borderColor: 'rgba(33, 255, 255, 1)',
              borderWidth: 1
            }
          ]
        },
        options: {
          scales: {
            yAxes: [
              {
                ticks: {
                  min: 0,
                  beginAtZero: true
                }
              }
            ]
          },
          legend: {
            display: false
          }
        }
      })
    });
  }

  updateChart(data) {
    const { chart } = this.state;
    chart.data.labels = [];
    chart.data.datasets.forEach(dataset => {
      dataset.data = [];
    });

    chart.data.labels = data.labels;
    chart.data.datasets[0].data = data.values;

    chart.update();
  }

  render() {
    return (
      <canvas id="processedTransactionsGraph" ref={el => (this.processedTransactionsGraph = el)} />
    );
  }
}

ProcessedTransactionsGraph.propTypes = {
  data: PropTypes.any
};

export { ProcessedTransactionsGraph };
