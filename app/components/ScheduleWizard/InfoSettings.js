import React from 'react';
import { inject, observer } from 'mobx-react';
import Bb from 'bluebird';
import AbstractSetting from './AbstractSetting';

@inject('scheduleStore')
@inject('web3Service')
@observer
class InfoSettings extends AbstractSetting {
    constructor (props) {
      super(props);

      this.state = {
        minGas: 21000
      };
      const { _validations,_validationsErrors } = this.props;
      this._validations = _validations.InfoSettings;
      this._validationsErrors = _validationsErrors.InfoSettings;

      this.toggleYourData = this.toggleYourData.bind(this);
      this.onChangeCheck = this.onChangeCheck.bind(this);
    }

    validators = {
      toAddress: this.ethereumAddressValidator(),
      gasAmount: '',
      amountToSend: this.decimalValidator(),
      gasPrice: this.integerValidator(),
      yourData: {
        validator: value => typeof value === 'string'?0:1,
        errors: [
          'Kindly provide valid input Data'
        ]
      }
    }

    async calculateMinimumGas () {
      const { web3Service: { web3 },scheduleStore } = this.props;
      const isAddress = this.ethereumAddressValidator().validator;
      const minEstimate = 21000;
      let estimate;
      if (isAddress(scheduleStore.toAddress, web3) && scheduleStore.useData ) {
          estimate = await Bb.fromCallback(callback =>
          web3.eth.estimateGas({
            to: scheduleStore.toAddress,
            data: scheduleStore.yourData
          }, callback)
        );
      }
      estimate = Number(estimate) > minEstimate ? Number(estimate) : minEstimate;
      this.setState({ minGas:estimate });
      return estimate;
    }

    toggleYourData(){
      const { scheduleStore } = this.props;
      scheduleStore.useData = !scheduleStore.useData;
    }

    onChangeCheck = (property) => async(event) => {
      let { target: { value } } = event;
      await this.calculateMinimumGas();

      this.onChange(property)({ target: { value: value } });
      this.forceUpdate();
    }

    render() {
      const { scheduleStore } = this.props;
      const { _validations,_validationsErrors } = this;
      this.validators.gasAmount = this.integerValidator(this.state.minGas);

      return (
        <div id="infoSettings" className="tab-pane slide">
          <div className="d-sm-block d-md-none">
            <h2 className="m-b-20">Information</h2>
            <hr/>
          </div>
          <div className="row">
            <div className="col-md-12">
              <div className={'form-group form-group-default required'+(_validations.toAddress?'':' has-error')}>
                <label>To Address</label>
                <input type="text" placeholder="Enter address" value={scheduleStore.toAddress} onChange={this.onChangeCheck('toAddress')}  onBlur={this.validate('toAddress')} className="form-control"></input>
              </div>
              {!_validations.toAddress &&
                <label className="error">{_validationsErrors.toAddress}</label>
                }
            </div>
          </div>
          <div className="row">
            <div className="col-md-4">
              <div className={'form-group form-group-default required' + (_validations.gasAmount ? '' : ' has-error')}>
                <label>Gas Amount</label>
                <input type="number" placeholder="Enter Gas Amount" value={scheduleStore.gasAmount} onBlur={this.validate('gasAmount')} onChange={this.onChange('gasAmount')} className="form-control"></input>
              </div>
              {!_validations.gasAmount &&
                <label className="error">{_validationsErrors.gasAmount}</label>
              }
            </div>
            <div className="col-md-4">
              <div className={'form-group form-group-default required'+(_validations.amountToSend?'':' has-error')}>
                <label>Value/Amount to Send</label>
                <input type="number" placeholder="Enter Value/Amount in ETH" value={scheduleStore.amountToSend} onBlur={this.validate('amountToSend')} onChange={this.onChangeCheck('amountToSend')}  className="form-control"></input>
              </div>
              {!_validations.amountToSend &&
                <label className="error">{_validationsErrors.amountToSend}</label>
                }
            </div>
            <div className="col-md-4">
              <div className={'form-group form-group-default required'+(_validations.gasPrice?'':' has-error')}>
                <label>Gas Price</label>
                <input type="number" placeholder="Enter Gas Price in Gwei" value={scheduleStore.gasPrice}  onBlur={this.validate('gasPrice')} onChange={this.onChange('gasPrice')}  className="form-control"></input>
              </div>
              {!_validations.gasPrice &&
                <label className="error">{_validationsErrors.gasPrice}</label>
                }
            </div>
          </div>
          <div className="checkbox check-primary">
            <input type="checkbox" id="checkboxAddData" onChange={this.toggleYourData} checked={scheduleStore.useData} />
            <label htmlFor="checkboxAddData">Add Data</label>
          </div>
          {scheduleStore.useData &&
            <div className="row">
              <div className="col-md-4">
                <div className={'form-group form-group-default required'+(_validations.yourData?'':' has-error')}>
                  <label>Your Data</label>
                  <input type="text" placeholder="Enter Your Data" value={scheduleStore.yourData}  onBlur={this.validate('yourData')} onChange={this.onChangeCheck('yourData')}  className="form-control"></input>
                </div>
                {!_validations.yourData &&
                  <label className="error">{_validationsErrors.yourData}</label>
                  }
              </div>
            </div>
          }
        </div>
      );
    }
}

export default InfoSettings;
