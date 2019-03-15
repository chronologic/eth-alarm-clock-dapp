import TransactionFetcher from '../../app/stores/TransactionFetcher';
import { equal } from 'assert';
import TransactionCache from '../../app/stores/TransactionCache';
import FeaturesService from '../../app/services/features';
import { Networks, KOVAN_NETWORK_ID } from '../../app/config/web3Config';
import LocalStorageService from '../../app/services/storage';
import LocalStorageMock from '../../__mocks__/LocalStorageMock';

describe('Stores / TransactionFetcher', () => {
  describe('getTransactions', () => {
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
          getRequestCreatedEvents() {
            return MOCKED_TRANSACTIONS.map(tx => ({
              args: {
                request: tx,
                params: []
              }
            }));
          }
        }),
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

    const storageService = new LocalStorageService(new LocalStorageMock());

    const transactionsCache = new TransactionCache(storageService);

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

    const getInstance = () =>
      new TransactionFetcher(eacService, transactionsCache, web3, featuresService);

    it('fills allTransactionsAddresses', async () => {
      const TransactionsFetcher = getInstance();

      await TransactionsFetcher.getTransactions({});

      equal(TransactionsFetcher.allTransactionsAddresses.length, MOCKED_TRANSACTIONS.length);
      equal(TransactionsFetcher.allTransactionsAddresses[0], MOCKED_TRANSACTIONS[0]);
      equal(TransactionsFetcher.allTransactionsAddresses[1], MOCKED_TRANSACTIONS[1]);
    });

    it('returns transactions requests instances by default', async () => {
      const TransactionsFetcher = getInstance();

      const transactions = await TransactionsFetcher.getTransactions({});

      equal(transactions.length, MOCKED_TRANSACTIONS.length);
      equal(transactions[0].address, MOCKED_TRANSACTIONS[0]);
      equal(transactions[1].address, MOCKED_TRANSACTIONS[1]);
    });

    it('returns transactions requests instances when passing false as onlyAddresses parameter', async () => {
      const TransactionsFetcher = getInstance();

      TransactionFetcher._requestFactory = {};

      const transactions = await TransactionsFetcher.getTransactions({}, false, false);

      equal(transactions.length, MOCKED_TRANSACTIONS.length);
      equal(transactions[0].address, MOCKED_TRANSACTIONS[0]);
      equal(transactions[1].address, MOCKED_TRANSACTIONS[1]);
    });

    it('returns transactions addresses when passing true as onlyAddresses parameter', async () => {
      const TransactionsFetcher = getInstance();

      TransactionFetcher._requestFactory = {};

      const transactions = await TransactionsFetcher.getTransactions({}, false, true);

      equal(transactions.length, MOCKED_TRANSACTIONS.length);
      equal(transactions[0], MOCKED_TRANSACTIONS[0]);
      equal(transactions[1], MOCKED_TRANSACTIONS[1]);
    });
  });
});
