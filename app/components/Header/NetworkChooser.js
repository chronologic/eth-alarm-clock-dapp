import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { observer, inject } from 'mobx-react';
import { Networks, CUSTOM_PROVIDER_NET_ID } from '../../config/web3Config';
import { isRunningInElectron } from '../../lib/electron-util';

const DEFAULT_NETWORK_ID = Networks[0].id;

@inject('web3Service')
@inject('timeNodeStore')
@inject('storageService')
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
      currentPath: props.history.location.pathname
    };

    this.props.history.listen(location => {
      if (location.pathname !== this.state.currentPath) {
        this.setState({
          currentPath: location.pathname
        });
      }
    });

    this._handleSelectedNetworkChange = this._handleSelectedNetworkChange.bind(this);
    this.getCurrentTimeNodeBlock = this.getCurrentTimeNodeBlock.bind(this);
  }

  isOnTimeNodeScreen() {
    return this.state.currentPath === '/timenode';
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

  /*
   * Checks if the TimeNode provider is different from the global
   * MetaMask provider.
   */
  checkSelectedProvider() {
    const { storageService, timeNodeStore } = this.props;

    const selectedProviderId = parseInt(storageService.load('selectedProviderId'));
    const selectedProviderUrl = storageService.load('selectedProviderUrl');

    if (selectedProviderId && selectedProviderUrl) {
      timeNodeStore.customProviderUrl = selectedProviderUrl;
      return selectedProviderId;
    }

    return DEFAULT_NETWORK_ID;
  }

  hasCustomProvider() {
    const selectedProviderId = parseInt(this.props.storageService.load('selectedProviderId'));

    return selectedProviderId === CUSTOM_PROVIDER_NET_ID;
  }

  _handleSelectedNetworkChange(event) {
    const selectedNetId = parseInt(event.target.value);

    if (selectedNetId === CUSTOM_PROVIDER_NET_ID) {
      const { jQuery } = window;
      jQuery('#customProviderModal').modal({
        show: true
      });

      return;
    }

    const { storageService, timeNodeStore } = this.props;

    const selectedProviderUrl = Networks[selectedNetId].endpoint;
    timeNodeStore.customProviderUrl = selectedProviderUrl;
    storageService.save('selectedProviderId', selectedNetId);
    storageService.save('selectedProviderUrl', selectedProviderUrl);

    // Reload the page so that the changes are refreshed
    if (isRunningInElectron()) {
      // Workaround for getting the Electron app to reload
      // since the regular reload results in a blank screen
      window.location.href = '/index.html';
    } else {
      window.location.reload();
    }
  }

  getCurrentTimeNodeBlock() {
    // If the current screen is the TimeNode
    if (this.isOnTimeNodeScreen()) {
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
      </span>
    );
  }
}

NetworkChooser.propTypes = {
  storageService: PropTypes.any,
  web3Service: PropTypes.any,
  timeNodeStore: PropTypes.any,
  history: PropTypes.object.isRequired
};

export default NetworkChooser;
