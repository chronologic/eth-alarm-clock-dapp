import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { observer, inject } from 'mobx-react';
import SearchResult from './SearchResult';

@observer
@inject('transactionStore')
class SearchOverlay extends Component {

  constructor(props) {
    super(props);
    this.state = {
      transactions: [],
      filter: '',
      fetchedTransactions: false
    };
  }

  async componentDidMount() {
    await this.props.transactionStore.getAllTransactions();

    this.setState({
      fetchedTransactions: true
    });
  }

  filter(e) {
    this.props.transactionStore.filter = e.target.value;
    this.forceUpdate();
  }

  render() {
    let filter = "";
    let filteredTransactions = [];

    if (this.state.fetchedTransactions) {
      filter = this.props.transactionStore.filter;
      filteredTransactions = this.props.transactionStore.filteredTransactions;
    }

    const shortList = filteredTransactions.slice(0, 4);

    const transactionsList = shortList.map(transaction => 
      <SearchResult
        key={transaction.instance.address}
        txHash={transaction.instance.address}
        txResolved={transaction.resolved}
      />
    );

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
            <input id="overlay-search" 
              className="no-border overlay-search bg-transparent" 
              placeholder="Search..." 
              autoComplete="off" 
              spellCheck="false"
              value={filter || ''}
              onChange={this.filter.bind(this)}
              autoFocus/>
          </div>
          <div className="container-fluid">
            <div className="search-results m-t-40">
              <p className="bold">ETH Alarm Clock - Search Results</p>
                {transactionsList}
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