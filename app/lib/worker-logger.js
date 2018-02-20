import moment from 'moment';
import { EAC_WORKER_MESSAGE_TYPES } from '../js/eac-worker-message-types';

export default class WorkerLogger {
  // 1 - debug / cache
  // 2 - info
  // 3 - error

  constructor(logLevel, logs) {
    this.logLevel = logLevel;
    this.logs = logs;
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

    postMessage({
      type: EAC_WORKER_MESSAGE_TYPES.LOG,
      value: [timestamp, message]
    });
  }
}