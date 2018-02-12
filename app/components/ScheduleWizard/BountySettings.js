import React from 'react';
import { observer, inject } from 'mobx-react';
import AbstractSetting from './AbstractSetting';

@inject('scheduleStore')
@observer

class BountySettings extends AbstractSetting {

  constructor (props) {
    super(props)
    this.state = {}
  }

  render() {
    const { scheduleStore } = this.props;
    return (
      <div id="bountySettings">
        <div className="row">
          <div className="col-md-4">

            <div className="form-group form-group-default">
              <label>Time Bounty</label>
              <input type="text" placeholder="Enter Time Bounty" value={scheduleStore.timeBounty} onChange={this.onChange('timeBounty')} className="form-control"></input>
            </div>
          </div>
        </div>
        <div className="checkbox check-primary">
          <input type="checkbox" id="checkboxRequireDeposit" defaultChecked />
          <label htmlFor="checkboxRequireDeposit">Require Deposit</label>
        </div>
        <div className="row">
          <div className="col-md-4">
            <div className="form-group form-group-default">
              <label>Deposit</label>
              <input type="text" value={scheduleStore.deposit} onChange={this.onChange('deposit')} placeholder="Enter Deposit" className="form-control"></input>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default BountySettings;
