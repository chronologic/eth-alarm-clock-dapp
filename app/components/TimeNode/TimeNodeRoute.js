import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import PropTypes from 'prop-types';
import TimeNodeMain from './TimeNodeMain';
import TimeNodeWallet from './TimeNodeWallet';
import TimeNodeProve from './TimeNodeProve';
import TimeNodeUnlock from './TimeNodeUnlock';

@inject('timeNodeStore')
@observer
class TimeNodeRoute extends Component {
  constructor(props) {
    super(props);
    this.state = {
      walletUnlocked: false
    };
    this.updateWalletUnlocked = this.updateWalletUnlocked.bind(this);
  }

  updateWalletUnlocked(unlocked) {
    this.setState({
      walletUnlocked: unlocked
    });
  }

  render() {
    const { walletKeystore, attachedDAYAccount, nodeStatus } = this.props.timeNodeStore;

    const { walletUnlocked } = this.state;

    let componentToShow = null;
    if (walletKeystore) {
      if (attachedDAYAccount) {
        componentToShow = walletUnlocked ? (
          <TimeNodeMain updateWalletUnlocked={this.updateWalletUnlocked} />
        ) : (
          <TimeNodeUnlock updateWalletUnlocked={this.updateWalletUnlocked} />
        );
      } else {
        componentToShow = <TimeNodeProve />;
      }
    } else {
      componentToShow = <TimeNodeWallet />;
    }

    return (
      <div id="timenodeRoute" className="container padding-25 sm-padding-10 subsection">
        <h1 className="view-title">
          {nodeStatus}
          &nbsp;
          <span className="view-subtitle d-none d-md-inline">
            {this.props.timeNodeStore.getMyAddress()}
          </span>
        </h1>
        <div className="widget-12 card no-border widget-loader-circle no-margin">
          {componentToShow}
        </div>
      </div>
    );
  }
}

TimeNodeRoute.propTypes = {
  timeNodeStore: PropTypes.any
};

export default TimeNodeRoute;
