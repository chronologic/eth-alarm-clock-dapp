import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { inject } from 'mobx-react';
import SearchResult from './SearchResult';

@inject('transactionStore')
class SearchOverlay extends Component {

  _isMounted = false;

  constructor(props) {
    super(props);
    this.state = {
      limit: 10,
      transactions: []
    }
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  componentDidMount() {
    this._isMounted = true;
  }

  async fetchData() {
    return await this.props.transactionStore.getAllTransactions();        
  }

  async loadPage(page) {
    const offset = (page - 1) * this.state.limit;

    this.setState({
      fetchingTransactions: true
    });

    const { total, transactions } = await this.fetchData();

    if (!this._isMounted) {
      return;
    }

    this.setState({
      currentPage: page,
      transactions,
      offset,
      total,
      fetchingTransactions: false
    });
  }

  async componentWillMount() {
    await this.loadPage(1);
  }

  render() {
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
                {this.state.transactions.map((result, index) => 
                  <SearchResult
                    key={index}
                    txHash={result.instance.address}
                    txResolved={result.resolved}
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
  updateSearchState: PropTypes.any,
  transactionStore: PropTypes.any
};

export default SearchOverlay;