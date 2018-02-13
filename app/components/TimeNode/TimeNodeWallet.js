import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';
import Cookies from 'js-cookie';

@inject('timeNodeStore')
@observer
class TimeNodeWallet extends Component {

  constructor(props) {
    super(props);
    this.verifyKeystore = this.verifyKeystore.bind(this);
  }

  verifyKeystore() {
    const file = this.walletFileRef.files[0];
    const password = this.passwdRef.value;
    const refreshParent = this.props.refreshParent;
    const timeNodeStore = this.props.timeNodeStore;

    if (file) {
      const reader = new FileReader();
      reader.onload = function() {
        const keystore = reader.result;

        // TEMPORARY
        // Replace this logic with a proper wallet import
        if (keystore && password) {
          Cookies.set('verifiedWallet', true);
          timeNodeStore.verifiedWallet = true;
          refreshParent();
        }
      }
      reader.readAsText(file, "utf-8");
    }
  }

  render() {
    return (
      <div id="timeNodeWallet" className="tab-content">
        <div className="tab-pane active show padding-25">
          <h2>Select Your Wallet File</h2>
          <p>We support MyEtherWallet keystore files</p>
          <p>If you don't have the wallet yet, please visit <a href="https://myetherwallet.com" target="_blank" rel="noopener noreferrer">https://myetherwallet.com</a> and create a new wallet.</p>
          <input type="file"
            className="my-3"
            ref={(el) => this.walletFileRef = el} />
          <p>Your wallet is encrypted. Please enter the password:</p>
          <div className="row">
            <div className="col-md-4">
              <div className="form-group form-group-default">
                <input type="password"
                  placeholder="Password"
                  className="form-control"
                  ref={(el) => this.passwdRef = el}/>
              </div>
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-md-12">
            <button className="btn btn-primary pull-right mr-4 px-5"
              type="button"
              onClick={this.verifyKeystore}>Unlock</button>
          </div>
        </div>
      </div>
    );
  }
}

TimeNodeWallet.propTypes = {
  timeNodeStore: PropTypes.any,
  refreshParent: PropTypes.any
};

export default TimeNodeWallet;
