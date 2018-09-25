import KeenAnalysis from 'keen-analysis';
import KeenTracking from 'keen-tracking';
import { observable } from 'mobx';
import moment from 'moment';

const COLLECTIONS = {
  PAGEVIEWS: 'pageviews',
  TIMENODES: 'timenodes'
};

// 2 minutes in milliseconds
const ACTIVE_TIMENODES_POLLING_INTERVAL = 2 * 60 * 1000;

export class KeenStore {
  @observable
  activeTimeNodes = null;

  @observable
  activeTimeNodesTimeNodeSpecificProvider = null;
  timeNodeSpecificProviderNetId = null;

  projectId = '';
  writeKey = '';
  readKey = '';
  analysisClient = null;
  trackingClient = null;
  networkId = null;
  isBlacklisted = false;

  _web3Service = null;

  @observable
  historyActiveTimeNodes = {};
  @observable
  latestActiveTimeNodes = [];

  constructor(projectId, writeKey, readKey, web3Service, storageService, versions) {
    this.projectId = projectId;
    this.writeKey = writeKey;
    this.readKey = readKey;

    this._storageService = storageService;
    this._web3Service = web3Service;
    this.versions = versions;

    this.initialize();
  }

  async initialize() {
    await this._web3Service.init();

    this.networkId = this._web3Service.network.id;

    this.analysisClient = new KeenAnalysis({
      projectId: this.projectId,
      readKey: this.readKey
    });

    this.trackingClient = new KeenTracking({
      projectId: this.projectId,
      writeKey: this.writeKey
    });

    this.sendPageView();

    this._pollActiveTimeNodesCount();
  }

  async awaitKeenInitialized() {
    if (!this.networkId || !this.analysisClient || !this.trackingClient) {
      return new Promise(resolve => {
        setTimeout(async () => {
          resolve(await this.awaitKeenInitialized());
        }, 500);
      });
    }
    return true;
  }

  sendPageView() {
    this.trackingClient.recordEvent(COLLECTIONS.PAGEVIEWS, {
      title: document.title
    });
  }

  async sendActiveTimeNodeEvent(nodeAddress, dayAddress, networkId = this.networkId) {
    await this.awaitKeenInitialized();
    nodeAddress = this._web3Service.web3.sha3(nodeAddress).toString();
    dayAddress = this._web3Service.web3.sha3(dayAddress).toString();
    networkId = networkId.toString();

    const event = {
      nodeAddress,
      dayAddress,
      networkId,
      eacVersions: this.versions,
      nodeType: 'dapp',
      status: 'active'
    };
    this.trackingClient.recordEvent(COLLECTIONS.TIMENODES, event);
  }

  setTimeNodeSpecificProviderNetId(netId) {
    this.timeNodeSpecificProviderNetId = parseInt(netId);
  }

  async refreshActiveTimeNodesCount() {
    this.activeTimeNodes = await this.getActiveTimeNodesCount(this.networkId);

    if (this.timeNodeSpecificProviderNetId === this.networkId) {
      this.activeTimeNodesTimeNodeSpecificProvider = this.activeTimeNodes;
    } else if (this.timeNodeSpecificProviderNetId === null) {
      this.activeTimeNodesTimeNodeSpecificProvider = null;
    } else {
      this.activeTimeNodesTimeNodeSpecificProvider = await this.getActiveTimeNodesCount(
        this.timeNodeSpecificProviderNetId
      );
    }

    if (this.activeTimeNodesTimeNodeSpecificProvider !== null) {
      // Push the Active TimeNodes count to the array
      // that holds the last 1h of active TimeNodes counters
      this.latestActiveTimeNodes.push({
        amount: this.activeTimeNodesTimeNodeSpecificProvider,
        timestamp: moment().unix()
      });

      // If there are some old counters that are in the 'latest' array
      if (
        this.latestActiveTimeNodes.some(counter => !this._timestampIsInThisHour(counter.timestamp))
      ) {
        // Archive them
        this._archiveActiveTimeNodeCounters();
      }
    }

    this.isBlacklisted = this.activeTimeNodes === null;
  }

  hourFromTimestamp(timestamp) {
    const date = moment.unix(timestamp).toDate();
    date.setHours(date.getHours(), 0, 0, 0);
    return date.getTime();
  }

  _timestampIsInThisHour(timestamp) {
    const hour = this.hourFromTimestamp(timestamp);
    const currentHour = this.hourFromTimestamp(moment().unix());
    return hour === currentHour;
  }

  _archiveActiveTimeNodeCounters() {
    const countersToArchive = [];
    let hour;

    for (let counter of this.latestActiveTimeNodes) {
      if (!this._timestampIsInThisHour(counter.timestamp)) {
        // Determine the hour under which the timestamps will be saved
        hour = this.hourFromTimestamp(counter.timestamp);
        countersToArchive.push(counter.amount);

        // Remove the counter from the 'latest' list
        const counterIndex = this.latestActiveTimeNodes.indexOf(counter);
        this.latestActiveTimeNodes.splice(counterIndex, 1);
      }
    }

    if (!this.historyActiveTimeNodes[hour]) {
      this.historyActiveTimeNodes[hour] = [];
    }

    // Push the counter to the history
    const average = arr =>
      arr.reduce((accumulator, currentValue) => accumulator + currentValue) / arr.length;
    this.historyActiveTimeNodes[hour] = average(countersToArchive);

    // Clean up any history entries older than 24h
    const lastValidTime = new Date().getTime() - 24 * 60 * 60 * 1000; // NOW - 24h
    const historyHours = Object.keys(this.historyActiveTimeNodes);

    for (let historyHour of historyHours) {
      if (historyHour < lastValidTime) {
        delete this.historyActiveTimeNodes[historyHour];
      }
    }
  }

  async getActiveTimeNodesCount(networkId) {
    await this.awaitKeenInitialized();

    const count = new KeenAnalysis.Query('count', {
      event_collection: COLLECTIONS.TIMENODES,
      target_property: 'nodeAddress',
      timeframe: 'previous_2_minutes',
      filters: [
        {
          property_name: 'networkId',
          operator: 'eq',
          property_value: networkId
        },
        {
          property_name: 'eacVersions.contracts',
          operator: 'eq',
          property_value: this.versions.contracts
        },
        {
          property_name: 'status',
          operator: 'eq',
          property_value: 'active'
        }
      ]
    });

    const response = await this.analysisClient.run(count);

    if (response === null || !response.hasOwnProperty('result') || response.hasOwnProperty('err')) {
      return null;
    }

    return response.result;
  }

  async _pollActiveTimeNodesCount() {
    await this.refreshActiveTimeNodesCount();

    setInterval(() => this.refreshActiveTimeNodesCount(), ACTIVE_TIMENODES_POLLING_INTERVAL);
  }
}
