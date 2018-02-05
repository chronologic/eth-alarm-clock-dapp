import createBrowserHistory from 'history/createBrowserHistory';
import { RouterStore, syncHistoryWithStore } from 'mobx-react-router';
import { TransactionStore } from './TransactionStore';
import { initWeb3Service } from '../web3Service';
import EAC from 'eac.js';

const browserHistory = createBrowserHistory();
const routingStore = new RouterStore();

const web3 = initWeb3Service(false, window.web3);
const eac = EAC(web3);

export const transactionStore = new TransactionStore(eac, web3);

export const history = syncHistoryWithStore(browserHistory, routingStore);

export const stores = {
  routing: routingStore,
  transactionStore
};