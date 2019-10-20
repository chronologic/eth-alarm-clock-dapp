import createBrowserHistory from 'history/createBrowserHistory';
import { RouterStore, syncHistoryWithStore } from 'mobx-react-router';
import { TransactionStore } from './TransactionStore';
import TimeNodeStore from './TimeNodeStore';
import { services } from '../services';
import ScheduleStore from './ScheduleStore';
import DateTimeValidatorStore from './DateTimeValidatorStore';
import { AnalyticsStore } from './AnalyticsStore';
import TransactionFetcher from './TransactionFetcher';
import TransactionCache from './TransactionCache';
import TransactionHelper from '../services/transaction-helper';
import BucketHelper from '../services/bucket-helper';
import { TransactionStatistics } from './TransactionStatistics';
import LoadingStateStore from './LoadingStateStore';
import EacStore from './EacStore';

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

const analyticsStore = new AnalyticsStore(
  process.env.MIXPANEL_TOKEN,
  process.env.MIXPANEL_QUERY_TOKEN,
  web3Service,
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
export const timeNodeStore = new TimeNodeStore(
  eacService,
  web3Service,
  analyticsStore,
  storageService
);

export const transactionStatistics = new TransactionStatistics(transactionHelper, transactionStore);

export const history = syncHistoryWithStore(browserHistory, routingStore);

const loadingStateStore = new LoadingStateStore(web3Service, featuresService, transactionStore);

export const eacStore = new EacStore(eacService, featuresService, web3Service);

export const stores = {
  dateTimeValidatorStore,
  eacStore,
  loadingStateStore,
  analyticsStore,
  routing: routingStore,
  scheduleStore,
  timeNodeStore,
  transactionCache,
  transactionHelper,
  transactionStatistics,
  transactionStore
};
