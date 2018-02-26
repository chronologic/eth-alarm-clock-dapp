import { observable } from 'mobx';
import DateTimeValidatorStore from './DateTimeValidatorStore';

export default class mobxStore {
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
  @observable deposit = '';

  //infoSettings
  @observable toAddress = '';
  @observable gasAmount = '';
  @observable amountToSend = '';
  @observable gasPrice = '';
  @observable useData = false;
  @observable yourData = '';

  @observable isUsingTime = true;

  get transactionTimestamp() {
    return this.dateTimeValidatorStore.ts(this.transactionDate, this.transactionTime, this.timeZone);
  }

  get transactionTzTime() {
    return this.dateTimeValidatorStore.parse(this.transactionDate, this.transactionTime, this.timeZone).calendar();
  }

  constructor(source) {
    Object.assign(this, source);
    this.dateTimeValidatorStore = new DateTimeValidatorStore();
  }
}
