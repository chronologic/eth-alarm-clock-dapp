import React, { Component } from 'react';
import { observer } from 'mobx-react';
import PropTypes from 'prop-types';
import { Chart } from 'chart.js';

@observer
class TimeBountiesGraph extends Component {
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
    this.interval = setInterval(this.refreshChart, this.props.refreshInterval);
  }

  componentWillUnmount() {
    this.props.onRef(undefined);
    clearInterval(this.interval);
  }

  async refreshChart() {
    const data = {
      labels: ['label1', 'label2', 'label3'],
      values: [1, 2, 3]
    };

    if (this.state.chart !== null) {
      this.updateChart(data);
    } else {
      this.setChart(this.timeBountiesGraph.getContext('2d'), data);
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
              label: 'TimeBounty',
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
                  beginAtZero: true,
                  callback: value => {
                    if (Math.floor(value) === value) {
                      return value;
                    }
                  }
                }
              }
            ]
          }
        }
      })
    });
  }

  updateChart(data) {
    const { chart } = this.state;
    chart.data.labels.pop();
    chart.data.datasets.forEach(dataset => {
      dataset.data.pop();
    });

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
    return <canvas id="timeBountiesGraph" ref={el => (this.timeBountiesGraph = el)} />;
  }
}

TimeBountiesGraph.propTypes = {
  onRef: PropTypes.any,
  refreshInterval: PropTypes.number
};

export { TimeBountiesGraph };
