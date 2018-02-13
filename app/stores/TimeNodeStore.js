import { observable } from 'mobx';

export default class TimeNodeStore {
  @observable verifiedWallet = false;
  @observable hasDayTokens = false;

  constructor(eac) {
    this._eac = eac;
  }
}