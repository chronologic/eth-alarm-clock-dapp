/* eslint-disable */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { inject,observer } from 'mobx-react';

@inject('store')
@observer
class ConfirmSettings extends Component {
  constructor(props){
    super(props);
  }
  state = {}

    componentDidMount() {

    }

render() {
  const props = this.props;
  return (

        <div id="confirmSettings">

          <div className="row">
            <div className="col-md-6">

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
                <td><a href="#">{props.address}</a></td>
              </tr>
              <tr>
                <td>Data</td>
                <td>{props.data}</td>
              </tr>
              <tr>
                <td>Block or Time</td>
                <td>{props.blockortime}</td>
              </tr>
              <tr>
                <td>Window Size</td>
                <td>{props.blockortime}</td>
              </tr>
              <tr>
                <td>Gas Amount</td>
                <td>{props.gasamount}</td>
              </tr>
              <tr>
                <td>Gas Price</td>
                <td>{props.gasprice}</td>
              </tr>
              <tr>
                <td>Time Bounty</td>
                <td>{props.timeBounty}</td>
              </tr>
              <tr>
                <td>Donation</td>
                <td>{props.donation}</td>
              </tr>
              <tr>
                <td>Deposit</td>
                <td>{props.deposit}</td>
              </tr>
              <tr>
                <td><strong>Total cost</strong></td>
                <td><strong>{props.totalcost}</strong></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

        </div>
      );
    }
}

export default ConfirmSettings;
