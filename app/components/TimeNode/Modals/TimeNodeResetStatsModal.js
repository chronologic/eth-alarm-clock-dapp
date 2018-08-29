import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { inject } from 'mobx-react';

@inject('timeNodeStore')
class TimeNodeResetStatsModal extends Component {
  constructor(props) {
    super(props);
    this.resetStats = this.resetStats.bind(this);
  }

  resetStats() {
    this.props.timeNodeStore.clearStats();
  }

  render() {
    return (
      <div
        className="modal fade stick-up"
        id="timeNodeResetStatsModal"
        tabIndex="-1"
        role="dialog"
        aria-labelledby="timeNodeResetStatsModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header clearfix text-left separator">
              <button type="button" className="close" data-dismiss="modal" aria-hidden="true">
                <i className="pg-close fs-14" />
              </button>
              <h3 className="timenode-modal-title m-0">
                Reset stats for <span className="semi-bold">TimeNode</span>
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
                    className="btn btn-primary btn-block"
                    type="button"
                    data-dismiss="modal"
                    onClick={this.resetStats}
                  >
                    <strong>Reset</strong>
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

TimeNodeResetStatsModal.propTypes = {
  timeNodeStore: PropTypes.any,
  updateWalletUnlocked: PropTypes.any
};

export default TimeNodeResetStatsModal;
