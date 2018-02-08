import { observable } from 'mobx';


export let timeSettings = observable({
  timezone: '',
  transactionDate: '',
  transactionTime: '',
  executionWindow: ''
});

export let blockSettings = observable({
  blockNumber: ''
});

export let bountySettings = observable({
  requireDeposit: '',
  timeBounty: '',
  deposit: ''
});

export let infoSettings = observable({
  toAddress: '',
  gasAmount: '',
  amountToSend: '',
  gastPrice: '',
  yourData: '',
});
