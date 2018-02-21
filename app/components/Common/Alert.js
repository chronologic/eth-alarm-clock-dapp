import React, { Component } from 'react';
import PropTypes from 'prop-types';

class Alert extends Component {
  render() {
    return (
      <div className="alert alert-danger" role="alert">
        <button className="close" data-dismiss="alert"></button>
        <strong>Error: </strong>{this.props.msg}
      </div>
    );
  }
}

Alert.propTypes = {
  msg: PropTypes.string
};

export default Alert;
