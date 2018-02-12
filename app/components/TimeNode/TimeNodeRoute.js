import React, { Component } from 'react';
import TimeNodeMain from './TimeNodeMain';
import PoweredByEAC from '../Common/PoweredByEAC';

class TimeNodeRoute extends Component {
  render() {
    return (
      <div className="container-fluid padding-25 sm-padding-10 subsection">
        <h1 className="view-title">TimeNode&nbsp;<span className="view-subtitle">x09s0a9sx09</span></h1>
        <div className="widget-12 card no-border widget-loader-circle no-margin">
          <TimeNodeMain/>
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

export default TimeNodeRoute;