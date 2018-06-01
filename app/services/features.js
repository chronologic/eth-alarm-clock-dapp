import { EAC_SUPPORTED_NETWORKS } from './eac';
import { computed, observable } from 'mobx';
import { showNotification } from './notification';

const UNSUPPORTED_NETWORK_MESSAGE = 'Network unsupported. Please change it to <b>Kovan.</b>';

export default class FeaturesService {
  _web3;

  @observable isCurrentNetworkSupported = null;

  constructor(web3Service) {
    this._web3 = web3Service;

    this._initializationPromise = this._initialize();
  }

  async _initialize() {
    await this._web3.init();

    this.isCurrentNetworkSupported = this._isCurrentNetworkSupported();

    if (!this.isCurrentNetworkSupported) {
      showNotification(UNSUPPORTED_NETWORK_MESSAGE, 'danger');
    }

    this.initialized = true;
  }

  _initializationPromise;

  async awaitInitialized() {
    return await this._initializationPromise;
  }

  @computed
  get enabled() {
    return {
      scheduling: this.isCurrentNetworkSupported,
      timenode: this.isCurrentNetworkSupported
    };
  }

  _isCurrentNetworkSupported() {
    return EAC_SUPPORTED_NETWORKS.includes(this._web3.network.id);
  }
}
