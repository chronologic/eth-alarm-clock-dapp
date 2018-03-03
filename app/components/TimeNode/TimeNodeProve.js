import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';
import PoweredByEAC from '../Common/PoweredByEAC';

@inject('timeNodeStore')
@observer
class TimeNodeProve extends Component {

  constructor(props) {
    super(props);
    this.verifyDayTokens = this.verifyDayTokens.bind(this);
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
    const signature = this.signatureRef.value;

    if (signature) {
      await this.props.timeNodeStore.attachDayAccount(signature);
    }
  }

  toClipboard() {
    var copyText = document.getElementById('copyAddress');
    copyText.select();
    document.execCommand('Copy');
  }

  render() {
    const myAddress = this.props.timeNodeStore.getMyAddress();

    return (
      <div id='timeNodeProve' className='tab-content'>
        <div className='tab-pane active show'>
          <h2>Sign to prove DAY ownership</h2>

          <div className='row'>
            <div className='col-md-6'>
              <p>The TimeNode functionality requires DAY tokens as a proof of ownership. By signing the TimeNode address using your DAY token account, you provide us with the necessary information to determine your DAY token balance.</p>
              <p>Please note that the signing process will not give us any control over your DAY tokens.</p>
              <p>Follow these steps to complete the setup:</p>
              <ol>
                <li>Visit <a href='https://www.mycrypto.com/signmsg.html' target='_blank' rel='noopener noreferrer'>https://www.mycrypto.com/signmsg.html</a></li>
                <li>Sign a message using your wallet. Use the following as the message content:
                  <div className='row'>
                    <div className='col-md-8'>
                      <div className='form-group'>
                        <input id='copyAddress' className='form-control' defaultValue={myAddress}/>
                      </div>
                    </div>
                    <div className='col-md-4'>
                      <button className='btn btn-white' onClick={this.toClipboard}>Copy</button>
                    </div>
                  </div>
                </li>
                <li>Copy generated signature</li>
                <li>Paste the whole generated signature into the Signature field</li>
              </ol>
              <a  className='d-none' target='_blank' rel='noopener noreferrer'>Watch Tutorial</a>
            </div>

            <div className='col-md-6 mt-3'>
              <div id='signatureCheck' className='form-group form-group-default'>
                <label>Signature from MyEtherWallet</label>
                <textarea
                  placeholder='Paste Your Signature Here'
                  className='form-control h-100'
                  ref={(el) => this.signatureRef = el} />
              </div>
            </div>

          </div>
        </div>

        <div className='row'>
          <div className='col-md-6 d-none d-md-block'>
            <PoweredByEAC className='col-md-2' />
          </div>
          <div className='col-md-6'>
            <button id='verifyDayTokensBtn'
              className='btn btn-primary pull-right mr-4 px-5'
              type='button'
              onClick={this.verifyDayTokens}>Verify</button>
          </div>
          <div className='d-sm-inline d-md-none'>
            <PoweredByEAC className='mt-5'/>
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
