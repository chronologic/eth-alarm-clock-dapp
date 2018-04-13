import React, { Component } from 'react';
import PropTypes from 'prop-types';
import intl from 'react-intl-universal';

const Titles = {
  danger: intl.get('ALERTS.ERROR').d('Error'),
  info: intl.get('ALERTS.INFO').d('Info'),
  warning: intl.get('ALERTS.WARNING').d('Warning'),
  success: intl.get('ALERTS.SUCCESS').d('Done')
};

class Alert extends Component {
  render() {
    const type = this.props.type || 'danger';
    return (
      <div className={'alert alert-'+type} role='alert'>
        <button className='close' data-dismiss='alert'></button>
        <strong> {Titles[type]} </strong>{this.props.msg}
      </div>
    );
  }
}

Alert.propTypes = {
  msg: PropTypes.string,
  type: PropTypes.string
};

export default Alert;
