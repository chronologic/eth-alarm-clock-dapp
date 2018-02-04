import React from 'react'
import { render } from 'react-dom'
import 'jquery.scrollbar';
import 'bootstrap';
import 'select2';
import 'bootstrap-datepicker';
import createBrowserHistory from 'history/createBrowserHistory';
import { Provider } from 'mobx-react';
import { RouterStore, syncHistoryWithStore } from 'mobx-react-router';
import { Router, Route } from 'react-router-dom';
import App from './components/App';

const browserHistory = createBrowserHistory();
const routingStore = new RouterStore();

const stores = {
  routing: routingStore,
  // ...other stores
};


const history = syncHistoryWithStore(browserHistory, routingStore);

const rootEl = document.getElementById('root');

render(
  <Provider {...stores}>
    <Router history={history}>
      <Route component={App} />
    </Router>
  </Provider>,
  rootEl
);
