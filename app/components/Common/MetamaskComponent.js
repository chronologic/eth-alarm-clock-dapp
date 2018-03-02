import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';
import Alert from './Alert';
import { showNotification } from '../../services/notification';
import Cookies from 'js-cookie';

@observer
class MetamaskComponent extends Component {

  state = {
    accounts: ''
  }

  showAlert(args) {
    return (
      <Alert {...args} />
    );
  }

  get isWeb3Viewable() {
    return this.props.web3Service.web3.isConnected();
  }

  get isWeb3Usable() {
    const { web3Service } = this.props;
    return (web3Service.web3.isConnected() && typeof web3Service.accounts !== 'undefined' && web3Service.accounts !== null && web3Service.accounts.length > 0);
  }

  runNotifications () {
    const { web3Service } = this.props;
    /*
 * Detects if the Metamask state (installed/not installed)
 * has changed since the last page refresh/state change.
 * - Shows the notification only if the state has changed since previous load.
 * - Uses cookies to save the states
 */
    const metamaskInstalled = web3Service.web3.isConnected() && web3Service.connectedToMetaMask;
    const hasPreviousMetamaskState = Cookies.get('metamaskInstalled') !== undefined;
    const previousMetamaskState = Cookies.get('metamaskInstalled') === 'true';
    const hasChangedMetamaskState = metamaskInstalled !== previousMetamaskState;

    if (!hasPreviousMetamaskState || hasChangedMetamaskState) {
      if (metamaskInstalled) {
        showNotification(`<b>Metamask connected</b>`, 'success');
        showNotification(`You are connected to ${web3Service.network}`, 'info');
      } else {
        showNotification(`<b>Metamask is not installed</b>`, undefined, undefined, undefined, false);
        showNotification(`<b>Metamask</b> is required to use this Dapp <a href='https://metamask.io' target='_blank' >https://metamask.io</a>`, 'warning');
      }
      Cookies.set('metamaskInstalled', metamaskInstalled, { expires: 30 });
    }

    /*
     * Detects if the Metamask wallet is unlocked.
     * - Shows the notification only if the state has changed since previous load.
     * - Uses cookies to save the states
     */
    const metamaskUnlocked = web3Service.accounts && web3Service.accounts.length > 0;
    const previousMetamaskUnlocked = Cookies.get('metamaskUnlocked') === 'true';
    const hasChangedMetamaskUnlocked = metamaskUnlocked !== previousMetamaskUnlocked;

    if (metamaskInstalled && hasChangedMetamaskUnlocked) {
      if (!metamaskUnlocked) {
        showNotification(`Kindly unlock your account or add new accounts to use this Dapp`, 'warning');
      }
      Cookies.set('metamaskUnlocked', metamaskUnlocked, { expires: 30 });
    }
  }

  async scoutUpdates () {
    const SCOUT_TIMEOUT = 1000;
    const { web3Service } = this.props;
    await web3Service.getAccountUpdates();
    const accountsChanged = this.state.accounts.length !== web3Service.accounts.length || (this.state.accounts.length > 0 && this.state.accounts[0] !== web3Service.accounts[0]);
    if (accountsChanged) {
      this.setState({ accounts: web3Service.accounts });
      showNotification(`Accounts updated`, 'info');
    }
    this.timeout = setTimeout ( () => this.scoutUpdates(), SCOUT_TIMEOUT );
    this.runNotifications();
  }

  async resolveWeb3() {
    const { web3Service } = this.props;
    await web3Service.awaitInitialized();
    this.setState({ accounts: web3Service.accounts });
    this.scoutUpdates();
    this.runNotifications();
  }

  componentDidMount() {
    this.resolveWeb3();
  }

  componentWillUnmount() {
    clearTimeout(this.timeout);
  }
}

MetamaskComponent.propTypes = {
  web3Service: PropTypes.object,
  history: PropTypes.any,
};

export default MetamaskComponent;