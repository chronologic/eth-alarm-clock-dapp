import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { inject } from 'mobx-react';

@inject('tokenHelper')
class CollectibleDisplay extends Component {
  getCollectibleIdDisplay() {
    const { collectibleId } = this.props;

    if (!collectibleId) {
      return '';
    }

    let display = collectibleId;

    if (typeof collectibleId !== 'string' && collectibleId.toString) {
      display = collectibleId.toString();
    }

    return display;
  }

  render() {
    const { tokenAddress, tokenHelper, tokenName } = this.props;

    const collectibleId = this.getCollectibleIdDisplay();

    const token = tokenHelper.getTokenConfig(tokenAddress);

    if (token && token.imagePath) {
      return (
        <img
          src={tokenHelper.getTokenImagePath(token, collectibleId)}
          style={{ height: token.imageHeight, width: token.imageWidth }}
        />
      );
    }

    if (tokenName) {
      return (
        <span>
          {tokenName} (NFT-ERC721) with id: {collectibleId}
        </span>
      );
    }

    return <span>NFT-ERC721 with id: {collectibleId}</span>;
  }
}

CollectibleDisplay.propTypes = {
  collectibleId: PropTypes.any,
  tokenAddress: PropTypes.any,
  tokenHelper: PropTypes.any,
  tokenName: PropTypes.any
};

export default CollectibleDisplay;
