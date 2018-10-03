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
@inject('eacService')
@inject('keenStore')
@inject('featuresService')
@inject('timeNodeStore')
@observer
class Header extends Component {
  constructor(props) {
    super(props);
    this.state = {
      eacContracts: {}
    };
  }

  async componentDidMount() {
    this.fetchEacContracts();

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

  async fetchEacContracts() {
    const { web3Service } = this.props;
    await web3Service.init();

    if (!this.props.featuresService._isCurrentNetworkSupported) {
      return;
    }

    const eacContracts = await this.props.eacService.getActiveContracts();
    this.setState({ eacContracts });
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
    const { web3Service, keenStore, timeNodeStore, transactionStatistics } = this.props;

    const loaderIfNull = value => (value !== null ? value : <BeatLoader color="#fff" size={4} />);

    const numActiveTimeNodes = {
      timeNodeScreen: timeNodeStore.unlocked
        ? keenStore.activeTimeNodesTimeNodeSpecificProvider
        : this.getInfoButton('<strong>Unlock</strong> your TimeNode to see the analytics.'),
      otherScreens: keenStore.activeTimeNodes
    };

    const whichCounter = loaderIfNull(
      this.isOnTimeNodeScreen()
        ? numActiveTimeNodes.timeNodeScreen
        : numActiveTimeNodes.otherScreens
    );

    const displayActiveTimenodes = keenStore.isBlacklisted
      ? this.getInfoButton('To enable site analytics, please <strong>whitelist our site</strong>.')
      : whichCounter;

    const { efficiency, transactionsScheduledInNextHoursAmount } = transactionStatistics;

    return (
      <div className="header">
        <a
          href="#"
          className="btn-link toggle-sidebar d-lg-none pg pg-menu"
          data-toggle="sidebar"
        />
        <div>
          <div className="brand inline">
            <img
              src="img/logo-white.png"
              data-src="img/logo-white.png"
              alt="ChronoLogic"
              height="36"
            />
          </div>
        </div>
        <div className="header-items">
          <div>
            <span className="active-timenodes">
              <i className="fa fa-sitemap" />
              <span className="mx-2">Active TimeNodes:</span>
            </span>
            <span className="timenode-count">{displayActiveTimenodes}</span>
          </div>
          <div className="header-separator" />
          <div>
            &nbsp;
            <span className="active-timenodes">
              <i className="fa fa-chart-bar" />
              <span className="mx-2" title="Amount of transactions scheduled in next 24 hours">
                Upcoming transactions:
              </span>
            </span>
            <span className="timenode-count">{transactionsScheduledInNextHoursAmount}</span>
          </div>
          <div className="header-separator" />
          <div>
            &nbsp;
            <span className="active-timenodes">
              <i className="fa fa-check-square" />
              <span
                className="mx-2"
                title="% of available transaction executed over the last 24 hours"
              >
                Efficiency:
              </span>
            </span>
            <span className="timenode-count">{efficiency !== null && `${efficiency}%`}</span>
          </div>
          <div className="header-separator" />
          <div data-test="network-display">
            <span className="active-timenodes">
              <i className="fa fa-th-large" />
              &nbsp;Network:&nbsp;
            </span>
            <span className="timenode-count">
              <NetworkChooser />
            </span>
          </div>
          <div className="header-separator" />
          <div>
            <span className="active-timenodes" data-toggle="dropdown" title="Contracts">
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
                        {this.state.eacContracts.timestampScheduler && (
                          <div className="content">
                            <div className="d-block">Time: </div>
                            <div className="d-block text-ellipsis">
                              <a
                                href={
                                  web3Service.explorer
                                    ? `${web3Service.explorer}/address/${
                                        this.state.eacContracts.timestampScheduler
                                      }`
                                    : ''
                                }
                                className="text-complete"
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                {this.state.eacContracts.timestampScheduler}
                              </a>
                            </div>
                          </div>
                        )}
                        {this.state.eacContracts.blockScheduler && (
                          <div className="content">
                            <div className="d-block">Block: </div>
                            <div className="d-block text-ellipsis">
                              <a
                                href={
                                  web3Service.explorer
                                    ? `${web3Service.explorer}/address/${
                                        this.state.eacContracts.blockScheduler
                                      }`
                                    : ''
                                }
                                className="text-complete"
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                {this.state.eacContracts.blockScheduler}
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
                        {this.state.eacContracts &&
                          Object.keys(this.state.eacContracts)
                            .filter(contract => new RegExp('lib', 'i').test(contract))
                            .map(found => (
                              <div className="content" key={found}>
                                <div className="d-block">{found} </div>
                                <div className="d-block text-ellipsis">
                                  <a
                                    href={
                                      web3Service.explorer
                                        ? `${web3Service.explorer}/address/${
                                            this.state.eacContracts[found]
                                          }`
                                        : ''
                                    }
                                    className="text-complete"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    {this.state.eacContracts[found]}
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
              onClick={() => {
                this.props.updateSearchState(true);
              }}
            >
              <i className="pg-search" />
              <span className="d-md-inline-block d-none">Search by address</span>
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
  eacService: PropTypes.any,
  keenStore: PropTypes.any,
  timeNodeStore: PropTypes.any,
  transactionStatistics: PropTypes.any,
  history: PropTypes.object.isRequired
};

export default Header;
