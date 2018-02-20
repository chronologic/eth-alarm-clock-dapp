import { observable } from 'mobx';
import moment from 'moment';
import 'moment-timezone';
import { computed } from '../../node_modules/mobx/lib/mobx';

export default class mobxStore {
  //TimeComponent
  @observable timeZone = '';
  @observable transactionDate = '';
  @observable transactionTime = '';
  @observable executionWindow = '';
  @observable customWindow = '';
  @observable donation = 0;

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

  @computed get transactionTimestamp() {
    var locale = window.navigator.userLanguage || window.navigator.language;
    moment.locale(locale);

    const localeData = moment.localeData();
    const timeFormat = localeData.longDateFormat('LT');
    const dateFormat = localeData.longDateFormat('L');
    const dateTimeFormat = dateFormat + " " + timeFormat;

    return moment.tz(this.transactionDate + " " + this.transactionTime, dateTimeFormat, this.timeZone).unix()
  }

  constructor(source) {
    Object.assign(this, source);
  }
}


//export { mobxStore };
