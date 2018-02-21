import createBrowserHistory from 'history/createBrowserHistory';
import { RouterStore, syncHistoryWithStore } from 'mobx-react-router';
import { TransactionStore } from './TransactionStore';
import TimeNodeStore from './TimeNodeStore';
import { services } from '../services';
import ScheduleStore from './mobxStore';
import DateTimeValidatorStore from './DateTimeValidatorStore';
import TransactionsCache from './TransactionsCache';

const { eacService, web3Service } = services;

const browserHistory = createBrowserHistory();
const routingStore = new RouterStore();
const scheduleStore = new ScheduleStore(false);
const dateTimeValidatorStore = new DateTimeValidatorStore();

export const transactionsCache = new TransactionsCache(eacService);
export const transactionStore = new TransactionStore(eacService, web3Service, transactionsCache);
export const timeNodeStore = new TimeNodeStore(eacService, web3Service);

//getCache running
transactionsCache.requestFactoryStartBlock = transactionsCache.requestFactoryStartBlock;
transactionsCache.startLazy();

export const history = syncHistoryWithStore(browserHistory, routingStore);

export const stores = {
  routing: routingStore,
  transactionStore,
  timeNodeStore,
  scheduleStore,
  dateTimeValidatorStore
};
