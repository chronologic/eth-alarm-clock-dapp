import React, { Component } from 'react';
import PropTypes from 'prop-types';

class TransactionNotFound extends Component {
  render() {
    const { address } = this.props;
    return (
      <div className="text-center">
        <h1 className="error-number">Oops!</h1>
        <h3 className="semi-bold mt-4">
          The scheduled transaction <div className="text-grey bold">{address}</div> does not exist.
        </h3>

        <div className="pb-4 mt-4">
          If you feel like the transaction should exist, please try changing the provider
          you&apos;re using.<br />Alternatively you can refresh the page in some time.
        </div>
      </div>
    );
  }
}

TransactionNotFound.propTypes = {
  address: PropTypes.any
};

export default TransactionNotFound;
