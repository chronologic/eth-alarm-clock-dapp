import React from 'react'
import { render } from 'react-dom'
import 'jquery.scrollbar';
import 'bootstrap';
import 'select2';
import 'bootstrap-datepicker';
import { Provider } from 'mobx-react';
import { Router, Route } from 'react-router-dom';
import App from './components/App';
import { stores, history } from './stores';

const rootEl = document.getElementById('root');

render(
  <Provider {...stores}>
    <Router history={history}>
      <Route component={App} />
    </Router>
  </Provider>,
  rootEl
);
