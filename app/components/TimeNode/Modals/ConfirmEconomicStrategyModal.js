import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { inject } from 'mobx-react';
import { showNotification } from '../../../services/notification';

@inject('timeNodeStore')
class ConfirmEconomicStrategyModal extends Component {
  constructor(props) {
    super(props);
    this.saveEconomicStrategyChange = this.saveEconomicStrategyChange.bind(this);
  }

  saveEconomicStrategyChange() {
    const password = this.passwdRef.value;
    const { maxDeposit, minBalance, minProfitability, timeNodeStore } = this.props;

    if (timeNodeStore.passwordMatchesKeystore(password)) {
      timeNodeStore.setEconomicStrategy(maxDeposit, minBalance, minProfitability);
      timeNodeStore.restart(password);
      showNotification('Changes saved.', 'success');
      this.passwdRef.value = '';
    }
  }

  render() {
    return (
      <div
        className="modal fade stick-up"
        id="confirmEconomicStrategyModal"
        tabIndex="-1"
        role="dialog"
        aria-labelledby="confirmEconomicStrategyModalLabel"
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
                    onClick={this.saveEconomicStrategyChange}
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

ConfirmEconomicStrategyModal.propTypes = {
  timeNodeStore: PropTypes.any,
  updateWalletUnlocked: PropTypes.any,
  maxDeposit: PropTypes.any,
  minBalance: PropTypes.any,
  minProfitability: PropTypes.any
};

export default ConfirmEconomicStrategyModal;
