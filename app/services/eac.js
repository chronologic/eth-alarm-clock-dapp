import { EAC, Analytics, RequestFactory } from '@ethereum-alarm-clock/lib';
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

    const endowment = this.util.calcEndowment(
      new BigNumber(gasAmount),
      new BigNumber(amountToSend),
      new BigNumber(gasPrice),
      new BigNumber(fee),
      new BigNumber(payment)
    );

    return endowment;
  },

  async getActiveContracts() {
    const contractsAddresses = await this.util.getContractsAddresses();
    return contractsAddresses;
  },

  async getTotalEthTransferred() {
    const addresses = await this.util.getContractsAddresses();
    const requestFactory = new RequestFactory(addresses.requestFactory, this.web3);
    const analytics = new Analytics(this.web3, requestFactory);
    return await analytics.getTotalEthTransferred();
  }
});

export function initEacService(web3Service) {
  if (!instance) {
    instance = Object.assign(new EAC(web3Service.web3), getAdditionalProperties());
  }
  return instance;
}
