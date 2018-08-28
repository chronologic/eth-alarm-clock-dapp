export default class NetworkAwareLocalStorageService {
  _localStorage = null;

  _keyModifier = null;

  constructor(localStorage = this.getBrowserLocalStorageInstance(), keyModifier) {
    this._localStorage = localStorage;
    this._keyModifier = keyModifier;
  }

  getBrowserLocalStorageInstance() {
    return window && window.localStorage;
  }

  save(key, value) {
    this._localStorage.setItem(this.getModifiedKey(key), value);
  }

  load(key) {
    return this._localStorage.getItem(this.getModifiedKey(key));
  }

  remove(key) {
    return this._localStorage.removeItem(this.getModifiedKey(key));
  }

  getModifiedKey(key) {
    return this._keyModifier ? this._keyModifier.modify(key) : key;
  }
}
