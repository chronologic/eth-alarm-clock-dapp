import React, { Component } from 'react';

class AwaitingMining extends Component {
  state = {}
  constructor(props){
    super(props);
  }

render() {
  const props = this.props;
  return (

    <div id="awaitingMining" className="horizontal-center">

      <div className="progress-circle-indeterminate m-t-45"></div>
      <p className="horizontal-center">Awaiting Mining</p>

      <p className="horizontal-center">Transation Hash: <a href="#">{props.address}</a></p>

    </div>
  );
}
}



export default AwaitingMining;
