import createBrowserHistory from 'history/createBrowserHistory';
import { RouterStore, syncHistoryWithStore } from 'mobx-react-router';
import { TransactionStore } from './TransactionStore';
import { services } from '../services';
import { default as scheduleStore } from './mobxStore';

const { eacService, web3Service } = services;

const browserHistory = createBrowserHistory();
const routingStore = new RouterStore();
const scheduleStores = new scheduleStore(false,scheduleStore);

export const transactionStore = new TransactionStore(eacService, web3Service);

export const history = syncHistoryWithStore(browserHistory, routingStore);
//export const mobx_store = initStore()
export const stores = {
  routing: routingStore,
  transactionStore,
  //scheduleStore
  scheduleStore:scheduleStores
};
