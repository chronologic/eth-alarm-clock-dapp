import React, { Component } from 'react';
import PropTypes from 'prop-types';

class AwaitingMining extends Component {
  state = {}

  componentDidMount() {

  }

render() {
  return (

    <div id="awaitingMining" className="horizontal-center">

      <div className="progress-circle-indeterminate m-t-45"></div>
      <p className="horizontal-center">Awaiting Mining</p>

      <p className="horizontal-center">Transation Hash: <a href="#">{this.props.address}</a></p>

    </div>
  );
}
}

AwaitingMining.propTypes = {
  address: PropTypes.any
};

export default AwaitingMining;
