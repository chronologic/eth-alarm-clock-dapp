import createBrowserHistory from 'history/createBrowserHistory';
import { RouterStore, syncHistoryWithStore } from 'mobx-react-router';
import { TransactionStore } from './TransactionStore';
import TimeNodeStore from './TimeNodeStore';
import { services } from '../services';
import ScheduleStore from './ScheduleStore';
import DateTimeValidatorStore from './DateTimeValidatorStore';
import TransactionsCache from './TransactionsCache';
import { KeenStore } from './KeenStore';

const { eacService, web3Service } = services;

const keenStore = new KeenStore(
  process.env.KEEN_PROJECT_ID,
  process.env.KEEN_WRITE_KEY,
  process.env.KEEN_READ_KEY,
  web3Service
);

const browserHistory = createBrowserHistory();
const routingStore = new RouterStore();
const scheduleStore = new ScheduleStore(false);
const dateTimeValidatorStore = new DateTimeValidatorStore();

export const transactionsCache = new TransactionsCache(eacService);
export const transactionStore = new TransactionStore(eacService, web3Service, transactionsCache);
export const timeNodeStore = new TimeNodeStore(eacService, web3Service, keenStore);

//getCache running
transactionsCache.requestFactoryStartBlock = transactionsCache.requestFactoryStartBlock;
transactionsCache.startLazy();

export const history = syncHistoryWithStore(browserHistory, routingStore);

export const stores = {
  routing: routingStore,
  transactionStore,
  timeNodeStore,
  scheduleStore,
  dateTimeValidatorStore,
  keenStore
};
