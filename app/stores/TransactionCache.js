import { computed, observable } from 'mobx';
import BigNumber from 'bignumber.js';

const REQUEST_LOGS_CACHE_KEY = 'TransactionCache-request-logs';
const REQUEST_LOGS_END_BLOCK_CACHE_KEY = 'TransactionCache-request-logs-end-block';

const ADDRESSES_EVENTS_CACHE_KEY = 'TransactionCache-addresses-events';

export default class TransactionCache {
  @observable transactions = [];

  @observable requestCreatedLogs = [];

  @observable requestCreatedLogsLastBlockFetched;

  @observable addressesEvents = {};

  _storage;

  constructor(storageService) {
    this._storage = storageService;

    this.loadRequestCreatedLogsFromStorage();
    this.loadAddressesEventsFromStorage();
  }

  loadRequestCreatedLogsFromStorage() {
    let storedLogs = this._storage.load(REQUEST_LOGS_CACHE_KEY);

    if (!storedLogs) {
      return;
    }

    storedLogs = JSON.parse(storedLogs);

    this.requestCreatedLogs =
      storedLogs &&
      storedLogs.map(log => {
        log.args.params = log.args.params.map(param => new BigNumber(param));

        return log;
      });

    this.requestCreatedLogsLastBlockFetched = parseInt(
      this._storage.load(REQUEST_LOGS_END_BLOCK_CACHE_KEY),
      10
    );
  }

  loadAddressesEventsFromStorage() {
    let storedData = this._storage.load(ADDRESSES_EVENTS_CACHE_KEY);

    if (!storedData) {
      return;
    }

    this.addressesEvents = JSON.parse(storedData);
  }

  @computed
  get allTransactionsAddresses() {
    if (!this.transactions) {
      return [];
    }

    return this.transactions.map(transaction => transaction.address);
  }

  cacheTransactions(transactions = [], updateType) {
    const replace = updateType === 'replace';
    const append = updateType === 'append';
    const unshift = updateType === 'top';

    if (this.transactions.length < transactions.length || replace) {
      this.transactions = transactions;
    } else {
      transactions.forEach(transaction => {
        if (append) {
          this.transactions.push(transaction);
        } else if (unshift) {
          this.transactions.unshift(transaction);
        }
      });
    }
  }

  addRequestCreatedLogToCache(log) {
    const logs = this._storage.load(REQUEST_LOGS_CACHE_KEY);
    let newLogs;

    if (logs) {
      newLogs = JSON.parse(logs);

      const exists = newLogs.find(cachedLog => cachedLog.args.request === log.args.request);

      if (!exists) {
        newLogs.push(log);
      }
    } else {
      newLogs = [log];
    }

    this._storage.save(REQUEST_LOGS_CACHE_KEY, JSON.stringify(newLogs));
    this._storage.save(REQUEST_LOGS_END_BLOCK_CACHE_KEY, log.blockNumber);

    this.loadRequestCreatedLogsFromStorage();
  }

  cacheRequestCreatedLogs(logs, endBlock) {
    this._storage.save(REQUEST_LOGS_CACHE_KEY, JSON.stringify(logs));
    this._storage.save(REQUEST_LOGS_END_BLOCK_CACHE_KEY, endBlock);
  }

  cacheAddressesEvents(events) {
    let newCachedEvents = events;

    let rawCachedEventsData = this._storage.load(ADDRESSES_EVENTS_CACHE_KEY);

    if (rawCachedEventsData) {
      const cachedEvents = JSON.parse(rawCachedEventsData);

      newCachedEvents = Object.assign(cachedEvents, events);
    }

    this._storage.save(ADDRESSES_EVENTS_CACHE_KEY, JSON.stringify(newCachedEvents));
  }
}
