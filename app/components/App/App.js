import React, { Component } from 'react'
import SidePanel from '../SidePanel/SidePanel';
import Header from '../Header/Header';
import ScheduleWizard from '../ScheduleWizard/ScheduleWizard';

class App extends Component {
  render() {
    return (
      <div>
        <SidePanel />
        <div className="page-container ">
          <Header />
          <div className="page-content-wrapper ">
            <div className="content sm-gutter">
              <div className="container-fluid padding-25 sm-padding-10">
                <h1 className="view-title">Schedule Transaction</h1>
                <div className="widget-12 card no-border widget-loader-circle no-margin">
                  <div className="card-body">
                    <ScheduleWizard/>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default App