import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';

@inject('timeNodeStore')
@observer
class TimeNodeWallet extends Component {

  constructor(props) {
    super(props);
    this.verifyKeystore = this.verifyKeystore.bind(this);
  }

  _handleEnterPress = event => {
    if (event.key !== "Enter") return;
    document.querySelector("#verifyWalletBtn").click();
    event.preventDefault();
  };

  componentDidMount() {
    this.passwdRef.addEventListener('keyup', this._handleEnterPress);
  }

  componentWillUnmount() {
    this.passwdRef.removeEventListener('keyup', this._handleEnterPress);
  }

  verifyKeystore() {
    const file = this.walletFileRef.files[0];
    const timeNodeStore = this.props.timeNodeStore;
    const password = timeNodeStore.encrypt(this.passwdRef.value);

    if (file) {
      const reader = new FileReader();
      reader.onload = async function() {
        const keystore = timeNodeStore.encrypt(reader.result);
        if (keystore && password) {
          await timeNodeStore.startClient(keystore, password);
        }
      };
      reader.readAsText(file, "utf-8");
    }
  }

  render() {
    return (
      <div id="timeNodeWallet" className="tab-content">
        <div className="tab-pane active show padding-25">
          <h2>Select Your Wallet File</h2>
          <p>In order to enable TimeNode functionality please unlock your wallet that contains small amount of ETH necessary for scheduled transactions execution.</p>
          <p>We support standard Ethereum keystore wallet file</p>
          <p>If you don&#39;t have the wallet yet, please visit <a href="https://www.mycrypto.com" target="_blank" rel="noopener noreferrer">https://www.mycrypto.com</a> and create a new wallet.</p>
          <input type="file"
            className="my-3"
            ref={(el) => this.walletFileRef = el} />
          <p>Your wallet is encrypted. Please enter the password:</p>
          <div className="row">
            <div className="col-md-4">
              <div className="form-group form-group-default">
                <input id="walletPassword"
                  type="password"
                  placeholder="Password"
                  className="form-control"
                  ref={(el) => this.passwdRef = el}/>
              </div>
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-md-12">
            <button id="verifyWalletBtn"
              className="btn btn-primary pull-right mr-4 px-5"
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
