import { W3Util } from '@ethereum-alarm-clock/timenode-core';
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
const w3Util = new W3Util();

if (window && window.ethereum && window.ethereum.enable) {
  window.ethereum.enable();
}

const web3Service = initWeb3Service(false, window.web3, networkAwareKeyModifier, w3Util);
web3Service.init();

// EAC requires web3 0.x so this is a temporary workaround until it gets updated
let eacWeb3Service = Object.assign(Object.create(Object.getPrototypeOf(web3Service)), web3Service);
eacWeb3Service.web3 = eacWeb3Service.web3_0;
eacWeb3Service = Object.assign(eacWeb3Service, eacWeb3Service.web3);

const eacService = initEacService(eacWeb3Service);

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
