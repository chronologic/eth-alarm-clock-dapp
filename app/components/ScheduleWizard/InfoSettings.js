import React from 'react';
import { inject, observer } from 'mobx-react';
import AbstractSetting from '../AbstractSetting';

@inject('scheduleStore')
@observer
class InfoSettings extends AbstractSetting {
    constructor (props) {
      super(props)

      this.state = {}
      this.onChange = this.onChange.bind(this);
    }
    componentDidMount() {
    }

    render() {
      const { scheduleStore } = this.props;
      return (

        <div id="infoSettings">

          <div className="row">
            <div className="col-md-4">

              <div className="form-group form-group-default">
                <label>To Address</label>
                <input type="text" placeholder="Enter address" value={scheduleStore.toAddress} onChange={this.onChange('toAddress')} className="form-control"></input>
              </div>

            </div>

            <div className="col-md-4">

              <div className="form-group form-group-default">
                <label>Gas Amount</label>
                <input type="text" placeholder="Enter Gas Amount" className="form-control" value={scheduleStore.gasAmount} onChange={this.onChange('gasAmount')}></input>
              </div>

            </div>
          </div>

          <div className="row">
            <div className="col-md-4">

              <div className="form-group form-group-default">
                <label>Value/Amount to Send</label>
                <input type="text" placeholder="Enter Value/Amount in ETH" className="form-control" value={scheduleStore.amountToSend} onChange={this.onChange('amountToSend')}></input>
              </div>

            </div>

            <div className="col-md-4">

              <div className="form-group form-group-default">
                <label>Gas Price</label>
                <input type="text" placeholder="Enter Gas Price" className="form-control" value={scheduleStore.gasPrice} onChange={this.onChange('gasPrice')}></input>
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
                <input type="text" placeholder="Enter Your Data" className="form-control" value={scheduleStore.yourData} onChange={this.onChange('yourData')}></input>
              </div>
            </div>
          </div>

        </div>
      );
    }
}

export default InfoSettings;
