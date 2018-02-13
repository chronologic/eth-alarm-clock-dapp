import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import PropTypes from 'prop-types';
import TimeNodeMain from './TimeNodeMain';
import TimeNodeWallet from './TimeNodeWallet';
import PoweredByEAC from '../Common/PoweredByEAC';
import Cookies from 'js-cookie';

@inject('timeNodeStore')
@observer
class TimeNodeRoute extends Component {

  constructor(props) {
    super(props);
    this.state = {};
  }

  refresh() {
    this.setState(this.state);
  }

  render() {
    let componentToShow = null;
    if (this.props.timeNodeStore.verifiedWallet || (Cookies.get('keystore') && Cookies.get('password'))) {
      componentToShow = <TimeNodeMain/>;
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