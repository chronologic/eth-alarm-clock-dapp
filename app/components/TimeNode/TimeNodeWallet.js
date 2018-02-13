import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';

@inject('timeNodeStore')
@observer
class TimeNodeWallet extends Component {
  render() {
    return (
      <div id="timeNodeWallet" className="tab-content">
        <div className="tab-pane active show padding-25">
          <h2>Select Your Wallet File</h2>
          <p>We support MyEtherWallet keystore files</p>
          <p>If you don't have the wallet yet, please visit <a href="https://myetherwallet.com" target="_blank" rel="noopener noreferrer">https://myetherwallet.com</a> and create a new wallet.</p>
          <button className="btn btn-white my-3">Select wallet file</button>
          <p>Your wallet is encrypted. Please enter the password:</p>
          <div className="row">
            <div className="col-md-4">
              <div className="form-group form-group-default">
                <input type="password" placeholder="Password" className="form-control"/>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

TimeNodeWallet.propTypes = {
  timeNodeStore: PropTypes.any
};

export default TimeNodeWallet;
