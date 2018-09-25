import React from 'react';
import PropTypes from 'prop-types';

class PoweredByEAC extends React.Component {
  render() {
    return (
      <div className={this.props.className}>
        <a href="http://www.ethereum-alarm-clock.com/ " target="_blank" rel="noopener noreferrer">
          <img
            src="img/powered-by-eac.svg"
            data="img/powered-by-eac.svg"
            alt="Powered by the Ethereum Alarm Clock"
            height="36"
          />
        </a>
      </div>
    );
  }
}

PoweredByEAC.propTypes = {
  className: PropTypes.string
};

export default PoweredByEAC;
