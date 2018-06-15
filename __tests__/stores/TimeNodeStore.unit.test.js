import { ok } from 'assert';
import TimeNodeStore from '../../app/stores/TimeNodeStore';

class LocalStorageMock {
  constructor() {
    this.store = {};
  }

  clear() {
    this.store = {};
  }

  getItem(key) {
    return this.store[key] || null;
  }

  setItem(key, value) {
    this.store[key] = value.toString();
  }

  removeItem(key) {
    delete this.store[key];
  }
}

describe('Stores / TimeNode', () => {
  describe('getWorkerOptions', () => {
    it('does not try to decrypt password', () => {
      global.localStorage = new LocalStorageMock();
      const KEYSTORE = '{}';
      const KEYSTORE_PASSWORD = 'testtest';

      const timeNodeStore = new TimeNodeStore({}, {});

      timeNodeStore.decrypt = encodedValue => {
        if (encodedValue === KEYSTORE_PASSWORD) {
          ok(false, 'getWorkerOptions should not attempt to decrypt password passed to it');
        } else {
          ok(true);
        }
      };

      timeNodeStore.getWorkerOptions(KEYSTORE, KEYSTORE_PASSWORD);
    });
  });
});
