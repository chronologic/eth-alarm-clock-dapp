import React from 'react';
import PropTypes from 'prop-types';
import { Image } from './Image';

class PoweredByEAC extends React.Component {
  render() {
    return (
      <div className={this.props.className}>
        <a href="https://github.com/ethereum-alarm-clock" target="_blank" rel="noopener noreferrer">
          <Image src="img/powered-by-eac.svg" alt="logo" height="36" />
        </a>
      </div>
    );
  }
}

PoweredByEAC.propTypes = {
  className: PropTypes.string
};

export default PoweredByEAC;
