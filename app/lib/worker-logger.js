import moment from 'moment';
import { TIMENODE_WORKER_MESSAGE_TYPES } from '../js/timenode-worker-message-types';

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
  // 1 - debug
  // 2 - info
  // 3 - error
  info(message, address = '') {
    this.log(message, address, LOGGER_MSG_TYPES.INFO);
  }

  debug(message, address = '') {
    this.log(message, address, LOGGER_MSG_TYPES.DEBUG);
  }

  error(message, address = '') {
    this.log(message, address, LOGGER_MSG_TYPES.ERROR);
  }

  log(message, address, type) {
    const timestamp = moment().unix();

    if (typeof message !== 'string') {
      message = `Invalid log message format: ${JSON.stringify(message)} is not a string.`;
      type = LOGGER_MSG_TYPES.DEBUG;
    }

    postMessage({
      type: TIMENODE_WORKER_MESSAGE_TYPES.LOG,
      value: {
        timestamp,
        message: `${address} ${message}`,
        type
      }
    });
  }
}
