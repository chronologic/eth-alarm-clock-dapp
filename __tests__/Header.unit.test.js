import React from 'react';
import renderer from 'react-test-renderer';
import { Provider } from 'mobx-react';
import Web3Service from '../app/services/web3';
import Header from '../app/components/Header/Header';
import { Router } from 'react-router-dom';
import createBrowserHistory from 'history/createBrowserHistory';
import { RouterStore, syncHistoryWithStore } from 'mobx-react-router';
import LocalStorageService from '../app/services/storage';
import LocalStorageMock from '../__mocks__/LocalStorageMock';
import TimeNodeStore from '../app/stores/TimeNodeStore';

const browserHistory = createBrowserHistory();
const routingStore = new RouterStore();

const history = syncHistoryWithStore(browserHistory, routingStore);

describe('Header', () => {
  it('displays current block number', () => {
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
    const eacService = {
      getActiveContracts: () => {
        return {};
      }
    };
    const featuresService = {};

    const storageService = new LocalStorageService(new LocalStorageMock());
    const timeNodeStore = new TimeNodeStore({}, web3Service, {}, storageService);

    const injectables = {
      featuresService,
      keenStore,
      storageService,
      web3Service,
      eacService,
      timeNodeStore
    };

    const props = {
      history
    };

    let mockedRender = renderer.create(
      <Provider {...injectables}>
        <Router history={history}>
          <Header {...props} />
        </Router>
      </Provider>
    );

    let tree = mockedRender.toJSON();
    expect(tree).toMatchSnapshot();

    const blockNumberDisplay = tree.children
      .find(el => el.props.className === 'd-flex align-items-center')
      .children.find(
        el => el.props.className === 'pull-left p-r-10 fs-14 font-heading d-lg-block d-none'
      )
      .children.find(el => el.props.className === 'timenode-count');

    expect(blockNumberDisplay).toMatchSnapshot();
  });
});
