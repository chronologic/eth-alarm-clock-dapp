import React, { Component } from 'react';
import { Router } from 'react-router';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';
import { PacmanLoader } from 'react-spinners';

const loaderConfig = {
  color:'#21ffff'
}

const mineDestinations = {
  scheduler:{
    path: 'transactions',
    prop: 'newContract',
    logEvent:''
  }
}

@inject('web3Service')
@observer
class AwaitingMining extends Component {
  constructor(props){
    super(props);

    const { type } = this.props.match.params;

    this.state = {
      waitType: type,
      transactionHash: '',
      newContract: '',
      deploying: false,
      minning: false,
    }
  }

  async loadUp (){
    const { web3Service } = this.props;
    const { hash } = this.props.match.params;

    await web3Service.awaitInitialized();

    if (web3.isAddress(hash)) {
      this.state.newContract = hash;
    } else {
      this.state.transactionHash = hash;
    }

    if ( this.state.newContract ) {
        return this.next();
    }
  }

  getDestination () {
    const { type } = this.props.match.params;
    const { newContract } = this.state;
    return '/'+mineDestinations[type].path+'/'+this.state[mineDestinations[type].prop];
  }

  next (){
    const { history } = this.props;
    const destination = this.getDestination();
    history.push( {
      pathname: destination
    } );
  }

  async componentDidMount() {
    await this.loadUp();
  }

  render() {
    const { web3Service: { explorer } } = this.props;

    return (
      <div id="awaitingMining" className="container-fluid padding-25 sm-padding-10 horizontal-center">
        { this.state.deploying &&
          <h1 className="view-title">Deploying</h1>
        }
        { this.state.minning &&
          <h1 className="view-title">Awaiting Mining</h1>
        }
        { !this.state.deploying && !this.state.minning &&
          <h1 className="view-title"> ... </h1>
        }
        <div className='card card-body'>
          <div className='tabs-content'>
            <div className="loader">
              <PacmanLoader { ...Object.assign( { loading:true } ,loaderConfig) } />
            </div>
            { this.state.transactionHash &&
              <p className="horizontal-center">
                Transation Hash: <br/>
                <a target="_blank" href= { explorer+'/tx/' } > { this.state.transactionHash } </a>
              </p>
            }
            { this.state.newContract &&
              <p className="horizontal-center">
                Contract Address: <br/>
                <a target="_blank" href= { explorer+'/address/' } > { this.state.newContract } </a>
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
  transactionStore: PropTypes.any,
  match: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired
};


export default AwaitingMining;
