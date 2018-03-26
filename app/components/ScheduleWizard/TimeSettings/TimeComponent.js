import React from 'react';
import { inject, observer } from 'mobx-react';
import moment from 'moment';
import 'moment-timezone';
import momentDurationFormatSetup from 'moment-duration-format';
import AbstractSetting from '../AbstractSetting';

const presetExecutionWindows = [
    { value: 5 },
    { value: 10 },
    { value: 15 },
  ];

const MINIMUM_TIME_WINDOW = 5;

const RadioButton = (args) =>{
  return (
    <label
      className= {`btn btn-default w-100 ${args.checked?'active':''} `}
      onClick = {args.onChange}
    >
      <input
        type = "radio"
        defaultChecked = {args.checked}
        value = {args.value}
        onBlur = {args.onBlur}
      /> { args.value } min
    </label >
  );
};

@inject('scheduleStore')
@inject('dateTimeValidatorStore')
@observer
class TimeComponent extends AbstractSetting {

  constructor(props) {
    super(props);
    this.state = {
      execWindows: presetExecutionWindows
    };

    const { _validations, _validationsErrors } = this.props;
    this._validations = _validations.TimeSettings.TimeComponent;
    this._validationsErrors = _validationsErrors.TimeSettings.TimeComponent;

    this.timeValidator = this.timeValidator.bind(this);
    this.dateValidator = this.dateValidator.bind(this);
    this.onRadioChange = this.onRadioChange.bind(this);
  }

  componentDidMount() {
    momentDurationFormatSetup(moment);

    const { scheduleStore, dateTimeValidatorStore } = this.props;
    const that = this;

    const inOneHour = moment().add(1, 'hours').toDate();
    const defaultTime = dateTimeValidatorStore.time(inOneHour);
    const defaultDate = dateTimeValidatorStore.date(inOneHour);

    const localTimezone = moment.tz.guess();

    scheduleStore.isUsingTime = true;
    scheduleStore.timeZone = scheduleStore.timeZone || localTimezone;
    scheduleStore.transactionTime = scheduleStore.transactionTime || defaultTime;
    scheduleStore.transactionDate = scheduleStore.transactionDate || defaultDate;
    scheduleStore.executionWindow = scheduleStore.executionWindow || 10;


    const { jQuery } = window;

    jQuery('#timepicker').val(scheduleStore.transactionTime);
    jQuery('#timezoneSelect').val(scheduleStore.timeZone);

    jQuery('#timepicker').timepicker({
      showMeridian: false
    }).on('show.timepicker', function() {
        const widget = jQuery('.bootstrap-timepicker-widget');
        widget.find('.glyphicon-chevron-up').removeClass().addClass('pg-arrow_maximize');
        widget.find('.glyphicon-chevron-down').removeClass().addClass('pg-arrow_minimize');
    }).on('changeTime.timepicker', function(e) {
        scheduleStore.transactionTime = e.time.value;
        that.validate('transactionTime')();
    });
    jQuery('#datepicker-component').datepicker({
      autoclose: true,
      startDate: new Date(),
      defaultDate: scheduleStore.transactionDate,
      format: dateTimeValidatorStore.dateFormat.toLowerCase() //super hacky thing but moment.js doesn't recognize D vs d where JS does
    }).on('hide',function(e){
        scheduleStore.transactionDate = e.target.value || defaultDate;
        that.validate('transactionDate')();
        that.forceUpdate();
    });
    jQuery('#timezoneSelect').select2();
  }

  timeValidator (){
    const { scheduleStore, dateTimeValidatorStore } = this.props;
    return {
      validator: (value) => dateTimeValidatorStore.isValid(scheduleStore.transactionDate, value, scheduleStore.timeZone)?0:1,
      errors: [
        'Kindly indicate Valid Time'
      ]
    };
  }

  dateValidator (){
    const { scheduleStore, dateTimeValidatorStore } = this.props;
    return {
      validator: (value) => value && dateTimeValidatorStore.isValid(value, scheduleStore.transactionTime, scheduleStore.timeZone)?0:1,
      errors: [
        'Kindly indicate a Valid Date'
      ]
    };
  }

