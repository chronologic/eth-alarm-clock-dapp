import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';

@inject('loadingStateStore')
@observer
class InformativeLoader extends Component {
  render() {
    return (
      <div className="text-center">
        <b>{this.props.loadingStateStore.progress}%</b>{' '}
        {this.props.loadingStateStore.loadingMessage}
      </div>
    );
  }
}

InformativeLoader.propTypes = {
  loadingStateStore: PropTypes.any
};

export default InformativeLoader;
