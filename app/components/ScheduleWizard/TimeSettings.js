/* eslint-disable */
import React, { Component } from 'react';
import TimeComponent from './TimeSettings/TimeComponent';
import BlockComponent from './TimeSettings/BlockComponent';
import { observer,inject } from 'mobx-react';

@inject('scheduleStore')
@observer
class TimeSettings extends Component {

  constructor(props) {
    super(props);
    this.state = {
      isUsingTime: true
    };
  }

  toggleBlockTime = () => {
    this.setState({
      isUsingTime: !this.state.isUsingTime
    });
  }

  render() {
    const { scheduleStore } = this.props;
    let componentToRender = null;
    if (this.state.isUsingTime) {
      componentToRender = <TimeComponent />;
    } else {
      scheduleStore.isUsingTime = false;
      componentToRender = <BlockComponent />;
    }

    return (
      <div id="timeSettings">
        <div className="radio radio-primary">
          <input type="radio"
            id="timeSettingsTime"
            name="timeSettingsType"
            checked={this.state.isUsingTime}
            onChange={this.toggleBlockTime} />
          <label htmlFor="timeSettingsTime">Time</label>
          <input type="radio"
            id="timeSettingsBlock"
            name="timeSettingsType"
            checked={!this.state.isUsingTime}
            onChange={this.toggleBlockTime} />
          <label htmlFor="timeSettingsBlock">Block</label>
        </div>
        <div className="chosenTimeSettings">
          {componentToRender}
        </div>
      </div>
    );
  }
}

export default TimeSettings;
