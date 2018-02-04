import React, { Component } from 'react';

class TransactionDetails extends Component {
  state = {}

  componentDidMount() {

  }

render() {
  return (

    <div id="transactionDetails">

      <div className="row">
        <div className="col-md-8">

          <table className="table">
            <tbody>
              <tr>
                <td>Status</td>
                <td>Executed at <a href="#">0x68asd1a8s6d1as68d1asa4s78981</a></td>
              </tr>
              <tr>
                <td>To Address</td>
                <td><a href="#">0xasudbasidubasfafasd6s4d6asd45asd</a></td>
              </tr>
              <tr>
                <td>Value/Amount</td>
                <td>1.1234 ETH</td>
              </tr>
              <tr>
                <td>Data</td>
                <td>0x0</td>
              </tr>
              <tr>
                <td>Block or Time</td>
                <td>5555555 (2018-01-30 12:12 CEST)</td>
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
                <td>Created at</td>
                <td><a href="#">0x68asd1a8s6d1as68d1asa4s78981</a></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="row">
        <div className="col-md-12 text-right">
          <button className="btn btn-default">Cancel Transaction</button>
        </div>
      </div>

    </div>
  );
}
}

export default TransactionDetails;