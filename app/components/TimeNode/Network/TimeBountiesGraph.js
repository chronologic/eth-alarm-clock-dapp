import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import PropTypes from 'prop-types';
import { Chart } from 'chart.js';

const INITIAL_CURRENCY_DENOMINATION = 'ETH';

@inject('timeNodeStore')
@inject('web3Service')
@observer
class TimeBountiesGraph extends Component {
  constructor(props) {
    super(props);
    this.state = {
      chart: null,
      currencyDenomination: INITIAL_CURRENCY_DENOMINATION
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
      const { web3Service } = this.props;
      let { labels, values } = this.props.data;

      // Chart.js has issues if all numbers are lower than 0.00001
      // If that is the case, convert the number representation to GWei
      if (values.every(value => value < 1e-5)) {
        const valuesInGwei = [];

        values.forEach(value => {
          const wei = web3Service.web3.toWei(value, 'ether');
          valuesInGwei.push(web3Service.web3.fromWei(wei, 'gwei'));
        });
        values = valuesInGwei;

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
  }

  setChart(ctx, data) {
    this.setState({
      chart: new Chart(ctx, {
        type: 'bar',
        data: {
          labels: data.labels,
          datasets: [
            {
              label: 'Average TimeBounty',
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
    chart.data.labels = [];
    chart.data.datasets.forEach(dataset => {
      dataset.data = [];
    });

    chart.data.labels = data.labels;
    chart.data.datasets[0].data = data.values;

    chart.update();
  }

  render() {
    return <canvas id="timeBountiesGraph" ref={el => (this.timeBountiesGraph = el)} />;
  }
}

TimeBountiesGraph.propTypes = {
  data: PropTypes.any,
  web3Service: PropTypes.any
};

export { TimeBountiesGraph };
