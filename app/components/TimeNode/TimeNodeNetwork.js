import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';
import { ActiveTimeNodesGraph } from './Network';

@inject('keenStore')
@observer
class TimeNodeNetwork extends Component {
  render() {
    const { historyActiveTimeNodes } = this.props.keenStore;
    const activeTnsGraph =
      historyActiveTimeNodes.length > 0 ? <ActiveTimeNodesGraph /> : <p>No data yet.</p>;

    return <div id="timeNodeNetwork">{activeTnsGraph}</div>;
  }
}

TimeNodeNetwork.propTypes = {
  keenStore: PropTypes.any
};

export default TimeNodeNetwork;
