import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';

@inject('timeNodeStore')
@observer
class TimeNodeWallet extends Component {

  constructor(props) {
    super(props);
    this.state = {
        userUploadedWallet: false,
        selectedFile: null
    };
    this.verifyKeystore = this.verifyKeystore.bind(this);
    this._handleFileUpload = this._handleFileUpload.bind(this);
  }

  _handleEnterPress = event => {
    if (event.key !== "Enter") return;
    document.querySelector("#verifyWalletBtn").click();
    event.preventDefault();
  };

  componentDidMount() {
    this.walletTabRef.addEventListener('keyup', this._handleEnterPress);
    this.walletFileRef.addEventListener('change', this._handleFileUpload);
  }

  componentWillUnmount() {
    this.walletTabRef.removeEventListener('keyup', this._handleEnterPress);
  }

  verifyKeystore() {
    try {
      const file = this.walletFileRef.files[0];
      const timeNodeStore = this.props.timeNodeStore;
      const password = timeNodeStore.encrypt(this.passwdRef.value);

      if (file) {
        const reader = new FileReader();
        reader.onload = async function() {
          const keystore = timeNodeStore.encrypt(reader.result);
          const { matches, msg } = timeNodeStore.checkPasswordMatchesKeystore(keystore, password);

          alert(msg);

          if (matches) {
            await timeNodeStore.startClient(keystore, password);
          }
        };
        reader.readAsText(file, "utf-8");
      }
    } catch (e) {
      alert("Please select a wallet file.");
    }
  }

  _handleFileUpload() {
    this.setState({
      userUploadedWallet: true,
      selectedFile: this.walletFileRef.files[0].name
    });
  }


  render() {
    let passwordField = null;
    if (this.state.userUploadedWallet) {
      passwordField = <div>
        <p>Your wallet is <b>encrypted</b>. Please enter the password:</p>
        <div className="row">
          <div className="col-md-4">
            <div className="form-group form-group-default required">
              <input id="walletPassword"
                type="password"
                placeholder="Password"
                className="form-control"
                ref={(el) => this.passwdRef = el}/>
            </div>
          </div>
        </div>
      </div>;
    }

    return (
      <div id="timeNodeWallet"
        className="tab-content"
        ref={(el) => this.walletTabRef = el}>

        <div className="tab-pane active show padding-25">
          <h2>Select Your Wallet File</h2>
          <p>In order to enable TimeNode functionality please unlock your wallet that contains small amount of ETH necessary for scheduled transactions execution.</p>
          <p>We support the standard Ethereum keystore wallet file (v3).</p>
          <p>If you don&#39;t have the wallet yet, please visit <a href="https://www.mycrypto.com" target="_blank" rel="noopener noreferrer">https://www.mycrypto.com</a> and create a new one.</p>

          <div className="row my-3">
            <div className="col-md-6">
              <label htmlFor="walletFile" className="btn btn-block">Select wallet file</label>
              <input id="walletFile" type="file" className="hide" ref={(el) => this.walletFileRef = el} />
            </div>
            <div className="col-md-6">
              <p>{this.state.selectedFile}</p>
            </div>
          </div>
          {passwordField}
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
