import React, { Component } from 'react'

class Header extends Component {
  render() {
    return (
      <div className="header ">
        <a href="#" className="btn-link toggle-sidebar d-lg-none pg pg-menu" data-toggle="sidebar">
        </a>
        <div>
          <div className="brand inline">
            <img src="img/eac-logo.png" alt="logo" data-src="img/eac-logo.png" />
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

export default Header;