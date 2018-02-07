import React, { Component } from 'react';
import moment from 'moment';
import 'moment-timezone';
import momentDurationFormatSetup from 'moment-duration-format';

momentDurationFormatSetup(moment);

const presetExecutionWindows = [
  { value: 1, selected: false },
  { value: 3, selected: false },
  { value: 5, selected: false }
];

class TimeComponent extends Component {

  constructor(props) {
    super(props);
    this.state = {
      execWindows: presetExecutionWindows
    };
  }

  componentDidMount() {
    const { jQuery } = window;

    jQuery('#timepicker').timepicker().on('show.timepicker', function() {
        const widget = jQuery('.bootstrap-timepicker-widget');
        widget.find('.glyphicon-chevron-up').removeClass().addClass('pg-arrow_maximize');
        widget.find('.glyphicon-chevron-down').removeClass().addClass('pg-arrow_minimize');
    });
    jQuery('#datepicker-component').datepicker();
    jQuery('#timezoneSelect').select2();
  }

  clearPresetExecWindow() {
    
  }

  render() {
    const timezones = moment.tz.names();
    const localTimezone = moment.tz.guess();
    const defaultTime = moment().add(1, 'hours').format("hh:mm a");

    return (
      <div id="timeComponent">
        <div className="row">
          <div className="col-md-3">
            <div className="form-group form-group-default form-group-default-select2 required">
              <label className="">Timezone</label>
              <select id="timezoneSelect" className="full-width" defaultValue={localTimezone}>
                {timezones.map((timezone, index) => 
                  <option key={index} value={timezone}>{timezone}</option>
                )} 
              </select>
            </div>
          </div>

          <div className="col-md-3">
            <div className="form-group form-group-default input-group">
              <div className="form-input-group">
                <label>Transaction Date</label>
                <input type="email" className="form-control" placeholder="Pick a date" id="datepicker-component"/>
              </div>
              <div className="input-group-addon">
                <i className="fa fa-calendar"></i>
              </div>
            </div>
          </div>

          <div className="col-md-3">
            <div className="form-group form-group-default input-group">
              <div className="form-input-group">
                <label>Transaction Time</label>
              <input id="timepicker" type="text" className="form-control" defaultValue={defaultTime}/>
              </div>
              <div className="input-group-addon">
                <i className="pg-clock"></i>
              </div>
            </div>
          </div>

          <div className="col-md-3">
            <div className="form-group">
              <label>Execution Window</label>
            </div>
            <div className="btn-group d-flex" data-toggle="buttons">
              {this.state.execWindows.map((exeWind, index) => 
                <label key={index} className={"btn btn-default w-100 " + (exeWind.selected ? 'active' : '')}>
                  <input type="radio" name="exeWindOptions" value={exeWind.value} defaultChecked={exeWind.selected}/>{exeWind.value} min
                </label>
              )} 
            </div>

            <div id="customExecution" className="form-group form-group-default">
              <label>Custom</label>
              <input type="text" placeholder="Enter custom execution window (min)" className="form-control" onChange={() => {this.clearPresetExecWindow()}}></input>
            </div>
          </div>

        </div>
      </div>
    );
  }
}

export default TimeComponent;
