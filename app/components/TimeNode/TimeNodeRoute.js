import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import PropTypes from 'prop-types';
import { TimeNodeMain } from './TimeNodeMain';
import TimeNodeWallet from './TimeNodeWallet';
import TimeNodeProve from './TimeNodeProve';
import TimeNodeUnlock from './TimeNodeUnlock';

@inject('timeNodeStore')
@observer
class TimeNodeRoute extends Component {
  render() {
    const { walletKeystore, attachedDAYAccount, nodeStatus, unlocked } = this.props.timeNodeStore;

    let componentToShow = null;
    if (walletKeystore) {
      if (attachedDAYAccount) {
        componentToShow = unlocked ? <TimeNodeMain /> : <TimeNodeUnlock />;
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
