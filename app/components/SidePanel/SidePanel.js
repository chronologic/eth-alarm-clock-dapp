import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { NavLink } from 'react-router-dom';
import { observer, inject } from 'mobx-react';
import { isRunningInElectron } from '../../lib/electron-util';
import { BeatLoader } from 'react-spinners';
import NetworkChooser from '../Header/NetworkChooser';

@inject('transactionStatistics')
@inject('web3Service')
@inject('analyticsStore')
@inject('eacStore')
@observer
class SidePanel extends Component {
  constructor() {
    super();
    this.state = {
      isElectron: isRunningInElectron()
    };
  }

  componentDidMount() {
    const { jQuery } = window;

    if (jQuery) {
      jQuery('[data-toggle="tooltip"]').tooltip();

      if (jQuery.Pages) {
        jQuery.Pages.init();
      }
    }
  }

  componentDidUpdate() {
    const { jQuery } = window;

    if (jQuery) {
      jQuery('[data-toggle="tooltip"]').tooltip();
    }
  }

  isUrlActive(url, type = 'thumbnail', substring = false) {
    const currentUrl = this.props.location.pathname;
    const classToAdd = type === 'thumbnail' ? 'active' : 'text-white';

    if (substring) {
      return currentUrl.includes(url) ? classToAdd : '';
    }

    return currentUrl === url ? classToAdd : '';
  }

