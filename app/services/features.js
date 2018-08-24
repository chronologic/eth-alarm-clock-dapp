import { computed, observable } from 'mobx';
import { showNotification } from './notification';
import { Networks } from '../config/web3Config';

const supportedNetworks = () => {
  let supported = [];
  Object.keys(Networks).forEach(netId => {
    if (Networks[netId].supported) {
      supported.push(Networks[netId]);
    }
  });
  return supported;
};

export default class FeaturesService {
  _web3;

  @observable
  isCurrentNetworkSupported = null;

  constructor(web3Service) {
    this._web3 = web3Service;

    this._initializationPromise = this._initialize();
  }

  async _initialize() {
    await this._web3.init();

    this.isCurrentNetworkSupported = this._isCurrentNetworkSupported();

    if (!this.isCurrentNetworkSupported) {
      const networkList = supportedNetworks()
        .map(network => network.name)
        .join(', ');
      showNotification(
        `Network unsupported. Please change it to one of the following: <b>${networkList}</b>`,
        'danger'
      );
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
    return supportedNetworks().includes(this._web3.network);
  }
}
