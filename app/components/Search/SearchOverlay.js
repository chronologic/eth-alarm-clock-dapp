import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { observer, inject } from 'mobx-react';
import SearchResult from './SearchResult';

@inject('transactionStore')
@observer
class SearchOverlay extends Component {

  constructor(props) {
    super(props);
    this.state = {
      transactions: [],
      filter: '',
      fetchedTransactions: false,
      updateSearchState: this.props.updateSearchState
    };
  }

  async componentDidMount() {
    // This has to be changed after we implement a data layer (cache or db)
    // For now it always fetches all the transactions from eac.js on each page load
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
    let searchResultsString = 'Fetching...';
    let filteredTransactions = [];
    const maxTxShown = 5;
    const { filter } = this.props.transactionStore;

    if (this.state.fetchedTransactions) {
      filteredTransactions = this.props.transactionStore.filteredTransactions;

      searchResultsString = 'Showing '.concat(
        filteredTransactions.length > maxTxShown ? maxTxShown : filteredTransactions.length,
        ' of ',
        filteredTransactions.length
      );
    }

    const shortList = filteredTransactions.slice(0, maxTxShown);

    const transactionsList = shortList.map(transaction =>
      <SearchResult
        key={transaction.instance.address}
        txAddress={transaction.instance.address}
        txStatus={transaction.status}
        updateSearchState={this.updateSearchState}
      />
    );

    return (
      <div id="searchOverlay" className="overlay" data-pages="search">
        <div className="overlay-content has-results m-t-20">
          <div className="container-fluid">
            <img className="overlay-brand" src="img/logo-black.png" alt="logo" data-src="img/logo-black.png" height="36" />
            <div className="close-icon-light overlay-close text-black fs-16" onClick={() => {this.props.updateSearchState(false);}}>
              <i className="pg-close"></i>
            </div>
          </div>
          <div className="container-fluid">
            <input id="overlay-search"
              className="no-border overlay-search bg-transparent"
              placeholder="Search by contract address..."
              autoComplete="off"
              spellCheck="false"
              value={filter}
              onChange={this.filter.bind(this)}
              autoFocus/>
          </div>
          <div className="container-fluid">
            <div className="search-results m-t-40">
              <p className="bold">{'Search Results - ' + searchResultsString}</p>
                {transactionsList}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

SearchOverlay.propTypes = {
  updateSearchState: PropTypes.any,
  transactionStore: PropTypes.any
};

export default SearchOverlay;