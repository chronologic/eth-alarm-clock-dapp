import React, { Component } from 'react';

class AwaitingMining extends Component {
  state = {}

  componentDidMount() {

  }

render() {
  return (

    <div id="awaitingMining" className="horizontal-center">

      <div className="progress-circle-indeterminate m-t-45"></div>
      <p className="horizontal-center">Awaiting Mining</p>

      <p className="horizontal-center">Transation Hash: <a href="#">0x56as51d6as51d6as5d1a6sdsa61d6as81d</a></p>
      
    </div>
  );
}
}

export default AwaitingMining;