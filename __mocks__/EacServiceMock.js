export const MOCKED_TRANSACTIONS = [
  '0x123306090abab3a6e1400e9345bc60c78a8bef57',
  '0x456306090abab3a6e1400e9345bc60c78a8bef57'
];

export const eacService = {
  calcEndowment(num) {
    return num;
  },
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
  },
  getTotalEthTransferred: () => {
    return 1000;
  }
};
