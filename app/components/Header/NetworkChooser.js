import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { observer, inject } from 'mobx-react';
import { Networks, CUSTOM_PROVIDER_NET_ID } from '../../config/web3Config';
import Cookies from 'js-cookie';
import { isRunningInElectron } from '../../lib/electron-util';

const DEFAULT_NETWORK_ID = Networks[0].id;

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
    await web3Service.awaitInitialized();

    if (web3Service.network.id !== this.state.metaMaskNetworkId)
      this.setState({ metaMaskNetworkId: web3Service.network.id });

    if (!Cookies.get('selectedProviderId')) {
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
    const selectedProviderId = parseInt(Cookies.get('selectedProviderId'));
    const selectedProviderUrl = Cookies.get('selectedProviderUrl');

    const { timeNodeStore } = this.props;

    if (selectedProviderId && selectedProviderUrl) {
      timeNodeStore.customProviderUrl = selectedProviderUrl;
      return selectedProviderId;
    }

    return DEFAULT_NETWORK_ID;
  }

  hasCustomProvider() {
    const selectedProviderId = parseInt(Cookies.get('selectedProviderId'));
    return selectedProviderId === CUSTOM_PROVIDER_NET_ID;
  }

  _handleSelectedNetworkChange(event) {
    const selectedNetId = parseInt(event.target.value);

    if (selectedNetId !== CUSTOM_PROVIDER_NET_ID) {
      const selectedProviderUrl = Networks[selectedNetId].endpoint;
      this.props.timeNodeStore.customProviderUrl = selectedProviderUrl;
      Cookies.set('selectedProviderId', selectedNetId, { expires: 30 });
      Cookies.set('selectedProviderUrl', selectedProviderUrl, { expires: 30 });

      // Reload the page so that the changes are refreshed
      if (!isRunningInElectron()) {
        window.location.reload();
      } else {
        window.location.href = 'http://localhost:8080/timenode?mode=electron';
      }
    } else {
      const { jQuery } = window;
      jQuery('#customProviderModal').modal({
        show: true
      });
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
  web3Service: PropTypes.any,
  timeNodeStore: PropTypes.any,
  history: PropTypes.object.isRequired
};

export default NetworkChooser;
