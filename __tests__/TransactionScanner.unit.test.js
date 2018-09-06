import React from 'react';
import { Provider } from 'mobx-react';
import Web3Service from '../app/services/web3';
import BigNumber from 'bignumber.js';
import { TransactionStore, TEMPORAL_UNIT } from '../app/stores/TransactionStore';
import TransactionScanner from '../app/components/TransactionScanner/index';
import TransactionCache from '../app/stores/TransactionCache';
import moment from 'moment';
import momentDurationFormatSetup from 'moment-duration-format';
import Enzyme, { mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import { Router } from 'react-router-dom';
import createBrowserHistory from 'history/createBrowserHistory';
import { RouterStore, syncHistoryWithStore } from 'mobx-react-router';
import { TRANSACTION_ROW_TEST_ATTRS } from '../app/components/TransactionScanner/TransactionRow';
import { TRANSACTIONS_TABLE_TEST_ATTRS } from '../app/components/TransactionScanner/TransactionsTable';
import { TRANSACTION_SCANNER_LIMIT } from '../app/components/TransactionScanner/TransactionScanner';
import TransactionHelper from '../app/services/transaction-helper';

momentDurationFormatSetup(moment);

const browserHistory = createBrowserHistory();
const routingStore = new RouterStore();

const history = syncHistoryWithStore(browserHistory, routingStore);

Enzyme.configure({ adapter: new Adapter() });

const waitForNextTick = () => new Promise(resolve => setTimeout(resolve, 0));
const dataTest = name => `[data-test="${name}"]`;

describe('TransactionScanner', () => {
  it('correctly renders', async () => {
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

    const storageService = {
      load() {},
      waitForInitialization: () => Promise.resolve()
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
      },

      fillUpTransactions() {}
    };

    const featuresService = {
      awaitInitialized() {
        return true;
      },

      isCurrentNetworkSupported: true
    };
    const transactionCache = new TransactionCache(storageService);
    const transactionHelper = new TransactionHelper(transactionCache);

    transactionHelper.isTransactionMissed = () => false;

    const transactionStore = new TransactionStore(
      eacService,
      web3Service,
      fetcher,
      transactionCache,
      featuresService,
      transactionHelper
    );

    const injectables = {
      eacService,
      transactionStore,
      web3Service
    };

    let mockedRender = mount(
      <Provider {...injectables}>
        <Router history={history}>
          <TransactionScanner includeUnresolved />
        </Router>
      </Provider>
    );

    expect(
      mockedRender.find(dataTest(TRANSACTIONS_TABLE_TEST_ATTRS.INFO_TOTAL_ENTRIES)).text()
    ).toBe('Showing 1 to 0 of  entries');

    await waitForNextTick();

    mockedRender.update();

    expect(
      mockedRender
        .find('.pagination-entry.bold')
        .text()
        .trim()
    ).toBe('1');

    let rows = mockedRender.find('table tbody tr');

    let firstRow = rows.at(0);

    const FIRST_TRANSACTION_ON_FIRST_PAGE = TRANSACTIONS[0];

    expect(firstRow.find(dataTest(TRANSACTION_ROW_TEST_ATTRS.BOUNTY_COLUMN)).text()).toBe(
      '10000 WEI'
    );
    expect(firstRow.find(dataTest(TRANSACTION_ROW_TEST_ATTRS.WINDOW_SIZE_COLUMN)).text()).toBe(
      '3 minutes'
    );
    expect(firstRow.find('a').props().href).toBe(
      `/transactions/${FIRST_TRANSACTION_ON_FIRST_PAGE.address}`
    );
    expect(firstRow.find('a').text()).toBe(FIRST_TRANSACTION_ON_FIRST_PAGE.address);

    expect(mockedRender.find('thead tr').html()).toEqual(
      '<tr><th>Contract Address</th><th>Time</th><th>Bounty</th><th>TxValue</th><th>Deposit Amount</th><th>Time Window</th></tr>'
    );
    expect(
      mockedRender.find(dataTest(TRANSACTIONS_TABLE_TEST_ATTRS.INFO_TOTAL_ENTRIES)).text()
    ).toBe(`Showing 1 to ${TRANSACTION_SCANNER_LIMIT} of ${TRANSACTIONS.length} entries`);

    mockedRender.update();

    mockedRender.find(dataTest(TRANSACTIONS_TABLE_TEST_ATTRS.NEXT_PAGE)).simulate('click');

    await waitForNextTick();

    mockedRender.update();

    expect(
      mockedRender
        .find('.pagination-entry.bold')
        .text()
        .trim()
    ).toBe('2');

    firstRow = mockedRender.find('table tbody tr').at(0);

    const FIRST_TRANSACTION_ON_SECOND_PAGE = TRANSACTIONS[TRANSACTION_SCANNER_LIMIT];

    expect(firstRow.find(dataTest(TRANSACTION_ROW_TEST_ATTRS.BOUNTY_COLUMN)).text()).toBe(
      '10000 WEI'
    );
    expect(firstRow.find(dataTest(TRANSACTION_ROW_TEST_ATTRS.WINDOW_SIZE_COLUMN)).text()).toBe(
      '33 minutes'
    );
    expect(firstRow.find('a').props().href).toBe(
      `/transactions/${FIRST_TRANSACTION_ON_SECOND_PAGE.address}`
    );
    expect(firstRow.find('a').text()).toBe(FIRST_TRANSACTION_ON_SECOND_PAGE.address);

    expect(
      mockedRender.find(dataTest(TRANSACTIONS_TABLE_TEST_ATTRS.INFO_TOTAL_ENTRIES)).text()
    ).toBe(
      `Showing ${TRANSACTION_SCANNER_LIMIT + 1} to ${TRANSACTION_SCANNER_LIMIT * 2} of ${
        TRANSACTIONS.length
      } entries`
    );

    expect(rows.length).toBe(TRANSACTION_SCANNER_LIMIT);

    expect(mockedRender.find(dataTest(TRANSACTIONS_TABLE_TEST_ATTRS.INFO_NO_TRANSACTIONS)).html());
  });
});
