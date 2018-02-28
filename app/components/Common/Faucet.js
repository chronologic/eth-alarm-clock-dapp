import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';
import Bb from 'bluebird';
import dayFaucetABI from '../../abi/dayFaucetABI';
import { showNotification } from '../../services/notification';

const Eth = 1e+18;

@inject('web3Service')
@observer
class Faucet extends Component {
    constructor(props) {
        super(props);
        this.useFaucet = this.useFaucet.bind(this);
    }

    state = {
        loaded: false,
        defaultAccount: '',
        faucetAddress: '',
        faucetBalance: 0,
        waitTime: 3600,
        waitTimeLeft: 0,
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
        return this.state.loaded && this.networkHasFaucet && this.waitTimeLeft == 0;
    }

    get printWaitTime () {
        let waitMins = 0;
        let waitSecs = 0;
        const Min = 60 * 1000;
        const waitTimeLeft = this.state.waitTimeLeft;
        if (waitTimeLeft > 0) {
            waitMins = Math.floor(waitTimeLeft / Min);
            waitSecs = Math.ceil((waitTimeLeft % Min) / 1000);
            this.startWaitTimeTimeout();
        }
        return `${waitMins} min(s) : ${waitSecs} sec(s)`;
    }

    setWaitTime() {
        this.setState({ waitTimeLeft: this.waitTimeLeft });
    }

    startWaitTimeTimeout() {
        const TIMEOUT = 1000;
        this.timeout = setTimeout(() => this.setWaitTime(), TIMEOUT);
    }

    startInterval() {
        const INTERVAL = 30000;
        this.interval = setInterval(() => this.loadInfo(), INTERVAL);
    }

    cancelInterval() {
        clearInterval(this.interval);
        clearTimeout(this.timeout);
    }

    restartInterval() {
        this.cancelInterval();
        this.startInterval();
    }

    async loadInfo() {
        this.setState({ loaded: false });

        if (!this.state.faucetAddress) {
            return;
        }

        const { web3Service: { web3 } } = this.props;

        this.instance = web3.eth.contract(dayFaucetABI).at(this.state.faucetAddress);
        this.setState({
            faucetBalance: Number( await Bb.fromCallback(callback => this.instance.getTokensBalance(callback))),
            lastUsed: Number( await Bb.fromCallback(callback => this.instance.lastRequest(this.state.defaultAccount, callback))),
            waitTime: Number(await Bb.fromCallback(callback => this.instance.waitTime(callback))),
            allowedTokens: Number( await Bb.fromCallback(callback => this.instance.allowedTokens(callback)))
        });

        this.setWaitTime();
        this.setState({ loaded: true });
    }

    useFaucet = async (event) => {
        const { target } = event;
        const {  web3Service: { explorer } } = this.props;

        target.disabled = true;
        let transaction;
        try {
            transaction = await Bb.fromCallback(callback => this.instance.useFaucet({ from: this.state.defaultAccount }, callback));
            showNotification(`Transaction successful \r\n <a target='_blank' href='${explorer + 'tx/' + transaction}'> ${transaction}<a>`, 'success');
            await this.restartInterval();
        } catch (e) {
            showNotification(`Transaction Failed !!!`);
        }
    }

    async componentDidMount() {
        const { web3Service, web3Service: { accounts } } = this.props;
        await web3Service.awaitInitialized();
        this.state.defaultAccount = accounts[0];
        this.state.faucetAddress = JSON.parse(process.env.DAY_FAUCET_ADDRESS)[web3Service.netId];
        await this.loadInfo();
        this.startInterval();
    }

    componentWillUnmount() {
        this.cancelInterval();
    }

    render() {
        const { web3Service } = this.props;

        return (
            <div className='container padding-25 sm-padding-10 subsection'>
                <h1 className='view-title'>DAY Faucet </h1>
                <div className='card card-body'>
                    <div id='faucet' className='tabs-content horizontal-center'>
                        <div className='tab-pane active show padding-25'>
                            <div className='padding-25'>
                                <div className='row'>
                                    <div className='col-md-6 text-right'>
                                        <strong> Network |</strong>
                                    </div>
                                    <div className='col-md-6 text-left'>
                                        {web3Service.network}
                                    </div>
                                </div>
                                <div className='row'>
                                    <div className='col-md-6 text-right'>
                                        <strong> Faucet Address |</strong>
                                    </div>
                                    <div className='col-md-6 text-left'>
                                        {this.state.faucetAddress}
                                    </div>
                                </div>
                                <div className='row'>
                                    <div className='col-md-6 text-right'>
                                        <strong> Faucet Balance |</strong>
                                    </div>
                                    <div className='col-md-6 text-left'>
                                        {this.state.faucetBalance / Eth}
                                    </div>
                                </div>
                                <div className='row'>
                                    <div className='col-md-6 text-right'>
                                        <strong> Wallet Address |</strong>
                                    </div>
                                    <div className='col-md-6 text-left'>
                                        {this.state.defaultAccount}
                                    </div>
                                </div>
                                <div className='row'>
                                    <div className='col-md-6 text-right'>
                                        <strong> Remaining Wait Time |</strong>
                                    </div>
                                    <div className='col-md-6 text-left'>
                                        {this.printWaitTime}
                                    </div>
                                </div>
                            </div>
                            <button className='btn btn-primary btn-lg' disabled={!this.isEligible || this.state.faucetBalance < this.state.allowedTokens } onClick={this.useFaucet} >
                                Get Testnet Day
                            </button>
                        </div>
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