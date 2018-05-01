import TransactionsCache from '../../app/stores/TransactionsCache';
import { equal, ok } from 'assert';

describe('Stores / TransactionsCache', () => {
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
      }
    };

    it('fills allTransactions', async () => {
      const transactionsCache = new TransactionsCache(eacService);

      await transactionsCache.getTransactions({});

      equal(transactionsCache.allTransactions.length, MOCKED_TRANSACTIONS.length);
      equal(transactionsCache.allTransactions[0].address, MOCKED_TRANSACTIONS[0]);
      equal(transactionsCache.allTransactions[1].address, MOCKED_TRANSACTIONS[1]);
    });

    it('fills allTransactionsAddresses', async () => {
      const transactionsCache = new TransactionsCache(eacService);

      await transactionsCache.getTransactions({});

      equal(transactionsCache.allTransactionsAddresses.length, MOCKED_TRANSACTIONS.length);
      equal(transactionsCache.allTransactionsAddresses[0], MOCKED_TRANSACTIONS[0]);
      equal(transactionsCache.allTransactionsAddresses[1], MOCKED_TRANSACTIONS[1]);
    });

    it('returns transactions requests instances by default', async () => {
      const transactionsCache = new TransactionsCache(eacService);

      const transactions = await transactionsCache.getTransactions({});

      equal(transactions.length, MOCKED_TRANSACTIONS.length);
      equal(transactions[0].address, MOCKED_TRANSACTIONS[0]);
      equal(transactions[1].address, MOCKED_TRANSACTIONS[1]);
    });

    it('returns transactions requests instances when passing false as onlyAddresses parameter', async () => {
      const transactionsCache = new TransactionsCache(eacService);

      const transactions = await transactionsCache.getTransactions({}, false, false);

      equal(transactions.length, MOCKED_TRANSACTIONS.length);
      equal(transactions[0].address, MOCKED_TRANSACTIONS[0]);
      equal(transactions[1].address, MOCKED_TRANSACTIONS[1]);
    });

    it('returns transactions addresses when passing true as onlyAddresses parameter', async () => {
      const transactionsCache = new TransactionsCache(eacService);

      const transactions = await transactionsCache.getTransactions({}, false, true);

      equal(transactions.length, MOCKED_TRANSACTIONS.length);
      equal(transactions[0], MOCKED_TRANSACTIONS[0]);
      equal(transactions[1], MOCKED_TRANSACTIONS[1]);
    });

    it('calls getTransactionsInLastHours() when pastHours parameter is a number', async () => {
      const transactionsCache = new TransactionsCache(eacService);

      let getTransactionsInLastHoursCalled = false;

      transactionsCache.getTransactionsInLastHours = () => {
        getTransactionsInLastHoursCalled = true;

        return {
          addresses: [],
          transactions: []
        };
      };

      await transactionsCache.getTransactions({ pastHours: 24 }, false, true);

      ok(getTransactionsInLastHoursCalled);
    });

    it('throws when pastHours parameter is truthy, but not a number', async () => {
      const transactionsCache = new TransactionsCache(eacService);

      let errorThrown = false;

      try {
        await transactionsCache.getTransactions({ pastHours: true }, false, true);
      } catch (error) {
        errorThrown = true;

        equal(error.message, 'pastHours parameter in getTransactions must be a number.');
      }

      ok(errorThrown);
    });

    it('calls getTransactionsByBlocks() when pastHours parameter is not defined', async () => {
      const transactionsCache = new TransactionsCache(eacService);

      let getTransactionsByBlocksCalled = false;

      transactionsCache.getTransactionsByBlocks = () => {
        getTransactionsByBlocksCalled = true;

        return {
          addresses: [],
          transactions: []
        };
      };

      await transactionsCache.getTransactions({}, false, true);

      ok(getTransactionsByBlocksCalled);
    });
  });
});
