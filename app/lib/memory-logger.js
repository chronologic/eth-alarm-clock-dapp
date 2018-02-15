import moment from 'moment';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';

@inject('timeNodeStore')
@observer
class MemoryLogger {
  // 1 - debug / cache
  // 2 - info
  // 3 - error

  logLevel = 1

  constructor(logLevel) {
    this.logLevel = logLevel;
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
    this.props.timeNodeStore.logs.push([timestamp, message]);
  }
}

MemoryLogger.propTypes = {
  timeNodeStore: PropTypes.any
};

export default MemoryLogger;