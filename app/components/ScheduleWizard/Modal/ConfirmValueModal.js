import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { inject } from 'mobx-react';

@inject('scheduleStore')
class ConfirmValueModal extends Component {

  render() {
    const { scheduleStore } = this.props;
    return (
      <div
        className="modal fade stick-up"
        id="confirmValueModal"
        tabIndex="-1"
        role="dialog"
        aria-labelledby="confirmValueModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header clearfix text-left separator">
              <button type="button" className="close" data-dismiss="modal" aria-hidden="true">
                <i className="pg-close fs-14" />
              </button>
              <h3 className="timenode-modal-title m-0">
                Confirm <span className="semi-bold">Schedule</span> details
              </h3>
            </div>
            <div className="modal-body">
              <hr />
              <p>You are about to schedule a transaction with <b>{Number(scheduleStore.amountToSend)} value</b> and <b>No Data</b>.<br />
              Continue ?</p>
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
                    onClick={this.props.scheduleTransaction}
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

ConfirmValueModal.propTypes = {
  scheduleStore: PropTypes.any,
  scheduleTransaction: PropTypes.any
};

export default ConfirmValueModal;
