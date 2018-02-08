import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';

@inject('store')
@observer
class BountySettings extends Component {
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
  const BountySettings = this.props;
  return (
    <div id="bountySettings">

      <div className="row">
        <div className="col-md-4">

          <div className="form-group form-group-default">
            <label>Time Bounty</label>
            <input type="text" placeholder="Enter Time Bounty" value={bountySettings.timeBounty} onChange={this.onChange} className="form-control"></input>
          </div>

        </div>
      </div>

      <div className="checkbox check-primary">
        <input type="checkbox" value={bountySettings.depositRequired} onChange={this.onChange} id="checkboxRequireDeposit" defaultChecked />
        <label htmlFor="checkboxRequireDeposit">Require Deposit</label>
      </div>

      <div className="row">
        <div className="col-md-4">
          <div className="form-group form-group-default">
            <label>Deposit</label>
            <input type="text" value={bountySettings.deposit} onChange={this.onChange} placeholder="Enter Deposit" className="form-control"></input>
          </div>
        </div>
      </div>

    </div>
  );
}

BountySettings.propTypes = {
  onChange: PropTypes.func.isRequired
}
}

export default BountySettings;
