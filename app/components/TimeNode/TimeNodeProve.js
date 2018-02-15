import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';

@inject('timeNodeStore')
@observer
class TimeNodeProve extends Component {

  constructor(props) {
    super(props);
    this.verifyDayTokens = this.verifyDayTokens.bind(this);
  }

  _handleEnterPress = event => {
    if(event.key !== "Enter") return;
    document.querySelector("#verifyDayTokensBtn").click();
    event.preventDefault();
  };

  componentDidMount() {
    this.signatureRef.addEventListener('keyup', this._handleEnterPress);
  }

  componentWillUnmount() {
    this.signatureRef.removeEventListener('keyup', this._handleEnterPress);
  }

  verifyDayTokens() {
    const signature = this.signatureRef.value;

    if (signature) {
      this.props.timeNodeStore.attachDayAccount(signature);
    }
  }

  toClipboard() {
    var copyText = document.getElementById("copyAddress");
    copyText.select();
    document.execCommand("Copy");
  }

  render() {
    const myAddress = this.props.timeNodeStore.getMyAddress();

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
                <li>Sign a message using your wallet. Use the following as the message content:
                  <div className="row">
                    <div className="col-md-8">
                      <div className="form-group">
                        <input id="copyAddress" className="form-control" defaultValue={myAddress}/>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <button className="btn btn-white" onClick={this.toClipboard}>Copy</button>
                    </div>
                  </div>
                </li>
                <li>Paste the whole generated signature into the Signature field.</li>
              </ol>
              <a href="#">Watch Tutorial</a>
            </div>

            <div className="col-md-6">
              <div className="form-group form-group-default">
                <label>Signature from MyEtherWallet</label>
                <input type="text"
                  placeholder="Paste Your Signature Here"
                  className="form-control"
                  ref={(el) => this.signatureRef = el} />
              </div>
            </div>

          </div>
        </div>

        <div className="row">
          <div className="col-md-12">
            <button id="verifyDayTokensBtn"
              className="btn btn-primary pull-right mr-4 px-5"
              type="button"
              onClick={this.verifyDayTokens}>Verify</button>
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
