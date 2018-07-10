import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { inject } from 'mobx-react';

@inject('timeNodeStore')
@inject('keenStore')
class ClaimedTxWarningModal extends Component {
  constructor(props) {
    super(props);
    this.stopTimeNode = this.stopTimeNode.bind(this);
  }

  stopTimeNode() {
    this.props.timeNodeStore.stopScanning();
    this.props.keenStore.activeTimeNodes =
      this.props.keenStore.activeTimeNodes > 0 ? this.props.keenStore.activeTimeNodes - 1 : 0;
  }

  render() {
    return (
      <div
        className="modal fade stick-up"
        id="claimedTxWarningModal"
        tabIndex="-1"
        role="dialog"
        aria-labelledby="claimedTxWarningModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header clearfix text-left separator">
              <button type="button" className="close" data-dismiss="modal" aria-hidden="true">
                <i className="pg-close fs-14" />
              </button>
              <h3 className="timenode-modal-title m-0">
                You have <span className="semi-bold">claimed transactions</span>!
              </h3>
            </div>
            <div className="modal-body">
              <hr />
              <span className="semi-bold">
                If the claimed transaction is not executed you will lose your deposit.
              </span>
              <p>Are you sure you want to stop the TimeNode?</p>
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
                    className="btn btn-danger btn-block"
                    type="button"
                    data-dismiss="modal"
                    onClick={this.stopTimeNode}
                  >
                    <strong>Stop</strong>
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

ClaimedTxWarningModal.propTypes = {
  timeNodeStore: PropTypes.any,
  keenStore: PropTypes.any
};

export default ClaimedTxWarningModal;
