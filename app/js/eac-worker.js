import Web3 from 'web3/index';
import EAC from 'eac.js';
import { EAC_WORKER_MESSAGE_TYPES } from './eac-worker-message-types';
import WorkerLogger from '../lib/worker-logger';
import Loki from 'lokijs';

class EacWorker {
  alarmClient = null;
  browserDB = null;

  async start(options) {
    const provider = new Web3.providers.HttpProvider(process.env.HTTP_PROVIDER);

    const web3 = new Web3(provider);

    const eac = EAC(web3);

    const logger = new WorkerLogger(options.logLevel, this.logs);
    this.browserDB = new Loki("stats.db");

    const AlarmClient = eac.AlarmClient;

    this.alarmClient = await AlarmClient(
      web3,
      eac,
      provider,
      options.scan,
      options.milliseconds,
      options.logfile,
      options.logLevel,
      options.wallet,
      options.password,
      options.autostart,
      logger,
      options.repl,
      this.browserDB
    );
  }

  startScanning() {
    this.alarmClient.startScanning();
  }

  stopScanning() {
    this.alarmClient.stopScanning();
  }

  /*
   * Fetches the current stats of the Alarm Client
   * And updates the TimeNodeStore.
   */
  updateStats() {
    const stats = this.browserDB.getCollection('stats');

    let etherGain;
    let executedCounter;

    // If it finds any data
    if (stats && stats.data) {
      const accountStats = stats.data[0];
      etherGain = accountStats.currentEther.minus(accountStats.startingEther).toNumber();
      executedCounter = accountStats.executed;

    // Otherwise report every value as a zero
    } else {
      etherGain = 0;
      executedCounter = 0;
    }

    postMessage({
      type: EAC_WORKER_MESSAGE_TYPES.UPDATE_STATS,
      etherGain: etherGain,
      executedCounter: executedCounter
    });
  }
}

let eacWorker = null;

onmessage = async function(event) {
  const type = event.data.type;

  switch (type) {
    case EAC_WORKER_MESSAGE_TYPES.START:
      eacWorker = new EacWorker();
      eacWorker.start(event.data.options);
      break;

    case EAC_WORKER_MESSAGE_TYPES.START_SCANNING:
      eacWorker.startScanning();
      break;

    case EAC_WORKER_MESSAGE_TYPES.STOP_SCANNING:
      eacWorker.stopScanning();
      break;

    case EAC_WORKER_MESSAGE_TYPES.UPDATE_STATS:
      eacWorker.updateStats();
      break;
  }
};