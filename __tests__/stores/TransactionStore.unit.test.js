import FeaturesService from '../../app/services/features';
import { KOVAN_NETWORK_ID } from '../../app/config/web3Config';
import { TransactionStore } from '../../app/stores/TransactionStore';

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
      awaitInitialized: () => Promise.resolve(true)
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

      await store.getBountiesForBucket(EXAMPLE_WINDOW_START, true);
    });
  });
});
