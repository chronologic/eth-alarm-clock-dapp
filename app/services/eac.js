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

const getAdditionalMethods = web3Service => ({
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
    const contracts = require(`eac.js-lib/lib/assets/${chainName}.json`);
    return contracts;
  },

  async getTransactionsEventsForAddresses(addresses) {
    return new Promise(resolve => {
      const ABORTED_TOPIC = '0xc008bc849b42227c61d5063a1313ce509a6e99211bfd59e827e417be6c65c81b';
      const CANCELLED_TOPIC = '0xa761582a460180d55522f9f5fdc076390a1f48a7a62a8afbd45c1bb797948edb';
      const EXECUTED_TOPIC = '0x3e504bb8b225ad41f613b0c3c4205cdd752d1615b4d77cd1773417282fcfb5d9';

      web3Service
        .filter({
          address: addresses,
          topics: [[ABORTED_TOPIC, CANCELLED_TOPIC, EXECUTED_TOPIC]],
          fromBlock: 0,
          toBlock: 'latest'
        })
        .get((error, events) => {
          const TX_EVENTS_MAP = {};

          for (const event of events) {
            let eventType;

            switch (event.topics[0]) {
              case EXECUTED_TOPIC:
                eventType = TRANSACTION_EVENT.EXECUTED;
                break;
              case CANCELLED_TOPIC:
                eventType = TRANSACTION_EVENT.CANCELLED;
                break;
              case ABORTED_TOPIC:
                eventType = TRANSACTION_EVENT.ABORTED;
                break;
            }

            TX_EVENTS_MAP[event.address] = eventType;
          }

          resolve(TX_EVENTS_MAP);
        });
    });
  }
});

export function initEacService(web3Service) {
  if (!instance) {
    web3 = web3Service;
    instance = Object.assign(EAC(web3Service), getAdditionalMethods(web3Service));
  }

  return instance;
}
