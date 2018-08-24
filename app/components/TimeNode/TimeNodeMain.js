import React, { Component } from 'react';
import PropTypes from 'prop-types';
import TimeNodeStatistics from './TimeNodeStatistics';
import TimeNodeLogs from './TimeNodeLogs';
import TimeNodeSettings from './TimeNodeSettings';
import PoweredByEAC from '../Common/PoweredByEAC';
import ConfirmModal from '../Common/ConfirmModal';

const INITIAL_STATE = {
  dontPreventTab: null
};

class TimeNodeMain extends Component {
  constructor(props) {
    super(props);

    this.state = INITIAL_STATE;

    this.handleClick = this.handleClick.bind(this);
    this.resetFields = this.resetFields.bind(this);
    this.resetState = this.resetState.bind(this);

    this.settingsTab = React.createRef();
  }

  componentDidMount() {
    window.jQuery('a[data-toggle="tab"]').on('show.bs.tab', this.handleClick);
  }

  handleClick(e) {
    const clickedOnTab = e.target.name;
    const settingsTab = this.settingsTab.current.wrappedInstance;

    const { dontPreventTab } = this.state;

    if (!dontPreventTab) {
      if (clickedOnTab === 'logs' || clickedOnTab === 'statistics') {
        if (settingsTab.hasUnsavedChanges()) {
          this.setState({
            dontPreventTab: e.target
          });

          // Prevent moving to the other tab before confirmed
          e.preventDefault();

          // Ask the user if he's sure he wants to leave the page
          const $ = window.jQuery;
          $('#confirmUnsavedChangesModal').modal('show');
        }
      }
    } else {
      this.setState({
        dontPreventTab: null
      });
    }
  }

  // Once the user confirms he wants to leave the page
  resetFields() {
    // Reset the fields in the settings tab
    const settingsTab = this.settingsTab.current.wrappedInstance;
    settingsTab.resetFields();

    // Manually trigger moving to the other tab
    const $ = window.jQuery;
    const tabName = this.state.dontPreventTab.href.split('#')[1];
    $(`.nav-tabs a[href="#${tabName}"]`).tab('show');
  }

  resetState() {
    this.setState(INITIAL_STATE);
  }

  render() {
    return (
      <div id="timeNodeMain">
        <ul className="nav nav-tabs nav-tabs-simple" role="tablist">
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

        <ConfirmModal
          modalName="confirmUnsavedChanges"
          modalTitle="You have unsaved changes."
          modalBody="Are you sure you want to leave the settings tab? All unsaved changes will be discarded."
          onConfirm={this.resetFields}
          onCancel={this.resetState}
        />
      </div>
    );
  }
}

TimeNodeMain.propTypes = {
  updateWalletUnlocked: PropTypes.any
};

export default TimeNodeMain;
