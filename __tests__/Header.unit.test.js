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
import EacStore from '../app/stores/EacStore';
import { eacService } from '../__mocks__/EacServiceMock';

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
    const featuresService = {};

    const storageService = new LocalStorageService(new LocalStorageMock());
    const timeNodeStore = new TimeNodeStore({}, web3Service, {}, storageService);
    const transactionStatistics = {};

    const eacStore = new EacStore(eacService, featuresService, web3Service);

    const injectables = {
      featuresService,
      keenStore,
      storageService,
      web3Service,
      timeNodeStore,
      eacStore,
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
      `<div data-test="network-display" class="header-item"><span class="analytics-name"><i class="fa fa-th-large"></i>&nbsp;Network:&nbsp;</span><span class="analytics-count"><span>Kovan at #${CURRENT_BLOCK}</span></span></div>`
    );

    mockedRender.unmount();
  });
});
