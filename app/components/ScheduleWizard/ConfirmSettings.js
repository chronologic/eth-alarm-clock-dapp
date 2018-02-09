import React, { Component } from 'react';
import PropTypes from 'prop-types';

class ConfirmSettings extends Component {
  state = {}

    componentDidMount() {

    }

    render() {
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
                    <td><a href="#">{this.props.address}</a></td>
                  </tr>
                  <tr>
                    <td>Data</td>
                    <td>{this.props.data}</td>
                  </tr>
                  <tr>
                    <td>Block or Time</td>
                    <td>{this.props.blockortime}</td>
                  </tr>
                  <tr>
                    <td>Window Size</td>
                    <td>{this.props.blockortime}</td>
                  </tr>
                  <tr>
                    <td>Gas Amount</td>
                    <td>{this.props.gasamount}</td>
                  </tr>
                  <tr>
                    <td>Gas Price</td>
                    <td>{this.props.gasprice}</td>
                  </tr>
                  <tr>
                    <td>Time Bounty</td>
                    <td>{this.props.timeBounty}</td>
                  </tr>
                  <tr>
                    <td>Donation</td>
                    <td>{this.props.donation}</td>
                  </tr>
                  <tr>
                    <td>Deposit</td>
                    <td>{this.props.deposit}</td>
                  </tr>
                  <tr>
                    <td><strong>Total cost</strong></td>
                    <td><strong>{this.props.totalcost}</strong></td>
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
  totalcost: PropTypes.any,
  deposit: PropTypes.any,
  donation: PropTypes.any,
  timeBounty: PropTypes.any,
  gasprice: PropTypes.any,
  address: PropTypes.any,
  data: PropTypes.any,
  blockortime: PropTypes.any,
  gasamount: PropTypes.any
};

export default ConfirmSettings;
