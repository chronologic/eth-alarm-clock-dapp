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
      load() {}
    };

    const transaction = {
      address: '0x123306090abab3b7e1400e9345bc60c78a8bef88',
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
      windowStart: new BigNumber(1),
      windowSize: new BigNumber(180)
    };

    const TRANSACTIONS = [transaction];

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

      isCurrentNetworkSupported: true
    };
    const transactionCache = new TransactionCache(storageService);
    const transactionStore = new TransactionStore(
      eacService,
      web3Service,
      fetcher,
      transactionCache,
      featuresService
    );

    transactionStore.isTransactionMissed = () => false;

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

    const domNode = mockedRender.getDOMNode();

    const firstRow = domNode.querySelectorAll('tbody > tr')[0];

    const bountyColumn = firstRow.querySelector(dataTest(TRANSACTION_ROW_TEST_ATTRS.BOUNTY_COLUMN));
    const windowSizeColumn = firstRow.querySelector(
      dataTest(TRANSACTION_ROW_TEST_ATTRS.WINDOW_SIZE_COLUMN)
    );

    expect(bountyColumn.innerHTML).toBe('10000 WEI');
    expect(windowSizeColumn.innerHTML).toBe('3 minutes');

    const transactionLink = firstRow.querySelector('a');

    expect(transactionLink.href).toBe(`/transactions/${transaction.address}`);
    expect(transactionLink.text).toBe(transaction.address);

    expect(mockedRender.find('thead tr').html()).toEqual(
      '<tr><th>Contract Address</th><th>Time</th><th>Bounty</th><th>TxValue</th><th>Deposit Amount</th><th>Time Window</th></tr>'
    );
    expect(
      mockedRender.find(dataTest(TRANSACTIONS_TABLE_TEST_ATTRS.INFO_TOTAL_ENTRIES)).text()
    ).toBe(`Showing 1 to ${TRANSACTIONS.length} of ${TRANSACTIONS.length} entries`);

    expect(mockedRender.find(dataTest(TRANSACTIONS_TABLE_TEST_ATTRS.INFO_NO_TRANSACTIONS)).html());
  });
});
