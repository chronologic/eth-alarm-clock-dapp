import React from 'react';
import { render } from 'react-dom';
import 'jquery.scrollbar';
import 'bootstrap';
import 'select2';
import 'bootstrap-timepicker';
import './plugins/bootstrap-datepicker/js/bootstrap-datepicker.js';
import { Provider } from 'mobx-react';
import { Router, Route } from 'react-router-dom';
import App from './components/App';
import { services } from './services';
import { stores, history } from './stores';

const injectables = Object.assign({}, stores, services);

const rootEl = document.getElementById('root');

const setElectron = () => {
  history.push('/timenode?mode=electron');
};

window.setElectron = setElectron;

render(
  <Provider {...injectables}>
    <Router history={history}>
      <Route component={App} path="/" />
    </Router>
  </Provider>,
  rootEl
);
