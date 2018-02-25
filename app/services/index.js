import { initWeb3Service } from './web3';
import { initEacService } from './eac';

const web3Service = initWeb3Service(false, window.web3);

web3Service.init();
const eacService = initEacService(web3Service);

export const services = {
  eacService,
  web3Service
};
