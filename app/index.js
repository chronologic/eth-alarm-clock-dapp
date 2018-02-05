import React from 'react'
import { render } from 'react-dom'
import 'jquery.scrollbar';
import 'bootstrap';
import 'select2';
import 'bootstrap-timepicker';
import './plugins/bootstrap-datepicker/js/bootstrap-datepicker.js'

import App from './components/App'

const rootEl = document.getElementById('root')

render(
    <App />,
    rootEl
  )
