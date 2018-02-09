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
    this.props = Object.assign({},this.props,props);

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
    console.log(history,Router,Router.history)
    const { query } = Router;
    if(!query){
      //history.goBack();
      return;
    }
    let { query:{ newContract,transactionHash,destination } } = Router;
    if((!newContract && !transactionHash) || !destination){
      //history.goBack();
      return;
    }

    this.setState(Object.assign(this.state,{ newContract:newContract,transactionHash:transactionHash,destination:destination }));
    await this.loadUp();
  }

render() {
  return (

    <div id="awaitingMining" className="container-fluid padding-25 sm-padding-10 horizontal-center">
      <h1 className="view-title">...</h1>
      <div className='card card-body'>
        <div className='tabs-content'>
          <div className="loader">
            <PacmanLoader {...Object.assign({ loading:true },loaderConfig)} />
          </div>
          <p className="horizontal-center">Awaiting Mining</p>

          <p className="horizontal-center">Transation Hash: <a href="#">{this.state.transactionHash}</a></p>
        </div>
      </div>
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
