import React  from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';
import { Route, Redirect, Switch } from 'react-router';
import MetamaskComponent from '../Common/MetamaskComponent';
import TransactionsCompleted from './TransactionsCompleted';
import TransactionsScheduled from './TransactionsScheduled';
import TransactionDetailsRoute from './TransactionDetailsRoute';

@inject('web3Service')
@observer
class TransactionsRoute extends MetamaskComponent {
  render() {
    return (
      <div id="transactionScanner" className="padding-25 sm-padding-10 subsection">
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