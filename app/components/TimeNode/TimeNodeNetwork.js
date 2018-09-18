import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';

@inject('timeNodeStore')
@observer
class TimeNodeNetwork extends Component {
  render() {
    return <div id="timeNodeNetwork">Network</div>;
  }
}

TimeNodeNetwork.propTypes = {
  timeNodeStore: PropTypes.any
};

export default TimeNodeNetwork;
