import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { inject } from 'mobx-react';

@inject('timeNodeStore')
class TimeNodeDetachModal extends Component {
  constructor(props) {
    super(props);
    this.detachWallet = this.detachWallet.bind(this);
  }

  detachWallet() {
    const { timeNodeStore } = this.props;
    timeNodeStore.clearStats();
    timeNodeStore.updateStats();
    timeNodeStore.detachWallet();
    timeNodeStore.unlocked = false;
  }

  render() {
    return (
      <div
        className="modal fade stick-up"
        id="timeNodeDetachModal"
        tabIndex="-1"
        role="dialog"
        aria-labelledby="timeNodeDetachModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header clearfix text-left separator">
              <button type="button" className="close" data-dismiss="modal" aria-hidden="true">
                <i className="pg-close fs-14" />
              </button>
              <h3 className="timenode-modal-title m-0">
                Detach wallet from <span className="semi-bold">TimeNode</span>
              </h3>
            </div>
            <div className="modal-body">
              <hr />
              <p>Are you sure you want to do this?</p>
              <span className="semi-bold">This will erase your TimeNode statistics.</span>
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
                    onClick={this.detachWallet}
                  >
                    <strong>Detach</strong>
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

TimeNodeDetachModal.propTypes = {
  timeNodeStore: PropTypes.any
};

export default TimeNodeDetachModal;
