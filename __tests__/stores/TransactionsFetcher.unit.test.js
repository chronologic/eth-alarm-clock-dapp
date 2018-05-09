import TransactionFetcher from '../../app/stores/TransactionFetcher';
import { equal, ok } from 'assert';
import TransactionCache from '../../app/stores/TransactionCache';

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
          getRequestCreatedLogs() {
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

    class StorageService {
      map = {};

      save(key, value) {
        this.map[key] = value;
      }

      load(key) {
        return this.map[key];
      }
    }

    const storageService = new StorageService();

    const transactionsCache = new TransactionCache(storageService);

    const web3 = {
      filter() {
        return {
          get(callback) {
            callback(null, []);
          }
        };
      }
    };

    const getInstance = () => new TransactionFetcher(eacService, transactionsCache, web3);

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

      const transactions = await TransactionsFetcher.getTransactions({}, false, false);

      equal(transactions.length, MOCKED_TRANSACTIONS.length);
      equal(transactions[0].address, MOCKED_TRANSACTIONS[0]);
      equal(transactions[1].address, MOCKED_TRANSACTIONS[1]);
    });

    it('returns transactions addresses when passing true as onlyAddresses parameter', async () => {
      const TransactionsFetcher = getInstance();

      const transactions = await TransactionsFetcher.getTransactions({}, false, true);

      equal(transactions.length, MOCKED_TRANSACTIONS.length);
      equal(transactions[0], MOCKED_TRANSACTIONS[0]);
      equal(transactions[1], MOCKED_TRANSACTIONS[1]);
    });

    it('calls getTransactionsInLastHours() when pastHours parameter is a number', async () => {
      const TransactionsFetcher = getInstance();

      let getTransactionsInLastHoursCalled = false;

      TransactionsFetcher.getTransactionsInLastHours = () => {
        getTransactionsInLastHoursCalled = true;

        return [];
      };

      await TransactionsFetcher.getTransactions({ pastHours: 24 }, false, true);

      ok(getTransactionsInLastHoursCalled);
    });

    it('throws when pastHours parameter is truthy, but not a number', async () => {
      const TransactionsFetcher = getInstance();

      let errorThrown = false;

      try {
        await TransactionsFetcher.getTransactions({ pastHours: true }, false, true);
      } catch (error) {
        errorThrown = true;

        equal(error.message, 'pastHours parameter in getTransactions must be a number.');
      }

      ok(errorThrown);
    });

    it('calls getTransactionsByBlocks() when pastHours parameter is not defined', async () => {
      const TransactionsFetcher = getInstance();

      let getTransactionsByBlocksCalled = false;

      TransactionsFetcher.getTransactionsByBlocks = () => {
        getTransactionsByBlocksCalled = true;

        return [];
      };

      await TransactionsFetcher.getTransactions({}, false, true);

      ok(getTransactionsByBlocksCalled);
    });
  });
});
