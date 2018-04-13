import { Component } from 'react';
import { action } from 'mobx';
import { observer } from 'mobx-react';
import PropTypes from 'prop-types';

@observer
class AbstractSetting extends Component {

  constructor (props) {
    super(props);
    this.onChange = this.onChange.bind(this);
  }

  validators = {}

  integerValidator (min,minError){
    const { _validations } = this.props;
    if (min) {
      minError = minError || `Value / amount should be greater or equal to minimum value of ${min}`;
    }

    return {
      validator: (value)=> {
        if (!new RegExp('^\\d+$').test(value)) return 1;
        if (min) {
          if (Number(value) < Number(min)) {
            return 2;
          }
        } else if (!(Number(value) > 0)) {
          return 2;
        }
        return 0;
      },
      errors: [
        _validations.Errors.numeric,
        minError || _validations.Errors.minimum_numeric
      ]
    };
  }

  decimalValidator(min, minError){
    const { _validations } = this.props;
    minError = minError || _validations.Errors.minimum_decimal;
    return {
      validator: (value)=> {
        if (!new RegExp('^\\d+\\.?\\d*$').test(value)) return 1;
        if (min) {
          if (Number(value) < Number(min) ) {
            return 2;
          }
        } else if (!(Number(value) > 0)) {
          return 2;
        }
        return 0;
      },
      errors: [
        _validations.Errors.numeric,
        minError
      ]
    };
  }

  integerMinMaxValidator( min, max, minError, maxError) {
    const { _validations } = this.props;
    min = min || 1;
    minError = minError || `Value / amount should be greater or equal to minimum value of ${min}`;
    maxError = max ? maxError || `Value / amount should be less or equal to maximum value of ${max}` : null;
    return {
      validator: (value) => {
        if (!new RegExp('^\\d+\\.?\\d*$').test(value)) return 1;
        if (Number(value) < Number(min)) {
          return 2;
        }
        if (max && Number(value) > Number(max)) {
            return 3;
        }
        return 0;
      },
      errors: [
        _validations.Errors.numeric,
        minError || _validations.Errors.minimum_numeric,
        maxError || `Value / amount should be less or equal to maximum value of ${max}`
      ]
    };
  }

  booleanValidator (){
    return {
      validator: (value)=> {
        if (!value && value !== true) return 1;
        return 0;
      },
      errors: [
        'Kindly indicate Value'
      ]
    };
  }

  ethereumAddressValidator(){
      return {
        validator: (value,web3)=>web3.isAddress(value)?0:1,
        errors: [
          'Kindly provide valid address'
        ]
      };
  }

  getValidations() {
    return this._validations;
  }

  @action
  validate = (property) => () => {
    const { props: { scheduleStore,web3Service },_validationsErrors } = this;
    const { _validations } = this;
    const { validator,errors } = this.validators[property];
    const value = scheduleStore[property];
    let Web3;
    if (web3Service){
      const { web3 } = web3Service;
      Web3 = web3;
    }
    const errorState = validator(value,Web3);
    if (errorState == 0){
      _validations[property] = true;
      _validationsErrors[property] = '';
    }
    else {
      _validations[property] = false;
      _validationsErrors[property] = errors[errorState-1];
    }
    return _validations[property];
  }

	onChange = (name) => (event)=> {
    const { target } = event;
    const { scheduleStore } = this.props;
    scheduleStore[name] = target.value;
    this.validate(name)(event);
  }

}

AbstractSetting.propTypes = {
  scheduleStore: PropTypes.any,
  web3Service: PropTypes.any,
  _validations: PropTypes.any,
  _validationsErrors: PropTypes.any
};

export default AbstractSetting;
