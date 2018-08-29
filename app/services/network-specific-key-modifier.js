export default class NetworkSpecificKeyModifier {
  _networkId = null;

  setNetworkId(networkId) {
    this._networkId = networkId;
  }

  modify(key) {
    return `${this._networkId}-${key}`;
  }
}
