import React, { Component } from 'react';
import PropTypes from 'prop-types';

class ConfirmModal extends Component {
  render() {
    return (
      <div
        className="modal fade stick-up"
        id={`${this.props.modalName}Modal`}
        tabIndex="-1"
        role="dialog"
        aria-labelledby={`${this.props.modalName}ModalLabel`}
        aria-hidden="true"
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header clearfix text-left separator">
              <button type="button" className="close" data-dismiss="modal" aria-hidden="true">
                <i className="pg-close fs-14" />
              </button>
              <h3 className="timenode-modal-title m-0">{this.props.modalTitle}</h3>
            </div>
            <div className="modal-body text-dark">
              <hr />
              <p>{this.props.modalBody}</p>
            </div>
            <div className="modal-footer">
              <div className="row">
                <div className="col-md-6">
                  <button
                    className="btn btn-light btn-block"
                    type="button"
                    data-dismiss="modal"
                    onClick={this.props.onCancel}
                  >
                    Cancel
                  </button>
                </div>
                <div className="col-md-6">
                  <button
                    className="btn btn-primary btn-block"
                    type="button"
                    data-dismiss="modal"
                    onClick={this.props.onConfirm}
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

ConfirmModal.propTypes = {
  modalName: PropTypes.string,
  modalTitle: PropTypes.string,
  modalBody: PropTypes.string,
  onConfirm: PropTypes.func,
  onCancel: PropTypes.func
};

export default ConfirmModal;
