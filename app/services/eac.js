import EAC from 'eac.js';
import RequestLib from '../abi/RequestLib';

let instance = null;
let web3 = null;

const additionalMethods = {
  getRequestLibInstance(address) {
    return web3.eth.contract(RequestLib).at(address);
  }
};

export function initEacService(web3Service) {
  if (!instance) {
    web3 = web3Service;
    instance = Object.assign(EAC(web3Service), additionalMethods);
  }

  return instance;
}
