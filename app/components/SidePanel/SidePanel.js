import React, { Component } from 'react';
import { NavLink } from 'react-router-dom';

class SidePanel extends Component {

  componentDidMount() {
    const { jQuery } = window;

    jQuery.Pages.init();
  }

  isUrlActive(url, type = 'thumbnail', substring = false) {
    const currentUrl = window.location.pathname;
    const cls = type === 'thumbnail' ? 'active' : 'text-white';

    if (substring) {
      return currentUrl.includes(url) ? cls : '';
    } else {
      return currentUrl === url ? cls : '';
    }
  }

  render() {
    const titleClasses = 'title ';
    const thumbnailClasses = 'icon-thumbnail ';

    const entryList = [
      {
        title: 'Schedule',
        titleClasses: titleClasses + this.isUrlActive('/', 'title'),
        thumbnailClasses: thumbnailClasses + this.isUrlActive('/')
      },
      {
        title: 'Transactions',
        titleClasses: titleClasses + this.isUrlActive('/transactions', 'title', true),
        thumbnailClasses: thumbnailClasses + this.isUrlActive('/transactions', 'thumbnail', true),
      },
      {
        title: 'TimeNode',
        titleClasses: titleClasses + this.isUrlActive('/timenode', 'title'),
        thumbnailClasses: thumbnailClasses + this.isUrlActive('/timenode'),
      },
    ];

    return (
      <nav className="page-sidebar" data-pages="sidebar">
        <div className="sidebar-header">
          <img src="img/logo-white.png" alt="logo" className="brand" data-src="img/logo-white.png" height="36"/>
          <div className="sidebar-header-controls">
            <button type="button" className="btn btn-link d-lg-inline-block d-xlg-inline-block d-md-inline-block d-sm-none d-none" data-toggle-pin="sidebar"><i className="fa fa-lock"></i>
            </button>
          </div>
        </div>
        <div className="sidebar-menu">
          <ul className="menu-items">
            <li className="m-t-30 ">
              <NavLink to="/" className={entryList[0].titleClasses}>{entryList[0].title}</NavLink>
              <span className={entryList[0].thumbnailClasses}><i className="pg-calender"></i></span>
            </li>
            <li className="">
              <a href="#" onClick={(e) => e.preventDefault()} className={entryList[1].titleClasses}>{entryList[1].title}</a>
              <span className={entryList[1].thumbnailClasses}><i className="pg-charts"></i></span>

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
            <li>
              <NavLink to="/timenode" className={entryList[2].titleClasses}>{entryList[2].title}</NavLink>
              <span className={entryList[2].thumbnailClasses}><i className="fa fa-sitemap"></i></span>
            </li>
          </ul>
          <div className="clearfix"></div>
        </div>
      </nav>
    );
  }
}

export default SidePanel;
