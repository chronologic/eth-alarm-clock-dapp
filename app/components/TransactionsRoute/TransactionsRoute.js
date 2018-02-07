import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Route, Redirect, Switch } from 'react-router';
import TransactionsCompleted from './TransactionsCompleted';
import TransactionsScheduled from './TransactionsScheduled';

class TransactionsRoute extends Component {
  render() {
    return (
      <div className="container-fluid padding-25 sm-padding-10">
        <Switch>
          <Redirect exact path="/transactions" to="/transactions/completed"/>
          <Route path="/transactions/completed" component={TransactionsCompleted}/>
          <Route path="/transactions/scheduled" component={TransactionsScheduled}/>
        </Switch>
      </div>
    );
  }
}

TransactionsRoute.propTypes = {
  children: PropTypes.any
};

export default TransactionsRoute;