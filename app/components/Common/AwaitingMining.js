import React, { Component } from 'react';
//import PropTypes from 'prop-types';
import { Router, history } from 'react-router';
import { PacmanLoader } from 'react-spinners';


const loaderConfig = {
  color:'#21ffff'
}

class AwaitingMining extends Component {
  constructor(props){
    super(props);
    this.props = Object.assign(this.props,props);

    this.state = {
      transactionHash:'',
      newContract: '',
      destination:'',
      deploying:true,
      minning:false,
    }

  }

  async loadUp (){


  }

  next (){
    const { destination } = this.state;
    let that = this;
    const PROPERTIES = ['transactionHash','newContract','destination'];
    const query = PROPERTIES.reduce((result, name) => {
      result[name] = that.state[name];
      return result;
    }, {});

    Router.push({
      pathname: destination,
      query,
    });
  }

  async componentDidMount() {
    let { query:{ newContract,transactionHash,destination } } = Router;
    if((!newContract && !transactionHash) || !destination)
      history.goBack();

    this.setState(Object.assign(this.state,{ newContract:newContract,transactionHash:transactionHash,destination:destination }));
    await this.loadUp();
  }

render() {
  return (

    <div id="awaitingMining" className="horizontal-center">

      <div className="progress-circle-indeterminate m-t-45"></div>
      <PacmanLoader {...Object.assign({ loading:true },loaderConfig)}/>
      <p className="horizontal-center">Awaiting Mining</p>

      <p className="horizontal-center">Transation Hash: <a href="#">{this.state.transactionHash}</a></p>

    </div>
  );
}
}

AwaitingMining.propTypes = {
  //contractAddress: PropTypes.any
  //transactionHash: PropTypes.any
  //destination: PropTypes.any
};

export default AwaitingMining;
