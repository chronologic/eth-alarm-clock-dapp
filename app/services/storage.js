export default class StorageService {
  get localStorage() {
    return window && window.localStorage;
  }

  save(key, value) {
    this.localStorage.setItem(key, value);
  }

  load(key) {
    return this.localStorage.getItem(key);
  }
}
