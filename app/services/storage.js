export default class LocalStorageService {
  _localStorage = null;

  getBrowserLocalStorageInstance() {
    return window && window.localStorage;
  }

  constructor(localStorage = this.getBrowserLocalStorageInstance()) {
    this._localStorage = localStorage;
  }

  save(key, value) {
    this._localStorage.setItem(key, value);
  }

  load(key) {
    return this._localStorage.getItem(key);
  }

  remove(key) {
    return this._localStorage.removeItem(key);
  }
}
