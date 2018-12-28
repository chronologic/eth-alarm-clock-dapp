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

    const eacCounter = new EacCounter();

    await eacCounter.enableUSDFetching(process.env.NOMICS_API_KEY);

    const { eth, usd } = await eacCounter.getTotalTransferred();

    this.totalEthTransferred = Math.round(eth);
    this.totalUsdTransferred = Math.round(usd);
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
