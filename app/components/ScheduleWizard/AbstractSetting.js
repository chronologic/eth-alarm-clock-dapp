/* eslint-disable */
import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';

@observer
class AbstractSetting extends Component {

  constructor (props) {
    super(props)
//    this._props = this.props;

    this.onChange = this.onChange.bind(this);
  }

	onChange = (name) => (event)=> {
		const { target } = event;
		let { scheduleStore } = this.props;
		scheduleStore[name] = target.value;
    console.log(scheduleStore[name])
  }


  getValidations() {
    return this._validations
  }

}

export default AbstractSetting;
