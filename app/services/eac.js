import EAC from 'eac.js';

let instance = null;

export function initEacService(web3Service) {
  if (!instance) {
    instance = EAC(web3Service);
  }

  return instance;
}
