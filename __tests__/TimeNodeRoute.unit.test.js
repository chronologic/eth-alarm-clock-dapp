import React from 'react';
import renderer from 'react-test-renderer';
import { Provider } from 'mobx-react';
import TimeNodeRoute from '../app/components/TimeNode/TimeNodeRoute';

describe('TimeNodeRoute', () => {
  it('has timenodeRoute identifier for usage in GTM tools', async () => {
    const timeNodeStore = {
      getMyAddress() {
        return '0x';
      }
    };

    const featuresService = {
      awaitInitialized() {
        return true;
      },

      enabled: {
        scheduling: true
      },

      isCurrentNetworkSupported: true
    };

    const injectables = {
      featuresService,
      timeNodeStore
    };

    let mockedRender = renderer.create(
      <Provider {...injectables}>
        <TimeNodeRoute />
      </Provider>
    );

    let tree = mockedRender.toJSON();
    expect(tree).toMatchSnapshot();

    expect(tree.props.id).toBe('timenodeRoute');
  });
});
