import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';
import { showNotification } from '../../services/notification';
import PoweredByEAC from '../Common/PoweredByEAC';
import { isRunningInElectron } from '../../lib/electron-util';

@inject('featuresService')
@inject('timeNodeStore')
@observer
class TimeNodeWallet extends Component {
  constructor(props) {
    super(props);
    this.state = {
      userUploadedWallet: false,
      selectedFile: null,
      warnings: []
    };
    this.verifyKeystore = this.verifyKeystore.bind(this);
    this._handleFileUpload = this._handleFileUpload.bind(this);
  }

  _handleEnterPress = event => {
    if (event.key !== 'Enter') return;
    document.querySelector('#verifyWalletBtn').click();
    event.preventDefault();
  };

  componentDidMount() {
    if (!this.walletTabRef) {
      return;
    }

    this.walletTabRef.addEventListener('keyup', this._handleEnterPress);
    this.walletFileRef.addEventListener('change', this._handleFileUpload);
  }

  componentWillUnmount() {
    if (!this.walletTabRef) {
      return;
    }

    this.walletTabRef.removeEventListener('keyup', this._handleEnterPress);
  }

  verifyKeystoreCapitalization(keystore) {
    // Some keystores incorrectly capitalize the `Crypto` key
    // This section fixes that
    if (keystore.hasOwnProperty('Crypto')) {
      keystore['crypto'] = keystore['Crypto'];
      delete keystore['Crypto'];
    }
    return keystore;
  }

  verifyKeystore() {
    const file = this.walletFileRef.files[0];
    const timeNodeStore = this.props.timeNodeStore;

    if (file) {
      const reader = new FileReader();

      reader.onload = async () => {
        const keystore = reader.result;

        try {
          let parsedKeystore = JSON.parse(keystore);
          if (
            parsedKeystore.version === 3 &&
            'id' in parsedKeystore &&
            'address' in parsedKeystore
          ) {
            parsedKeystore = this.verifyKeystoreCapitalization(parsedKeystore);

            const encryptedKeystore = timeNodeStore.encrypt(JSON.stringify(parsedKeystore));
            timeNodeStore.setKeyStore(encryptedKeystore);
          } else {
            throw new Error();
          }
        } catch (e) {
          showNotification('Please select a valid wallet file.');
        }
      };
      reader.readAsText(file, 'utf-8');
    }
  }

  _handleFileUpload() {
    this.setState({
      userUploadedWallet: true,
      selectedFile: this.walletFileRef.files[0].name
    });
  }

  render() {
    const { selectedFile } = this.state;
    const timeNodeEnabled = this.props.featuresService.enabled.timenode;

    const myCryptoUrl = 'https://www.mycrypto.com';

    return (
      <div id="timeNodeWallet" className="tab-content" ref={el => (this.walletTabRef = el)}>
        <div className="tab-pane active show">
          <div className="row">
            <div className="col-md-6 p-4">
              <h1>TimeNode</h1>
              <p>
                A TimeNode enables you to earn ETH by executing transactions scheduled on the
                Ethereum Alarm Clock protocol.
              </p>
              <p>
                To find out more about TimeNodes and how to properly use them, please see the{' '}
                <a
                  href="https://blog.chronologic.network/how-to-prove-day-ownership-to-be-a-timenode-3dc1333c74ef"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  tutorial on how to run up a TimeNode
                </a>
                .
              </p>
              {!isRunningInElectron() && (
                <p>
                  <i>
                    <strong>Note:</strong> We strongly advise that you run the TimeNode using our
                    desktop apps instead of the browser TimeNode. You can find the link to the
                    latest desktop releases{' '}
                    <a
                      href="https://github.com/chronologic/eth-alarm-clock-dapp/releases"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      here.
                    </a>
                  </i>
                </p>
              )}
            </div>

            <div className="col-md-6 p-4">
              <h3 className="mb-4">Step 1. Select Your Wallet File</h3>
              <p>
                In order to enable TimeNode functionality please unlock your wallet that contains
                small amount of ETH necessary for scheduled transactions execution.
              </p>
              <p>We support the standard Ethereum keystore wallet file (v3).</p>
              <p>
                {`If you don't have the wallet yet, please visit `}
                <a href={myCryptoUrl} target="_blank" rel="noopener noreferrer">
                  {myCryptoUrl}
                </a>
                {` and create a new one.`}
              </p>

              <div className="my-4">
                <div className="row">
                  <div className="col-md-6">
                    <label htmlFor="walletFile" className="btn btn-block">
                      Select wallet file
                    </label>
                    <input
                      id="walletFile"
                      type="file"
                      className="hide"
                      ref={el => (this.walletFileRef = el)}
                    />
                  </div>
                </div>
                <p>{this.state.selectedFile}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-md-6 d-none d-md-block">
            <PoweredByEAC className="col-md-2" />
          </div>
          <div className="col-md-6">
            <button
              id="verifyWalletBtn"
              className="btn btn-primary pull-right mr-4 px-5"
              type="button"
              onClick={this.verifyKeystore}
              disabled={!selectedFile || !timeNodeEnabled}
            >
              Unlock
            </button>
          </div>
          <div className="d-sm-inline d-md-none">
            <PoweredByEAC className="mt-5" />
          </div>
        </div>
      </div>
    );
  }
}

TimeNodeWallet.propTypes = {
  featuresService: PropTypes.any,
  timeNodeStore: PropTypes.any,
  refreshParent: PropTypes.any
};

export default TimeNodeWallet;
