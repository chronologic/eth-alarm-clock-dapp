import React from 'react';
import AbstractSetting from '../AbstractSetting';
import moment from 'moment';
import 'moment-timezone';
import momentDurationFormatSetup from 'moment-duration-format';
import { inject, observer } from 'mobx-react';

const presetExecutionWindows = [
    { value: 1, selected: false },
    { value: 3, selected: false },
    { value: 5, selected: false }
  ];

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
    scheduleStore.executionWindow = scheduleStore.executionWindow || 5;

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
        that.validate('transactionDate');
    });
    jQuery('#datepicker-component').datepicker({
      autoclose: true,
      defaultDate: scheduleStore.transactionDate,
      format: dateTimeValidatorStore.dateFormat.toLowerCase() //super hacky thing but moment.js doesn't recognize D vs d where JS does
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
      validator: (value) => dateTimeValidatorStore.isValid(value, scheduleStore.transactionTime, scheduleStore.timeZone)?0:1,
      errors: [
        'Kindly indicate Valid Date'
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
    executionWindow: this.integerValidator(),
    customWindow: this.integerValidator(),
  }

  onRadioChange = (property) => (event) => {
    const { scheduleStore } = this.props;
    const { target } = event;
    scheduleStore[property] = target.value;
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
          <div className="col-md-3">
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

          <div className="col-md-3">
            <div className={'form-group form-group-default input-group required'+(_validations.transactionDate?'':' has-error')}>
              <div className="form-input-group">
                <label>Transaction Date</label>
                <input type="text" className="form-control" value={scheduleStore.transactionDate} onBlur={this.validate('transactionDate')} onChange={this.onChange('transactionDate')} placeholder="Pick a date" id="datepicker-component"/>
              </div>
              <div className="input-group-addon">
                <i className="fa fa-calendar"></i>
              </div>
            </div>
            {!_validations.transactionDate &&
              <label className="error">{_validationsErrors.transactionDate}</label>
              }
          </div>

          <div className="col-md-3">
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


          <div className="col-md-3">
            <div className="d-sm-block d-md-none">
              <hr/>
            </div>
            <div className="form-group required">
              <label>Execution Window</label>
            </div>
            <div data-toggle="buttons" className={'btn-group d-flex'+(_validations.executionWindow?'':' has-error')}>
              {this.state.execWindows.map((exeWind, index) =>
                <label key={index} className={'btn btn-default w-100 ' + (exeWind.value==scheduleStore.executionWindow ? 'active' : '')}>
                  <input type="radio" name="exeWindOptions" value={exeWind.value} checked={exeWind.value == scheduleStore.executionWindow} onBlur={this.validate('executionWindow')} onChange={this.onRadioChange('executionWindow')} />{exeWind.value} min
                </label>
              )}
            </div>
            {!_validations.executionWindow &&
              <label className="error">{_validationsErrors.executionWindow}</label>
              }

            <div id="customExecution" className={'form-group form-group-default'+(_validations.customWindow?'':' has-error')}>
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
