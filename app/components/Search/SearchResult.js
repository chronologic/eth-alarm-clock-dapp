import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

class SearchResult extends Component {

  constructor(props) {
    super(props);
    this.state = {
      txAddress: props.txAddress,
      txStatus: props.txStatus
    };
  }

  render() {
    return (
      <div>
        <div className="thumbnail-wrapper d48 circular bg-primary text-black inline m-t-10">
          <div>{this.state.txStatus[0]}</div>
        </div>
        <div className="p-l-10 inline p-t-5">
          <h5 className="m-b-5">
            <span>Transaction </span>
            <Link to={`/transactions/${this.state.txAddress}`}
              className="semi-bold result-name"
              onClick={() => {this.props.updateSearchState(false)}}>
              {this.state.txAddress}
            </Link>
          </h5>
          <p className="hint-text">{this.state.txStatus}</p>
        </div>
      </div>
    )
  }
}

SearchResult.propTypes = {
  txAddress: PropTypes.string,
  txStatus: PropTypes.string,
  updateSearchState: PropTypes.any
};

export default SearchResult;