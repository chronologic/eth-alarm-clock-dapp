import moment from 'moment';

export default class MemoryLogger {
  // 1 - debug / cache
  // 2 - info
  // 3 - error

  logLevel = 1
  storageArray = []
  storageArrayUpdated = () => {}

  constructor(logLevel, storageArrayUpdated) {
    this.logLevel = logLevel;
    this.storageArrayUpdated = storageArrayUpdated;
  }

  cache(message) {
    this.log(`[CACHE] ${message}`);
  }

  info(message) {
    this.log(`[INFO] ${message}`);
  }

  debug(message) {
    this.log(`[DEBUG] ${message}`);
  }

  error(message) {
    this.log(`[ERROR] ${message}`);
  }

  log(message) {
    const timestamp = moment().unix();
    this.storageArray.push([timestamp, message]);

    this.storageArrayUpdated(this.storageArray);
  }
}