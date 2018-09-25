import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import PropTypes from 'prop-types';
import { Chart } from 'chart.js';
import moment from 'moment';
import { BeatLoader } from 'react-spinners';

@inject('transactionStore')
@observer
class TimeBountiesGraph extends Component {
  constructor(props) {
    super(props);
    this.state = {
      chart: null,
      loadingBounties: false
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
    if (!this.state.loadingBounties) {
      this.setState({ loadingBounties: true });

      const { transactionStore } = this.props;
      const labels = [];
      const values = [];

      const currentTime = moment().unix();

      const average = arr =>
        arr.reduce((accumulator, currentValue) => accumulator + currentValue) / arr.length;

      for (let i = 24; i > 0; i--) {
        const bucket = currentTime - 3600 * i;

        let bounties = await transactionStore.getBountiesForBucket(bucket, true);
        bounties = bounties.map(bn => bn.toNumber());
        const averageBounty = bounties.length > 0 ? average(bounties) : 0.0;

        labels.push(`${moment.unix(bucket).hour()}:00`);
        values.push(averageBounty);
      }

      const data = {
        labels,
        values
      };

      if (this.state.chart !== null) {
        this.updateChart(data);
      } else {
        this.setChart(this.timeBountiesGraph.getContext('2d'), data);
      }

      this.setState({ loadingBounties: false });
    }
  }

  setChart(ctx, data) {
    this.setState({
      chart: new Chart(ctx, {
        type: 'line',
        data: {
          labels: data.labels,
          datasets: [
            {
              label: 'Average TimeBounty',
              data: data.values,
              borderColor: 'rgba(33, 255, 255, 1)',
              borderWidth: 3,
              fill: false,
              steppedLine: true
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
    return (
      <div id="timeBountiesGraphWrapper" className="horizontal-center">
        {this.state.loadingBounties && <BeatLoader />}
        <canvas id="timeBountiesGraph" ref={el => (this.timeBountiesGraph = el)} />
      </div>
    );
  }
}

TimeBountiesGraph.propTypes = {
  onRef: PropTypes.any,
  transactionStore: PropTypes.any,
  refreshInterval: PropTypes.number
};

export { TimeBountiesGraph };
