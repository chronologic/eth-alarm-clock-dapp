import { observable } from 'mobx';
import moment from 'moment';
import 'moment-timezone';

export default class mobxStore {
  //TimeComponent
  @observable timezone = moment.tz.guess();
  @observable transactionDate = '';
  @observable transactionTime = moment().add(1, 'hours').format("hh:mm a");
  @observable executionWindow = '';
  @observable customWindow = '';
  @observable donation = '';

//BlockComponent
  @observable blockNumber = '';

//BountySettings
@observable requireDeposit = true;
@observable timeBounty = '';
@observable deposit = '';

//infoSettings
@observable toAddress = '';
@observable gasAmount = '';
@observable amountToSend = '';
@observable gasPrice = '';
@observable yourData = '';

@observable isUsingTime = true;

constructor(source) {
    Object.assign(this, source);
  }
}


//export { mobxStore };
