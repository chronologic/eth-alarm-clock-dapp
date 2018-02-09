import React, { Component } from 'react'
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
              <a href="#" onClick={(e) => e.preventDefault()} className="title">Transactions</a>
              <span className="icon-thumbnail"><i className="pg-charts"></i></span>

              <ul className="sub-menu">
                <li>
                  <NavLink to="/transactions/scheduled" className="title">Scheduled</NavLink>
                  <span className="icon-thumbnail"><i className="pg-plus_circle"></i></span>
                </li>
                <li>
                  <NavLink to="/transactions/completed" className="title">Completed</NavLink>
                  <span className="icon-thumbnail"><i className="fa fa-check"></i></span>
                </li>
              </ul>
            </li>
          </ul>
          <div className="clearfix"></div>
        </div>
      </nav>
    )
  }
}

export default SidePanel;
