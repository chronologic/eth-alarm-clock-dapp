import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { NavLink } from 'react-router-dom';
import { observer,inject } from 'mobx-react';

@inject('web3Service')
@inject('keenStore')
@observer
class SidePanel extends Component {

  constructor(props) {
    super(props);
    this.state = {
      blocknumber: ''
    };
    this.getCurrentBlock = this.getCurrentBlock.bind(this);
  }

  componentWillMount() {
    this.getCurrentBlock();
  }

  getCurrentBlock() {
    const { web3Service: { web3 } } = this.props;
    web3.eth.getBlockNumber((err,res) =>{
      err == null && this.setState({ blocknumber: res });
    });
  }

  componentDidMount() {
    const { jQuery } = window;
    jQuery.Pages.init();

    // Check every 10 seconds if the block number changed
    this.interval = setInterval(this.getCurrentBlock, 10000);
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  isUrlActive(url, type = 'thumbnail', substring = false) {
    const currentUrl = this.props.location.pathname;
    const cls = type === 'thumbnail' ? 'active' : 'text-white';

    if (substring) {
      return currentUrl.includes(url) ? cls : '';
    } else {
      return currentUrl === url ? cls : '';
    }
  }

  render() {
    const titleClasses = 'title ';
    const subtitleClasses = 'sub-title ';
    const thumbnailClasses = 'icon-thumbnail ';

    const entryList = [
      {
        title: 'Schedule',
        titleClasses: titleClasses + this.isUrlActive('/', 'title'),
        thumbnailClasses: thumbnailClasses + this.isUrlActive('/', 'thumbnail')
      },
      {
        title: 'Transactions',
        titleClasses: titleClasses + subtitleClasses + this.isUrlActive('/transactions', 'title', true),
        thumbnailClasses: thumbnailClasses + this.isUrlActive('/transactions', 'thumbnail', true),
      },
      {
        title: 'TimeNode',
        titleClasses: titleClasses + this.isUrlActive('/timenode', 'title'),
        thumbnailClasses: thumbnailClasses + this.isUrlActive('/timenode', 'thumbnail'),
      },
      {
        title: 'Faucet',
        titleClasses: titleClasses + this.isUrlActive('/faucet', 'title'),
        thumbnailClasses: thumbnailClasses + this.isUrlActive('/faucet', 'thumbnail')
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
              <NavLink to="/">
                <span className={entryList[0].titleClasses}>{entryList[0].title}</span>
                <span className={entryList[0].thumbnailClasses}><i className="pg-calender"></i></span>
              </NavLink>
            </li>
            <li>
              <a href="#" onClick={(e) => e.preventDefault()}>
                <span className={entryList[1].titleClasses}>{entryList[1].title}</span>
                <span className={entryList[1].thumbnailClasses}><i className="pg-charts"></i></span>
              </a>

              <ul className="sub-menu">
                <li>
                  <NavLink to="/transactions/scheduled">
                    <span className="title">Scheduled</span>
                    <span className="icon-thumbnail"><i className="pg-plus_circle"></i></span>
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/transactions/completed">
                    <span className="title">Completed</span>
                    <span className="icon-thumbnail"><i className="fa fa-check"></i></span>
                  </NavLink>
                </li>
              </ul>
            </li>
            <li>
              <NavLink to="/timenode">
                <span className={entryList[2].titleClasses}>{entryList[2].title}</span>
                <span className={entryList[2].thumbnailClasses}><i className="fa fa-sitemap"></i></span>
              </NavLink>
            </li>
            <li>
              <a href="https://alpha.chronologic.network/debt/" target="_blank" rel="noopener noreferrer">
                <span className="title">Debt Smart Contract</span>
                <span className="icon-thumbnail"><i className="fab fa-ethereum"></i></span>
              </a>
            </li>
            <li>
              <a href="https://alpha.chronologic.network/chronos/" target="_blank" rel="noopener noreferrer">
                <span className="title">Day Token Contract</span>
                <span className="icon-thumbnail"><i className="far fa-clock"></i></span>
              </a>
            </li>
            <li>
              <NavLink to="/faucet">
                <span className={entryList[3].titleClasses}>{entryList[3].title}</span>
                <span className={entryList[3].thumbnailClasses}><i className="fas fa-tint"></i></span>
              </NavLink>
            </li>
            <li>
              <a href="https://blog.chronologic.network/chronos-platform/home" target="_blank" rel="noopener noreferrer">
                <span className="title">Help</span>
                <span className="icon-thumbnail"><i className="far fa-question-circle"></i></span>
              </a>
            </li>

            <hr id="sidebar-separator" className="d-md-block d-lg-none mx-4"/>

            <li className="d-md-block d-lg-none">
              <div className="container py-2">
                <div className="row p-l-20 p-r-15">
                  <div className="col-8 px-0">
                    <span className="active-timenodes">Active TimeNodes</span>
                  </div>
                  <div className="col-4 px-0 text-right">
                    <span className="timenode-count col-6">{this.props.keenStore.activeTimeNodes}</span>
                  </div>
                </div>
              </div>
            </li>

            <li className="d-md-block d-lg-none">
              <div className="container py-2">
                <div className="row p-l-20 p-r-15">
                  <div className="col-8 px-0">
                    <span className="active-timenodes">Current Block</span>
                  </div>
                  <div className="col-4 px-0 text-right">
                    <span className="timenode-count col-6">{this.state.blocknumber}</span>
                  </div>
                </div>
              </div>
            </li>

          </ul>
          <div className="clearfix"></div>
        </div>
      </nav>
    );
  }
}

SidePanel.propTypes = {
  web3Service: PropTypes.any,
  keenStore: PropTypes.any,
  location: PropTypes.object.isRequired
};

export default SidePanel;
