import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { inject } from 'mobx-react';
import { showNotification } from '../../../services/notification';

@inject('timeNodeStore')
class ConfirmClaimingModal extends Component {
  constructor(props) {
    super(props);
    this.saveClaimingChange = this.saveClaimingChange.bind(this);
  }

  saveClaimingChange() {
    const password = this.passwdRef.value;
    const {
      claiming,
      maxDeposit,
      minBalance,
      minProfitability,
      maxGasSubsidy,
      timeNodeStore
    } = this.props;

    if (timeNodeStore.passwordMatchesKeystore(password)) {
      timeNodeStore.claiming = claiming;
      timeNodeStore.saveClaimingStrategy({
        maxDeposit,
        minBalance,
        minProfitability,
        maxGasSubsidy
      });
      timeNodeStore.restart(password);
      showNotification('Changes saved.', 'success');
      this.passwdRef.value = '';
    }
  }

  render() {
    return (
      <div
        className="modal fade stick-up"
        id="confirmClaimingModal"
        tabIndex="-1"
        role="dialog"
        aria-labelledby="confirmClaimingModallLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header clearfix text-left separator">
              <button type="button" className="close" data-dismiss="modal" aria-hidden="true">
                <i className="pg-close fs-14" />
              </button>
              <h3 className="timenode-modal-title m-0">
                Confirm <span className="semi-bold">TimeNode</span> changes
              </h3>
            </div>
            <div className="modal-body">
              <hr />
              <p>Please enter your password:</p>
              <input
                id="walletPassword"
                type="password"
                placeholder="Password"
                className="form-control"
                ref={el => (this.passwdRef = el)}
                autoFocus
              />
            </div>
            <div className="modal-footer">
              <div className="row">
                <div className="col-md-6">
                  <button className="btn btn-light btn-block" type="button" data-dismiss="modal">
                    Cancel
                  </button>
                </div>
                <div className="col-md-6">
                  <button
                    className="btn btn-primary btn-block"
                    type="button"
                    data-dismiss="modal"
                    onClick={this.saveClaimingChange}
                  >
                    <strong>Confirm</strong>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

ConfirmClaimingModal.propTypes = {
  timeNodeStore: PropTypes.any,
  updateWalletUnlocked: PropTypes.any,
  claiming: PropTypes.bool,
  maxDeposit: PropTypes.string,
  minBalance: PropTypes.string,
  minProfitability: PropTypes.string,
  maxGasSubsidy: PropTypes.string
};

export default ConfirmClaimingModal;
