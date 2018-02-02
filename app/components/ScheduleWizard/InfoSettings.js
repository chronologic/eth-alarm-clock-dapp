import React, { Component } from 'react';

class InfoSettings extends Component {
  state = {}

  componentDidMount() {

  }

render() {
  return (

    <div id="infoSettings">

      <div className="row">
        <div className="col-4">

          <div className="form-group form-group-default">
            <label>To Address</label>
            <input type="text" placeholder="Enter address" className="form-control"></input>
          </div>

        </div>

        <div className="col-4">

          <div className="form-group form-group-default">
            <label>Gas Amount</label>
            <input type="text" placeholder="Enter Gas Amount" className="form-control"></input>
          </div>

        </div>
      </div>

      <div className="row">
        <div className="col-4">

          <div className="form-group form-group-default">
            <label>Value/Amount to Send</label>
            <input type="text" placeholder="Enter Value/Amount in ETH" className="form-control"></input>
          </div>

        </div>

        <div className="col-4">

          <div className="form-group form-group-default">
            <label>Gas Price</label>
            <input type="text" placeholder="Enter Gas Price" className="form-control"></input>
          </div>

        </div>
      </div>

      <div className="checkbox check-primary">
        <input type="checkbox" id="checkboxAddData" defaultChecked />
        <label htmlFor="checkboxAddData">Add Data</label>
      </div>

      <div className="row">
        <div className="col-4">
          <div className="form-group form-group-default">
            <label>Your Data</label>
            <input type="text" placeholder="Enter Your Data" className="form-control"></input>
          </div>
        </div>
      </div>

    </div>
  );
}
}

export default InfoSettings;