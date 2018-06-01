import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';
import PoweredByEAC from '../Common/PoweredByEAC';

@inject('timeNodeStore')
@observer
class TimeNodeUnlock extends Component {
  constructor(props) {
    super(props);
    this.verifyPassword = this.verifyPassword.bind(this);
  }

  _handleEnterPress = event => {
    if (event.key !== 'Enter') return;
    document.querySelector('#verifyPasswordBtn').click();
    event.preventDefault();
  };

  componentDidMount() {
    this.passwdRef.addEventListener('keyup', this._handleEnterPress);
  }

  componentWillUnmount() {
    this.passwdRef.removeEventListener('keyup', this._handleEnterPress);
  }

  async verifyPassword() {
    const password = this.passwdRef.value;

    if (
      this.props.timeNodeStore.passwordMatchesKeystore(this.props.timeNodeStore.encrypt(password))
    ) {
      this.props.timeNodeStore.unlockTimeNode(password);
      this.props.updateWalletUnlocked(true);
    }
  }

  render() {
    return (
      <div id="timeNodeUnlock" className="tab-content">
        <div className="tab-pane active show">
          <h2>Please unlock your account</h2>

          <div>
            <p>
              Your wallet is <b>encrypted</b>. Please enter the password:
            </p>
            <div className="row">
              <div className="col-md-4">
                <div className="form-group form-group-default required">
                  <input
                    id="walletPassword"
                    type="password"
                    placeholder="Password"
                    className="form-control"
                    ref={el => (this.passwdRef = el)}
                    autoFocus
                  />
                </div>
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
              id="verifyPasswordBtn"
              className="btn btn-primary pull-right mr-4 px-5"
              type="button"
              onClick={this.verifyPassword}
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

TimeNodeUnlock.propTypes = {
  timeNodeStore: PropTypes.any,
  updateWalletUnlocked: PropTypes.any
};

export default TimeNodeUnlock;
