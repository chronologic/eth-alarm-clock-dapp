import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';
import Alert from './Alert';
import { showNotification } from '../../services/notification';

@observer
class MetamaskComponent extends Component {

    showAlert (args) {
        return (
            <Alert {...args} />
        );
    }

    get isWeb3Viewable () {
        const { web3Service } = this.props;
        return ( web3Service.web3.isConnected() );
    }

    get isWeb3Usable() {
        const { web3Service } = this.props;
        return (web3Service.web3.isConnected() && typeof web3Service.accounts != 'undefined' && web3Service.accounts != null && web3Service.accounts.length > 0);
    }

    async resolveWeb3() {
        const { web3Service } = this.props;
        await web3Service.awaitInitialized();
        if (web3Service.web3.isConnected() && web3Service.connectedToMetaMask) {
            showNotification(`<b>Metamask connected</b>`, 'success');
            showNotification(`You are connected to ${ web3Service.network }`, 'info');
            if (web3Service.accounts.length < 1) {
                showNotification(`Kindly unlock your account or add new accounts to use this Dapp`, 'warning');
            }
        } else {
            showNotification(`<b>Metamask is not installed</b>`, undefined, undefined, false);
            showNotification(`<b>Metamask</b> is required to use this Dapp <a href='https://metamask.io' target='_blank' >https://metamask.io</a>`,'warning');
        }
    }

    componentDidMount () {
        this.resolveWeb3();
    }
}

MetamaskComponent.propTypes = {
    web3Service: PropTypes.object,
    history: PropTypes.any,
};

export default MetamaskComponent;