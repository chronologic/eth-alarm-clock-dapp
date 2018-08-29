import KeenAnalysis from 'keen-analysis';
import KeenTracking from 'keen-tracking';
import { observable } from 'mobx';

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

  projectId = '';
  writeKey = '';
  readKey = '';
  analysisClient = null;
  trackingClient = null;
  networkId = null;
  isBlacklisted = false;

  _web3Service = null;

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

    this.pollActiveTimeNodesCount();
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
    this.trackingClient.addEvent(COLLECTIONS.TIMENODES, event);
  }

  async refreshActiveTimeNodesCount(networkId) {
    const timeNodeSpecificProviderNetId = parseInt(this._storageService.load('selectedProviderId'));

    this.activeTimeNodes = await this.getActiveTimeNodesCount(networkId);

    if (timeNodeSpecificProviderNetId === networkId) {
      this.activeTimeNodesTimeNodeSpecificProvider = this.activeTimeNodes;
    } else {
      this.activeTimeNodesTimeNodeSpecificProvider = await this.getActiveTimeNodesCount(
        timeNodeSpecificProviderNetId
      );
    }

    this.isBlacklisted = this.activeTimeNodes === null;
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

  async pollActiveTimeNodesCount() {
    await this.refreshActiveTimeNodesCount(this.networkId);

    setInterval(
      () => this.refreshActiveTimeNodesCount(this.networkId),
      ACTIVE_TIMENODES_POLLING_INTERVAL
    );
  }
}
