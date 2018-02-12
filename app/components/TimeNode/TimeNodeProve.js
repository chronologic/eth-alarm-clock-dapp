import React, { Component } from 'react';

class TimeNodeProve extends Component {
  render() {
    return (
      <div id="timeNodeProve" className="tab-content">
        <div className="tab-pane active show padding-25">
          <h2>Sign to prove DAY ownership</h2>

          <div className="row">
            <div className="col-md-6">
              <p>TimeNode functionality requires a wallet address that holds DAY tokens.</p>
              <p>Please follow these steps to attach it:</p>
              <ol>
                <li>Visit <a href="https://www.myetherwallet.com/signmsg.html" target="_blank" rel="noopener noreferrer">https://www.myetherwallet.com/signmsg.html</a></li>
                <li>TimeNode: <a href="#">0xf9fcacad8c20b15c891a9cbe2dadaf5c4a55eb62</a>&nbsp;<button className="btn btn-white">Copy</button></li>
              </ol>
              <a href="#">Watch Tutorial</a>
            </div>

            <div className="col-md-6">
              <div className="form-group form-group-default">
                <label>Your ETH Address Holding Day</label>
                <input type="text" placeholder="Enter Your ETH Address" className="form-control"></input>
              </div>

              <div className="form-group form-group-default">
                <label>Signature from MyEtherWallet</label>
                <input type="text" placeholder="Enter Your Signature" className="form-control"></input>
              </div>
            </div>

          </div>
        </div>

        <div className="row">
          <div className="col-md-12">
            <button className="btn btn-primary pull-right mr-4 px-5" type="button">Verify</button>
          </div>
        </div>

      </div>
    );
  }
}

export default TimeNodeProve;
