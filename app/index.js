import React from 'react'
import { render } from 'react-dom'
import 'jquery.scrollbar';
import 'bootstrap';
import 'select2';
import 'bootstrap-datepicker';

import App from './components/App'

const rootEl = document.getElementById('root')

render(
    <App />,
    rootEl
  )
