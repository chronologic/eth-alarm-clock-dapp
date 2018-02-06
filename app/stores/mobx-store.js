import { observable } from 'mobx';

let store = null;

class mobxStore {
  @observable timezone = '';
  @observable transactionDate = '';
  @observable transactionTime = '';
}
