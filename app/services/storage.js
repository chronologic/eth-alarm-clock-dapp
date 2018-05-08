const { localStorage } = window;

export default class StorageService {
  save(key, value) {
    localStorage.setItem(key, value);
  }

  load(key) {
    return localStorage.getItem(key);
  }
}
