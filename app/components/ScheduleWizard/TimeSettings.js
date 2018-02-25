import React, { Component } from 'react';
import TimeComponent from './TimeSettings/TimeComponent';
import BlockComponent from './TimeSettings/BlockComponent';
import PropTypes from 'prop-types';
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
    let componentToRender = null;
    if (this.state.isUsingTime) {
      componentToRender = <TimeComponent {...this.props}/>;
    } else {
      componentToRender = <BlockComponent {...this.props}/>;
    }

    return (
      <div id="timeSettings" className="tab-pane active slide">
        <div className="d-sm-block d-md-none">
          <h2 className="m-b-20">Date & Time</h2>
          <hr/>
        </div>
        <div className="radio radio-primary py-3">
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
TimeSettings.propTypes = {
  scheduleStore: PropTypes.any
};
export default TimeSettings;
