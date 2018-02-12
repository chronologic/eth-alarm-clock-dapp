import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Route, Redirect, Switch } from 'react-router';
import TransactionsCompleted from './TransactionsCompleted';
import TransactionsScheduled from './TransactionsScheduled';
import TransactionDetailsRoute from './TransactionDetailsRoute';

class TransactionsRoute extends Component {
  render() {
    return (
      <div id="transactionScanner" className="container-fluid padding-25 sm-padding-10 subsection">
        <Switch>
          <Redirect exact path="/transactions" to="/transactions/completed"/>
          <Route path="/transactions/completed" component={TransactionsCompleted}/>
          <Route path="/transactions/scheduled" component={TransactionsScheduled}/>
          <Route path="/transactions/:txAddress" component={TransactionDetailsRoute}/>
        </Switch>
      </div>
    );
  }
}

TransactionsRoute.propTypes = {
  children: PropTypes.any
};

export default TransactionsRoute;