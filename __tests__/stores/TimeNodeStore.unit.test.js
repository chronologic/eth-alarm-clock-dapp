import { ok } from 'assert';
import TimeNodeStore from '../../app/stores/TimeNodeStore';

describe('Stores / TimeNode', () => {
  describe('getWorkerOptions', () => {
    it('does not try to decrypt password', () => {
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
