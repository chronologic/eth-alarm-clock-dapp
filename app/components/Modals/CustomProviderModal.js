import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { observer, inject } from 'mobx-react';
import Cookies from 'js-cookie';
import { CUSTOM_PROVIDER_NET_ID } from '../../config/web3Config';

@inject('timeNodeStore')
@observer
class CustomProviderModal extends Component {
  constructor() {
    super();
    this.setCustomProvider = this.setCustomProvider.bind(this);
  }

  setCustomProvider() {
    this.props.timeNodeStore.customProviderUrl = this.providerInputField.value;
    Cookies.set('selectedProviderId', CUSTOM_PROVIDER_NET_ID, { expires: 30 });
    Cookies.set('selectedProviderUrl', this.providerInputField.value, { expires: 30 });

    // Reload the page so that the changes are refreshed
    window.location.reload();
  }

  render() {
    return (
      <div
        className="modal fade stick-up"
        id="customProviderModal"
        tabIndex="-1"
        role="dialog"
        aria-labelledby="customProviderModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header clearfix text-left separator">
              <button type="button" className="close" data-dismiss="modal" aria-hidden="true">
                <i className="pg-close fs-14" />
              </button>
              <h3 className="timenode-modal-title m-0">
                Select a <span className="semi-bold">custom RPC provider</span>
              </h3>
            </div>
            <div className="modal-body">
              <hr />
              <div className={'form-group form-group-default required'}>
                <label>Custom RPC provider URL</label>
                <input
                  type="text"
                  placeholder="http://localhost:8545"
                  className="form-control"
                  ref={el => (this.providerInputField = el)}
                  autoFocus
                />
              </div>
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
                    onClick={this.setCustomProvider}
                  >
                    Apply
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

CustomProviderModal.propTypes = {
  timeNodeStore: PropTypes.any
};

export default CustomProviderModal;
