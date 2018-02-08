import createBrowserHistory from 'history/createBrowserHistory';
import { RouterStore, syncHistoryWithStore } from 'mobx-react-router';
import { TransactionStore } from './TransactionStore';
import { services } from '../services';
import { blockSettings,timeSettings,bountySettings,infoSettings } from 'mobxStore';

const { eacService, web3Service } = services;

const browserHistory = createBrowserHistory();
const routingStore = new RouterStore();

export const transactionStore = new TransactionStore(eacService, web3Service);

export const history = syncHistoryWithStore(browserHistory, routingStore);

export const stores = {
  routing: routingStore,
  transactionStore,
  blockSettings,
  timeSettings,
  bountySettings,
  infoSettings
};
