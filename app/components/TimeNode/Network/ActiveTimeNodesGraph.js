import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import PropTypes from 'prop-types';
import { Chart } from 'chart.js';
import moment from 'moment';

@inject('keenStore')
@observer
class ActiveTimeNodesGraph extends Component {
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

  componentDidUpdate(prevProps) {
    if (prevProps.data !== this.props.data) {
      this.refreshChart();
    }
  }

  refreshChart() {
    if (this.props.data.length >= 24) {
      const labels = [];
      for (let i = 24; i > 0; i--) {
        labels.push(
          moment()
            .subtract(i, 'hours')
            .hour() + ':00'
        );
      }

      const data = {
        labels,
        values: JSON.parse(JSON.stringify(this.props.data)) // deep copy the array
      };

      if (this.state.chart !== null) {
        this.updateChart(data);
      } else {
        this.setChart(this.activeTnsGraph.getContext('2d'), data);
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
              label: '# of Active TimeNodes',
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
    return <canvas id="activeTnsGraph" ref={el => (this.activeTnsGraph = el)} />;
  }
}

ActiveTimeNodesGraph.propTypes = {
  onRef: PropTypes.any,
  data: PropTypes.any,
  keenStore: PropTypes.any,
  refreshInterval: PropTypes.number
};

export { ActiveTimeNodesGraph };
