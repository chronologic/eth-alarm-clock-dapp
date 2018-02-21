import Keen from 'keen-js';
import { observable } from 'mobx';

const COLLECTIONS = {
  PAGEVIEWS: 'pageviews',
  TIMENODES: 'timenodes'
};

// 5 minutes in milliseconds
const ACTIVE_TIMENODES_POLLING_INTERVAL = 5 * 60 * 1000;

export class KeenStore {
  @observable activeTimeNodes = 0;

  projectId = '';
  writeKey = '';
  readKey = '';
  client = null;
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

    this.client = new Keen({
      projectId: this.projectId,
      writeKey: this.writeKey,
      readKey: this.readKey
    });

    this.sendPageView();

    this.pollActiveTimeNodesCount();
  }

  sendPageView() {
    this.client.recordEvent(COLLECTIONS.PAGEVIEWS, {
      title: document.title
    });
  }

  sendActiveTimeNodeEvent(nodeAddress, dayAddress, networkId = this.networkId) {
    const event = {
      nodeAddress,
      dayAddress,
      networkId,
      status: 'active'
    };

    this.client.addEvent(COLLECTIONS.TIMENODES, event);
  }

  getActiveTimeNodesCount(networkId) {
    const count = new Keen.Query('count_unique', {
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

    this.client.run(count, (err, response) => {
      this.activeTimeNodes = response.result;
    });
  }

  async pollActiveTimeNodesCount() {
    await this.getActiveTimeNodesCount(this.networkId);

    setInterval(() => this.getActiveTimeNodesCount(this.networkId), ACTIVE_TIMENODES_POLLING_INTERVAL);
  }
}
