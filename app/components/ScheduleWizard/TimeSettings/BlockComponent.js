import React, { Component } from 'react';

class BlockComponent extends Component {

  render() {
    return (
      <div id="blockComponent">
        <div className="row">
          <div className="col-md-4">
            <div className="form-group form-group-default">
              <label>Block Number</label>
              <input type="text" placeholder="Enter a block number" className="form-control"></input>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default BlockComponent;
