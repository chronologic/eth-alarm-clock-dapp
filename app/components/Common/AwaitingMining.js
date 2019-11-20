import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';
import { PacmanLoader } from 'react-spinners';

const loaderConfig = {
  color: '#21ffff'
};

const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

@inject('transactionStore')
@inject('web3Service')
@observer
class AwaitingMining extends Component {
  _isMounted = false;

  constructor(props) {
    super(props);

    this.state = {
      transactionHash: ''
    };
  }

  async loadUp() {
    const { match, web3Service, transactionStore, history } = this.props;
    const { hash } = match.params;

    await web3Service.init();

    if (!this._isMounted) {
      return;
    }

    this.setState({ transactionHash: hash });

    if (!hash) {
      return;
    }

    const txReceipt = await web3Service.waitForMining(hash);
    await wait(5000);

    const requestAddress = transactionStore.getAndSaveRequestFromLogs(txReceipt.logs);

    history.push(`/transactions/${requestAddress}`);
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
    const { transactionHash } = this.state;

    return (
      <div id="awaitingMining" className="container padding-25 sm-padding-10 horizontal-center">
        <h1 className="view-title">Deploying</h1>
        <div className="card card-body">
          <div className="tabs-content">
            <div className="loader">
              <PacmanLoader {...Object.assign({ loading: true }, loaderConfig)} />
            </div>
            {transactionHash && (
              <p className="horizontal-center">
                Transaction Hash: <br />
                <a
                  target="_blank"
                  href={explorer + '/tx/' + transactionHash}
                  rel="noopener noreferrer"
                >
                  {' '}
                  {transactionHash}{' '}
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
