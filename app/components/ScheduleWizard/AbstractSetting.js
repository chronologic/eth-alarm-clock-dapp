import { Component } from 'react';
import { observer } from 'mobx-react';
import PropTypes from 'prop-types';

@observer
class AbstractSetting extends Component {

  constructor (props) {
    super(props)
    this.onChange = this.onChange.bind(this);
  }

	onChange = (name) => (event)=> {
		const { target } = event;
		const { scheduleStore } = this.props;
		scheduleStore[name] = target.value;
  }

  getValidations() {
    return this._validations
  }

}

AbstractSetting.propTypes = {
  scheduleStore: PropTypes.any
};

export default AbstractSetting;
