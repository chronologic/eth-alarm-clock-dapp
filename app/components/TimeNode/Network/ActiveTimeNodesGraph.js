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

  async refreshChart() {
    await this.props.keenStore.refreshActiveTimeNodesCount();

    const { latestActiveTimeNodes, historyActiveTimeNodes } = this.props.keenStore;

    // Deep copy the history of the last 24h
    const timeIntervals = JSON.parse(JSON.stringify(historyActiveTimeNodes));

    const currentHour = this.props.keenStore.hourFromTimestamp(moment().unix());

    // Add all current hour counters to the history
    const average = arr =>
      arr.reduce((accumulator, currentValue) => accumulator + currentValue) / arr.length;
    timeIntervals[currentHour] = Math.floor(
      average(latestActiveTimeNodes.map(counter => counter.amount))
    );

    // Sort the time intervals and values
    const sortedIntervals = {};
    Object.keys(timeIntervals)
      .sort()
      .forEach(key => (sortedIntervals[key] = timeIntervals[key]));
    const sortedValues = Object.values(sortedIntervals);

    // Format the values to be displayed on the graph
    const labels = Object.keys(sortedIntervals).map(
      timestamp =>
        moment(parseInt(timestamp))
          .toDate()
          .getHours() + ':00'
    );

    const data = {
      labels,
      values: sortedValues
    };

    if (this.state.chart !== null) {
      this.updateChart(data);
    } else {
      this.setChart(this.activeTnsGraph.getContext('2d'), data);
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
    chart.data.labels.pop();
    chart.data.datasets.forEach(dataset => {
      dataset.data.pop();
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
  keenStore: PropTypes.any,
  refreshInterval: PropTypes.number
};

export { ActiveTimeNodesGraph };
