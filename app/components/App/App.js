import React, { Component } from 'react'
import SidePanel from '../SidePanel/SidePanel';
import Header from '../Header/Header';
import { Route } from 'react-router-dom';
import { ScheduleRoute } from '../ScheduleWizard/ScheduleRoute';
import { TransactionsRoute } from '../TransactionsRoute/TransactionsRoute';

class App extends Component {
  render() {
    return (
      <div>
        <SidePanel />
        <div className="page-container">
          <Header />
          <div className="page-content-wrapper">
            <div className="content sm-gutter">
              <Route exact path="/" component={ScheduleRoute}/>
              <Route path="/transactions" component={TransactionsRoute}/>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default App