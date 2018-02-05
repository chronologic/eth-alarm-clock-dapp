export class TransactionStore {
  _eac = null
  _web3 = null

  constructor(eac, web3) {
    this._web3 = web3;
    this._eac = eac;

    this.setup();
  }

  async setup() {
    // const requestFactory = await this._eac.requestFactory();

    // const trackerAddress = requestFactory.getTrackerAddress();
  }

  async getTransactions() {
    return [];
  }
}