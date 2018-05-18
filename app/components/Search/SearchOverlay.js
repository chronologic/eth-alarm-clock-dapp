import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { observer, inject } from 'mobx-react';
import { isValidAddress } from 'ethereumjs-util';

@inject('transactionStore')
@observer
class SearchOverlay extends Component {
  constructor(props) {
    super(props);
    this.state = {
      updateSearchState: this.props.updateSearchState,
      searchError: null
    };
    this.searchTransaction = this.searchTransaction.bind(this);
    this._handleChange = this._handleChange.bind(this);
  }

  componentDidMount() {
    this.searchOverlayRef.addEventListener('keyup', this._handleEnterPress);
  }

  componentWillUnmount() {
    this.searchOverlayRef.removeEventListener('keyup', this._handleEnterPress);
  }

  _handleEnterPress = event => {
    if (event.key !== 'Enter') return;
    document.querySelector('#searchOverlayButton').click();
    event.preventDefault();
  };

  async searchTransaction() {
    const address = this.searchQuery.value;

    try {
      if (isValidAddress(address)) {
        const transaction = await this.props.transactionStore.getTransactionByAddress(address);
        await transaction.fillData();
        if (transaction.owner !== '0x') {
          window.location = `/transactions/${transaction.address}`;
        } else {
          window.location = `/transactions/owner/${address}`;
          // if
          // throw Error('This transaction was never scheduled.');
        }
      } else {
        throw Error('Invalid address or txHash.');
      }
    } catch (err) {
      this.setState({ searchError: err.message });
    }
  }

  _handleChange() {
    if (this.state.searchError) {
      this.setState({ searchError: null });
    }
  }

  render() {
    return (
      <div id="searchOverlay" className="overlay" data-pages="search" ref={el => (this.searchOverlayRef = el)}>
        <div className="overlay-content has-results m-t-20">
          <div className="container-fluid">
            <img
              className="overlay-brand"
              src="img/logo-black.png"
              alt="logo"
              data-src="img/logo-black.png"
              height="36"
            />
            <div
              className="close-icon-light overlay-close text-black fs-16"
              onClick={() => {
                this.props.updateSearchState(false);
              }}
            >
              <i className="pg-close" />
            </div>
          </div>
          <div className="container-fluid">
            <div className="row">
              <div className="col-9 col-md-9">
                <input
                  id="overlay-search"
                  className="no-border overlay-search bg-transparent"
                  placeholder="Search by Address / Tx hash..."
                  autoComplete="off"
                  spellCheck="false"
                  ref={el => (this.searchQuery = el)}
                  onChange={this._handleChange}
                  autoFocus
                />
              </div>
              <div className="col-3 col-md-3 vertical-align">
                <button
                  id="searchOverlayButton"
                  className="btn btn-secondary btn-lg btn-rounded"
                  onClick={this.searchTransaction}>
                  <i className="fa fa-search" />&nbsp;
                  Search
                </button>
              </div>
            </div>

            <div className="searchError text-danger">
              <strong>{this.state.searchError}</strong>
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