  validators = {
    timezone:{
      validator: (value)=> typeof moment.tz.zone(value) == 'object'?0:1,
      errors: [
        'Kindly indicate Valid time zone'
      ]
    },
    transactionDate: '',
    transactionTime: '',
    executionWindow: this.integerValidator(MINIMUM_TIME_WINDOW, `window has minimum value of ${MINIMUM_TIME_WINDOW} mins`),
    customWindow: this.integerValidator(MINIMUM_TIME_WINDOW,`window has minimum value of ${MINIMUM_TIME_WINDOW} mins`),
  }

  onRadioChange = (property,value) => (event) => {
    const { scheduleStore } = this.props;
    scheduleStore[property] = value;
    this.validate(property)(event);
  }

  render() {
    const { scheduleStore } = this.props;
    const timezones = moment.tz.names();
    const { _validations,_validationsErrors } = this;

    this.validators.transactionTime = this.timeValidator();//enable optimum validation
    this.validators.transactionDate = this.dateValidator();//enable optimum validation

    return (
      <div id="timeComponent">
        <div className="row">
          <div className="col-lg-3">
            <div className={'form-group form-group-default form-group-default-select2 required'+(_validations.timeZone?'':' has-error')}>
              <label className="">Timezone</label>
              <select id="timezoneSelect" className="full-width" value={scheduleStore.timeZone} onBlur={this.validate('timeZone')} onChange={this.onChange('timeZone')} >
                {timezones.map((timezone, index) =>
                  <option key={index} value={timezone}>{timezone}</option>
                )}
              </select>
            </div>
            {!_validations.timezone &&
              <label className="error">{_validationsErrors.timeZone}</label>
              }
          </div>

          <div className="col-lg-3">
            <div className={'form-group form-group-default input-group required'+(_validations.transactionDate?'':' has-error')}>
              <div className="form-input-group">
                <label>Transaction Date</label>
                <input type="text" className="form-control" value={scheduleStore.transactionDate} onChange={this.onChange('transactionDate')} placeholder="Pick a date" id="datepicker-component"/>
              </div>
              <div className="input-group-addon">
                <i className="fa fa-calendar"></i>
              </div>
            </div>
            {!_validations.transactionDate &&
              <label className="error">{_validationsErrors.transactionDate}</label>
              }
          </div>

          <div className="col-lg-3">
            <div className={'form-group form-group-default input-group required'+(_validations.transactionTime?'':' has-error')}>
              <div className="form-input-group">
                <label>Transaction Time</label>
              <input id="timepicker" type="text" className="form-control" value={scheduleStore.transactionTime} onBlur={this.validate('transactionTime')} onChange={this.onChange('transactionTime')} />
              </div>
              <div className="input-group-addon">
                <i className="pg-clock"></i>
              </div>
            </div>
            {!_validations.transactionTime &&
              <label className="error">{_validationsErrors.transactionTime}</label>
              }
          </div>


          <div className="col-lg-3">
            <div className="d-sm-block d-md-none">
              <hr/>
            </div>
            <div className="form-group required">
              <label>Execution Window</label>
            </div>
            <div data-toggle="buttons" className={'btn-group d-flex' + (_validations.executionWindow ? '' : ' has-error')}>
              {this.state.execWindows.map((exeWind, index) =>
                <RadioButton key={`radio${index}`} {...{ value: exeWind.value, checked: scheduleStore.executionWindow == exeWind.value, onChange: this.onRadioChange('executionWindow', exeWind.value), onBlur: this.validate('executionWindow') }} />
              )}
            </div>
            {!_validations.executionWindow &&
              <label className="error">{_validationsErrors.executionWindow}</label>
              }

            <div id="customExecution" className={'form-group form-group-default' + (_validations.customWindow ? '' : ' has-error' )}>
              <label>Custom</label>
              <input type="text" placeholder="Enter custom execution window (min)" className="form-control" value={scheduleStore.customWindow} onBlur={this.validate('customWindow')} onChange={this.onChange('customWindow')}></input>
            </div>
            {!_validations.customWindow &&
              <label className="error">{_validationsErrors.customWindow}</label>
              }
          </div>

        </div>
      </div>
    );
  }
}
export default TimeComponent;
