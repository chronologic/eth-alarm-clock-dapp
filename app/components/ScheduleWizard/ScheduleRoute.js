import React, { Component } from 'react';
import ScheduleWizard from '../Common/ScheduleWizard';
import mobxStore from './mobxStore';

export class ScheduleRoute extends Component {
  render() {
    return (
      <div className="container-fluid padding-25 sm-padding-10">
        <h1 className="view-title">Schedule Transaction</h1>
        <div className="widget-12 card no-border widget-loader-circle no-margin">
          <div className="card-body">
            <ScheduleWizard store={mobxStore}/>
          </div>
        </div>
      </div>
    );
  }
}
