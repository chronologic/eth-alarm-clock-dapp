import Web3 from 'web3/index';
import EAC from 'eac.js';
import { EAC_WORKER_MESSAGE_TYPES } from './eac-worker-message-types';
import WorkerLogger from '../lib/worker-logger';

class EacWorker {
  alarmClient = null;

  async start(options) {
    const provider = new Web3.providers.HttpProvider(process.env.HTTP_PROVIDER);

    const web3 = new Web3(provider);

    const eac = EAC(web3);

    const logger = new WorkerLogger(options.logLevel, this.logs);

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
      options.browserDB
    );
  }

  startScanning() {
    this.alarmClient.startScanning();
  }

  stopScanning() {
    this.alarmClient.stopScanning();
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
  }
}