import { ok } from 'assert';
import TimeNodeStore from '../../app/stores/TimeNodeStore';
import LocalStorageMock from '../../__mocks__/LocalStorageMock';
import { services } from '../../app/services';

describe('Stores / TimeNode', () => {
  describe('getWorkerOptions', () => {
    it('does not try to decrypt password', () => {
      global.localStorage = new LocalStorageMock();
      const KEYSTORE = '{}';
      const KEYSTORE_PASSWORD = 'testtest';

      const timeNodeStore = new TimeNodeStore({}, {}, {}, services.storageService);

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
