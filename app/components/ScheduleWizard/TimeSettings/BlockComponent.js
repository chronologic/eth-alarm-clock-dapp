import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import AbstractSetting from '../AbstractSetting';

@inject('scheduleStore')
@observer
class BlockComponent extends AbstractSetting {

  constructor (props) {
    super(props);
  }

  render() {

  	const { scheduleStore } = this.props;
      return (
        <div id="blockComponent">
          <div className="row">
            <div className="col-md-4">
              <div className="form-group form-group-default">
                <label>Block Number</label>
                <input type="text" placeholder="Enter a block number" value={scheduleStore.blockNumber} onChange={this.onChange('blockNumber')} className="form-control"></input>
              </div>
            </div>
          </div>
        </div>
      );
  }
}

export default BlockComponent;
