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
import TransactionHelper from '../services/transaction-helper';
import BucketHelper from '../services/bucket-helper';
import { TransactionStatistics } from './TransactionStatistics';

const {
  eacService,
  featuresService,
  storageService,
  web3Service,
  networkAwareStorageService
} = services;

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
  storageService,
  eacVersions
);

const browserHistory = createBrowserHistory();
const routingStore = new RouterStore();
const scheduleStore = new ScheduleStore();
const dateTimeValidatorStore = new DateTimeValidatorStore();

export const transactionCache = new TransactionCache(networkAwareStorageService);

const transactionHelper = new TransactionHelper(transactionCache);
const bucketHelper = new BucketHelper();

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
  featuresService,
  transactionHelper,
  bucketHelper
);
export const timeNodeStore = new TimeNodeStore(eacService, web3Service, keenStore, storageService);

export const transactionStatistics = new TransactionStatistics(transactionHelper, transactionStore);

export const history = syncHistoryWithStore(browserHistory, routingStore);

export const stores = {
  dateTimeValidatorStore,
  keenStore,
  routing: routingStore,
  scheduleStore,
  timeNodeStore,
  transactionCache,
  transactionHelper,
  transactionStatistics,
  transactionStore
};
