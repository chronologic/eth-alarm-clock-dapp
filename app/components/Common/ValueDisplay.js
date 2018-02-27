import { Component } from 'react';
import PropTypes from 'prop-types';
import { inject } from 'mobx-react';

@inject('web3Service')
export class ValueDisplay extends Component {
  render() {
    const { priceInWei } = this.props;

    if (!priceInWei) {
      return null;
    }

    return this.props.web3Service.humanizeCurrencyDisplay(priceInWei);
  }
}

ValueDisplay.propTypes = {
  priceInWei: PropTypes.any,
  web3Service: PropTypes.any
};

export default ValueDisplay;