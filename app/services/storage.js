export default class LocalStorageService {
  get localStorage() {
    return window && window.localStorage;
  }

  save(key, value) {
    this.localStorage.setItem(key, value);
  }

  load(key) {
    return this.localStorage.getItem(key);
  }

  remove(key) {
    return this.localStorage.removeItem(key);
  }
}
