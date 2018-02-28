import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import PropTypes from 'prop-types';
import TimeNodeMain from './TimeNodeMain';
import TimeNodeWallet from './TimeNodeWallet';
import TimeNodeProve from './TimeNodeProve';

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
      <div id="timenodeRoute" className="container padding-25 sm-padding-10 subsection">
        <h1 className="view-title">
          {this.props.timeNodeStore.nodeStatus}&nbsp;
          <span className="view-subtitle d-none d-md-inline">{this.props.timeNodeStore.getMyAddress()}</span>
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