import EAC from 'eac.js-lib';
import BigNumber from 'bignumber.js';
import RequestLib from '../abi/RequestLib';

let instance = null;
let web3 = null;

export const TRANSACTION_EVENT = {
  ABORTED: 'aborted',
  CANCELLED: 'cancelled',
  EXECUTED: 'executed'
};

const getAdditionalProperties = () => ({
  getRequestLibInstance(address) {
    return web3.eth.contract(RequestLib).at(address);
  },

  calcEndowment(gasAmount = 0, amountToSend = 0, gasPrice = 0, fee = 0, payment = 0) {
    gasAmount = gasAmount || 0;
    amountToSend = amountToSend || 0;
    gasPrice = gasPrice || 0;
    fee = fee || 0;
    payment = payment || 0;

    const {
      Util: { calcEndowment }
    } = this;

    const endowment = calcEndowment(
      new BigNumber(gasAmount),
      new BigNumber(amountToSend),
      new BigNumber(gasPrice),
      new BigNumber(fee),
      new BigNumber(payment)
    );

    return endowment;
  },

  async getActiveContracts() {
    const { Util } = this;
    const chainName = await Util.getChainName();

    return require(`eac.js-lib/lib/assets/${chainName}.json`);
  }
});

export function initEacService(web3Service) {
  if (!instance) {
    web3 = web3Service;
    instance = Object.assign(EAC(web3Service), getAdditionalProperties());
  }
  return instance;
}
