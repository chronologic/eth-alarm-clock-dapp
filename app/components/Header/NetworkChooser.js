import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { observer, inject } from 'mobx-react';
import { Networks, CUSTOM_PROVIDER_NET_ID, MAIN_NETWORK_ID } from '../../config/web3Config';
import { withRouter } from 'react-router-dom';

const DEFAULT_NETWORK_ID = Networks[MAIN_NETWORK_ID].id;

@withRouter
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
      timeNodeNetworkId: this.checkSelectedProvider()
    };

    this._handleSelectedNetworkChange = this._handleSelectedNetworkChange.bind(this);
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

    this.props.timeNodeStore.proposedNewNetId = selectedNetId;

    $(modalToShow).modal({
      show: true,
      backdrop: isCustomSelected // Backdrop breaks #confirmProviderChangeModal, so enable only for custom
    });
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  isOnTimeNodeScreen() {
    return this.props.location.pathname === '/timenode';
  }

  render() {
    const { timeNodeNetworkId, metaMaskNetworkId } = this.state;
    const blockNumberString = blockNumber => (blockNumber ? ' at #' + blockNumber : '');

    if (!this.isOnTimeNodeScreen()) {
      return (
        <span>
          {Networks[metaMaskNetworkId].name}
          {blockNumberString(this.props.web3Service.latestBlockNumber)}
        </span>
      );
    }

    // Return this only if the user enters the TimeNode screen.
    return (
      <span className="networkChooser">
        <span className="networkChooserSelect">
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
      </span>
    );
  }
}

NetworkChooser.propTypes = {
  location: PropTypes.any,
  storageService: PropTypes.any,
  web3Service: PropTypes.any,
  timeNodeStore: PropTypes.any
};

export default NetworkChooser;
