import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { observer,inject } from 'mobx-react';

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
              <i className="fa fa-sitemap"/>&nbsp;&nbsp;Active TimeNodes:&nbsp;
            </span>
            <span className="timenode-count">{this.props.keenStore.activeTimeNodes}</span>
          </div>
          <div className="left-separator pull-left p-l-10 fs-14 font-heading d-lg-block d-none">
            <span className="active-timenodes">
              <i className="fa fa-th-large" />&nbsp;Current Block Number:&nbsp;
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
                <div className="notification-body d-block scrollable scroll-content scroll-visible">
                  {this.state.eacContracts.timestampScheduler &&
                    <div className="notification-item clearfix">
                      <div className="heading row">
                        <span className="d-inline-block col-5 col-md-4 col-lg-6">Timestamp Sceduler: </span>
                      <span className="d-inline-block col-7 col-md-8 col-lg-6 text-ellipsis">
                          <a href={`${web3Service.explorer}/address/${this.state.eacContracts.timestampScheduler}`} className="text-complete" target="_blank" rel="noopener noreferrer">
                            {this.state.eacContracts.timestampScheduler}
                          </a>
                        </span>
                      </div>
                    </div>
                  }
                  {this.state.eacContracts.blockScheduler &&
                    <div className="notification-item clearfix">
                      <div className="heading row">
                        <span className="d-inline-block col-5 col-md-4 col-lg-6">Block Sceduler: </span>
                        <span className="d-inline-block col-7 col-md-8 col-lg-6 text-ellipsis">
                          <a href={`${web3Service.explorer}/address/${this.state.eacContracts.blockScheduler}`} className="text-complete" target="_blank" rel="noopener noreferrer">
                            {this.state.eacContracts.blockScheduler}
                          </a>
                        </span>
                      </div>
                    </div>
                  }
                  {this.state.eacContracts.schedulerLib &&
                    <div className="notification-item clearfix">
                      <div className="heading row">
                        <span className="d-inline-block col-5 col-md-4 col-lg-6">Sceduler Lib: </span>
                        <span className="d-inline-block col-7 col-md-8 col-lg-6 text-ellipsis">
                          <a href={`${web3Service.explorer}/address/${this.state.eacContracts.schedulerLib}`} className="text-complete" target="_blank" rel="noopener noreferrer">
                            {this.state.eacContracts.schedulerLib}
                          </a>
                        </span>
                      </div>
                    </div>
                  }
                  {this.state.eacContracts.executionLib &&
                    <div className="notification-item clearfix">
                      <div className="heading row">
                      <span className="d-inline-block col-5 col-md-4 col-lg-6">Execution Lib: </span>
                        <span className="d-inline-block col-7 col-md-8 col-lg-6 text-ellipsis">
                          <a href={`${web3Service.explorer}/address/${this.state.eacContracts.executionLib}`} className="text-complete" target="_blank" rel="noopener noreferrer">
                            {this.state.eacContracts.executionLib}
                          </a>
                        </span>
                      </div>
                    </div>
                  }
                  {this.state.eacContracts.claimLib &&
                    <div className="notification-item clearfix">
                      <div className="heading row">
                      <span className="d-inline-block col-5 col-md-4 col-lg-6">Claim Lib: </span>
                        <span className="d-inline-block col-7 col-md-8 col-lg-6 text-ellipsis">
                          <a href={`${web3Service.explorer}/address/${this.state.eacContracts.claimLib}`} className="text-complete" target="_blank" rel="noopener noreferrer">
                            {this.state.eacContracts.claimLib}
                          </a>
                        </span>
                      </div>
                    </div>
                  }
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="d-flex">
          <div className="search-link d-lg-inline-block d-none" onClick={() => {this.props.updateSearchState(true);}}>
            <i className="pg-search"></i>
            Search by Address
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
  keenStore: PropTypes.any
};

export default Header;