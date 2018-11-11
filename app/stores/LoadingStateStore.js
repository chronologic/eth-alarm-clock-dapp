import { autorun, observable } from 'mobx';

class CORE_LOADING_STATES_NAMES {
  static START = 'START';
  static INITIALIZED_WEB3 = 'INITIALIZED_WEB3';
  static INITIALIZED_FEATURES = 'INITIALIZED_FEATURES';
  static INITIALIZED_TRANSACTION_STORE = 'INITIALIZED_TRANSACTION_STORE';
  static FETCHING_TRANSACTIONS = 'FETCHING_TRANSACTIONS';
  static FINISHING = 'FINISHING';
}

const CORE_LOADING_STATES_INFO = {
  [CORE_LOADING_STATES_NAMES.START]: {
    IS_COMPLETE: () => true
  },
  [CORE_LOADING_STATES_NAMES.INITIALIZED_WEB3]: {
    LOADING_MESSAGE: 'Connecting to blockchain node... Sometimes it can take up to a minute.',
    IS_COMPLETE: ({ _web3 }) => _web3.initialized
  },
  [CORE_LOADING_STATES_NAMES.INITIALIZED_FEATURES]: {
    LOADING_MESSAGE: 'Detecting supported features for the current environment...',
    IS_COMPLETE: ({ _features }) => _features.initialized
  },
  [CORE_LOADING_STATES_NAMES.INITIALIZED_TRANSACTION_STORE]: {
    LOADING_MESSAGE: 'Initializing service for fetching transactions...',
    IS_COMPLETE: ({ _transactionStore }) => _transactionStore.initialized
  },
  [CORE_LOADING_STATES_NAMES.FETCHING_TRANSACTIONS]: {
    IS_COMPLETE: ({ _transactionStore }) => !_transactionStore.info.gettingTransactions,
    LOADING_MESSAGE: 'Fetching transactions...'
  },
  [CORE_LOADING_STATES_NAMES.FINISHING]: {
    LOADING_MESSAGE: 'Fetching remaining data...',
    IS_COMPLETE: () => true
  }
};

export default class LoadingStateStore {
  @observable
  loadingState;

  loadingStates = [];
  loadingStatesInfo = {};

  _web3;

  constructor(web3Service, featuresService, transactionStore) {
    this._web3 = web3Service;
    this._features = featuresService;
    this._transactionStore = transactionStore;

    this.reset();

    autorun(() => this.refreshCurrentState());
  }

  get loadingMessage() {
    const nextLoadingStateIndex = this.loadingStates.indexOf(this.loadingState) + 1;
    const nextLoadingStateName = this.loadingStates[nextLoadingStateIndex];
    const nextLoadingState = this.loadingStatesInfo[nextLoadingStateName];

    if (nextLoadingState) {
      return nextLoadingState.LOADING_MESSAGE;
    }

    return this.loadingStatesInfo[CORE_LOADING_STATES_NAMES.FINISHING];
  }

  get progress() {
    const currentLoadingStateIndex = this.loadingStates.indexOf(this.loadingState);

    return Math.max(Math.ceil((currentLoadingStateIndex / this.loadingStates.length) * 100), 10);
  }

  add(name, info) {
    this.loadingStates.push(name);
    this.loadingStatesInfo[name] = info;
  }

  complete(name) {
    this.loadingStatesInfo[name].COMPLETED = true;
    this.refreshCurrentState();
  }

  reset() {
    this.loadingStates = Object.keys(CORE_LOADING_STATES_NAMES);
    this.loadingStatesInfo = Object.assign({}, CORE_LOADING_STATES_INFO);
    this.loadingState = CORE_LOADING_STATES_NAMES.START;
  }

  refreshCurrentState() {
    this.loadingStates.forEach((checkedLoadingStateName, checkedLoadingStateIndex) => {
      const currentLoadingStateIndex = this.loadingStates.indexOf(this.loadingState);

      if (
        currentLoadingStateIndex + 1 === checkedLoadingStateIndex &&
        this._checkLoadingStateCompleteness(checkedLoadingStateName)
      ) {
        this.loadingState = checkedLoadingStateName;
      }
    });
  }

  /**
   * @private
   *
   * @param {string} stateName
   */
  _checkLoadingStateCompleteness(stateName) {
    const state = this.loadingStatesInfo[stateName];

    return state.COMPLETED || (state.IS_COMPLETE && state.IS_COMPLETE(this));
  }
}
