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
    const close = typeof this.props.close !== 'undefined' ? this.props.close : true;
    const callToAction = this.props.action || null;
    return (
      <div className={'d-flex flex-nowrap alert alert-' + type} role="alert">
        <div className="d-flex flex-wrap flex-stretch flex-sm-nowrap justify-content-center justify-content-sm-start align-items-center ">
          <div className="flex-stretch">
            <strong> {Titles[type]} </strong>
            {this.props.msg}
          </div>
          {callToAction && (
            <div className="d-inline-block ml-0 ml-sm-2 mt-2 mt-sm-0">{callToAction}</div>
          )}
        </div>
        <div>{close && <button className="close" data-dismiss="alert" />}</div>
      </div>
    );
  }
}

Alert.propTypes = {
  msg: PropTypes.string,
  type: PropTypes.string,
  close: PropTypes.any,
  action: PropTypes.any
};

export default Alert;
