import React from 'react';
import { observer, inject } from 'mobx-react';
import AbstractSetting from './AbstractSetting';

@inject('scheduleStore')
@observer

class BountySettings extends AbstractSetting {

  constructor (props) {
    super(props);
    const { _validations,_validationsErrors } = this.props;
    this._validations = _validations.BountySettings;
    this._validationsErrors = _validationsErrors.BountySettings;
    this.toggleRequiredDeposit = this.toggleRequiredDeposit.bind(this);
  }
  validators = {
    timeBounty: this.decimalValidator(),
    deposit: this.decimalValidator(),
    requireDeposit: this.booleanValidator()
  }

  toggleRequiredDeposit() {
    const { scheduleStore } = this.props;
    scheduleStore.requireDeposit = !scheduleStore.requireDeposit;
  }

  render() {
    const { scheduleStore, } = this.props;
    const { _validations,_validationsErrors } = this;
    return (
      <div id="bountySettings" className="tab-pane slide">
        <div className="d-sm-block d-md-none">
          <h2 className="m-b-20">Bounty</h2>
          <hr/>
        </div>
        <div className="row">
          <div className="col-md-4">
            <div className={'form-group form-group-default required ' + (_validations.timeBounty ? '' : ' has-error')}>
              <label>Time Bounty</label>
              <input type="number" placeholder="Enter Time Bounty in ETH" value={scheduleStore.timeBounty} onBlur={this.validate('timeBounty')} onChange={this.onChange('timeBounty') } className="form-control"></input>
            </div>
            {!_validations.timeBounty &&
              <label className="error">{_validationsErrors.timeBounty}</label>
              }
          </div>
        </div>
        <div className={'checkbox check-primary' + (_validations.requireDeposit ? '' : ' has-error')}>
          <input type="checkbox" id="checkboxRequireDeposit" onChange={this.toggleRequiredDeposit} checked={scheduleStore.requireDeposit} />
          <label htmlFor="checkboxRequireDeposit">Require Deposit</label>
        </div>
        {scheduleStore.requireDeposit &&
          <div className="row">
            <div className="col-md-4">
              <div className={'form-group form-group-default required ' + (_validations.deposit ? '' : ' has-error')}>
                <label>Deposit</label>
                <input type="number" value={scheduleStore.deposit} onBlur={this.validate('deposit')} onChange={this.onChange('deposit')} placeholder="Enter Deposit in ETH" className="form-control"></input>
              </div>
              {!_validations.timeBounty &&
                <label className="error">{_validationsErrors.deposit}</label>
                }
            </div>
          </div>
        }
      </div>
    );
  }
}

export default BountySettings;
