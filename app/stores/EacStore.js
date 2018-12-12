import { autorun, observable } from 'mobx';

export default class EacStore {
  @observable
  contracts = {};

  @observable
  totalEthTransferred = null;

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

    const totalEthTransferred = await this._eac.getTotalEthTransferred();
    this.totalEthTransferred = Math.round(totalEthTransferred);
  }
}
