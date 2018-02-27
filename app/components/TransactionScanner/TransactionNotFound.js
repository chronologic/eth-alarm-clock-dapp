import React, { Component } from 'react';
import PropTypes from 'prop-types';

class TransactionNotFound extends Component {
  render() {
    const { address } = this.props;
    return (
      <div className="card no-border">
        <div className="card-body absolute-center">
          <span>
            <h1 className="error-number">Oops!</h1>
            <h2 className="semi-bold">The scheduled transaction <div className="text-grey bold">{address}</div> does not exist.</h2>
          </span>
        </div>
      </div>
    );
  }
}

TransactionNotFound.propTypes = {
  address: PropTypes.any
};

export default TransactionNotFound;
