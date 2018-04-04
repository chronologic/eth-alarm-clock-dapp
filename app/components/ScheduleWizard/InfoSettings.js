import React from 'react';
import { inject, observer } from 'mobx-react';
import Bb from 'bluebird';
import Switch from "react-switch";
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

      this.toggleField = this.toggleField.bind(this);

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
      },
      receiverAddress: this.ethereumAddressValidator()
    }

    async calculateMinimumGas () {
      const { web3Service: { web3 },scheduleStore } = this.props;
      const isAddress = this.ethereumAddressValidator().validator;
      const minEstimate = 21000;
      let estimate;
      if (isAddress(scheduleStore.toAddress, web3) === 0 && scheduleStore.useData ) {
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
    toggleField = (property) => () => {
      const { scheduleStore } = this.props;
      scheduleStore[property] = !scheduleStore[property];
      scheduleStore.isTokenTransfer ? this.calculateTokenTransferMinimumGas() : this.calculateMinimumGas();
    }

    onChangeCheck = (property) => async(event) => {
      let { target: { value } } = event;
      const { scheduleStore } = this.props;

      if (scheduleStore.isTokenTransfer) {
        await this.tokenChangeCheck(property);
      } else {
        await this.calculateMinimumGas();
      }

      this.onChange(property)({ target: { value: value } });
      this.forceUpdate();
    }

    render() {
      const { scheduleStore } = this.props;
      const { _validations,_validationsErrors } = this;
      this.validators.gasAmount = this.integerValidator(this.state.minGas);

      return (
        <div id='infoSettings' className='tab-pane slide'>
          <div className='d-sm-block d-md-none'>
            <h2 className='m-b-20'>Information</h2>
            <hr/>
          </div>
          <div className='row'>
            <div className='col-md-12'>
              <div className={'form-group'}>
                <Switch onChange={this.toggleField('isTokenTransfer')} checked={scheduleStore.isTokenTransfer} onHandleColor='#21ffff' offColor='#ddd' onColor='#000' uncheckedIcon={false} checkedIcon={false}/>
                <span className='switch-label' > Token transfer </span>
              </div>
            </div>
          </div>
          <div className='row'>
            <div className={!scheduleStore.isTokenTransfer ? 'col-md-12': 'col-lg-6 col-md-12' }>
              <div className={'form-group form-group-default required'+(_validations.toAddress?'':' has-error')}>
                <label>{ scheduleStore.isTokenTransfer ? 'Token Address' : 'To Address' }</label>
                <input type='text' placeholder='Enter address' value={scheduleStore.toAddress} onChange={this.onChangeCheck('toAddress')} onKeyUp={this.onChangeCheck('toAddress')}  onBlur={this.validate('toAddress')} className='form-control'></input>
              </div>
              {!_validations.toAddress &&
                <label className='error'>{_validationsErrors.toAddress}</label>
                }
            </div>
            <div className={!scheduleStore.isTokenTransfer ? 'd-none' : 'col-lg-6 col-md-12'}>
              <div className={'form-group form-group-default required' + (_validations.receiverAddress ? '' : ' has-error')}>
                <label> Receiver Address</label>
                <input type='text' placeholder='Enter address' value={scheduleStore.receiverAddress} onChange={this.onChangeCheck('receiverAddress')} onBlur={this.validate('receiverAddress')} className='form-control'></input>
              </div>
              {!_validations.toAddress &&
                <label className='error'>{_validationsErrors.toAddress}</label>
              }
            </div>
          </div>
          {scheduleStore.isTokenTransfer &&
            <div className='row'>
              <div className='col-md-12'>
                <div className={'form-group form-group-default'}>
                  <div className='row'>
                    <div className='col-sm-4'>
                      <label> Name :</label>
                      <span className='form-control'></span>
                    </div>
                    <div className='col-sm-4'>
                      <label> Decimals :</label>
                      <span className='form-control'></span>
                    </div>
                    <div className='col-sm-4'>
                      <label> Balance :</label>
                      <span className='form-control'></span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          }
          <div className='row'>
            <div className='col-md-4'>
              <div className={'form-group form-group-default required' + (_validations.amountToSend ? '' : ' has-error')}>
                <label>Value/Amount to Send</label>
                <input type='number' placeholder='Enter Value/Amount in ETH' value={scheduleStore.amountToSend} onBlur={this.validate('amountToSend')} onChange={this.onChangeCheck('amountToSend')} className='form-control'></input>
              </div>
              {!_validations.amountToSend &&
                <label className='error'>{_validationsErrors.amountToSend}</label>
              }
            </div>
            <div className='col-md-4'>
              <div className={'form-group form-group-default required' + (_validations.gasAmount ? '' : ' has-error')}>
                <label>Gas Amount</label>
                <input type='number' placeholder='Enter Gas Amount' value={scheduleStore.gasAmount} onBlur={this.validate('gasAmount')} onChange={this.onChange('gasAmount')} className='form-control'></input>
              </div>
              {!_validations.gasAmount &&
                <label className='error'>{_validationsErrors.gasAmount}</label>
              }
            </div>
            <div className='col-md-4'>
              <div className={'form-group form-group-default required'+(_validations.gasPrice?'':' has-error')}>
                <label>Gas Price</label>
                <input type='number' placeholder='Enter Gas Price in Gwei' value={scheduleStore.gasPrice}  onBlur={this.validate('gasPrice')} onChange={this.onChange('gasPrice')}  className='form-control'></input>
              </div>
              {!_validations.gasPrice &&
                <label className='error'>{_validationsErrors.gasPrice}</label>
                }
            </div>
          </div>
          <div className='checkbox check-primary'>
            <input type='checkbox' id='checkboxAddData' onChange={this.toggleField('useData')} checked={scheduleStore.useData} />
            <label htmlFor='checkboxAddData'>Add Data</label>
          </div>
          {scheduleStore.useData &&
            <div className='row'>
              <div className='col-md-4'>
                <div className={'form-group form-group-default required'+(_validations.yourData?'':' has-error')}>
                  <label>Your Data</label>
                  <input type='text' placeholder='Enter Your Data' value={scheduleStore.yourData}  onBlur={this.validate('yourData')} onChange={this.onChangeCheck('yourData')}  className='form-control'></input>
                </div>
                {!_validations.yourData &&
                  <label className='error'>{_validationsErrors.yourData}</label>
                  }
              </div>
            </div>
          }
        </div>
      );
    }
}

export default InfoSettings;
