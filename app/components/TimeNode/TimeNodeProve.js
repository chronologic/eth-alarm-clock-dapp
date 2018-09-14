import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';
import PoweredByEAC from '../Common/PoweredByEAC';
import { BeatLoader } from 'react-spinners';

@inject('timeNodeStore')
@observer
class TimeNodeProve extends Component {
  constructor(props) {
    super(props);
    this.state = {
      checkOngoing: false
    };
    this.verifyDayTokens = this.verifyDayTokens.bind(this);
    this.resetVerify = this.resetVerify.bind(this);
    this.toClipboard = this.toClipboard.bind(this);
  }

  _handleEnterPress = event => {
    if (event.key !== 'Enter') return;
    document.querySelector('#verifyDayTokensBtn').click();
    event.preventDefault();
  };

  componentDidMount() {
    this.signatureRef.addEventListener('keyup', this._handleEnterPress);
  }

  componentWillUnmount() {
    this.signatureRef.removeEventListener('keyup', this._handleEnterPress);
  }

  async verifyDayTokens() {
    this.setState({ checkOngoing: true });
    const signature = this.signatureRef.value;

    if (signature) {
      await this.props.timeNodeStore.attachDayAccount(signature);
    }

    this.setState({ checkOngoing: false });
  }

  resetVerify() {
    this.props.timeNodeStore.detachWallet();
  }

  toClipboard() {
    this.copyMessageRef.select();
    document.execCommand('Copy');
  }

  render() {
    const { checkOngoing } = this.state;

    return (
      <div id="timeNodeProve" className="tab-content">
        <div className="tab-pane active show">
          <h3>Step 2. Sign to prove DAY ownership</h3>

          <div className="row m-b-25">
            <div className="col-md-6">
              <p>
                The TimeNode functionality requires the proof of ownership of DAY tokens. By
                providing the signature from your DAY token account, you help us determine your DAY
                token balance.
              </p>
              <p>
                <i>Note:</i> Please note that the signing process <strong>will not</strong> give us
                any control over your DAY tokens.
              </p>
              <hr />
              <p>Follow these steps to complete the setup:</p>
              <ol>
                <li>
                  Visit{' '}
                  <a
                    href="https://www.mycrypto.com/sign-and-verify-message/sign"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    https://www.mycrypto.com/sign-and-verify-message/sign
                  </a>
                </li>
                <li>
                  Sign a message using your wallet. Use the following message:
                  <div className="input-group">
                    <input
                      id="copyMessage"
                      ref={el => (this.copyMessageRef = el)}
                      type="text"
                      className="form-control"
                      value={`TimeNode:${this.props.timeNodeStore.getMyAddress()}`}
                      readOnly
                    />
                    <div className="input-group-append">
                      <button className="btn btn-primary" onClick={this.toClipboard}>
                        Copy
                      </button>
                    </div>
                  </div>
                </li>
                <li>Copy the generated signature.</li>
                <li>Paste the whole generated signature into the Signature field.</li>
              </ol>
              <a
                href="https://blog.chronologic.network/how-to-prove-day-ownership-to-be-a-timenode-3dc1333c74ef"
                target="_blank"
                rel="noopener noreferrer"
              >
                Watch the Tutorial
              </a>
            </div>

            <div className="col-md-6 mt-3">
              <div id="signatureCheck" className="form-group form-group-default">
                <label>Signature from MyCrypto</label>
                <textarea
                  placeholder="Paste Your Signature Here"
                  className="form-control h-100"
                  ref={el => (this.signatureRef = el)}
                />
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
              id="verifyDayTokensBtn"
              className="btn btn-primary pull-right mr-4 px-5"
              type="button"
              onClick={this.verifyDayTokens}
            >
              {checkOngoing ? <BeatLoader size={8} color={'#fff'} /> : 'Verify'}
            </button>
            <button
              className="btn btn-light pull-right mr-4 px-5"
              type="button"
              onClick={this.resetVerify}
            >
              Reset
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

TimeNodeProve.propTypes = {
  timeNodeStore: PropTypes.any,
  refreshParent: PropTypes.any
};

export default TimeNodeProve;
