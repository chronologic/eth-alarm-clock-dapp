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
    const close = typeof this.props.close !== 'undefined' ? this.props.close : true;
    return (
      <div className={'alert alert-'+type} role='alert'>
        { close &&
          <button className='close' data-dismiss='alert'></button>        
        }
        <strong> {Titles[type]} </strong>{this.props.msg}
      </div>
    );
  }
}

Alert.propTypes = {
  msg: PropTypes.string,
  type: PropTypes.string,
  close: PropTypes.any
};

export default Alert;
