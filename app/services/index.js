import { initWeb3Service } from './web3';
import { initEacService } from './eac';
import StorageService from './storage';

const web3Service = initWeb3Service(false, window.web3);
web3Service.init();

const eacService = initEacService(web3Service);

const storageService = new StorageService();

export const services = {
  eacService,
  storageService,
  web3Service
};
