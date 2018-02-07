import React, { Component } from 'react';
import PropTypes from 'prop-types';
import SearchResult from './SearchResult';

class SearchOverlay extends Component {
  render() {
    const results = [
      {
        txHash: "0xasudbasidubasfafasd6s4d6asd45asd",
        txStatus: "Executed"
      },
      {
        txHash: "0x68asd1a8s6d1as68d1asa4s7898123",
        txStatus: "Scheduled"
      },
      {
        txHash: "0xASidnasodinOi123907adfoinoi123456",
        txStatus: "Executed"
      }
    ];

    return (
      <div id="searchOverlay" className="overlay" data-pages="search">
        <div className="overlay-content has-results m-t-20">
          <div className="container-fluid">
            <img className="overlay-brand" src="img/logo-black.png" alt="logo" data-src="img/logo-black.png" height="36" />
            <a href="#" className="close-icon-light overlay-close text-black fs-16" onClick={() => {this.props.updateSearchState(false)}}>
              <i className="pg-close"></i>
            </a>
          </div>
          <div className="container-fluid">
            <input id="overlay-search" className="no-border overlay-search bg-transparent" placeholder="Search..." autoComplete="off" spellCheck="false"/>
            <br/>
            <div className="inline-block">
              <div className="checkbox right">
                <input id="checkboxn" type="checkbox" value="1" defaultChecked="checked"/>
                <label htmlFor="checkboxn"><i className="fa fa-search"></i> Search within page</label>
              </div>
            </div>
            <div className="inline-block m-l-10">
              <p className="fs-13">Press enter to search</p>
            </div>
          </div>
          <div className="container-fluid">
            <div className="search-results m-t-40">
              <p className="bold">ETH Alarm Clock Search Results</p>
                {results.map((result, index) => 
                  <SearchResult
                    key={index}
                    txHash={result.txHash}
                    txStatus={result.txStatus}
                  />
                )}
            </div>
          </div>
        </div>
      </div>
    )
  }
}

SearchOverlay.propTypes = {
  updateSearchState: PropTypes.any
};

export default SearchOverlay;