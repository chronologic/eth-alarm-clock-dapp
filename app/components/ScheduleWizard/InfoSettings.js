/* eslint-disable */
import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import PropTypes from 'PropTypes';

@inject('mobxStore')
@observer
class InfoSettings extends Component {
  state = {}

  componentDidMount() {

  }

    constructor (props) {
      super(props)
  //    this._props = this.props;

      this.onChange = this.onChange.bind(this);
    }

    onChange (event) {
       this.props.onChange(event.target.name,event.target.value)
     }

render() {
  const infoSettings = this.props;
  return (

    <div id="infoSettings">

      <div className="row">
        <div className="col-md-4">

          <div className="form-group form-group-default">
            <label>To Address</label>
            <input type="text" placeholder="Enter address" value={infoSettings.address} onChange={this.onChange} className="form-control"></input>
          </div>

        </div>

        <div className="col-md-4">

          <div className="form-group form-group-default">
            <label>Gas Amount</label>
            <input type="text" placeholder="Enter Gas Amount" className="form-control" value={infoSettings.gasAmount} onChange={this.onChange}></input>
          </div>

        </div>
      </div>

      <div className="row">
        <div className="col-md-4">

          <div className="form-group form-group-default">
            <label>Value/Amount to Send</label>
            <input type="text" placeholder="Enter Value/Amount in ETH" className="form-control" value={infoSettings.amountToSend} onChange={this.onChange}></input>
          </div>

        </div>

        <div className="col-md-4">

          <div className="form-group form-group-default">
            <label>Gas Price</label>
            <input type="text" placeholder="Enter Gas Price" className="form-control" value={infoSettings.gasPrice} onChange={this.onChange}></input>
          </div>

        </div>
      </div>

      <div className="checkbox check-primary">
        <input type="checkbox" id="checkboxAddData" defaultChecked />
        <label htmlFor="checkboxAddData">Add Data</label>
      </div>

      <div className="row">
        <div className="col-md-4">
          <div className="form-group form-group-default">
            <label>Your Data</label>
            <input type="text" placeholder="Enter Your Data" className="form-control" value={infoSettings.yourData} onChange={this.onChange}></input>
          </div>
        </div>
      </div>

    </div>
  );
}
}

export default InfoSettings;
