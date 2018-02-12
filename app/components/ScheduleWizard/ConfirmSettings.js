import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { inject,observer } from 'mobx-react';

@inject('scheduleStore')
@inject('transactionStore')
@observer
class ConfirmSettings extends Component {
  constructor(props){
    super(props);
  }
  state = {}

    componentDidMount() {

    }

render() {
  const { scheduleStore } = this.props;
  return (
        <div id="confirmSettings">
          <div className="row">
            <div className="col-md-10">
              <table className="table">
                <thead>
                  <tr>
                    <th><strong>Summary</strong></th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>To Address</td>
                    <td><a href="#">{scheduleStore.toAddress}</a></td>
                  </tr>
                  <tr>
                    <td>Data</td>
                    <td>{scheduleStore.yourData}</td>
                  </tr>
                  <tr>
                    <td>Block or Time</td>
                    <td>{scheduleStore.transactionTime}</td>
                  </tr>
                  <tr>
                    <td>Window Size</td>
                    <td>{scheduleStore.executionWindow}</td>
                  </tr>
                  <tr>
                    <td>Gas Amount</td>
                    <td>{scheduleStore.gasAmount}</td>
                  </tr>
                  <tr>
                    <td>Gas Price</td>
                    <td>{scheduleStore.gasPrice}</td>
                  </tr>
                  <tr>
                    <td>Time Bounty</td>
                    <td>{scheduleStore.timeBounty}</td>
                  </tr>
                  <tr>
                    <td>Deposit</td>
                    <td>{scheduleStore.deposit}</td>
                  </tr>
                  <tr>
                    <td><strong>Total cost</strong></td>
                    <td><strong>{scheduleStore.totalcost}</strong></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      );
    }
}

ConfirmSettings.propTypes = {
  scheduleStore: PropTypes.any
};

export default ConfirmSettings;
