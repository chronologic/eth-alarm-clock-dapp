import React, { Component } from 'react';
import TimeSettings from './TimeSettings';
import InfoSettings from './InfoSettings';
import BountySettings from './BountySettings';
import ConfirmSettings from './ConfirmSettings';
import {Tabs, Tab} from 'react-bootstrap-tabs';
class ScheduleWizard extends Component {
  state = {}

  componentDidMount() {

}

render() {
  return (
    <Tabs onSelect={(index, label) => console.log(label + ' selected')}>
      <Tab label="Date & Time"> <TimeSettings/></Tab>
      <Tab label="Information"> <InfoSettings/></Tab>
      <Tab label="Bounty"><BountySettings/></Tab>
      <Tab label="Confirm"><ConfirmSettings/></Tab>
  </Tabs>
  );
}
}

export default ScheduleWizard;
