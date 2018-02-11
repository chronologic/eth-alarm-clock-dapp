import { observable } from 'mobx';


export class mobxStore {
  //TimeComponent
  @observable timezone = '';
  @observable transactionDate = '';
  @observable transactionTime = '';
  @observable executionWindow = '';

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


}

//export { mobxStore };
