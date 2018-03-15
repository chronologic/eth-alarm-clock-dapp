import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { inject } from 'mobx-react';

@inject('timeNodeStore')
class TimeNodeSettings extends Component {
  constructor(props) {
    super(props);
    this.resetWallet = this.resetWallet.bind(this);
    this.clearStats = this.clearStats.bind(this);
  }

  resetWallet() {
    this.props.timeNodeStore.resetWallet();
    this.props.timeNodeStore.clearStats();
  }

  clearStats() {
    this.props.timeNodeStore.clearStats();
    this.props.timeNodeStore.updateStats();
  }

  render() {
    return (
      <div id="timeNodeSettings">

        <div className="card card-transparent">
          <div className="card-header separator">
            <div className="card-title">
              Clear Stats
            </div>
          </div>
          <div className="card-block p-3">
            <div className="row vertical-align">
              <div className="col-md-8 col-lg-9 my-2">
                <p className="m-0">You can reset your TimeNode statistics here - claimed ETH and executed transactions counter.</p>
              </div>
              <div className="col-md-4 col-lg-3">
                <button className='btn btn-light'
                  type='button'
                  data-dismiss="modal"
                  onClick={this.clearStats}>
                  Clear Stats
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="card card-transparent">
          <div className="card-header separator">
            <div className="card-title">
              Detach Wallet
            </div>
          </div>
          <div className="card-block p-3">
            <div className="row vertical-align">
              <div className="col-md-8 col-lg-9 my-2">
                <p className="m-0">If you wish to run a TimeNode using a different wallet, you can detach this wallet and recreate the TimeNode.</p>
              </div>
              <div className="col-md-4 col-lg-3">
                <button className="btn btn-danger" data-toggle="modal" data-target="#timeNodeDetachModal">
                  Detach wallet
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="modal fade stick-up" id="timeNodeDetachModal" tabIndex="-1" role="dialog" aria-labelledby="timeNodeDetachModalLabel" aria-hidden="true">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header clearfix text-left separator">
                <button type="button" className="close" data-dismiss="modal" aria-hidden="true">
                  <i className="pg-close fs-14"></i>
                </button>
                <h3 className="timenode-modal-title m-0">Detach wallet from <span className="semi-bold">TimeNode</span></h3>
              </div>
              <div className="modal-body">
                <hr/>
                <p>Are you sure you want to do this?</p>
                <span className="text-danger semi-bold">This will erase all your TimeNode data.</span>
              </div>
              <div className="modal-footer">
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
                      onClick={this.resetWallet}>
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
