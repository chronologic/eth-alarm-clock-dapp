import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { observer, inject } from 'mobx-react';
import NetworkChooser from './NetworkChooser';
import { isRunningInElectron } from '../../lib/electron-util';
import { BeatLoader } from 'react-spinners';

@inject('web3Service')
@inject('eacService')
@inject('keenStore')
@inject('featuresService')
@observer
class Header extends Component {
  constructor(props) {
    super(props);
    this.state = {
      eacContracts: {}
    };
  }

  componentDidMount() {
    this.fetchEacContracts();

    const { jQuery } = window;

    if (jQuery) {
      jQuery('[data-toggle="tooltip"]').tooltip();
    }
  }

  componentDidUpdate() {
    const { jQuery } = window;

    if (jQuery) {
      jQuery('[data-toggle="tooltip"]').tooltip();
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

  render() {
    const { web3Service, keenStore } = this.props;

    const activeTimenodes = keenStore.activeTimeNodes ? (
      keenStore.activeTimeNodes
    ) : (
      <BeatLoader color="#fff" size={4} />
    );

    const infoBtn = (
      <span
        className="analytics-info"
        data-placement="bottom"
        data-toggle="tooltip"
        data-html="true"
        title="Unable to load analytics. Please <strong>disable any privacy tools</strong> in order to view the network analytics."
      >
        <i className="fa fa-info-circle" />
      </span>
    );

    const displayActiveTimenodes = keenStore.isBlacklisted ? infoBtn : activeTimenodes;

    return (
      <div className="header">
        <a
          href="#"
          className="btn-link toggle-sidebar d-lg-none pg pg-menu"
          data-toggle="sidebar"
        />
        <div>
          <div className="brand inline">
            <img src="img/logo-white.png" alt="logo" data-src="img/logo-white.png" height="36" />
          </div>
        </div>
        <div className="d-flex align-items-center">
          <div className="pull-left p-r-10 fs-14 font-heading d-lg-block d-none">
            <span className="active-timenodes">
              <i className="fa fa-sitemap" />
              <span className="mx-2">Active TimeNodes:</span>
            </span>
            <span className="timenode-count">{displayActiveTimenodes}</span>
          </div>
          <div className="left-separator right-separator pull-left px-2 fs-14 font-heading d-lg-block d-none">
            <span className="active-timenodes">
              <i className="fa fa-th-large" />&nbsp;Network:&nbsp;
            </span>
            <span className="timenode-count">
              <NetworkChooser history={this.props.history} />
            </span>
          </div>
          <div className="pull-left p-l-10 fs-14 font-heading d-lg-block d-none">
            <span className="active-timenodes" data-toggle="dropdown">
              <i className="fa fa-file-alt ml-2 cursor-pointer" />&nbsp;
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
  featuresService: PropTypes.any,
  updateSearchState: PropTypes.any,
  web3Service: PropTypes.any,
  eacService: PropTypes.any,
  keenStore: PropTypes.any,
  history: PropTypes.object.isRequired
};

export default Header;
