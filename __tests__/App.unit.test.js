import React from 'react';
import { Provider } from 'mobx-react';
import Web3Service from '../app/services/web3';
import BigNumber from 'bignumber.js';
import { TransactionStore, TEMPORAL_UNIT } from '../app/stores/TransactionStore';
import TransactionCache from '../app/stores/TransactionCache';
import moment from 'moment';
import momentDurationFormatSetup from 'moment-duration-format';
import Enzyme, { mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import { Route, MemoryRouter } from 'react-router-dom';
import App from '../app/components/App';
import TimeNodeStore from '../app/stores/TimeNodeStore';
import ScheduleStore from '../app/stores/ScheduleStore';
import DateTimeValidator from '../app/stores/DateTimeValidatorStore';
import LocalStorageService from '../app/services/storage';
import LocalStorageMock from '../__mocks__/LocalStorageMock';

momentDurationFormatSetup(moment);

Enzyme.configure({ adapter: new Adapter() });

describe.skip('App', () => {
  it('correctly navigates when clicking links', async () => {
    const TEST_EXPLORER = 'https://etherscan.io/';

    const MOCKED_TRANSACTIONS = [
      '0x123306090abab3a6e1400e9345bc60c78a8bef57',
      '0x456306090abab3a6e1400e9345bc60c78a8bef57'
    ];

    const web3Service = new Web3Service({
      eth: {
        accounts: []
      },
      explorer: TEST_EXPLORER,
      web3: {
        fromWei: a => a,
        toWei: a => a,
        isConnected: () => true,
        eth: {
          contract() {
            return {
              at() {
                return {
                  name() {}
                };
              }
            };
          }
        },

        sha3() {
          return '';
        }
      },
      filter() {
        return {
          get(callback) {
            callback(null, []);
          }
        };
      },
      connect() {},
      init: () => Promise.resolve(true)
    });

    const eacService = {
      calcEndowment(num) {
        return num;
      },
      getActiveContracts: () => {
        return {};
      },
      requestFactory: () =>
        Promise.resolve({
          getRequestCreatedLogs() {
            return MOCKED_TRANSACTIONS.map(tx => ({
              args: {
                request: tx,
                params: []
              }
            }));
          }
        }),
      scheduler: () => Promise.resolve({}),

      transactionRequest(address) {
        return {
          address
        };
      },
      getTransactionsEventsForAddresses() {
        return {};
      },
      Util: {
        getBlockNumber() {
          return 1;
        },
        getTimestampForBlock: () => 123
      },
      RequestData() {
        return {};
      }
    };

    const TRANSACTIONS_LENGTH = 20;

    const TRANSACTIONS = [];

    for (let i = 0; i < TRANSACTIONS_LENGTH; i++) {
      TRANSACTIONS.push({
        address: `0x123306090abab3b7e1400e9345bc60c78a8bef${i < 10 ? '0' + i : i}`,
        bounty: new BigNumber('10000'),
        callData() {
          return 'xyz';
        },
        toAddress: '0x123306090abab3a6e1400e9345bc60c78a8bef57',
        data: {
          wasSuccessful: true
        },
        temporalUnit: TEMPORAL_UNIT.TIMESTAMP,
        afterExecutionWindow: () => false,
        executionWindowEnd: new BigNumber(1),
        windowStart: new BigNumber(1 + i),
        windowSize: new BigNumber(180 * (i + 1))
      });
    }

    const fetcher = {
      startLazy() {},

      lastBlock: 7080464,

      getTransactions() {
        return TRANSACTIONS;
      },
      calcBucketForTimestamp() {
        return Promise.resolve(1527588000);
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

    const storageService = new LocalStorageService(new LocalStorageMock());

    const transactionCache = new TransactionCache(storageService);
    const transactionStore = new TransactionStore(
      eacService,
      web3Service,
      fetcher,
      transactionCache,
      featuresService
    );

    const timeNodeStore = new TimeNodeStore({}, {}, {}, storageService);

    const scheduleStore = new ScheduleStore();

    const keenStore = {};

    const dateTimeValidatorStore = new DateTimeValidator();

    const injectables = {
      dateTimeValidatorStore,
      eacService,
      featuresService,
      keenStore,
      scheduleStore,
      storageService,
      transactionStore,
      timeNodeStore,
      web3Service
    };

    let mockedRender = mount(
      <Provider {...injectables}>
        <MemoryRouter>
          <Route component={App} path="/" />
        </MemoryRouter>
      </Provider>
    );

    expect(mockedRender.find('.sidebar-menu .menu-items span.active').length).toBe(1);

    let activeMenuItem = mockedRender.find('.sidebar-menu .menu-items a.active');

    expect(activeMenuItem.props().href).toBe('/');
    expect(activeMenuItem.find('.title').text()).toBe('Schedule');
    expect(mockedRender.find('.view-title').text()).toBe('Schedule Transaction');

    mockedRender.find('a[href="/timenode"]').simulate('click', {
      button: 0
    });

    mockedRender.update();

    activeMenuItem = mockedRender.find('.sidebar-menu .menu-items a.active');

    expect(activeMenuItem.find('.title').text()).toBe('TimeNode');
    expect(activeMenuItem.props().href).toBe('/timenode');

    expect(
      mockedRender
        .find('.view-title')
        .text()
        .trim()
    ).toBe('TimeNode');
    expect(
      mockedRender
        .find('.tab-pane.active h2')
        .text()
        .trim()
    ).toBe('Select Your Wallet File');
    expect(
      mockedRender
        .find('#verifyWalletBtn')
        .text()
        .trim()
    ).toBe('Unlock');
    expect(mockedRender.find('#verifyWalletBtn').props().disabled).toBe(true);

    mockedRender.find('a[href="/faucet"]').simulate('click', {
      button: 0
    });

    mockedRender.update();

    activeMenuItem = mockedRender.find('.sidebar-menu .menu-items a.active');

    expect(activeMenuItem.find('.title').text()).toBe('Faucet');
    expect(activeMenuItem.props().href).toBe('/faucet');

    expect(
      mockedRender
        .find('.view-title')
        .text()
        .trim()
    ).toBe('DAY Token Faucet');
    expect(
      mockedRender
        .find('#faucet button')
        .text()
        .trim()
    ).toBe('Get Testnet DAY');
    expect(mockedRender.find('#faucet button').props().disabled).toBe(true);

    expect(mockedRender.find('#searchOverlay').exists()).toBe(false);

    mockedRender.find('.search-link').simulate('click', {
      button: 0
    });

    mockedRender.update();

    expect(mockedRender.find('#searchOverlay').exists()).toBe(true);
    expect(mockedRender.find('#overlay-search').props().placeholder).toBe(
      'Search by address / tx hash...'
    );
    expect(
      mockedRender
        .find('#searchOverlayButton')
        .text()
        .trim()
    ).toBe('Search');
    expect(mockedRender.find('#searchOverlayButton').props().disabled).toBe(undefined);

    mockedRender.find('.close-icon-light').simulate('click', {
      button: 0
    });

    mockedRender.update();

    expect(mockedRender.find('#searchOverlay').exists()).toBe(false);

    mockedRender.find('.search-link').simulate('click', {
      button: 0
    });

    mockedRender.update();

    expect(mockedRender.find('#searchOverlay').exists()).toBe(true);

    expect(mockedRender.find('#overlay-search').getDOMNode().nodeValue).toBe(null);

    expect(mockedRender.find('.searchError').text()).toBe('');

    function fillSearchField(text) {
      mockedRender.find('input#overlay-search').simulate('change', {
        target: {
          value: text
        }
      });

      mockedRender.find('input#overlay-search').getDOMNode().value = text;
    }

    const INVALID_ADDRESS = '0x123';
    const VALID_ADDRESS = MOCKED_TRANSACTIONS[0];

    fillSearchField(INVALID_ADDRESS);

    mockedRender.find('#searchOverlayButton').simulate('click');

    mockedRender.update();

    expect(mockedRender.find('#overlay-search').getDOMNode().value).toBe(INVALID_ADDRESS);
    expect(mockedRender.find('.searchError').text()).toBe('Invalid address or transaction hash.');

    mockedRender.update();

    fillSearchField(VALID_ADDRESS);

    expect(mockedRender.find('#overlay-search').getDOMNode().value).toBe(VALID_ADDRESS);
    expect(mockedRender.find('.searchError').text()).toBe('');
  });
});
