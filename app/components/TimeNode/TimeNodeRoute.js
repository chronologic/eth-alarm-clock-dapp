import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import PropTypes from 'prop-types';
import TimeNodeMain from './TimeNodeMain';
import TimeNodeWallet from './TimeNodeWallet';
import TimeNodeProve from './TimeNodeProve';
import PoweredByEAC from '../Common/PoweredByEAC';
import Cookies from 'js-cookie';

@inject('timeNodeStore')
@observer
class TimeNodeRoute extends Component {

  constructor(props) {
    super(props);
    this.state = {};
    this.refresh = this.refresh.bind(this);
  }

  refresh() {
    this.setState(this.state);
  }

  render() {
    if (Cookies.get('verifiedWallet')) {
      this.props.timeNodeStore.verifiedWallet = true;
    }

    if (Cookies.get('hasDayTokens')) {
      this.props.timeNodeStore.hasDayTokens = true;
    }

    let componentToShow = null;
    if (this.props.timeNodeStore.verifiedWallet) {
      if (this.props.timeNodeStore.hasDayTokens) {
        componentToShow = <TimeNodeMain/>;
      } else {
        componentToShow = <TimeNodeProve refreshParent={this.refresh.bind(this)}/>;
      }
    } else {
      componentToShow = <TimeNodeWallet refreshParent={this.refresh.bind(this)}/>;
    }

    return (
      <div className="container-fluid padding-25 sm-padding-10 subsection">
        <h1 className="view-title">TimeNode&nbsp;<span className="view-subtitle"></span></h1>
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