import { initWeb3Service } from './web3';
import { initEacService } from './eac';
import LocalStorageService from './storage';
import FeaturesService from './features';

const web3Service = initWeb3Service(false, window.web3);
web3Service.init();

const eacService = initEacService(web3Service);

const storageService = new LocalStorageService();

const featuresService = new FeaturesService(web3Service);

export const services = {
  eacService,
  featuresService,
  storageService,
  web3Service
};
