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
    const callToAction = this.props.action || null;
    return (
      <div className={' d-flex flex-nowrap alert alert-'+type} role='alert'>
        <div className='d-flex flex-wrap flex-strech flex-sm-nowrap justify-content-center justify-content-sm-start align-items-center '>
          <div className='flex-strech'>
            <strong> {Titles[type]} </strong>{this.props.msg}
          </div>
          {callToAction &&
            <div className='d-inline-block ml-2' >
              {callToAction}
            </div>
          }
        </div>
        <div>
          {close &&
            <button className='close' data-dismiss='alert'></button>
          }
        </div>
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
