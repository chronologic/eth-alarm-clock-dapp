import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';
import { services } from '../../services';
import Coder from 'web3/lib/solidity/coder';
import { PacmanLoader } from 'react-spinners';

const loaderConfig = {
  color: '#21ffff'
};

const mineDestinations = {
  scheduler: {
    path: 'transactions',
    prop: 'newContract',
    logEventHex: services.eacService.Constants.NEWREQUESTLOG,
    logEventTypes: ['address'],
    nextParameterPosition: 0
  }
};

@inject('web3Service')
@observer
class AwaitingMining extends Component {
  constructor(props) {
    super(props);

    const { type } = this.props.match.params;

    this.state = {
      waitType: type,
      transactionHash: '',
      newContract: '',
      deploying: false,
      minning: false,
    };
  }

  async loadUp() {
    const { web3Service } = this.props;
    const { web3Service: { web3 } } = this.props;
    const { hash, type } = this.props.match.params;
    let unmined = true;
    let unconfirmed = true;

    await web3Service.awaitInitialized();

    if (web3.isAddress(hash)) {
      this.setState({ newContract: hash });
    } else {
      this.setState({ transactionHash: hash });
    }

    if (this.state.newContract) {
      return this.next();
    }

    if (this.state.transactionHash) {
      const { transactionHash } = this.state;

      while (unmined) {
        let txReceipt = await web3Service.fetchReceipt(transactionHash);
        if (!txReceipt) {
          this.setState({ deploying: true });
          await web3Service.trackTransaction(transactionHash);
        } else {
          this.setState({ deploying: false });
          unmined = false;
        }
      }

      while (unconfirmed) {
        const confirmations = await web3Service.fetchConfirmations(transactionHash);
        if (confirmations < 2) {
          this.setState({ minning: true });
        } else {
          this.setState({ minning: false });
          unconfirmed = false;
        }
      }

      if (mineDestinations[type].logEventTypes && mineDestinations[type].logEventHex) {
        const log = await web3Service.fetchLog(transactionHash, mineDestinations[type].logEventHex);
        const data = log.data.substring(2);//truncate data for decoding
        const args = Coder.decodeParams(mineDestinations[type].logEventTypes, data);
        let newSate = {};
        newSate[mineDestinations[type].prop] = args[mineDestinations[type].nextParameterPosition];
        this.setState(newSate);
      }

      this.next();
    }
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
    await this.loadUp();
  }

  render() {
    const { web3Service: { explorer } } = this.props;
    const { transactionHash,newContract } = this.state;

    return (
      <div id="awaitingMining" className="container padding-25 sm-padding-10 horizontal-center">
        {this.state.deploying &&
          <h1 className="view-title">Deploying</h1>
        }
        {this.state.minning &&
          <h1 className="view-title">Awaiting Mining</h1>
        }
        {!this.state.deploying && !this.state.minning &&
          <h1 className="view-title"> ... </h1>
        }
        <div className='card card-body'>
          <div className='tabs-content'>
            <div className="loader">
              <PacmanLoader {...Object.assign({ loading: true }, loaderConfig)} />
            </div>
            {this.state.transactionHash &&
              <p className="horizontal-center">
                Transation Hash: <br />
              <a target="_blank" href={explorer + '/tx/' + transactionHash } > {this.state.transactionHash} </a>
              </p>
            }
            {this.state.newContract &&
              <p className="horizontal-center">
                Contract Address: <br />
              <a target="_blank" href={explorer + '/address/' + newContract } > {this.state.newContract} </a>
              </p>
            }
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
