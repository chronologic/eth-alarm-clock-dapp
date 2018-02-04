import React, { Component } from 'react'
import PropTypes from 'prop-types';
import { NavLink } from 'react-router-dom';

class SidePanel extends Component {
  componentDidMount() {
    const { jQuery } = window;
    
    jQuery.Pages.init();
  }

  render() {
    return (
      <nav className="page-sidebar" data-pages="sidebar">
        <div className="sidebar-header">
          <img src="img/eac-logo_sm.png" alt="logo" className="brand" data-src="img/eac-logo_sm.png" />
          <div className="sidebar-header-controls">
            <button type="button" className="btn btn-link d-lg-inline-block d-xlg-inline-block d-md-inline-block d-sm-none d-none" data-toggle-pin="sidebar"><i className="fa fs-12"></i>
            </button>
          </div>
        </div>
        <div className="sidebar-menu">
          <ul className="menu-items">
            <li className="m-t-30 ">
              <NavLink to="/" className="title">Schedule</NavLink>
              <span className="icon-thumbnail"><i className="pg-calender"></i></span>
            </li>
            <li className="">
              <NavLink to="/transactions" className="title">Transactions</NavLink>
              <span className="icon-thumbnail"><i className="pg-charts"></i></span>
            </li>
          </ul>
          <div className="clearfix"></div>
        </div>
      </nav>
    )
  }
}

SidePanel.propTypes = {
  routing: PropTypes.any
};

export default SidePanel
