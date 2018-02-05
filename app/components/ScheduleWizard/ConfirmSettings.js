import React, { Component } from 'react';

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
                <td><a href="#">0xasudbasidubasfafasd6s4d6asd45asd</a></td>
              </tr>
              <tr>
                <td>Data</td>
                <td>0x0</td>
              </tr>
              <tr>
                <td>Block or Time</td>
                <td>5605105 (2018-01-30 12:12 CEST)</td>
              </tr>
              <tr>
                <td>Window Size</td>
                <td>30 blocks (5 min)</td>
              </tr>
              <tr>
                <td>Gas Amount</td>
                <td>3000000</td>
              </tr>
              <tr>
                <td>Gas Price</td>
                <td>50 Gwei</td>
              </tr>
              <tr>
                <td>Time Bounty</td>
                <td>10 Gwei</td>
              </tr>
              <tr>
                <td>Donation</td>
                <td>30 Gwei</td>
              </tr>
              <tr>
                <td>Deposit</td>
                <td>1 ETH</td>
              </tr>
              <tr>
                <td><strong>Total cost</strong></td>
                <td><strong>0.123 ETH</strong></td>
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