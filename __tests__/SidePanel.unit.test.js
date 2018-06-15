import React from 'react';
import renderer from 'react-test-renderer';
import { Provider } from 'mobx-react';
import Web3Service from '../app/services/web3';
import SidePanel from '../app/components/SidePanel/index';
import { Router } from 'react-router-dom';
import createBrowserHistory from 'history/createBrowserHistory';
import { RouterStore, syncHistoryWithStore } from 'mobx-react-router';

const browserHistory = createBrowserHistory();
const routingStore = new RouterStore();

const history = syncHistoryWithStore(browserHistory, routingStore);

describe('SidePanel', () => {
  it('is correctly rendered', () => {
    const CURRENT_BLOCK = 5361200;

    const web3Service = new Web3Service({
      web3: {
        eth: {
          getBlockNumber(callback) {
            callback(null, CURRENT_BLOCK);
          }
        }
      }
    });

    const keenStore = {};

    const injectables = {
      keenStore,
      web3Service
    };

    const props = {
      location: {
        pathname: 'test',
        search: ''
      }
    };

    let mockedRender = renderer.create(
      <Provider {...injectables}>
        <Router history={history}>
          <SidePanel {...props} />
        </Router>
      </Provider>,
    );

    let tree = mockedRender.toJSON();
    expect(tree).toMatchSnapshot();
  });
});