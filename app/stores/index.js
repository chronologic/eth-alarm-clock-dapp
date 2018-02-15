import createBrowserHistory from 'history/createBrowserHistory';
import { RouterStore, syncHistoryWithStore } from 'mobx-react-router';
import { TransactionStore } from './TransactionStore';
import TimeNodeStore from './TimeNodeStore';
import { services } from '../services';
import ScheduleStore from './mobxStore';

const { eacService, web3Service } = services;

const browserHistory = createBrowserHistory();
const routingStore = new RouterStore();
const scheduleStore = new ScheduleStore(false);

export const transactionStore = new TransactionStore(eacService, web3Service);
export const timeNodeStore = new TimeNodeStore(eacService, web3Service);

export const history = syncHistoryWithStore(browserHistory, routingStore);

export const stores = {
  routing: routingStore,
  transactionStore,
  timeNodeStore,
  scheduleStore
};
