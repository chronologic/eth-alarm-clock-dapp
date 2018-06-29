import React, { Component } from 'react';
import PropTypes from 'prop-types';
import TimeNodeStatistics from './TimeNodeStatistics';
import TimeNodeLogs from './TimeNodeLogs';
import TimeNodeSettings from './TimeNodeSettings';
import PoweredByEAC from '../Common/PoweredByEAC';

class TimeNodeMain extends Component {
  render() {
    return (
      <div id="timeNodeMain">
        <ul className="nav nav-tabs nav-tabs-simple" role="tablist">
          <li className="nav-item">
            <a
              className="active px-4 py-3"
              data-toggle="tab"
              role="tab"
              data-target="#tabStatistics"
              href="#"
            >
              Statistics
            </a>
          </li>
          <li className="nav-item">
            <a className="px-4 py-3" href="#" data-toggle="tab" role="tab" data-target="#tabLogs">
              Logs
            </a>
          </li>
          <li className="nav-item">
            <a
              className="px-4 py-3"
              href="#"
              data-toggle="tab"
              role="tab"
              data-target="#tabSettings"
            >
              Settings
            </a>
          </li>
        </ul>
        <div className="tab-content padding-25">
          <div className="tab-pane active" id="tabStatistics">
            <TimeNodeStatistics />
          </div>
          <div className="tab-pane " id="tabLogs">
            <TimeNodeLogs />
          </div>
          <div className="tab-pane " id="tabSettings">
            <TimeNodeSettings updateWalletUnlocked={this.props.updateWalletUnlocked} />
          </div>
          <PoweredByEAC />
        </div>
      </div>
    );
  }
}

TimeNodeMain.propTypes = {
  updateWalletUnlocked: PropTypes.any
};

export default TimeNodeMain;
