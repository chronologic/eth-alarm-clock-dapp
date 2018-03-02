import { observable, action } from 'mobx';
import DateTimeValidatorStore from './DateTimeValidatorStore';

export default class ScheduleStore {
  //TimeComponent
  @observable timeZone = '';
  @observable transactionDate = '';
  @observable transactionTime = '';
  @observable executionWindow = '';
  @observable customWindow = '';
  @observable fee = 0;

  //BlockComponent
  @observable blockNumber = '';
  @observable blockSize = '';

  //BountySettings
  @observable requireDeposit = true;
  @observable timeBounty = '';
  @observable deposit = 0;

  //infoSettings
  @observable toAddress = '';
  @observable gasAmount = 21000;
  @observable amountToSend = '';
  @observable gasPrice = '';
  @observable useData = false;
  @observable yourData = '';

  @observable isUsingTime = true;

  /*
   * Currently MobX doesn't have a more elegant
   * way to reset to defaults.
   */
  @action reset = () => {
    this.timeZone = '';
    this.transactionDate = '';
    this.transactionTime = '';
    this.executionWindow = '';
    this.customWindow = '';
    this.fee = 0;

    this.blockNumber = '';
    this.blockSize = '';

    this.requireDeposit = true;
    this.timeBounty = '';
    this.deposit = '';

    this.toAddress = '';
    this.gasAmount = 21000;
    this.amountToSend = '';
    this.gasPrice = '';
    this.useData = false;
    this.yourData = '';

    this.isUsingTime = true;
  }

  get transactionTimestamp() {
    return this.dateTimeValidatorStore.ts(this.transactionDate, this.transactionTime, this.timeZone);
  }

  get transactionTzTime() {
    return this.dateTimeValidatorStore.parse(this.transactionDate, this.transactionTime, this.timeZone).toString();
  }

  constructor(source) {
    Object.assign(this, source);
    this.dateTimeValidatorStore = new DateTimeValidatorStore();
  }
}
