import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { isRunningInElectron } from '../../lib/electron-util';

class Image extends Component {
  render() {
    let imageUrl = this.props.src;

    if (isRunningInElectron()) {
      imageUrl = `${window.remote.getCurrentWindow().getDirName()}/${imageUrl}`;
    }

    return (
      <img src={imageUrl} alt={this.props.alt} data-src={imageUrl} height={this.props.height} />
    );
  }
}

Image.propTypes = {
  src: PropTypes.string,
  alt: PropTypes.string,
  height: PropTypes.any
};

export { Image };
