import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { observer, inject } from 'mobx-react';
import NetworkChooser from './NetworkChooser';
import { isRunningInElectron } from '../../lib/electron-util';
import { BeatLoader } from 'react-spinners';
import { withRouter } from 'react-router-dom';

@withRouter
@inject('transactionStatistics')
@inject('web3Service')
// @inject('keenStore')
@inject('featuresService')
// @inject('timeNodeStore')
@inject('eacStore')
@observer
class Header extends Component {
  async componentDidMount() {
    const $ = window.jQuery;
    if ($) {
      $('[data-toggle="tooltip"]').tooltip();
    }
  }

  componentDidUpdate() {
    const $ = window.jQuery;
    if ($) {
      $('[data-toggle="tooltip"]').tooltip();
    }
  }

  getInfoButton(message) {
    return (
      <span
        className="analytics-info"
        data-placement="bottom"
        data-toggle="tooltip"
        data-html="true"
        title={message}
      >
        <i className="fa fa-info-circle" />
      </span>
    );
  }

  isOnTimeNodeScreen() {
    return this.props.location.pathname === '/timenode';
  }

  render() {
    const { web3Service, transactionStatistics, eacStore } = this.props;

    const loaderIfNull = value => (value !== null ? value : <BeatLoader color="#fff" size={4} />);

    // const numActiveTimeNodes = {
    //   timeNodeScreen: this.getInfoButton('<strong>Unlock</strong> your TimeNode to see the analytics.'),
    //   otherScreens: null
    //   // timeNodeScreen: timeNodeStore.unlocked
    //   //   ? keenStore.activeTimeNodesTimeNodeSpecificProvider
    //   //   : this.getInfoButton('<strong>Unlock</strong> your TimeNode to see the analytics.'),
    //   // otherScreens: keenStore.activeTimeNodes
    // };

    // const whichCounter = loaderIfNull(
    //   this.isOnTimeNodeScreen()
    //     ? numActiveTimeNodes.timeNodeScreen
    //     : numActiveTimeNodes.otherScreens
    // );

    const displayActiveTimenodes = this.getInfoButton(
      'To enable site analytics, please <strong>whitelist our site</strong>.'
    );
    // const displayActiveTimenodes = keenStore.isBlacklisted
    //   ? this.getInfoButton('To enable site analytics, please <strong>whitelist our site</strong>.')
    //   : whichCounter;

    const { efficiency, transactionsScheduledInNextHoursAmount } = transactionStatistics;

    return (
      <div className="header">
        <a
          href="#"
          className="btn-link toggle-sidebar d-lg-none pg pg-menu"
          data-toggle="sidebar"
        />

        <div className="brand inline">
          <img
            src="img/logo-white.png"
            data-src="img/logo-white.png"
            alt="ChronoLogic"
            height="36"
          />
        </div>

        <div className="header-items">
          <div className="header-item">
            <span className="analytics-name">
              <i className="fa fa-exchange-alt" />
              <span
                className="mx-2"
                title="Amount of ETH transferred using the Ethereum Alarm Clock"
              >
                Transferred:
              </span>
            </span>
            <span className="analytics-count">
              {eacStore.totalEthTransferred !== null ? (
                `${eacStore.totalEthTransferred} ETH`
              ) : (
                <BeatLoader color="#fff" size={4} />
              )}
              {eacStore.totalUsdTransferred !== null &&
                ` (${eacStore.getFormattedUSDTranferred()}*)`}
            </span>
          </div>

          <div className="header-separator" />

          <div className="header-item">
            <span className="analytics-name">
              <i className="fa fa-sitemap" />
              <span className="mx-2">TimeNodes:</span>
            </span>
            <span className="analytics-count">{displayActiveTimenodes}</span>
          </div>

          <div className="header-separator" />

          <div className="header-item">
            <span className="analytics-name">
              <i className="fa fa-chart-bar" />
              <span className="mx-2" title="Amount of transactions scheduled">
                Upcoming transactions:
              </span>
            </span>
            <span className="analytics-count">
              {loaderIfNull(transactionsScheduledInNextHoursAmount)}
            </span>
          </div>

          <div className="header-separator" />

          <div className="header-item">
            <span className="analytics-name">
              <i className="fa fa-check-square" />
              <span
                className="mx-2"
                title="% of available transaction executed over the last 24 hours"
              >
                Efficiency:
              </span>
            </span>
            <span className="analytics-count">
              {efficiency === null ? <BeatLoader color="#fff" size={4} /> : `${efficiency}%`}
            </span>
          </div>

          <div className="header-separator" />

          <div data-test="network-display" className="header-item">
            <span className="analytics-name">
              <i className="fa fa-th-large" />
              &nbsp;Network:&nbsp;
            </span>
            <span className="analytics-count">
              <NetworkChooser showBlockNumber={true} />
            </span>
          </div>

          <div className="header-separator" />

          <div className="header-item">
            <span className="analytics-name" data-toggle="dropdown" title="Contracts">
              <i className="fa fa-file-alt ml-2 cursor-pointer" />
              &nbsp;
            </span>
            <div
              className="dropdown-menu notification-toggle"
              role="menu"
              aria-labelledby="notification-center"
            >
              <div className="notification-panel">
                <div className="scroll-wrapper notification-body scrollable">
                  <div className="notification-body d-block scrollable scroll-content scroll-visible">
                    <div className="notification-item clearfix">
                      <div className="heading row">
                        <div className="d-block text-uppercase font-weight-bold text-dark">
                          Ethereum Alarm Clock contracts{' '}
                        </div>
                      </div>
                    </div>
                    <div className="notification-item clearfix">
                      <div className="heading row">
                        <div className="d-block text-uppercase font-weight-bold text-dark">
                          Schedulers
                        </div>
                        {eacStore.contracts.timestampScheduler && (
                          <div className="content">
                            <div className="d-block">Time: </div>
                            <div className="d-block text-ellipsis">
                              <a
                                href={
                                  web3Service.explorer
                                    ? `${web3Service.explorer}/address/${
                                        eacStore.contracts.timestampScheduler
                                      }`
                                    : ''
                                }
                                className="text-complete"
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                {eacStore.contracts.timestampScheduler}
                              </a>
                            </div>
                          </div>
                        )}
                        {eacStore.contracts.blockScheduler && (
                          <div className="content">
                            <div className="d-block">Block: </div>
                            <div className="d-block text-ellipsis">
                              <a
                                href={
                                  web3Service.explorer
                                    ? `${web3Service.explorer}/address/${
                                        eacStore.contracts.blockScheduler
                                      }`
                                    : ''
                                }
                                className="text-complete"
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                {eacStore.contracts.blockScheduler}
                              </a>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="notification-item clearfix">
                      <div className="heading row">
                        <div className="d-block text-uppercase font-weight-bold text-dark">
                          Libraries
                        </div>
                        {eacStore.contracts &&
                          Object.keys(eacStore.contracts)
                            .filter(contract => new RegExp('lib', 'i').test(contract))
                            .map(found => (
                              <div className="content" key={found}>
                                <div className="d-block">{found} </div>
                                <div className="d-block text-ellipsis">
                                  <a
                                    href={
                                      web3Service.explorer
                                        ? `${web3Service.explorer}/address/${
                                            eacStore.contracts[found]
                                          }`
                                        : ''
                                    }
                                    className="text-complete"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    {eacStore.contracts[found]}
                                  </a>
                                </div>
                              </div>
                            ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="d-flex">
          {!isRunningInElectron() && (
            <div
              className="search-link"
              title="Search scheduled transactions by address"
              onClick={() => {
                this.props.updateSearchState(true);
              }}
            >
              <i className="pg-search" />
              <span className="search-text">Search by address</span>
            </div>
          )}
        </div>
      </div>
    );
  }
}

Header.propTypes = {
  location: PropTypes.any,
  featuresService: PropTypes.any,
  updateSearchState: PropTypes.any,
  web3Service: PropTypes.any,
  // keenStore: PropTypes.any,
  // timeNodeStore: PropTypes.any,
  eacStore: PropTypes.any,
  transactionStatistics: PropTypes.any,
  history: PropTypes.object.isRequired
};

export default Header;
