import React, { Component } from 'react';
import { observable } from 'mobx';
import { inject, observer } from 'mobx-react';

@inject('mobxStore')
@observer
class BlockComponent extends Component {

  constructor (props) {
    super(props)
    this._props = this.props;
    this.updateProperty = this.updateProperty.bind(this)
    this.onChange = this.onChange.bind(this)
  }

  updateProperty (value) {
    this._props.blockNumber = value
  }

  onChange (event) {
     this.updateProperty(event.target.value)
   }

@observable
_validations = {
  blockNumber: true,
}

getValidations() {
  return this._validations
}
  render() {

    return (
      <div id="blockComponent">
        <div className="row">
          <div className="col-md-4">
            <div className="form-group form-group-default">
              <label>Block Number</label>
              <input type="text" placeholder="Enter a block number" value={this._props.blocknumber} onChange={this.onChange} className="form-control"></input>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default BlockComponent;
