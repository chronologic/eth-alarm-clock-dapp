import React, { Component } from 'react';
import PropTypes from 'prop-types';

class Header extends Component {
  render() {
    return (
      <div className="header">
        <a href="#" className="btn-link toggle-sidebar d-lg-none pg pg-menu" data-toggle="sidebar">
        </a>
        <div>
          <div className="brand inline">
            <img src="img/logo-white.png" alt="logo" data-src="img/logo-white.png" height="36" />
          </div>
        </div>
        <div className="d-flex align-items-center">
          <div className="pull-left p-r-10 fs-14 font-heading d-lg-block d-none">
            <span className="active-timenodes">
              <i className="fa fa-sitemap"/>&nbsp;Active TimeNodes:&nbsp;
            </span>
            <span className="timenode-count">1000</span>
          </div>
        </div>
        <div className="d-flex">
          <div className="search-link d-lg-inline-block d-none" onClick={() => {this.props.updateSearchState(true);}}>
            <i className="pg-search"></i>
            Search by Address
          </div>
        </div>
      </div>
    );
  }
}

Header.propTypes = {
  updateSearchState: PropTypes.any
};

export default Header;