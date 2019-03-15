import { Util } from '@ethereum-alarm-clock/lib';
import { initWeb3Service } from './web3';
import { initEacService } from './eac';
import LocalStorageService from './storage';
import FeaturesService from './features';
import NetworkAwareKeyModifier from './network-specific-key-modifier';
import NetworkAwareStorageService from './network-aware-storage';
import TokenHelper from './token-helper';

const networkAwareKeyModifier = new NetworkAwareKeyModifier();

const storageService = new LocalStorageService();
const networkAwareStorageService = new NetworkAwareStorageService(networkAwareKeyModifier);

if (window && window.ethereum && window.ethereum.enable) {
  window.ethereum.enable();
}

const web3Service = initWeb3Service(
  false,
  window.web3,
  networkAwareKeyModifier,
  new Util(window.web3)
);
web3Service.init();

const eacService = initEacService(web3Service);

const featuresService = new FeaturesService(web3Service);

const tokenHelper = new TokenHelper(web3Service);

export const services = {
  eacService,
  featuresService,
  networkAwareStorageService,
  storageService,
  tokenHelper,
  web3Service
};
