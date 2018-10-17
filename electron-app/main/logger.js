/* eslint-disable no-console */
const fs = require('fs');

class FileLogger {
  constructor(logFile, logLevel) {
    if (logFile === 'console') {
      this.logToFile = false;
    } else {
      this.logToFile = true;
      this.logFile = logFile;
      let i = 1;
      while (fs.existsSync(this.logFile)) {
        this.logFile = `${logFile}.${i.toString()}`;
        i += 1;
      }
      fs.writeFileSync(this.logFile, '\n');
    }
    this.logLevel = logLevel;
  }

  log(log) {
    const time = new Date(log.timestamp * 1000).toISOString();
    const stringToLog = `${time} [${log.type.toUpperCase()}] ${log.message}`;
    if (this.logToFile) {
      fs.appendFileSync(this.logFile, `${stringToLog}\n`);
    } else {
      console.log(stringToLog);
    }
  }
}

module.exports = FileLogger;
