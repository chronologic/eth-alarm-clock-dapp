import React, { Component } from 'react';
import TimeNodeStatistics from './TimeNodeStatistics';
import TimeNodeLogs from './TimeNodeLogs';

class TimeNodeMain extends Component {
  render() {
    return (
      <div id="timeNodeMain" className="padding-25">
        <ul className="nav nav-tabs nav-tabs-simple" role="tablist" data-init-reponsive-tabs="dropdownfx">
          <li className="nav-item">
            <a className="active" data-toggle="tab" role="tab" data-target="#tabStatistics" href="#">Statistics</a>
          </li>
          <li className="nav-item">
            <a href="#" data-toggle="tab" role="tab" data-target="#tabLogs">Logs</a>
          </li>
        </ul>
        <div className="tab-content">
          <div className="tab-pane active" id="tabStatistics">
            <TimeNodeStatistics/>
          </div>
          <div className="tab-pane " id="tabLogs">
            <TimeNodeLogs/>
          </div>
        </div>
      </div>
    );
  }
}

export default TimeNodeMain;
