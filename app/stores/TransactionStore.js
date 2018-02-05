import BigNumber from 'bignumber.js';

export class TransactionStatus {
  static PENDING = 0
  static EXECUTED = 1
  static FAILED = 2
  static CANCELLED = 3
}

export class TransactionStore {
  _eac = null
  _web3 = null
  _eacScheduler = null

  constructor(eac, web3) {
    this._web3 = web3;
    this._eac = eac;

    // console.log(this);

    this.setup();
  }

  async setup() {
    this._eacScheduler = await this._eac.scheduler();
    
    // const requestFactory = await this._eac.requestFactory();

    // const trackerAddress = requestFactory.getTrackerAddress();

    // console.log(requestFactory, await requestFactory.address, await requestFactory.getRequests());

    await this._web3.connect();
  }

  async getTransactions() {
    return [
      {
        address: '0x50as6d50asd56as0d50s6a5d0',
        time: new Date(),
        bounty: '0.001 ETH',
        txValue: '10 ETH',
        depositAmount: '1 ETH',
        timeWindow: '5 min',
        status: TransactionStatus.EXECUTED
      }
    ];
  }

  async schedule(toAddress, callData = '', callGas, callValue, windowSize, windowStart, gasPrice, donation, payment, requiredDeposit) {    
    toAddress = '0xDacC9C61754a0C4616FC5323dC946e89Eb272302';
    callData = '';
    callGas = 3000000
		callValue = 123454321
		windowSize = 255
		windowStart = (await this._eac.Util.getBlockNumber()) + 25
		gasPrice = this._web3.web3.toWei("55", "gwei")
		donation = this._web3.web3.toWei("120", "finney")
		payment = this._web3.web3.toWei("250", "finney")
		requiredDeposit = this._web3.web3.toWei("50", "finney")

		const endowment = this._eacScheduler.calcEndowment(
			new BigNumber(callGas),
			new BigNumber(callValue),
			new BigNumber(gasPrice),
			new BigNumber(donation),
			new BigNumber(payment)
    )
    
		this._eacScheduler.initSender({
			from: this._web3.eth.defaultAccount,
			gas: 3000000,
			value: endowment
    });
    
		this._eacScheduler.blockSchedule(
			toAddress,
			this._web3.web3.fromAscii(callData),
			callGas,
			callValue,
			windowSize,
			windowStart,
			gasPrice,
			donation,
			payment,
			requiredDeposit
		)
  }
}