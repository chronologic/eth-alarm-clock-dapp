import { observable, action } from 'mobx';
import DateTimeValidatorStore from './DateTimeValidatorStore';

export default class ScheduleStore {
  //TimeComponent
  @observable timeZone;
  @observable transactionDate;
  @observable transactionTime;
  @observable executionWindow;
  @observable customWindow;
  @observable fee;

  //BlockComponent
  @observable blockNumber;
  @observable blockSize;

  //BountySettings
  @observable requireDeposit;
  @observable timeBounty;
  @observable deposit;

  //infoSettings
  @observable toAddress;
  @observable gasAmount;
  @observable amountToSend;
  @observable gasPrice;
  @observable useData;
  @observable yourData;

  //Token Transfer settings
  @observable receiverAddress;

  @observable isUsingTime;
  @observable isTokenTransfer;

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

    this.requireDeposit = false;
    this.timeBounty = '';
    this.deposit = '';

    this.toAddress = '';
    this.gasAmount = 21000;
    this.amountToSend = '';
    this.gasPrice = '';
    this.useData = false;
    this.yourData = '';

    this.receiverAddress = '';

    this.isUsingTime = true;
    this.isTokenTransfer = false;
  }

  constructor(source) {
    Object.assign(this, source);
    this.reset();
    this.dateTimeValidatorStore = new DateTimeValidatorStore();
  }

  get transactionTimestamp() {
    return this.dateTimeValidatorStore.ts(this.transactionDate, this.transactionTime, this.timeZone);
  }

  get transactionTzTime() {
    return this.dateTimeValidatorStore.parse(this.transactionDate, this.transactionTime, this.timeZone).toString();
  }
}
