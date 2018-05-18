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
  @observable activeTimeNodes = '-';

  projectId = '';
  writeKey = '';
  readKey = '';
  analysisClient = null;
  trackingClient = null;
  networkId = null;

  _web3Service = null;

  constructor(projectId, writeKey, readKey, web3Service, versions) {
    this.projectId = projectId;
    this.writeKey = writeKey;
    this.readKey = readKey;

    this._web3Service = web3Service;
    this.versions = versions;

    this.initialize();
  }

  async initialize() {
    await this._web3Service.awaitInitialized();

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
    nodeAddress = this._web3Service.web3.sha3(nodeAddress);
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

  async getActiveTimeNodesCount(networkId) {
    const alphaCount = new KeenAnalysis.Query('count', {
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
          operator: 'exists',
          property_value: false
        },
        {
          property_name: 'status',
          operator: 'eq',
          property_value: 'active'
        }
      ]
    });

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

    let alphaNodes;
    const isAlphaNode = this.versions.contracts === '0.9.3';

    if (isAlphaNode) {
      await this.analysisClient.run(alphaCount, (err, response) => {
        if (err) {
          this.activeTimeNodes = '-';
        }
        alphaNodes = response.result;
      });
    }

    this.analysisClient.run(count, (err, response) => {
      if (err) {
        this.activeTimeNodes = '-';
      }
      this.activeTimeNodes = isAlphaNode ? Number(alphaNodes) + Number(response.result) : response.result;
    });
  }

  async pollActiveTimeNodesCount() {
    await this.getActiveTimeNodesCount(this.networkId);

    setInterval(
      () => this.getActiveTimeNodesCount(this.networkId),
      ACTIVE_TIMENODES_POLLING_INTERVAL
    );
  }
}
