import mixpanel from 'mixpanel-browser';
import { observable } from 'mobx';
import moment from 'moment';

const MINUTE_MILLIS = 60 * 1000;
const ACTIVE_TIMENODES_POLLING_INTERVAL = 15 * MINUTE_MILLIS;
const HISTORY_POLLING_INTERVAL = 30 * MINUTE_MILLIS;
const dateFormat = 'YYYY-MM-DD';

const EVENT_TYPES = Object.freeze({
  TIMENODES: 'TIMENODES'
});

export class AnalyticsStore {
  @observable
  activeTimeNodes = null;

  @observable
  activeTimeNodesTimeNodeSpecificProvider = null;
  timeNodeSpecificProviderNetId = null;

  mixpanelToken = '';
  mixpanelQueryToken = '';
  apiSecret = '';
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
  historyPollingInterval = HISTORY_POLLING_INTERVAL;

  constructor(mixpanelToken, mixpanelQueryToken, web3Service, versions) {
    this.mixpanelToken = mixpanelToken;
    this.mixpanelQueryToken = mixpanelQueryToken;

    this._web3Service = web3Service;
    this.versions = versions;

    this.initialized = this.initialize();
  }

  async initialize() {
    await this._web3Service.init();

    this.networkId = this._web3Service.network.id;

    await this.initializeMixpanel();

    this._pollActiveTimeNodesCount();
  }

  initializeMixpanel() {
    const mixpanelPromise = new Promise(resolve => {
      mixpanel.init(this.mixpanelToken, {
        autotrack: false,
        track_pageview: false,
        loaded: resolve
      });
    });
    const timeoutPromise = new Promise((resolve, reject) => {
      setTimeout(() => reject('Mixpanel init timed out'), 10000);
    });
    return Promise.race([mixpanelPromise, timeoutPromise]).catch(err => {
      console.error(err);
      this.isBlacklisted = true;
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
      timestamp: new Date().getTime(),
      nodeType: 'dapp'
    };
    mixpanel.track(EVENT_TYPES.TIMENODES, event);
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

      const history = await this._getActiveTimeNodesHistory();
      this.historyActiveTimeNodes = history;

      this.gettingActiveTimeNodesHistory = false;
    }
  }

  async _getActiveTimeNodesHistory() {
    await this.initialized;

    if (!this.isBlacklisted) {
      const params = {
        from_date: moment()
          .subtract(1, 'day')
          .format(dateFormat),
        to_date: moment().format(dateFormat),
        event: EVENT_TYPES.TIMENODES,
        networkId: this.timeNodeSpecificProviderNetId,
        contracts: this.versions.contracts
      };
      const query = `function main() {
        function groupByHour(event) {
          const roundedToHour = Math.floor(event.properties.timestamp / (3600 * 1000)) * 3600 * 1000;
          return new Date(roundedToHour).toISOString();
        }

        return Events({
          from_date: params.from_date,
          to_date: params.to_date,
          event_selectors: [
            {
              event: params.event
            }
          ]
        })
        .filter(function(event) {
          return (event.properties.networkId == params.networkId || !params.networkId) &&
            event.properties.eacVersions.contracts == params.contracts;
        })
          .groupBy([groupByHour, 'properties.nodeAddress'], mixpanel.reducer.count());
      }`;

      let response = null;
      try {
        response = await this.runMixpanelQuery(query, params);
      } catch (e) {
        this.isBlacklisted = true;
      }

      return response;
    }
  }

  async getActiveTimeNodesCount(networkId) {
    await this.initialized;

    if (!this.isBlacklisted) {
      const today = moment().format(dateFormat);
      const timeframe = new Date().getTime() - 15 * MINUTE_MILLIS;
      const params = {
        from_date: today,
        to_date: today,
        event: EVENT_TYPES.TIMENODES,
        timeframe,
        networkId,
        contracts: this.versions.contracts
      };
      const query = `function main() {
        return Events({
          from_date: params.from_date,
          to_date: params.to_date,
          event_selectors: [
            {
              event: params.event
            }
          ]
        })
          .filter(function(event) {
            return event.properties.timestamp >= params.timeframe &&
              event.properties.networkId == params.networkId &&
              event.properties.eacVersions.contracts == params.contracts;
          })
          .groupBy(['properties.nodeAddress'], mixpanel.reducer.count());
      }`;

      let response = [];
      try {
        response = await this.runMixpanelQuery(query, params);
      } catch (e) {
        this.isBlacklisted = true;
      }

      return response.length + 1 /* chronologic CLI timenode */;
    }
  }

  async _pollActiveTimeNodesCount() {
    await this.refreshActiveTimeNodesCount();
    setInterval(() => this.refreshActiveTimeNodesCount(), ACTIVE_TIMENODES_POLLING_INTERVAL);
  }

  async runMixpanelQuery(script, params = {}) {
    const data = {
      script,
      params: JSON.stringify(params)
    };
    const searchParams = Object.keys(data)
      .map(key => {
        return encodeURIComponent(key) + '=' + encodeURIComponent(data[key]);
      })
      .join('&');

    return fetch('https://mixpanel.com/api/2.0/jql/', {
      method: 'POST',
      headers: {
        Authorization: 'Basic ' + window.btoa(this.mixpanelQueryToken + ':'),
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
      },
      body: searchParams
    }).then(res => res.json());
  }
}
