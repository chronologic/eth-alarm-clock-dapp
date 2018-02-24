import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import PropTypes from 'prop-types';
import TimeNodeMain from './TimeNodeMain';
import TimeNodeWallet from './TimeNodeWallet';
import TimeNodeProve from './TimeNodeProve';
import PoweredByEAC from '../Common/PoweredByEAC';

@inject('timeNodeStore')
@observer
class TimeNodeRoute extends Component {
  render() {
    let componentToShow = null;
    if (this.props.timeNodeStore.hasWallet) {
      if (this.props.timeNodeStore.attachedDAYAccount) {
        componentToShow = <TimeNodeMain/>;
      } else {
        componentToShow = <TimeNodeProve/>;
      }
    } else {
      componentToShow = <TimeNodeWallet/>;
    }

    return (
      <div className="container-fluid padding-25 sm-padding-10 subsection">
        <h1 className="view-title">
          {this.props.timeNodeStore.nodeStatus}&nbsp;
          <span className="view-subtitle d-none d-md-block">{this.props.timeNodeStore.getMyAddress()}</span>
        </h1>
        <div className="widget-12 card no-border widget-loader-circle no-margin">
          {componentToShow}
          <div className="p-4">
            <div className="row">
              <PoweredByEAC className="col-md-2 mt-2" />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

TimeNodeRoute.propTypes = {
  timeNodeStore: PropTypes.any
};

export default TimeNodeRoute;