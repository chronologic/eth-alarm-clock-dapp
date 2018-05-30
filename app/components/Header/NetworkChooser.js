import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { observer, inject } from 'mobx-react';
import { Networks } from '../../config/web3Config';
import Cookies from 'js-cookie';

const CUSTOM_PROVIDER_NET_ID = 9999;
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
      if (selectedProviderId === CUSTOM_PROVIDER_NET_ID) {
        timeNodeStore.customProviderUrl = selectedProviderUrl;
      }
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
    const { timeNodeStore } = this.props;
    const customProviderUrl = 'http://localhost:8545';

    if (selectedNetId !== CUSTOM_PROVIDER_NET_ID) {
      Cookies.set('selectedProviderId', selectedNetId, { expires: 30 });
      Cookies.set('selectedProviderUrl', Networks[selectedNetId].endpoint, { expires: 30 });
    } else {
      timeNodeStore.customProviderUrl = customProviderUrl;
      Cookies.set('selectedProviderId', selectedNetId, { expires: 30 });
      Cookies.set('selectedProviderUrl', customProviderUrl, { expires: 30 });
    }

    // Reload the page so that the changes are refreshed
    window.location.reload();
  }

  render() {
    const { currentPath, timeNodeNetworkId, metaMaskNetworkId } = this.state;

    if (currentPath !== '/timenode') {
      return <span>{Networks[metaMaskNetworkId].name}</span>;
    }

    // Return this only if the user enters the TimeNode screen.
    return (
      <select value={timeNodeNetworkId} onChange={this._handleSelectedNetworkChange}>
        {Object.keys(Networks).map(index => (
          <option key={index} value={index}>
            {Networks[index].name}
          </option>
        ))}
        <option key={CUSTOM_PROVIDER_NET_ID} value={CUSTOM_PROVIDER_NET_ID}>
          Custom
        </option>
      </select>
    );
  }
}

NetworkChooser.propTypes = {
  web3Service: PropTypes.any,
  timeNodeStore: PropTypes.any,
  history: PropTypes.object.isRequired
};

export default NetworkChooser;
