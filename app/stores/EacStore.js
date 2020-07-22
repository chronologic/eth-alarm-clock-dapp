import { autorun, observable } from 'mobx';
import EacCounter from 'eac-counter';

export default class EacStore {
  @observable
  contracts = {};

  @observable
  totalEthTransferred = null;
  @observable
  totalUsdTransferred = null;

  constructor(eacService, featuresService, web3Service) {
    this._eac = eacService;
    this._featuresService = featuresService;
    this._web3Service = web3Service;

    autorun(() => this.refreshCurrentState());
  }

  async refreshCurrentState() {
    if (!this._featuresService._isCurrentNetworkSupported) {
      return;
    }

    await this._web3Service.init();

    this.contracts = await this._eac.getActiveContracts();

    const eacCounter = new EacCounter({
      nomicsApiKey: process.env.NOMICS_API_KEY,
      etherscanApiKey: process.env.ETHERSCAN_API_KEY
    });

    await eacCounter.enableUSDFetching();

    try {
      const { eth, usd } = await eacCounter.getTotalTransferred();

      console.log('TOTAL', { eth, usd });
      this.totalEthTransferred = Math.round(eth);
      this.totalUsdTransferred = usd ? Math.round(usd) : null;
    } catch (e) {
      console.error('TOTAL', e);
    }
  }

  getFormattedUSDTranferred() {
    const currencyFormatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    });
    return currencyFormatter.format(this.totalUsdTransferred);
  }
}
