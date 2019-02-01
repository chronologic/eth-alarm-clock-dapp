import React from 'react';
import renderer from 'react-test-renderer';
import { Provider } from 'mobx-react';
import Web3Service from '../app/services/web3';
import BigNumber from 'bignumber.js';
import TransactionDetails from '../app/components/TransactionScanner/TransactionDetails';
import { TransactionStore } from '../app/stores/TransactionStore';
import TokenHelper from '../app/services/token-helper';
import LoadingStateStore from '../app/stores/LoadingStateStore';
import TransactionHelper from '../app/services/transaction-helper';

describe('TransactionDetails', () => {
  it('correctly renders', async () => {
    const TEST_EXPLORER = 'https://etherscan.io/';

    const web3Service = new Web3Service({
      eth: {
        accounts: []
      },
      explorer: TEST_EXPLORER,
      web3: {
        eth: {
          contract() {
            return {
              at() {
                return {
                  name() {}
                };
              }
            };
          }
        },
        sha3() {
          return '';
        }
      },
      connect() {}
    });

    const eacService = {
      getRequestLibInstance() {
        return {
          Executed() {
            return {
              get(callback) {
                callback(null, []);
              }
            };
          }
        };
      },

      scheduler() {
        return {};
      }
    };

    const transactionHelper = new TransactionHelper();

    const transactionStore = new TransactionStore(
      eacService,
      web3Service,
      {},
      {},
      {},
      transactionHelper
    );
    const tokenHelper = new TokenHelper(web3Service);

    const loadingStateStore = new LoadingStateStore(web3Service, {}, transactionStore);

    const injectables = {
      eacService,
      loadingStateStore,
      tokenHelper,
      transactionStore,
      web3Service
    };

    const transaction = {
      bounty: new BigNumber('10000'),
      callData() {
        return 'xyz';
      },
      toAddress: '0x123306090abab3a6e1400e9345bc60c78a8bef57',
      data: {
        wasSuccessful: true
      },
      afterExecutionWindow: () => false
    };

    let mockedRender = renderer.create(
      <Provider {...injectables}>
        <TransactionDetails transaction={transaction} />
      </Provider>
    );

    let tree = mockedRender.toJSON();
    expect(tree).toMatchSnapshot();

    const tableRows = tree.children.find(el => el.props.className === 'table d-block').children[0]
      .children;

    // `To Address` field checks
    const toAddressTitleDisplay = tableRows[1].children[0].children[0];

    expect(toAddressTitleDisplay).toEqual('To Address');

    const toAddressExplorerLink = tableRows[1].children[1].children[0];

    expect(toAddressExplorerLink.props.href).toEqual(
      `${TEST_EXPLORER}address/${transaction.toAddress}`
    );

    const toAddressValueDisplay = tableRows[1].children[1].children[0].children[0];

    expect(toAddressValueDisplay).toEqual(transaction.toAddress);
  });
});
