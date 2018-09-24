import React from 'react';
import Enzyme, { mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import { Provider } from 'mobx-react';
import Web3Service from '../app/services/web3';
import Header from '../app/components/Header/Header';
import { Router } from 'react-router-dom';
import createBrowserHistory from 'history/createBrowserHistory';
import { RouterStore, syncHistoryWithStore } from 'mobx-react-router';
import LocalStorageService from '../app/services/storage';
import LocalStorageMock from '../__mocks__/LocalStorageMock';
import TimeNodeStore from '../app/stores/TimeNodeStore';
import { KOVAN_NETWORK_ID } from '../app/config/web3Config';

const browserHistory = createBrowserHistory();
const routingStore = new RouterStore();

Enzyme.configure({ adapter: new Adapter() });

const history = syncHistoryWithStore(browserHistory, routingStore);

const waitForNextTick = () => new Promise(resolve => setTimeout(resolve, 0));
const dataTest = name => `[data-test="${name}"]`;

describe('Header', () => {
  it('displays current block number', async () => {
    const CURRENT_BLOCK = 5361200;

    const web3Service = new Web3Service({
      web3: {
        eth: {
          getBlockNumber(callback) {
            callback(null, CURRENT_BLOCK);
          }
        },
        version: {
          getNetwork(callback) {
            callback(null, KOVAN_NETWORK_ID);
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
    const transactionStatistics = {};

    const injectables = {
      featuresService,
      keenStore,
      storageService,
      web3Service,
      eacService,
      timeNodeStore,
      transactionStatistics
    };

    const props = {
      history
    };

    let mockedRender = mount(
      <Provider {...injectables}>
        <Router history={history}>
          <Header {...props} />
        </Router>
      </Provider>
    );

    await web3Service.fetchBlockNumber();

    await waitForNextTick();

    mockedRender.update();

    expect(
      mockedRender
        .find(dataTest('network-display'))
        .html()
        .trim()
    ).toBe(
      `<div data-test="network-display"><span class="active-timenodes"><i class="fa fa-th-large"></i>&nbsp;Network:&nbsp;</span><span class="timenode-count"><span>Kovan at #${CURRENT_BLOCK}</span></span></div>`
    );
  });
});
