import moment from 'moment';
import 'moment-timezone';

export default class DateTimeValidator {
  constructor() {
    var locale = window.navigator.userLanguage || window.navigator.language;
    moment.locale(locale);

    const localeData = moment.localeData();
    this.timeFormat = localeData.longDateFormat('LT');
    this.dateFormat = localeData.longDateFormat('L');
    this.dateTimeFormat = this.dateFormat + " " + this.timeFormat;
  }

  parse(date, time, tz) {
    return moment.tz(date+' '+time, this.dateTimeFormat, tz);
  }

  isValid(date, time, tz) {
    return this.parse(date, time, tz).isValid();
  }

  time(dateTime) {
    return moment(dateTime).format(this.timeFormat);
  }

  date(dateTime) {
    return moment(dateTime).format(this.dateFormat);
  }
  
  ts(date, time, tz) {
    return this.parse(date, time, tz).unix();
  }
}