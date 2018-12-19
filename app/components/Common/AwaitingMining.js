import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';
// import Coder from 'web3/lib/solidity/coder';
import { PacmanLoader } from 'react-spinners';
import { Constants } from '@ethereum-alarm-clock/lib';

const loaderConfig = {
  color: '#21ffff'
};

const mineDestinations = {
  scheduler: {
    path: 'transactions',
    prop: 'newContract',
    logEventHex: Constants.NEWREQUESTLOG,
    logEventTypes: ['address'],
    nextParameterPosition: 0
  }
};

const REQUIRED_CONFIRMATIONS = 1;

@inject('web3Service')
@observer
class AwaitingMining extends Component {
  _isMounted = false;

  constructor(props) {
    super(props);

    this.state = {
      confirmations: 0,
      transactionHash: '',
      newContract: '',
      deploying: false
    };
  }

  async loadUp() {
    const { match, web3Service } = this.props;
    const { hash, type } = match.params;

    let unmined = true;
    let unconfirmed = true;

    await web3Service.init();

    if (!this._isMounted) {
      return;
    }

    if (web3Service.web3.utils.isAddress(hash)) {
      this.setState({ newContract: hash });
    } else {
      this.setState({ transactionHash: hash });
    }

    if (this.state.newContract) {
      return this.next();
    }

    const { transactionHash } = this.state;

    if (!transactionHash) {
      return;
    }

    while (unmined) {
      let txReceipt = await web3Service.fetchReceipt(transactionHash);

      unmined = !txReceipt;

      this.setState({
        deploying: unmined
      });

      if (unmined) {
        await web3Service.trackTransaction(transactionHash);
      }

      while (unconfirmed) {
        const confirmations = await web3Service.fetchConfirmations(transactionHash);

        this.setState({ confirmations });

        if (confirmations >= REQUIRED_CONFIRMATIONS) {
          unconfirmed = false;
        }
      }
    }

    if (mineDestinations[type].logEventTypes && mineDestinations[type].logEventHex) {
      const log = await web3Service.fetchLog(transactionHash, mineDestinations[type].logEventHex);
      const data = log.data.substring(2);
      // console.log(data);
      // console.log(mineDestinations[type].logEventTypes);
      const args = data; //Coder.decodeParams(mineDestinations[type].logEventTypes, data);
      let newSate = {};
      newSate[mineDestinations[type].prop] = args[mineDestinations[type].nextParameterPosition];
      this.setState(newSate);
    }

    this.next();
  }

  getDestination() {
    const { type } = this.props.match.params;
    return '/' + mineDestinations[type].path + '/' + this.state[mineDestinations[type].prop];
  }

  next() {
    const { history } = this.props;
    const destination = this.getDestination();
    history.push({
      pathname: destination
    });
  }

  async componentDidMount() {
    this._isMounted = true;

    await this.loadUp();
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  render() {
    const {
      web3Service: { explorer }
    } = this.props;
    const { confirmations, transactionHash, newContract } = this.state;

    return (
      <div id="awaitingMining" className="container padding-25 sm-padding-10 horizontal-center">
        {this.state.deploying && <h1 className="view-title">Deploying</h1>}
        {!this.state.deploying && <h1 className="view-title"> ... </h1>}
        <div className="card card-body">
          <div className="tabs-content">
            <div className="loader">
              <PacmanLoader {...Object.assign({ loading: true }, loaderConfig)} />
            </div>
            <div>
              Confirmations: {Math.min(Math.max(confirmations, 0), REQUIRED_CONFIRMATIONS)} of{' '}
              {REQUIRED_CONFIRMATIONS}
            </div>
            <br />
            {this.state.transactionHash && (
              <p className="horizontal-center">
                Transaction Hash: <br />
                <a
                  target="_blank"
                  href={explorer + '/tx/' + transactionHash}
                  rel="noopener noreferrer"
                >
                  {' '}
                  {this.state.transactionHash}{' '}
                </a>
              </p>
            )}
            {this.state.newContract && (
              <p className="horizontal-center">
                Contract Address: <br />
                <a
                  target="_blank"
                  href={explorer + '/address/' + newContract}
                  rel="noopener noreferrer"
                >
                  {' '}
                  {this.state.newContract}{' '}
                </a>
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }
}

AwaitingMining.propTypes = {
  match: PropTypes.any,
  web3Service: PropTypes.any,
  transactionStore: PropTypes.any,
  history: PropTypes.object.isRequired
};

export default AwaitingMining;
