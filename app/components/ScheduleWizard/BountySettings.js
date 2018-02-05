import React, { Component } from 'react';

class BountySettings extends Component {
  state = {}

  componentDidMount() {

  }

render() {
  return (

    <div id="bountySettings">

      <div className="row">
        <div className="col-4">

          <div className="form-group form-group-default">
            <label>Time Bounty</label>
            <input type="text" placeholder="Enter Time Bounty" className="form-control"></input>
          </div>

        </div>
      </div>

      <div className="checkbox check-primary">
        <input type="checkbox" id="checkboxRequireDeposit" defaultChecked />
        <label htmlFor="checkboxRequireDeposit">Require Deposit</label>
      </div>

      <div className="row">
        <div className="col-4">
          <div className="form-group form-group-default">
            <label>Deposit</label>
            <input type="text" placeholder="Enter Deposit" className="form-control"></input>
          </div>
        </div>
      </div>

    </div>
  );
}
}

export default BountySettings;