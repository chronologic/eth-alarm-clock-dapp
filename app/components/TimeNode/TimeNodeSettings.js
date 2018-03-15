import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { inject } from 'mobx-react';

@inject('timeNodeStore')
class TimeNodeSettings extends Component {
  constructor(props) {
    super(props);
    this.resetVerify = this.resetVerify.bind(this);
  }

  resetVerify() {
    this.props.timeNodeStore.resetWallet();
  }

  render() {
    return (
      <div id="timeNodeSettings">
        <button className="btn btn-danger btn-lg" data-toggle="modal" data-target="#timeNodeDetachModal">
          Detach wallet
        </button>

        <div className="modal fade stick-up" id="timeNodeDetachModal" tabIndex="-1" role="dialog" aria-labelledby="timeNodeDetachModalLabel" aria-hidden="true">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header clearfix text-left">
                <button type="button" className="close" data-dismiss="modal" aria-hidden="true">
                <i className="pg-close fs-14"></i>
                </button>
                <h5>Detach wallet from <span className="semi-bold">TimeNode</span></h5>
                <p>Are you sure you want to do this?</p>
                <p><strong>This will erase all your TimeNode data.</strong></p>
              </div>
              <div className="modal-body">
                <div className="row">
                  <div className="col-md-6">
                    <button className='btn btn-light btn-block'
                      type='button'
                      data-dismiss="modal">
                      Cancel
                    </button>
                  </div>
                  <div className="col-md-6">
                    <button className='btn btn-danger btn-block'
                      type='button'
                      data-dismiss="modal"
                      onClick={this.resetVerify}>
                      <strong>Detach</strong>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

TimeNodeSettings.propTypes = {
  timeNodeStore: PropTypes.any
};

export default TimeNodeSettings;
