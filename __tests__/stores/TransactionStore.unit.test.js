import FeaturesService from '../../app/services/features';
import { Networks, KOVAN_NETWORK_ID } from '../../app/config/web3Config';
import { TransactionStore, TEMPORAL_UNIT } from '../../app/stores/TransactionStore';
import TransactionHelper from '../../app/services/transaction-helper';

describe('Stores / TransactionStore', () => {
  describe('getBountiesForBucket', () => {
    const MOCKED_TRANSACTIONS = [
      '0x123306090abab3a6e1400e9345bc60c78a8bef57',
      '0x456306090abab3a6e1400e9345bc60c78a8bef57'
    ];

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
        }
      },
      RequestData() {
        return {};
      }
    };

    const web3 = {
      network: Networks[KOVAN_NETWORK_ID],
      filter() {
        return {
          get(callback) {
            callback(null, []);
          }
        };
      },
      init: () => Promise.resolve(true)
    };

    const featuresService = new FeaturesService(web3);

    const fetcher = {
      startLazy() {},
      getTransactions() {
        return [];
      },
      calcBucketForTimestamp() {
        return Promise.resolve(1527588000);
      }
    };

    const getInstance = () => new TransactionStore(eacService, web3, fetcher, {}, featuresService);

    it('calls fetcher.getTransactionsInBuckets passing array as argument', async () => {
      const store = getInstance();

      const EXAMPLE_WINDOW_START = 1527588123;

      fetcher.getTransactionsInBuckets = buckets => {
        expect(buckets).toBeInstanceOf(Array);

        return [];
      };

      store._requestFactory = {
        calcBucket() {}
      };

      await store.getBountiesForBucket(EXAMPLE_WINDOW_START, true);
    });
  });

  describe('_queryTransactions', () => {
    const eacService = {
      getActiveContracts: () => {
        return {};
      },
      requestFactory: () =>
        Promise.resolve({
          getRequestCreatedLogs() {
            return [];
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

        getTimestampForBlock() {
          return 1525175672;
        }
      },
      RequestData() {
        return {};
      }
    };

    const web3 = {
      network: {
        id: KOVAN_NETWORK_ID
      },
      filter() {
        return {
          get(callback) {
            callback(null, []);
          }
        };
      },
      init: () => Promise.resolve(true)
    };

    const featuresService = new FeaturesService(web3);

    const fetcher = {
      startLazy() {},

      lastBlock: 7080464,

      getTransactions() {
        return [];
      },
      calcBucketForTimestamp() {
        return Promise.resolve(1527588000);
      }
    };

    const transactionHelper = new TransactionHelper({});

    const getInstance = () =>
      new TransactionStore(eacService, web3, fetcher, {}, featuresService, transactionHelper);

    it('sorts transactions by time when sortByTimestampAscending is true', async () => {
      const store = getInstance();

      const MOST_RECENT_TIMESTAMP_TX = {
        id: 1,
        temporalUnit: TEMPORAL_UNIT.TIMESTAMP,
        windowStart: 1547627092
      };
      const MIDDLE_TIMESTAMP_TX = {
        id: 2,
        temporalUnit: TEMPORAL_UNIT.TIMESTAMP,
        windowStart: 1547603100
      };
      const MIDDLE_BLOCK_TX = {
        id: 3,
        temporalUnit: TEMPORAL_UNIT.BLOCK,
        windowStart: 7490464
      };
      const OLDEST_TIMESTAMP_TX = {
        id: 4,
        temporalUnit: TEMPORAL_UNIT.TIMESTAMP,
        windowStart: 1530881172
      };
      const OLDEST_AND_BLOCK_TX = {
        id: 5,
        temporalUnit: TEMPORAL_UNIT.BLOCK,
        windowStart: 7280464
      };

      const UNSORTED_TXS = [
        OLDEST_AND_BLOCK_TX,
        MOST_RECENT_TIMESTAMP_TX,
        OLDEST_TIMESTAMP_TX,
        MIDDLE_BLOCK_TX,
        MIDDLE_TIMESTAMP_TX
      ];

      const offset = 0;
      const limit = 10;
      const resolved = true;
      const unresolved = false;
      const sortByTimestampAscending = true;

      transactionHelper.isTransactionResolved = () => true;

      const { transactions, total } = await store._queryTransactions({
        transactions: UNSORTED_TXS,
        offset,
        limit,
        resolved,
        unresolved,
        sortByTimestampAscending
      });

      expect(total).toBe(UNSORTED_TXS.length);

      expect(transactions[4]).toBe(MOST_RECENT_TIMESTAMP_TX);
      expect(transactions[3]).toBe(MIDDLE_TIMESTAMP_TX);
      expect(transactions[2]).toBe(MIDDLE_BLOCK_TX);
      expect(transactions[1]).toBe(OLDEST_TIMESTAMP_TX);
      expect(transactions[0]).toBe(OLDEST_AND_BLOCK_TX);
    });
  });
});
