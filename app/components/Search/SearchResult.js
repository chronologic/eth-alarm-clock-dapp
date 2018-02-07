import React, { Component } from 'react';
import PropTypes from 'prop-types';

class SearchResult extends Component {

  constructor(props) {
    super(props);
    this.state = {
      txHash: props.txHash,
      txResolved: props.txResolved ? "Executed" : "Scheduled"
    };
  }

  render() {
    return (
      <div>
        <div className="thumbnail-wrapper d48 circular bg-primary text-black inline m-t-10">
          <div>{this.state.txResolved[0]}</div>
        </div>
        <div className="p-l-10 inline p-t-5">
          <h5 className="m-b-5">Transaction <span className="semi-bold result-name">{this.state.txHash}</span></h5>
          <p className="hint-text">{this.state.txResolved}</p>
        </div>
      </div>
    )
  }
}

SearchResult.propTypes = {
  txHash: PropTypes.string,
  txResolved: PropTypes.bool
};

export default SearchResult;