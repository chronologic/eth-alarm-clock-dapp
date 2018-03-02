import moment from 'moment';
import { EAC_WORKER_MESSAGE_TYPES } from '../js/eac-worker-message-types';

export const LOGGER_MSG_TYPES = {
  CACHE: 'Cache',
  INFO: 'Info',
  DEBUG: 'Debug',
  ERROR: 'Error'
};

export const LOG_TYPE = {
  BASIC: 'basic',
  DETAILED: 'detailed'
};

export default class WorkerLogger {
  // 1 - debug / cache
  // 2 - info
  // 3 - error
  cache(message) {
    this.log(message, LOGGER_MSG_TYPES.CACHE);
  }

  info(message) {
    this.log(message, LOGGER_MSG_TYPES.INFO);
  }

  debug(message) {
    this.log(message, LOGGER_MSG_TYPES.DEBUG);
  }

  error(message) {
    this.log(message, LOGGER_MSG_TYPES.ERROR);
  }

  log(message, type) {
    const timestamp = moment().unix();

    postMessage({
      type: EAC_WORKER_MESSAGE_TYPES.LOG,
      value: {
        timestamp,
        message,
        type
      }
    });
  }
}