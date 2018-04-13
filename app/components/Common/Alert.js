import React, { Component } from 'react';
import PropTypes from 'prop-types';

const Titles = {
  danger: 'Error',
  info: 'Info',
  warning: 'Warning',
  success: 'Done'
};

class Alert extends Component {
  render() {
    const type = this.props.type || 'danger';
    return (
      <div className={'alert alert-' + type} role="alert">
        <button className="close" data-dismiss="alert" />
        <strong> {Titles[type]} </strong>
        {this.props.msg}
      </div>
    );
  }
}

Alert.propTypes = {
  msg: PropTypes.string,
  type: PropTypes.string
};

export default Alert;
