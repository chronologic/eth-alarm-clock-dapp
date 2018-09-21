import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import PropTypes from 'prop-types';
import { Chart } from 'chart.js';

@inject('keenStore')
@observer
class ActiveTimeNodesGraph extends Component {
  constructor(props) {
    super(props);
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

  refreshChart() {
    const { historyActiveTimeNodes } = this.props.keenStore;

    const lastValidTime = Math.floor(Date.now() / 1000) - 24 * 60 * 60;

    let timeIntervals = [];

    for (let activeTns of historyActiveTimeNodes) {
      // If in the last 24h
      if (activeTns.timestamp > lastValidTime) {
        const activeTnsDate = new Date(activeTns.timestamp);
        activeTnsDate.setHours(activeTnsDate.getHours(), 0, 0, 0);

        let timeIntervalExists = false;

        // Check if that time interval already exists in the array
        for (let i = 0; i < timeIntervals.length; i++) {
          // If so, add to that array
          if (timeIntervals[i].datetime.getTime() === activeTnsDate.getTime()) {
            timeIntervals[i].amounts.push(activeTns.amount);
            timeIntervalExists = true;
          }
        }

        // If the time interval doesn't exist already
        if (!timeIntervalExists) {
          // Create the time interval and bump the executed flag
          timeIntervals.push({ datetime: activeTnsDate, amounts: [activeTns.amount] });
        }
      }
    }

    // Sort the time intervals by hour
    timeIntervals.sort(this.compareDates);

    const ctx = this.activeTnsGraph.getContext('2d');

    const average = arr => arr.reduce((p, c) => p + c, 0) / arr.length;

    const dataLabels = timeIntervals.map(interval => interval.datetime.getHours() + ':00');
    const dataActiveTns = timeIntervals.map(interval => Math.floor(average(interval.amounts)));

    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: dataLabels,
        datasets: [
          {
            label: '# of Active TimeNodes',
            data: dataActiveTns,
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
    });
  }

  compareDates(a, b) {
    if (a.datetime < b.datetime) return -1;
    if (a.datetime > b.datetime) return 1;
    return 0;
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
