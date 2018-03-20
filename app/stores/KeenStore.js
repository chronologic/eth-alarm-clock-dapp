import KeenAnalysis from 'keen-analysis';
import KeenTracking from 'keen-tracking';
import { observable } from 'mobx';

const COLLECTIONS = {
  PAGEVIEWS: 'pageviews',
  TIMENODES: 'timenodes',
  EACNODES: 'eacnodes'
};

// 5 minutes in milliseconds
const ACTIVE_TIMENODES_POLLING_INTERVAL = 5 * 60 * 1000;

export class KeenStore {
  @observable activeTimeNodes = 0;
  @observable activeEacNodes = 0;

  projectId = '';
  writeKey = '';
  readKey = '';
  analysisClient = null;
  trackingClient = null;
  networkId = null;

  _web3Service = null;

  constructor(projectId, writeKey, readKey, web3Service) {
    this.projectId = projectId;
    this.writeKey = writeKey;
    this.readKey = readKey;

    this._web3Service = web3Service;

    this.initialize();
  }

  async initialize() {
    await this._web3Service.awaitInitialized();

    this.networkId = this._web3Service.netId;

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

  async awaitKeenInitialized () {
    if (!this.networkId || !this.analysisClient || !this.trackingClient) {
      return new Promise((resolve) => {
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
    nodeAddress = this._web3.sha3(nodeAddress);
    const event = {
      nodeAddress,
      dayAddress,
      networkId,
      nodeType: 'dapp',
      status: 'active'
    };
    await this.awaitKeenInitialized();
    this.trackingClient.addEvent(COLLECTIONS.TIMENODES, event);
  }

  getActiveTimeNodesCount(networkId) {
    const count = new KeenAnalysis.Query('count_unique', {
      event_collection: COLLECTIONS.TIMENODES,
      target_property: 'nodeAddress',
      timeframe: 'previous_5_minutes',
      filters: [
        {
          property_name: 'networkId',
          operator: 'eq',
          property_value: networkId
        },
        {
          property_name: 'status',
          operator: 'eq',
          property_value: 'active'
        }
      ]
    });

    this.analysisClient.run(count, (err, response) => {
      this.activeTimeNodes = response.result;
    });
  }

  async pollActiveTimeNodesCount() {
    await this.getActiveTimeNodesCount(this.networkId);

    setInterval(() => this.getActiveTimeNodesCount(this.networkId), ACTIVE_TIMENODES_POLLING_INTERVAL);
  }
}
