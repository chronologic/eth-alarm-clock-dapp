import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { observer, inject } from 'mobx-react';
import { Networks } from '../../config/web3Config';
import ConfirmModal from '../Common/ConfirmModal';

@inject('timeNodeStore')
@observer
class NetworkChooserModal extends Component {
  constructor(props) {
    super(props);

    this.changeProvider = this.changeProvider.bind(this);
  }

  changeProvider() {
    const selectedNetId = this.props.timeNodeStore.proposedNewNetId;

    const selectedProviderEndpoint = Networks[selectedNetId].endpoint;
    this.props.timeNodeStore.setCustomProvider(selectedNetId, selectedProviderEndpoint);

    // Once we read the new network ID, reset it
    this.props.timeNodeStore.proposedNewNetId = null;
  }

  render() {
    return (
      <ConfirmModal
        modalName="confirmProviderChange"
        modalTitle="You are about to change your TimeNode provider."
        modalBody="Are you sure you want to change it? Your TimeNode will be stopped."
        onConfirm={this.changeProvider}
      />
    );
  }
}

NetworkChooserModal.propTypes = {
  timeNodeStore: PropTypes.any
};

export default NetworkChooserModal;
