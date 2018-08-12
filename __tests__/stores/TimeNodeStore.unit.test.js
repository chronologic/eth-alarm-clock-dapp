import { equal, ok } from 'assert';
import TimeNodeStore from '../../app/stores/TimeNodeStore';
import LocalStorageMock from '../../__mocks__/LocalStorageMock';
import LocalStorageService from '../../app/services/storage';

describe('Stores / TimeNode', () => {
  describe('getWorkerOptions', () => {
    it('does not try to decrypt password', () => {
      const KEYSTORE = '{}';
      const KEYSTORE_PASSWORD = 'testtest';

      const localStorageMock = new LocalStorageMock();
      const storageService = new LocalStorageService(localStorageMock);
      const timeNodeStore = new TimeNodeStore({}, {}, {}, storageService);

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

  describe('getMyAddress', () => {
    it('does not add 0x to address with 0x already', () => {
      const localStorageMock = new LocalStorageMock();
      const storageService = new LocalStorageService(localStorageMock);
      const timeNodeStore = new TimeNodeStore({}, {}, {}, storageService);

      timeNodeStore.walletKeystore = 'keystore';

      timeNodeStore.decrypt = () => {
        return JSON.stringify({ address: '0x5d89724641b4fCA3239CD69f2894ee4d5A12e8b7' });
      };

      equal(timeNodeStore.getMyAddress(), '0x5d89724641b4fCA3239CD69f2894ee4d5A12e8b7');

      timeNodeStore.decrypt = () => {
        return JSON.stringify({ address: '5d89724641b4fCA3239CD69f2894ee4d5A12e8b7' });
      };

      equal(timeNodeStore.getMyAddress(), '0x5d89724641b4fCA3239CD69f2894ee4d5A12e8b7');
    });
  });
});
