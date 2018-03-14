import React from 'react';
import renderer from 'react-test-renderer';
import { ValueDisplay } from '../app/components/Common/ValueDisplay';
import { Provider } from 'mobx-react';
import Web3Service from '../app/services/web3';
import BigNumber from 'bignumber.js';

describe('ValueDisplay', () => {
  it('correctly displays prices', () => {
    const BIGNUMBERS_DISPLAY_MAP = [
      ['0', '0 ETH'],
      ['1', '1 WEI'],
      ['400', '400 WEI'],
      ['10000000', '0.00000000001 ETH'],
      ['40000000', '0.00000000004 ETH'],
      ['6000000000000000000000', '6000 ETH']
    ];

    const web3Service = new Web3Service();

    const injectables = {
      web3Service
    };

    for (let [bignumber, display] of BIGNUMBERS_DISPLAY_MAP) {
      let mockedRender = renderer.create(
        <Provider {...injectables}>
          <ValueDisplay priceInWei={new BigNumber(bignumber)} />
        </Provider>,
      );

      let tree = mockedRender.toJSON();
      expect(tree).toMatchSnapshot();

      expect(tree).toBe(display);
    }
  });
});