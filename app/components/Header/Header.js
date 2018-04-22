import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { observer,inject } from 'mobx-react';
import intl from 'react-intl-universal';
import ReactFlagsSelect from 'react-flags-select';

@inject('languageStore')
@inject('web3Service')
@inject('eacService')
@inject('keenStore')
@observer
class Header extends Component {
  constructor(props) {
    super(props);
    this.state = {
      blocknumber: '',
      eacContracts: {}
    };
    this.getCurrentBlock = this.getCurrentBlock.bind(this);
  }

  componentWillMount() {
    this.getCurrentBlock();
  }

  componentDidMount() {
    // Check every 10 seconds if the block number changed
    this.interval = setInterval(this.getCurrentBlock, 10000);
    this.fetchEacContracts();
  }

  async fetchEacContracts() {
    const eacContracts = await this.props.eacService.getActiveContracts();
    this.setState({ eacContracts });
  }

  getCurrentBlock() {
    const { web3Service: { web3 } } = this.props;

    web3.eth.getBlockNumber((err,res) =>{
      err == null && this.setState({ blocknumber: res });
    });
  }

  onSelectLanguage(targetLocale) {
    this.props.languageStore.loadLocale(targetLocale);
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  render() {
    const { web3Service } = this.props;
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
              <i className="fa fa-sitemap"/>&nbsp;&nbsp;{intl.get('ACTIVE-TIMENODES').d('Active TimeNodes')}:&nbsp;
            </span>
            <span className="timenode-count">{this.props.keenStore.activeTimeNodes}</span>
          </div>
          <div className="left-separator pull-left p-l-10 fs-14 font-heading d-lg-block d-none">
            <span className="active-timenodes">
              <i className="fa fa-th-large" />&nbsp;{intl.get('CURRENT-BLOCK-NUMBER').d('Current Block Number')}:&nbsp;
            </span>
            <span className="timenode-count">{this.state.blocknumber}</span>
          </div>
          <div className="pull-left p-l-10 fs-14 font-heading d-block">
            <span className="left-separator d-lg"></span>
            <span className="active-timenodes" data-toggle="dropdown">
              <i className="fa fa-file-alt ml-2 cursor-pointer" />&nbsp;
            </span>
            <div className="dropdown-menu notification-toggle" role="menu" aria-labelledby="notification-center">
              <div className="notification-panel">
                <div className="scroll-wrapper notification-body scrollable">
                    <div className="notification-body d-block scrollable scroll-content scroll-visible">
                      <div className="notification-item clearfix">
                        <div className="heading row">
                        <div className="d-block text-uppercase font-weight-bold text-dark">Ethereum Alarm Clock contracts </div>
                        </div>
                      </div>
                        <div className="notification-item clearfix">
                          <div className="heading row">
                            <div className="d-block text-uppercase font-weight-bold text-dark">Schedulers</div>
                            {this.state.eacContracts.timestampScheduler &&
                              <div className="content">
                                <div className="d-block">Time: </div>
                                <div className="d-block text-ellipsis">
                                  <a href={ web3Service.explorer ? `${web3Service.explorer}/address/${this.state.eacContracts.timestampScheduler}` : '' } className="text-complete" target="_blank" rel="noopener noreferrer">
                                    {this.state.eacContracts.timestampScheduler}
                                  </a>
                                </div>
                              </div>
                            }
                            {this.state.eacContracts.blockScheduler &&
                          <div className="content">
                                <div className="d-block">Block: </div>
                                <div className="d-block text-ellipsis">
                                  <a href={ web3Service.explorer ? `${web3Service.explorer}/address/${this.state.eacContracts.blockScheduler}` : '' } className="text-complete" target="_blank" rel="noopener noreferrer">
                                    {this.state.eacContracts.blockScheduler}
                                  </a>
                                </div>
                              </div>
                            }
                          </div>
                        </div>
                      <div className="notification-item clearfix">
                        <div className="heading row">
                          <div className="d-block text-uppercase font-weight-bold text-dark">Libraries</div>
                          {this.state.eacContracts &&
                            Object.keys(this.state.eacContracts).filter( contract => new RegExp('lib','i').test(contract) ).map( found =>
                              <div className="content" key={found}>
                              <div className="d-block">{found} </div>
                                <div className="d-block text-ellipsis">
                                  <a href={ web3Service.explorer ? `${web3Service.explorer}/address/${this.state.eacContracts[found]}` : '' } className="text-complete" target="_blank" rel="noopener noreferrer">
                                    {this.state.eacContracts[found]}
                                  </a>
                                </div>
                              </div>
                            )
                          }
                        </div>
                      </div>
                    </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="d-flex">
          <ReactFlagsSelect
            countries={["US", "ES"]}
            defaultCountry={this.props.languageStore.selectorValue}
            placeholder="Select Language"
            showSelectedLabel={false}
            onSelect={this.onSelectLanguage.bind(this)} />
        </div>
        <div className="d-flex">
          <div className="search-link d-lg-inline-block d-none" onClick={() => {this.props.updateSearchState(true);}}>
            <i className="pg-search"></i>
            {intl.get('SEARCH-BY-ADDRESS').d('Search by Address')}
          </div>
        </div>
      </div>
    );
  }
}

Header.propTypes = {
  updateSearchState: PropTypes.any,
  web3Service: PropTypes.any,
  eacService: PropTypes.any,
  keenStore: PropTypes.any,
  languageStore: PropTypes.any
};

export default Header;