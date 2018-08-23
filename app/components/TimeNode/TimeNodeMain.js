import React, { Component } from 'react';
import PropTypes from 'prop-types';
import TimeNodeStatistics from './TimeNodeStatistics';
import TimeNodeLogs from './TimeNodeLogs';
import TimeNodeSettings from './TimeNodeSettings';
import PoweredByEAC from '../Common/PoweredByEAC';

class TimeNodeMain extends Component {
  constructor(props) {
    super(props);

    this.handleClick = this.handleClick.bind(this);
    this.settingsTab = React.createRef();
  }

  componentDidMount() {
    window.jQuery('a[data-toggle="tab"]').on('show.bs.tab', this.handleClick);
  }

  handleClick(e) {
    const clickedOnTab = e.target.name;
    const settingsTab = this.settingsTab.current.wrappedInstance;

    if (clickedOnTab === 'logs' || clickedOnTab === 'statistics') {
      if (settingsTab.hasUnsavedChanges()) {
        const leave = confirm('Unsaved changes. Are you sure you want to leave the tab?');
        if (!leave) {
          e.preventDefault();
        } else {
          settingsTab.resetFields();
        }
      }
    }
  }

  render() {
    return (
      <div id="timeNodeMain">
        <ul id="timeNodeTab" className="nav nav-tabs nav-tabs-simple" role="tablist">
          <li className="nav-item">
            <a
              name="statistics"
              className="active px-4 py-3"
              data-toggle="tab"
              role="tab"
              href="#tabStatistics"
            >
              Statistics
            </a>
          </li>
          <li className="nav-item">
            <a name="logs" className="px-4 py-3" href="#tabLogs" data-toggle="tab" role="tab">
              Logs
            </a>
          </li>
          <li className="nav-item">
            <a
              name="settings"
              className="px-4 py-3"
              href="#tabSettings"
              data-toggle="tab"
              role="tab"
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
            <TimeNodeSettings
              updateWalletUnlocked={this.props.updateWalletUnlocked}
              ref={this.settingsTab}
            />
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
