/* eslint-disable */
import React, { Component } from 'react';
import { inject, PropTypes } from 'mobx-react';

class BlockComponent extends Component {

  constructor (props) {
    super(props)
//    this._props = this.props;

    this.onChange = this.onChange.bind(this);
  }


  onChange (event) {
     this.props.onChange(event.target.name,event.target.value)
   }

@observable
_validations = {
  blockNumber: true,
}

getValidations() {
  return this._validations
}
  render() {
const blockSettings = this.props;
    return (
      <div id="blockComponent">
        <div className="row">
          <div className="col-md-4">
            <div className="form-group form-group-default">
              <label>Block Number</label>
              <input type="text" placeholder="Enter a block number" value={blockSettings.value} onChange={this.onChange} className="form-control"></input>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default BlockComponent;
