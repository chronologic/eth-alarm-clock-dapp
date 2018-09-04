import { Component } from 'react';
import PropTypes from 'prop-types';
import { inject } from 'mobx-react';

const ETHER_UNITS_VALUES_MAPPING = {
  WEI: 1,
  MWEI: 1000000,
  ETH: 1000000000000000000
};

@inject('web3Service')
export class ValueDisplay extends Component {
  render() {
    const { priceInWei } = this.props;

    if (!priceInWei) {
      return null;
    }

    return this._humanizeCurrencyDisplay(priceInWei);
  }

  /**
   * @private
   */
  _humanizeCurrencyDisplay(priceInWei) {
    let unit = 'ETH';

    if (!priceInWei) {
      return null;
    }

    const priceAsNumber = priceInWei.toNumber();

    let display = priceAsNumber;

    if (priceAsNumber < ETHER_UNITS_VALUES_MAPPING.MWEI && priceAsNumber > 0) {
      unit = 'WEI';
    } else {
      display = priceInWei.div(ETHER_UNITS_VALUES_MAPPING.ETH).toFixed();
      unit = 'ETH';
    }

    return `${display} ${unit}`;
  }
}

ValueDisplay.propTypes = {
  priceInWei: PropTypes.any,
  web3Service: PropTypes.any
};

export default ValueDisplay;
