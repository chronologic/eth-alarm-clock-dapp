import KeenAnalysis from 'keen-analysis';
import KeenTracking from 'keen-tracking';
import { observable } from 'mobx';
import moment from 'moment';

const COLLECTIONS = {
  PAGEVIEWS: 'pageviews',
  TIMENODES: 'timenodes'
};

// 2 minutes in milliseconds
const ACTIVE_TIMENODES_POLLING_INTERVAL = 5 * 60 * 1000;
const TEN_MIN = 10 * 60 * 1000;
const FIVE_SEC = 5000;

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
  initialized;

  @observable
  historyActiveTimeNodes = [];
  @observable
  gettingActiveTimeNodesHistory = false;
  @observable
  historyPollingInterval = FIVE_SEC;

  constructor(projectId, writeKey, readKey, web3Service, versions) {
    this.projectId = projectId;
    this.writeKey = writeKey;
    this.readKey = readKey;

    this._web3Service = web3Service;
    this.versions = versions;

    this.initialized = this.initialize();
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

  sendPageView() {
    this.trackingClient.recordEvent(COLLECTIONS.PAGEVIEWS, {
      title: document.title
    });
  }

  async sendActiveTimeNodeEvent(nodeAddress, dayAddress, networkId = this.networkId) {
    await this.initialized;
    nodeAddress = this._web3Service.web3.utils.sha3(nodeAddress).toString();
    dayAddress = this._web3Service.web3.utils.sha3(dayAddress).toString();
    networkId = networkId.toString();

    const event = {
      nodeAddress,
      dayAddress,
      networkId,
      eacVersions: this.versions,
      nodeType: 'dapp'
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
  }

  async refreshActiveTimeNodesHistory() {
    if (!this.isBlacklisted) {
      this.gettingActiveTimeNodesHistory = true;

      const isAllZeroes = array => array.every(counter => counter === 0);

      const history = await this._getActiveTimeNodesHistory();

      /*
        Keen sometimes returns all zeroes instead of the real value.
        We keep getting the values from Keen every 5 seconds until we get the proper values.
        After that we switch to a longer time interval.
        NOTE: This check can be remove if Keen fixes sending incorrect values
      */
      if (!isAllZeroes(history)) {
        this.historyPollingInterval = TEN_MIN; // Set a longer polling interval
        this.historyActiveTimeNodes = history;
      }

      this.gettingActiveTimeNodesHistory = false;
    }
  }

  async _getActiveTimeNodesHistory() {
    await this.initialized;

    if (!this.isBlacklisted) {
      const count = new KeenAnalysis.Query('count_unique', {
        event_collection: COLLECTIONS.TIMENODES,
        target_property: 'nodeAddress',
        timeframe: {
          start: moment()
            .subtract(24, 'hours')
            .toISOString(),
          end: moment().toISOString()
        },
        interval: 'hourly',
        group_by: 'nodeAddress',
        filters: [
          {
            property_name: 'networkId',
            operator: 'eq',
            property_value: this.timeNodeSpecificProviderNetId
          },
          {
            property_name: 'eacVersions.contracts',
            operator: 'eq',
            property_value: this.versions.contracts
          }
        ]
      });

      let response = null;
      try {
        response = await this.analysisClient.run(count);
      } catch (e) {
        this.isBlacklisted = true;
      }

      if (
        response === null ||
        !response.hasOwnProperty('result') ||
        response.hasOwnProperty('err')
      ) {
        return null;
      }

      return response.result.map(res => res.value[0].result);
    }
  }

  async getActiveTimeNodesCount(networkId, timeframe = 'this_5_minutes') {
    await this.initialized;

    if (!this.isBlacklisted) {
      const count = new KeenAnalysis.Query('count', {
        event_collection: COLLECTIONS.TIMENODES,
        target_property: 'nodeAddress',
        timeframe,
        group_by: 'nodeAddress',
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
          }
        ]
      });

      let response = null;
      try {
        response = await this.analysisClient.run(count);
      } catch (e) {
        this.isBlacklisted = true;
      }

      if (
        response === null ||
        !response.hasOwnProperty('result') ||
        response.hasOwnProperty('err')
      ) {
        return null;
      }

      return response.result.length;
    }
  }

  async _pollActiveTimeNodesCount() {
    await this.refreshActiveTimeNodesCount();
    setInterval(() => this.refreshActiveTimeNodesCount(), ACTIVE_TIMENODES_POLLING_INTERVAL);
  }
}
