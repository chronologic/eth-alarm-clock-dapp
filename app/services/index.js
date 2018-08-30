import { initWeb3Service } from './web3';
import { initEacService } from './eac';
import LocalStorageService from './storage';
import FeaturesService from './features';
import NetworkAwareKeyModifier from './network-specific-key-modifier';
import NetworkAwareLocalStorageService from './network-aware-storage';

const networkAwareKeyModifier = new NetworkAwareKeyModifier();

const storageService = new LocalStorageService();
const networkAwareStorageService = new NetworkAwareLocalStorageService(
  undefined,
  networkAwareKeyModifier
);

const web3Service = initWeb3Service(false, window.web3, networkAwareKeyModifier);
web3Service.init();

const eacService = initEacService(web3Service);

const featuresService = new FeaturesService(web3Service);

export const services = {
  eacService,
  featuresService,
  storageService,
  networkAwareStorageService,
  web3Service
};
