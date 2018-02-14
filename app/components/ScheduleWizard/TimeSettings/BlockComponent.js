import React from 'react';
import { inject, observer } from 'mobx-react';
import Bb from 'bluebird';
import AbstractSetting from '../AbstractSetting';

@inject('scheduleStore')
@inject('web3Service')
@observer
class BlockComponent extends AbstractSetting {

  constructor (props) {
    super(props);
    const { _validations,_validationsErrors } = this.props ;
    this._validations = _validations.TimeSettings.BlockComponent;
    this._validationsErrors = _validationsErrors.TimeSettings.BlockComponent;
    this.blockNumberValidator = this.blockNumberValidator.bind(this);
  }

  async componentDidMount(){
    const { web3Service: { web3 } } = this.props;
    this.state = {
      blockNumber : (await Bb.fromCallback( callback => web3.eth.getBlockNumber(callback) ) ).valueOf()
    }
    this.validators.blockNumber = this.blockNumberValidator();
  }

  blockNumberValidator (){
    const { blockNumber } = this.state;
    return{
      validator:(value)=>{
        if(!Number(value) > 0)return 1;
        if(Number(value) <= Number(blockNumber))
          return 2;
        else if(Number(value)-60 <= Number(blockNumber))
          return 3;
        return 0;
      },
      errors: [
        'Please enter a valid block number',
        'Entered block number is from the past. Please enter a valid block number',
        'Entered block number is too soon. Please enter a block number that is at least 60 blocks higher than the current block'
      ]
    }
  }

  validators = {
    blockNumber: ''
  }

  render() {
    const { scheduleStore } = this.props;
    const { _validations,_validationsErrors } = this;
      return (
        <div id="blockComponent">
          <div className="row">
            <div className="col-md-4">
              <div className={"form-group form-group-default required"+(_validations.blockNumber?"":" has-error")}>
                <label>Block Number</label>
                <input type="number" placeholder="Enter a block number" value={scheduleStore.blockNumber} onBlur={this.validate('blockNumber')} onChange={this.onChange('blockNumber')} className="form-control"></input>
              </div>
              {!_validations.blockNumber &&
                <label className="error">{_validationsErrors.blockNumber}</label>
                }
            </div>
          </div>
        </div>
      );
  }
}

export default BlockComponent;
