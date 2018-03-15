import React from 'react';
import renderer from 'react-test-renderer';
import { Provider } from 'mobx-react';
import TimeNodeLogs from '../../app/components/TimeNode/TimeNodeLogs';

describe('TimeNodeLogs', () => {
  it('correctly displays logs', () => {
    const timeNodeStore = {
      logs: [
        {
          timestamp: 0,
          type: 'DEBUG',
          message: 'Scanning started.'
        },
        {
          timestamp: 0,
          type: 'INFO',
          message: 'Transaction found.'
        }
      ]
    };

    const injectables = {
      timeNodeStore
    };

    let mockedRender = renderer.create(
      <Provider {...injectables}>
        <TimeNodeLogs />
      </Provider>,
    );

    let tree = mockedRender.toJSON();
    expect(tree).toMatchSnapshot();
  });
});