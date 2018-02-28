import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';
import Bb from 'bluebird';
import dayFaucetABI from '../../abi/dayFaucetABI';
import { showNotification } from '../../services/notification';

@inject('web3Service')
@observer
class Faucet extends Component {
    constructor(props) {
        super(props);
        this.useFaucet = this.useFaucet.bind(this);
    }

    state = {
        loaded: false,
        faucetAddress: '',
        faucetBalance: 0,
        waitTime: 3600,
        lastUsed: ''
    };

    instance = {}

    get networkHasFaucet() {
        return Boolean(this.state.faucetAddress && this.state.faucetAddress != '0x0');
    }

    get waitTimeLeft() {
        const now = new Date().getTime();
        const nextAvailableTIme = (this.state.lastUsed + this.state.waitTime) * 1000;
        return now > nextAvailableTIme ? 0 : nextAvailableTIme - now;
    }

    get isEligible() {
        return this.state.loaded && this.networkHasFaucet() && this.waitTimeLeft == 0;
    }

    startInterval() {
        const INTERVAL = 30000;
        this.interval = setInterval(() => this.loadInfo(), INTERVAL);
    }

    cancelInterval() {
        clearInterval(this.interval);
    }

    restartInterval() {
        this.cancelInterval();
        this.startInterval();
    }

    async loadInfo() {
        this.setState({ loaded: false });

        const { web3Service: { web3, accounts } } = this.props;
        const defaultAccount = accounts[0];

        this.instance = web3.eth.contract(dayFaucetABI).at(this.state.faucetAddress);
        console.log(this.state, dayFaucetABI, this.state.faucetAddress, this.instance);
        this.setState({
            faucetBalance: await Bb.fromCallback(callback => this.instance.getTokensBalance(callback)),
            lastUsed: await Bb.fromCallback(callback => this.instance.lastRequest(defaultAccount, callback)),
            waitTime: await Bb.fromCallback(callback => this.instance.waitTime(callback))
        });

        this.setState({ loaded: true });
    }

    useFaucet = () => async (event) => {
        const { target } = event;
        const { web3Service, web3Service: { explorer } } = this.props;
        const defaultAccount = web3Service.accounts[0];

        target.disabled = true;
        let transaction;
        try {
            transaction = await Bb.fromCallback(callback => this.instance.useFaucet({ from: defaultAccount }, callback));
            showNotification(`Transaction successful \r\n <a target="_blank" href="${explorer + 'tx/' + transaction}"> ${transaction}<a>`, 'success');
            await this.restartInterval();
        } catch (e) {
            showNotification(`Transaction Failed !!!`);
            console.error(e);
        }
    }

    async componentDidMount() {
        const { web3Service } = this.props;
        await web3Service.awaitInitialized();
        console.log(process.env.DAY_FAUCET_ADDRESS, web3Service.netId, JSON.parse(process.env.DAY_TOKEN_ADDRESS))
        this.state.faucetAddress = JSON.parse(process.env.DAY_TOKEN_ADDRESS)[web3Service.netId];
        await this.loadInfo();
        this.startInterval();
    }

    componentWillUnmount() {
        this.cancelInterval()
    }

    render() {

        return (
            <div id="faucet" className="container padding-25 sm-padding-10 horizontal-center">
                <div className='card card-body'>
                    <div className='tabs-content active'>
                        <button className='btn btn-primary btn-lg' disabled={this.loadInfo.isEligible} onClick={this.useFaucet} >
                            Get Testnet Day
                        </button>
                    </div>
                </div>
            </div>
        );
    }
}

Faucet.propTypes = {
    web3Service: PropTypes.any,
    history: PropTypes.object.isRequired
};

export default Faucet;