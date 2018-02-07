import { observable } from 'mobx';

let store = null;
class mobxStore {
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

export function initStore(isServer, source) {
  if (isServer) {
    return new mobxStore(source);
  } else {
    if (store === null) {
      store = new mobxStore(source);
    }
    return store;
  }
}

 export default mobxStore;
