import createBrowserHistory from 'history/createBrowserHistory';
import { RouterStore, syncHistoryWithStore } from 'mobx-react-router';
import { TransactionStore } from './TransactionStore';
import TimeNodeStore from './TimeNodeStore';
import { services } from '../services';
import ScheduleStore from './ScheduleStore';
import DateTimeValidatorStore from './DateTimeValidatorStore';
import { KeenStore } from './KeenStore';
import TransactionFetcher from './TransactionFetcher';
import TransactionCache from './TransactionCache';

const { eacService, featuresService, storageService, web3Service } = services;

const eacVersions = {
  client: require('@ethereum-alarm-clock/timenode-core').version,
  contracts: eacService.contracts,
  lib: eacService.version
};

const keenStore = new KeenStore(
  process.env.KEEN_PROJECT_ID,
  process.env.KEEN_WRITE_KEY,
  process.env.KEEN_READ_KEY,
  web3Service,
  eacVersions
);

const browserHistory = createBrowserHistory();
const routingStore = new RouterStore();
const scheduleStore = new ScheduleStore();
const dateTimeValidatorStore = new DateTimeValidatorStore();

export const transactionCache = new TransactionCache(storageService);
export const transactionFetcher = new TransactionFetcher(
  eacService,
  transactionCache,
  web3Service,
  featuresService
);
export const transactionStore = new TransactionStore(
  eacService,
  web3Service,
  transactionFetcher,
  transactionCache,
  featuresService
);
export const timeNodeStore = new TimeNodeStore(eacService, web3Service, keenStore, storageService);

export const history = syncHistoryWithStore(browserHistory, routingStore);

export const stores = {
  routing: routingStore,
  transactionStore,
  transactionCache,
  timeNodeStore,
  scheduleStore,
  dateTimeValidatorStore,
  keenStore
};
