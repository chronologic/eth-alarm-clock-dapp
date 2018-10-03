import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import PropTypes from 'prop-types';
import { Chart } from 'chart.js';
import { BeatLoader } from 'react-spinners';

const INITIAL_CURRENCY_DENOMINATION = 'ETH';

@inject('timeNodeStore')
@inject('web3Service')
@observer
class TimeBountiesGraph extends Component {
  constructor(props) {
    super(props);
    this.state = {
      chart: null,
      loadingBounties: false,
      currencyDenomination: INITIAL_CURRENCY_DENOMINATION
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

  async refreshChart() {
    if (!this.state.loadingBounties) {
      this.setState({ loadingBounties: true });
    }

    if (this.props.data) {
      const { web3Service } = this.props;
      const { labels, values } = this.props.data;

      // Chart.js has issues if all numbers are lower than 0.00001
      // If that is the case, convert the number representation to GWei
      if (values.every(value => value < 1e-5)) {
        values.forEach((o, i, arr) => {
          const wei = web3Service.web3.toWei(arr[i], 'ether');
          arr[i] = web3Service.web3.fromWei(wei, 'gwei');
        });
        this.setState({ currencyDenomination: 'Gwei' });
      } else if (this.state.currencyDenomination !== INITIAL_CURRENCY_DENOMINATION) {
        this.setState({ currencyDenomination: INITIAL_CURRENCY_DENOMINATION });
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
    }

    this.setState({ loadingBounties: false });
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
                },
                scaleLabel: {
                  display: true,
                  labelString: this.state.currencyDenomination
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
        {(this.state.loadingBounties || !this.props.data) && <BeatLoader />}
        <canvas id="timeBountiesGraph" ref={el => (this.timeBountiesGraph = el)} />
      </div>
    );
  }
}

TimeBountiesGraph.propTypes = {
  onRef: PropTypes.any,
  data: PropTypes.any,
  web3Service: PropTypes.any,
  refreshInterval: PropTypes.number
};

export { TimeBountiesGraph };
