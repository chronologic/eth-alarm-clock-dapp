import React, { Component } from 'react'
import PropTypes from 'prop-types';

class Header extends Component {
  render() {
    return (
      <div className="header">
        <a href="#" className="btn-link toggle-sidebar d-lg-none pg pg-menu" data-toggle="sidebar">
        </a>
        <div>
          <div className="brand inline">
            <img src="img/eac-logo.png" alt="logo" data-src="img/eac-logo.png" />
          </div>
          <div className="search-link d-lg-inline-block d-none" onClick={() => {this.props.updateSearchState(true)}}>
            <i className="pg-search"></i>
            Search by Address
          </div>
        </div>
        <div className="d-flex align-items-center">
          <div className="brand inline">
            <img src="img/logo-white.png" alt="logo" data-src="img/logo-white.png" height="36" />
          </div>
        </div>
      </div>
    )
  }
}

Header.propTypes = {
  updateSearchState: PropTypes.any
};

export default Header;