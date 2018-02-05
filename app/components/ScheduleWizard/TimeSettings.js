import React, { Component } from 'react';

class TimeSettings extends Component {
  state = {}

  componentDidMount() {

    const { jQuery } = window;

  /**  jQuery('#datepicker-component').datepicker(); **/
    jQuery('#timepicker').timepicker().on('show.timepicker', function() {
        var widget = jQuery('.bootstrap-timepicker-widget');
        widget.find('.glyphicon-chevron-up').removeClass().addClass('pg-arrow_maximize');
        widget.find('.glyphicon-chevron-down').removeClass().addClass('pg-arrow_minimize');
    });
    //jQuery('#datepicker-component').datepicker();
  }


render() {
  return (

    <div id="timeSettings">

      <div className="radio radio-primary">
        <input type="radio" id="timeSettingsTime" name="timeSettingsType" defaultChecked/>
        <label htmlFor="timeSettingsTime">Time</label>
        <input type="radio" id="timeSettingsBlock" name="timeSettingsType"/>
        <label htmlFor="timeSettingsBlock">Block</label>
      </div>

      <div className="row">

        <div className="col-md-3">

          <div className="form-group form-group-default form-group-default-select2 required">
            <label className="">Timezone</label>
            <select id="timezoneSelect" className="full-width" data-placeholder="Select Country" data-init-plugin="select2">
              <optgroup label="Alaskan/Hawaiian Time Zone">
                <option value="AK">Alaska</option>
                <option value="HI">Hawaii</option>
              </optgroup>
              <optgroup label="Pacific Time Zone">
                <option value="CA">California</option>
                <option value="NV">Nevada</option>
                <option value="OR">Oregon</option>
                <option value="WA">Washington</option>
              </optgroup>
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
            <input id="timepicker" type="text" className="form-control"/>
            </div>
            <div className="input-group-addon">
              <i className="pg-clock"></i>
            </div>
          </div>

        </div>

        <div className="col-md-2">
          <div className="btn-group d-flex" data-toggle="buttons">
            <label className="btn btn-default w-100 active">
              <input type="radio" name="options" id="option1" defaultChecked/>1 min
            </label>
            <label className="btn btn-default w-100">
              <input type="radio" name="options" id="option2"/>3 min
            </label>
            <label className="btn btn-default w-100">
              <input type="radio" name="options" id="option3"/>5 min
            </label>
          </div>

          <div className="form-group form-group-default">
            <label>Custom</label>
            <input type="text" placeholder="Enter custom execution window" className="form-control"></input>
          </div>
        </div>

      </div>

    </div>
  );
}
}

export default TimeSettings;
