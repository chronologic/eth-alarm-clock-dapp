import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { observer, inject } from 'mobx-react';
import { Networks, CUSTOM_PROVIDER_NET_ID } from '../../config/web3Config';
import ConfirmModal from '../Common/ConfirmModal';

const DEFAULT_NETWORK_ID = Networks[1].id; // Mainnet

@inject('web3Service')
@inject('timeNodeStore')
@observer
class NetworkChooser extends Component {
  constructor(props) {
    super(props);

    // We use two network providers
    // 1. Metamask injected provider for scheduling - This can be changed only when MetaMask is present
    // 2. Separate provider for TimeNodes if selected - This can be changed on platforms without MetaMask
    this.state = {
      metaMaskNetworkId: DEFAULT_NETWORK_ID,
      timeNodeNetworkId: this.checkSelectedProvider(),
      onTimeNodeScreen: props.onTimeNodeScreen,
      selectedNetId: null // Used for communicating the selected network to the modal
    };

    this._handleSelectedNetworkChange = this._handleSelectedNetworkChange.bind(this);
    this.getCurrentTimeNodeBlock = this.getCurrentTimeNodeBlock.bind(this);
    this.changeProvider = this.changeProvider.bind(this);
  }

  async componentDidMount() {
    const { web3Service } = this.props;
    await web3Service.init();

    if (web3Service.network.id !== this.state.metaMaskNetworkId)
      this.setState({ metaMaskNetworkId: web3Service.network.id });

    if (!localStorage.getItem('selectedProviderId')) {
      if (web3Service.network.id !== this.state.timeNodeNetworkId)
        this.setState({ timeNodeNetworkId: web3Service.network.id });
    }

    this.getCurrentTimeNodeBlock();
    // Check every 10 seconds if the block number changed
    this.interval = setInterval(this.getCurrentTimeNodeBlock, 10000);
  }

  componentDidUpdate() {
    this.getCurrentTimeNodeBlock();
  }

  static getDerivedStateFromProps(newProps) {
    return {
      onTimeNodeScreen: newProps.onTimeNodeScreen
    };
  }

  /*
   * Checks if the TimeNode provider is different from the global
   * MetaMask provider.
   */
  checkSelectedProvider() {
    const { timeNodeStore } = this.props;

    const { id, endpoint } = timeNodeStore.getCustomProvider();

    if (id && endpoint) {
      timeNodeStore.customProviderUrl = endpoint;
      return id;
    }

    return DEFAULT_NETWORK_ID;
  }

  hasCustomProvider() {
    const selectedProviderId = parseInt(this.props.storageService.load('selectedProviderId'));

    return selectedProviderId === CUSTOM_PROVIDER_NET_ID;
  }

  _handleSelectedNetworkChange(event) {
    const selectedNetId = parseInt(event.target.value);
    const $ = window.jQuery;

    const isCustomSelected = selectedNetId === CUSTOM_PROVIDER_NET_ID;
    const modalToShow = isCustomSelected ? '#customProviderModal' : '#confirmProviderChangeModal';

    this.setState({ selectedNetId }); // Let the modal know which network was selected

    $(modalToShow).modal({
      show: true,
      backdrop: isCustomSelected // Backdrop breaks #confirmProviderChangeModal, so enable only for custom
    });
  }

  changeProvider() {
    // Retrieve the selected network id in the modal
    const { selectedNetId } = this.state;

    const selectedProviderEndpoint = Networks[selectedNetId].endpoint;
    this.props.timeNodeStore.setCustomProvider(selectedNetId, selectedProviderEndpoint);

    // Once we read the new network ID, reset it
    this.setState({
      selectedNetId: null
    });
  }

  getCurrentTimeNodeBlock() {
    // If the current screen is the TimeNode
    if (this.state.onTimeNodeScreen) {
      // Get the block number from the eac-worker
      this.props.timeNodeStore.getNetworkInfo();
    }
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  render() {
    const { timeNodeNetworkId, metaMaskNetworkId } = this.state;
    const blockNumberString = blockNumber => (blockNumber ? ' at #' + blockNumber : '');

    if (!this.state.onTimeNodeScreen) {
      return (
        <span>
          {Networks[metaMaskNetworkId].name}
          {blockNumberString(this.props.web3Service.latestBlockNumber)}
        </span>
      );
    }

    // Return this only if the user enters the TimeNode screen.
    return (
      <span id="networkChooser">
        <span id="networkChooserSelect">
          <select
            className="form-control d-inline"
            value={timeNodeNetworkId}
            onChange={this._handleSelectedNetworkChange}
          >
            {Object.keys(Networks).map(index => {
              if (Networks[index].showInChooser) {
                return (
                  <option key={index} value={index}>
                    {Networks[index].name}
                  </option>
                );
              }
            })}
            <option key={CUSTOM_PROVIDER_NET_ID} value={CUSTOM_PROVIDER_NET_ID}>
              Custom...
            </option>
          </select>
        </span>
        {blockNumberString(this.props.timeNodeStore.providerBlockNumber)}

        <ConfirmModal
          modalName="confirmProviderChange"
          modalTitle="You are about to change your TimeNode provider."
          modalBody="Are you sure you want to change it? Your TimeNode will be stopped."
          onConfirm={this.changeProvider}
        />
      </span>
    );
  }
}

NetworkChooser.propTypes = {
  storageService: PropTypes.any,
  web3Service: PropTypes.any,
  timeNodeStore: PropTypes.any,
  onTimeNodeScreen: PropTypes.bool
};

export default NetworkChooser;
