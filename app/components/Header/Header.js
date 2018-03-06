import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { observer,inject } from 'mobx-react';

@inject('web3Service')
@inject('keenStore')
@observer
class Header extends Component {


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

  componentDidMount() {
    // Check every 10 seconds if the block number changed
    this.interval = setInterval(this.getCurrentBlock, 10000);
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
  keenStore: PropTypes.any
};

export default Header;