export default class NetworkSpecificKeyModifier {
  _networkId = null;
  _initializationPromise = null;
  _initializationPromiseResolver = null;

  constructor() {
    this._initializationPromise = new Promise(
      resolve => (this._initializationPromiseResolver = resolve)
    );
  }

  setNetworkId(networkId) {
    this._networkId = networkId;
    this._initializationPromiseResolver();
  }

  modify(key) {
    return `${this._networkId}-${key}`;
  }

  waitForInitialization() {
    return this._initializationPromise;
  }
}
