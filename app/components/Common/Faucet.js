import React from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';
import Bb from 'bluebird';
import { BeatLoader } from 'react-spinners';
import { showNotification } from '../../services/notification';
import MetamaskComponent from '../Common/MetamaskComponent';

const Eth = 1e18;

@inject('web3Service')
@observer
class Faucet extends MetamaskComponent {
  constructor(props) {
    super(props);
    this.useFaucet = this.useFaucet.bind(this);
  }

  state = {
    loaded: false,
    defaultAccount: '',
    faucetAddress: '',
    dayTokenAddress: '',
    faucetBalance: 0,
    waitTime: 3600,
    waitTimeLeft: 0,
    lastUsed: ''
  };

  instance = {};

  get networkHasFaucet() {
    return Boolean(this.state.faucetAddress && this.state.faucetAddress != '0x0');
  }

  get waitTimeLeft() {
    const now = new Date().getTime();
    const nextAvailableTIme = (this.state.lastUsed + this.state.waitTime) * 1000;
    return now > nextAvailableTIme ? 0 : nextAvailableTIme - now;
  }

  get isEligible() {
    return (
      this.isWeb3Usable &&
      this.state.loaded &&
      this.networkHasFaucet &&
      this.state.defaultAccount &&
      this.waitTimeLeft == 0
    );
  }

  get printWaitTime() {
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
    const { web3Service } = this.props;
    await web3Service.init();

    const { accounts } = web3Service;
    this.setState({
      defaultAccount: accounts[0],
      faucetAddress: web3Service.network.dayFaucetAddress,
      dayTokenAddress: web3Service.network.dayTokenAddress
    });

    if (!this.isWeb3Usable || !this.state.faucetAddress) {
      return;
    }

    const {
      web3Service: { web3 }
    } = this.props;

    const faucetAbi = web3Service.network.dayFaucetAbi;
    this.instance = web3.eth.contract(faucetAbi).at(this.state.faucetAddress);

    this.setState({
      faucetBalance: Number(
        await Bb.fromCallback(callback => this.instance.getTokensBalance(callback))
      ),
      lastUsed: Number(
        await Bb.fromCallback(callback =>
          this.instance.lastRequest(this.state.defaultAccount, callback)
        )
      ),
      waitTime: Number(await Bb.fromCallback(callback => this.instance.waitTime(callback))),
      allowedTokens: Number(
        await Bb.fromCallback(callback => this.instance.allowedTokens(callback))
      )
    });

    this.setWaitTime();
    this.setState({ loaded: true });
  }

  useFaucet = async event => {
    const { target } = event;
    const {
      web3Service: { explorer }
    } = this.props;

    target.disabled = true;
    let transaction;
    try {
      transaction = await Bb.fromCallback(callback =>
        this.instance.useFaucet({ from: this.state.defaultAccount }, callback)
      );
      showNotification(
        `Transaction successful \r\n <a target='_blank' href='${explorer +
          'tx/' +
          transaction}'> ${transaction}<a>`,
        'success'
      );
      await this.restartInterval();
    } catch (e) {
      showNotification(`The transaction was unsuccessful.`);
    }
  };

  hrefProps() {
    return {
      target: '_blank',
      rel: 'noopener noreferrer'
    };
  }

  async componentDidMount() {
    super.componentDidMount();
    await this.loadInfo();
    this.startInterval();
  }

  componentWillUnmount() {
    super.componentWillUnmount();
    this.cancelInterval();
  }

  render() {
    const { web3Service } = this.props;
    const explorer = web3Service.explorer;

    const dayTokenAddressProps = this.hrefProps();
    const faucetAddressProps = this.hrefProps();
    const yourAddressProps = this.hrefProps();

    if (explorer) {
      dayTokenAddressProps.href = explorer + 'address/' + this.state.dayTokenAddress;
      faucetAddressProps.href = explorer + 'address/' + this.state.faucetAddress;
      yourAddressProps.href = explorer + 'address/' + this.state.defaultAccount;
    }

    return (
      <div className="container subsection">
        <h1 className="view-title">DAY Token Faucet</h1>
        <div className="card card-body">
          <div id="faucet" className="tab-content">
            <div className="tab-pane active show">
              <p>Get test DAY tokens on a testnet of your choice.</p>

              <div className="row">
                <div className="col-md-8 offset-md-2">
                  <div className="row my-3">
                    <div className="col-md-6 text-sm-right">
                      <strong>Testnet Network</strong>
                    </div>
                    <div className="col-md-6 text-left">
                      {this.state.loaded || web3Service.network ? (
                        web3Service.network.name
                      ) : (
                        <BeatLoader />
                      )}
                    </div>
                  </div>

                  <div className="row my-3">
                    <div className="col-md-6 text-sm-right">
                      <strong>Token Address</strong>
                    </div>
                    <div className="col-md-6 text-left">
                      {this.state.loaded || this.state.dayTokenAddress ? (
                        <a {...dayTokenAddressProps}>{this.state.dayTokenAddress}</a>
                      ) : (
                        <BeatLoader />
                      )}
                    </div>
                  </div>

                  <div className="row my-3">
                    <div className="col-md-6 text-sm-right">
                      <strong>Faucet Address</strong>
                    </div>
                    <div className="col-md-6 text-left">
                      {this.state.loaded || this.state.faucetAddress ? (
                        <a {...faucetAddressProps}>{this.state.faucetAddress}</a>
                      ) : (
                        <BeatLoader />
                      )}
                    </div>
                  </div>

                  <div className="row my-3">
                    <div className="col-md-6 text-sm-right">
                      <strong>Faucet Balance</strong>
                    </div>
                    <div className="col-md-6 text-left">
                      {this.state.loaded ||
                      (this.state.faucetAddress &&
                        typeof this.state.faucetBalance !== 'undefined') ? (
                        this.state.faucetBalance > 0 ? (
                          this.state.faucetBalance / Eth
                        ) : (
                          0
                        )
                      ) : (
                        <BeatLoader />
                      )}
                    </div>
                  </div>

                  <div className="row my-3">
                    <div className="col-md-6 text-sm-right">
                      <strong>Your Wallet Address</strong>
                    </div>
                    <div className="col-md-6 text-left">
                      {this.state.loaded || this.state.defaultAccount ? (
                        <a {...yourAddressProps}>{this.state.defaultAccount}</a>
                      ) : (
                        <BeatLoader />
                      )}
                    </div>
                  </div>

                  <div className="row my-3">
                    <div className="col-md-6 text-sm-right">
                      <strong>Remaining Wait Time</strong>
                    </div>
                    <div className="col-md-6 text-left">
                      {this.state.loaded ||
                      (this.state.defaultAccount && typeof this.state.lastUsed !== 'undefined') ? (
                        this.printWaitTime
                      ) : (
                        <BeatLoader />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <button
              className="btn btn-primary pull-right btn-lg"
              disabled={!this.isEligible || this.state.faucetBalance < this.state.allowedTokens}
              onClick={this.useFaucet}
            >
              Get Testnet DAY
            </button>
          </div>
        </div>
      </div>
    );
  }
}

Faucet.propTypes = {
  web3Service: PropTypes.any
};

export default Faucet;