  render() {
    const titleClasses = 'title ';
    const subtitleClasses = 'sub-title ';
    const thumbnailClasses = 'icon-thumbnail ';

    const loaderIfNull = value => (value !== null ? value : <BeatLoader color="#fff" size={4} />);

    const entryList = [
      {
        title: 'Schedule',
        titleClasses: titleClasses + this.isUrlActive('/', 'title'),
        thumbnailClasses: thumbnailClasses + this.isUrlActive('/', 'thumbnail')
      },
      {
        title: 'Transactions',
        titleClasses:
          titleClasses + subtitleClasses + this.isUrlActive('/transactions', 'title', true),
        thumbnailClasses: thumbnailClasses + this.isUrlActive('/transactions', 'thumbnail', true)
      },
      {
        title: 'TimeNode',
        titleClasses: titleClasses + this.isUrlActive('/timenode', 'title'),
        thumbnailClasses: thumbnailClasses + this.isUrlActive('/timenode', 'thumbnail')
      },
      {
        title: 'Faucet',
        titleClasses: titleClasses + this.isUrlActive('/faucet', 'title'),
        thumbnailClasses: thumbnailClasses + this.isUrlActive('/faucet', 'thumbnail')
      }
    ];

    const { isElectron } = this.state;
    const { transactionStatistics, web3Service, eacStore, analyticsStore } = this.props;

    const defaultAccount = web3Service.accounts && web3Service.accounts[0];

    const myTransactionsLink = `/transactions/owner/${defaultAccount}`;

    const infoBtn = (
      <span
        className="analytics-info"
        data-placement="bottom"
        data-toggle="tooltip"
        data-html="true"
        title="To enable site analytics, please <strong>whitelist our site</strong>."
      >
        <i className="fa fa-info-circle" />
      </span>
    );

    const displayActiveTimenodes = analyticsStore.isBlacklisted
      ? infoBtn
      : loaderIfNull(analyticsStore.activeTimeNodes);

    const { efficiency, transactionsScheduledInNextHoursAmount } = transactionStatistics;

    return (
      <nav className="page-sidebar" data-pages="sidebar">
        <div className="sidebar-header">
          <img
            src="img/logo-white.png"
            data-src="img/logo-white.png"
            alt="Chronologic"
            className="brand"
            height="36"
          />
          <div className="sidebar-header-controls">
            <button
              type="button"
              className="btn btn-link d-lg-inline-block d-xlg-inline-block d-md-inline-block d-sm-none d-none"
              data-toggle-pin="sidebar"
            >
              <i className="fa fa-lock" />
            </button>
          </div>
        </div>
        <div className="sidebar-menu">
          <ul className="menu-items">
            {!isElectron && (
              <li className="m-t-30 ">
                <NavLink to="/" exact={true}>
                  <span className={entryList[0].titleClasses}>{entryList[0].title}</span>
                  <span className={entryList[0].thumbnailClasses}>
                    <i className="pg-calender" />
                  </span>
                </NavLink>
              </li>
            )}
            {!isElectron && (
              <li>
                <a href="#" onClick={e => e.preventDefault()}>
                  <span className={entryList[1].titleClasses}>{entryList[1].title}</span>
                  <span className={entryList[1].thumbnailClasses}>
                    <i className="pg-charts" />
                  </span>
                </a>

                <ul className="sub-menu">
                  {defaultAccount && (
                    <li>
                      <NavLink to={myTransactionsLink}>
                        <span className="title">My Transactions</span>
                        <span className="icon-thumbnail">
                          <i className="fas fa-user" />
                        </span>
                      </NavLink>
                    </li>
                  )}
                  <li>
                    <NavLink to="/transactions/scheduled">
                      <span className="title">Scheduled</span>
                      <span className="icon-thumbnail">
                        <i className="pg-plus_circle" />
                      </span>
                    </NavLink>
                  </li>
                  <li>
                    <NavLink to="/transactions/completed">
                      <span className="title">Completed</span>
                      <span className="icon-thumbnail">
                        <i className="fa fa-check" />
                      </span>
                    </NavLink>
                  </li>
                </ul>
              </li>
            )}
            <li>
              <NavLink to={isElectron ? '/timenode?mode=electron' : '/timenode'}>
                <span className={entryList[2].titleClasses}>{entryList[2].title}</span>
                <span className={entryList[2].thumbnailClasses}>
                  <i className="fa fa-sitemap" />
                </span>
              </NavLink>
            </li>
            <li>
              <a
                href="https://automate.chronologic.network"
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="title">Automate</span>
                <span className="icon-thumbnail">
                  <i className="fas fa-font" />
                </span>
              </a>
            </li>
            <li>
              <a
                href="https://blog.chronologic.network/search?q=zapier"
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="title">Automate Zapier</span>
                <span className="icon-thumbnail">
                  <i className="fas fa-bolt" />
                </span>
              </a>
            </li>
            {!isElectron && (
              <li>
                <a
                  href="https://alpha.chronologic.network/debt/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span className="title">Debt Smart Contract</span>
                  <span className="icon-thumbnail">
                    <i className="fab fa-ethereum" />
                  </span>
                </a>
              </li>
            )}
            {!isElectron && (
              <li>
                <a
                  href="https://alpha.chronologic.network/chronos/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span className="title">Day Token Contract</span>
                  <span className="icon-thumbnail">
                    <i className="far fa-clock" />
                  </span>
                </a>
              </li>
            )}
            {!isElectron && !web3Service.isOnMainnet() && (
              <li>
                <NavLink to="/faucet">
                  <span className={entryList[3].titleClasses}>{entryList[3].title}</span>
                  <span className={entryList[3].thumbnailClasses}>
                    <i className="fas fa-tint" />
                  </span>
                </NavLink>
              </li>
            )}
            <li>
              <a
                href="https://blog.chronologic.network/chronos-platform/home"
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="title">
                  Help&nbsp;
                  {isElectron && <i className="fa fa-external-link-alt" />}
                </span>
                <span className="icon-thumbnail">
                  <i className="far fa-question-circle" />
                </span>
              </a>
            </li>

            <hr className="sidebar-separator mx-4" />

            <li className="sidebar-additional-item">
              <div className="sidebar-additional-item--label">Transferred</div>
              <div className="sidebar-additional-item--display">
                {eacStore.totalEthTransferred !== null ? (
                  `${eacStore.totalEthTransferred} ETH`
                ) : (
                  <BeatLoader color="#fff" size={4} />
                )}
                {eacStore.totalUsdTransferred !== null &&
                  ` (${eacStore.getFormattedUSDTranferred()}*)`}
              </div>
            </li>

            <li className="sidebar-additional-item">
              <div className="sidebar-additional-item--label">Active TimeNodes</div>
              <div className="sidebar-additional-item--display">{displayActiveTimenodes}</div>
            </li>

            <li className="sidebar-additional-item">
              <div className="sidebar-additional-item--label">Network</div>
              <div className="sidebar-additional-item--display">
                <NetworkChooser />
              </div>
            </li>

            <li className="sidebar-additional-item">
              <div className="sidebar-additional-item--label">Current Block</div>
              <div className="sidebar-additional-item--display">
                {loaderIfNull(web3Service.latestBlockNumber)}
              </div>
            </li>

            <li className="sidebar-additional-item">
              <div className="sidebar-additional-item--label">Upcoming Transactions</div>
              <div className="sidebar-additional-item--display">
                {loaderIfNull(transactionsScheduledInNextHoursAmount)}
              </div>
            </li>

            <li className="sidebar-additional-item">
              <div className="sidebar-additional-item--label">Efficiency</div>
              <div className="sidebar-additional-item--display">
                {loaderIfNull(efficiency)}&nbsp;%
              </div>
            </li>
            <li className="sidebar-bottom-item">
              <small>
                *&nbsp;Some data provided by Nomics.com{' '}
                <a
                  href="https://p.nomics.com/cryptocurrency-bitcoin-api"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Cryptocurrency Market Data API
                </a>
              </small>
            </li>
          </ul>
          <div className="clearfix" />
        </div>
      </nav>
    );
  }
}

SidePanel.propTypes = {
  web3Service: PropTypes.any,
  analyticsStore: PropTypes.any,
  eacStore: PropTypes.any,
  location: PropTypes.object.isRequired,
  transactionStatistics: PropTypes.any
};

export default SidePanel;
