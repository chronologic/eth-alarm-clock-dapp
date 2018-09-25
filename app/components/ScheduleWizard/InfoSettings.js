import React from 'react';
import { inject, observer } from 'mobx-react';
import Bb from 'bluebird';
import Switch from 'react-switch';
import AbstractSetting from './AbstractSetting';
import Alert from '../Common/Alert';
import { TOKEN_ADDRESSES, PREDEFINED_TOKENS_FOR_NETWORK } from '../../config/web3Config';
import Select from '../Common/Select';

@inject('tokenHelper')
@inject('scheduleStore')
@inject('web3Service')
@observer
class InfoSettings extends AbstractSetting {
  constructor(props) {
    super(props);

    this.state = {
      account: '',
      minGas: 21000,
      token: {}
    };
    const { _validations, _validationsErrors } = this.props;
    this._validations = _validations.InfoSettings;
    this._validationsErrors = _validationsErrors.InfoSettings;

    this.toggleField = this.toggleField.bind(this);
    this.onChangeCheck = this.onChangeCheck.bind(this);
    this.useToken = this.useToken.bind(this);
  }

  validators = {
    toAddress: this.ethereumAddressValidator(),
    gasAmount: '',
    amountToSend: {
      validator: (value) => {
        const min = 0;
        const { scheduleStore } = this.props;
        if (!scheduleStore.useData && !new RegExp('^\\d+\\.?\\d*$').test(value)) return 1;
        if (!scheduleStore.useData && ((min && Number(value) < Number(min)) || Number(value) <= 0)) {
          return 2;
        }
        return 0;
      },
      errors: [
        'Please enter valid value/amount',
        'Either Add Data or set Value to greater or equal to 0.0000000000000000001'
      ]
    },
    gasPrice: this.integerValidator(),
    yourData: {
      validator: value => (typeof value === 'string' && value.length > 0 ? 0 : 1),
      errors: ['Please provide valid input data']
    },
    receiverAddress: this.ethereumAddressValidator(),
    tokenToSend: this.decimalValidator()
  };

  revalidateGasAmount() {
    const { scheduleStore } = this.props;
    const minimumGas =
      this.state.minGas > scheduleStore.gasAmount ? this.state.minGas : scheduleStore.gasAmount;
    this.onChange('gasAmount')({ target: { value: minimumGas } });
    this.forceUpdate();
  }

  checkAmountValidation() {
    const { scheduleStore } = this.props;

    if (!scheduleStore.isTokenTransfer && scheduleStore.amountToSend !== '') {
      this.validate('amountToSend')();
    }
    if (scheduleStore.isTokenTransfer && scheduleStore.tokenToSend !== '') {
      this.validate('tokenToSend')();
    }
  }

  async calculateMinimumGas() {
    const {
      web3Service: { web3 },
      scheduleStore
    } = this.props;
    const isAddress = this.ethereumAddressValidator().validator;
    const minEstimate = 21000;
    let estimate;
    if (isAddress(scheduleStore.toAddress, web3) === 0 && scheduleStore.useData) {
      estimate = await Bb.fromCallback(callback =>
        web3.eth.estimateGas(
          {
            to: scheduleStore.toAddress,
            data: scheduleStore.yourData
          },
          callback
        )
      );
    }
    estimate = Number(estimate) > minEstimate ? Number(estimate) : minEstimate;
    this.setState({ minGas: estimate });
    this.revalidateGasAmount();
    return estimate;
  }

  async calculateTokenTransferMinimumGasandData() {
    const {
      web3Service: { web3 },
      scheduleStore,
      tokenHelper
    } = this.props;
    const isAddress = this.ethereumAddressValidator().validator;
    const minEstimate = 21000;
    let estimate;
    scheduleStore.tokenData = '0x';
    if (
      isAddress(scheduleStore.toAddress, web3) === 0 &&
      isAddress(scheduleStore.receiverAddress, web3) == 0
    ) {
      try {
        estimate = await tokenHelper.estimateTokenTransfer(
          scheduleStore.toAddress,
          scheduleStore.receiverAddress,
          scheduleStore.tokenToSend * 10 ** this.state.token.decimals
        );
        estimate = estimate + 20000;
        scheduleStore.tokenData = await tokenHelper.getTokenTransferData(
          scheduleStore.toAddress,
          scheduleStore.receiverAddress,
          scheduleStore.tokenToSend * 10 ** this.state.token.decimals
        );
      } catch (e) {
        scheduleStore.tokenData = '';
        return;
      }
    }
    estimate = Number(estimate) > minEstimate ? Number(estimate) : minEstimate;
    this.setState({ minGas: estimate });
    this.revalidateGasAmount();
    return estimate;
  }

  async checkAccountUpdate() {
    if (!this._mounted) {
      return;
    }
    const {
      web3Service,
      web3Service: { web3 },
      scheduleStore
    } = this.props;
    const isAddress = this.ethereumAddressValidator().validator;
    if (
      !web3Service.accounts ||
      web3Service.accounts.length === 0 ||
      web3Service.accounts[0] === this.state.account
    ) {
      return;
    }
    this.setState({ account: web3Service.accounts[0] });
    if (scheduleStore.isTokenTransfer && isAddress(scheduleStore.toAddress, web3) === 0) {
      await this.getTokenDetails(true);
      await this.calculateTokenTransferMinimumGasandData();
    }
  }

  async getTokenDetails(onlyBalance = false) {
    const { scheduleStore, tokenHelper } = this.props;
    if (!onlyBalance) {
      const tokenDetails = await tokenHelper.fetchTokenDetails(scheduleStore.toAddress);
      this.setState({ token: tokenDetails });
      scheduleStore.tokenSymbol = tokenDetails.symbol;
    }
    let _balance = await tokenHelper.fetchTokenBalance(scheduleStore.toAddress);
    _balance = _balance == '-' ? _balance : Number(_balance / 10 ** this.state.token.decimals);
    const balance = new RegExp('^\\d+\\.?\\d{8,}$').test(_balance) ? _balance.toFixed(8) : _balance;
    this.setState({ token: Object.assign(this.state.token, { balance }) });
    this.validators.tokenToSend = this.integerMinMaxValidator(
      1 / 10 ** this.state.token.decimals,
      balance
    );
    this.checkAmountValidation();
    this.forceUpdate();
  }

  toggleField = property => () => {
    const { scheduleStore } = this.props;
    scheduleStore[property] = !scheduleStore[property];

    if (scheduleStore.isTokenTransfer) {
      scheduleStore.receiverAddress = scheduleStore.toAddress;
      scheduleStore.toAddress = '';
      this.tokenChangeCheck('toAddress');
    } else {
      if (property === 'isTokenTransfer') {
        scheduleStore.toAddress = scheduleStore.receiverAddress;
      }

      this.checkAmountValidation();
      this.calculateMinimumGas();
    }
  };

  async tokenChangeCheck(property) {
    const {
      scheduleStore,
      web3Service: { web3 }
    } = this.props;
    const isAddress = this.ethereumAddressValidator().validator;
    if (isAddress(scheduleStore.toAddress, web3) !== 0) {
      this.setState({ token: {} });
      scheduleStore.tokenSymbol = '';
      this.validators.tokenToSend = this.decimalValidator();
      return;
    }
    if (property === 'toAddress') {
      await this.getTokenDetails();
    }
    await this.calculateTokenTransferMinimumGasandData();
    this.forceUpdate();
  }

  onChangeCheck = property => async event => {
    let {
      target: { value }
    } = event;
    const { scheduleStore } = this.props;
    this.onChange(property)({ target: { value: value } });

    if (scheduleStore.isTokenTransfer) {
      await this.tokenChangeCheck(property);
    } else {
      await this.calculateMinimumGas();
    }

    this.forceUpdate();
  };

  async useToken(tokenSymbol) {
    if (tokenSymbol && tokenSymbol !== 'PLACEHOLDER') {
      this.props.scheduleStore.toAddress =
        TOKEN_ADDRESSES[tokenSymbol][this.props.web3Service.network.id];
    } else {
      this.props.scheduleStore.toAddress = '';
    }

    await this.revalidateToAddress();
  }

  async revalidateToAddress() {
    await this.tokenChangeCheck('toAddress');

    this.validate('toAddress')();

    this.forceUpdate();
  }

  componentDidMount() {
    this._mounted = true;
    this.checkAccountUpdate();

    if (this.props.scheduleStore.toAddress) {
      this.revalidateToAddress();
    }

    this.updateInterval = setInterval(() => this.checkAccountUpdate(), 2000);
  }

  componentWillUnmount() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
    this._mounted = false;
  }

  render() {
    const { scheduleStore, web3Service } = this.props;
    const { _validations, _validationsErrors } = this;
    this.validators.gasAmount = this.integerValidator(this.state.minGas);

    const predefinedTokens =
      web3Service.network && PREDEFINED_TOKENS_FOR_NETWORK[web3Service.network.id];

    return (
      <div id="infoSettings" className="tab-pane slide">
        <div className="d-sm-block d-md-none">
          <h2 className="m-b-20">Information</h2>
          <hr />
        </div>
        {scheduleStore.isTokenTransfer &&
          (scheduleStore.tokenToSend && scheduleStore.toAddress && scheduleStore.receiverAddress) &&
          (_validations.tokenToSend && _validations.toAddress && _validations.receiverAddress) &&
          !scheduleStore.tokenData && (
            <Alert
              {...{ msg: ' Unable to generate transaction Data, check transferrable balance.' }}
            />
          )}
        <div className="row">
          <div className="col-md-4 col-sm-12">
            <div className={'form-group'}>
              <Switch
                onChange={this.toggleField('isTokenTransfer')}
                checked={scheduleStore.isTokenTransfer}
                onHandleColor="#21ffff"
                offColor="#ddd"
                onColor="#000"
                uncheckedIcon={false}
                checkedIcon={false}
              />
              <span className="switch-label"> Token transfer </span>
            </div>
          </div>
          {scheduleStore.isTokenTransfer && (
            <div className="col-md-8 col-sm-12">
              <div className={'form-group'}>
                <div className="row">
                  <div className="col-sm-4">
                    <label>Name:</label>
                    <span className="w-100 d-block">
                      {scheduleStore.isTokenTransfer &&
                      predefinedTokens &&
                      (!scheduleStore.toAddress ||
                        predefinedTokens.includes(this.state.token.symbol)) ? (
                        <div>
                          <Select
                            setupOptions={{
                              placeholder: {
                                id: 'PLACEHOLDER',
                                text: 'Predefined Tokens'
                              },
                              width: '160px'
                            }}
                            onChange={event => this.useToken(event.target.value)}
                            value={this.state.token.symbol}
                          >
                            <option value="PLACEHOLDER">Predefined Tokens</option>

                            {predefinedTokens.map(token => (
                              <option key={token} value={token}>
                                {token}
                              </option>
                            ))}
                          </Select>
                        </div>
                      ) : (
                        this.state.token.name
                      )}
                    </span>
                  </div>
                  <div className="col-sm-4">
                    <label>Decimals:</label>
                    <span className="w-100 d-block">{this.state.token.decimals}</span>
                  </div>
                  <div className="col-sm-4">
                    <label>Balance:</label>
                    <span className="w-100 d-block">{this.state.token.balance}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="row">
          <div className={!scheduleStore.isTokenTransfer ? 'col-md-12' : 'col-lg-6 col-md-12'}>
            <div
              className={
                'form-group form-group-default required' +
                (_validations.toAddress ? '' : ' has-error')
              }
            >
              <label>{scheduleStore.isTokenTransfer ? 'Token Address' : 'To Address'}</label>
              <input
                type="text"
                placeholder="Enter address"
                value={scheduleStore.toAddress}
                onChange={this.onChangeCheck('toAddress')}
                onKeyUp={this.onChangeCheck('toAddress')}
                onBlur={this.validate('toAddress')}
                className="form-control"
              />
            </div>
            {!_validations.toAddress && (
              <label className="error">{_validationsErrors.toAddress}</label>
            )}
          </div>
          <div className={!scheduleStore.isTokenTransfer ? 'd-none' : 'col-lg-6 col-md-12'}>
            <div
              className={
                'form-group form-group-default required' +
                (_validations.receiverAddress ? '' : ' has-error')
              }
            >
              <label>To Address</label>
              <input
                type="text"
                placeholder="Enter address"
                value={scheduleStore.receiverAddress}
                onChange={this.onChangeCheck('receiverAddress')}
                onBlur={this.validate('receiverAddress')}
                className="form-control"
              />
            </div>
            {!_validations.receiverAddress && (
              <label className="error">{_validationsErrors.receiverAddress}</label>
            )}
          </div>
        </div>

        <div className="row">
          {scheduleStore.isTokenTransfer && (
            <div className="col-md-4">
              <div
                className={
                  'form-group form-group-default required' +
                  (_validations.tokenToSend ? '' : ' has-error')
                }
              >
                <label>Value/Amount to Send</label>
                <input
                  type="number"
                  placeholder={`Enter Value/Amount ${
                    scheduleStore.tokenSymbol ? 'in ' + scheduleStore.tokenSymbol : ''
                  }`}
                  value={scheduleStore.tokenToSend}
                  onBlur={this.validate('tokenToSend')}
                  onChange={this.onChangeCheck('tokenToSend')}
                  className="form-control"
                />
              </div>
              {!_validations.tokenToSend && (
                <label className="error">{_validationsErrors.tokenToSend}</label>
              )}
            </div>
          )}
          {!scheduleStore.isTokenTransfer && (
            <div className="col-md-4">
              <div
                className={
                  'form-group form-group-default required' +
                  (_validations.amountToSend ? '' : ' has-error')
                }
              >
                <label>Value/Amount to Send</label>
                <input
                  type="number"
                  placeholder={`Enter Value/Amount in ETH`}
                  value={scheduleStore.amountToSend}
                  onBlur={this.validate('amountToSend')}
                  onChange={this.onChangeCheck('amountToSend')}
                  className="form-control"
                />
              </div>
              {!_validations.amountToSend && (
                <label className="error">{_validationsErrors.amountToSend}</label>
              )}
            </div>
          )}
          <div className="col-md-4">
            <div
              className={
                'form-group form-group-default required' +
                (_validations.gasAmount ? '' : ' has-error')
              }
            >
              <label>Gas Amount</label>
              <input
                type="number"
                placeholder="Enter Gas Amount"
                value={scheduleStore.gasAmount}
                onBlur={this.validate('gasAmount')}
                onChange={this.onChange('gasAmount')}
                className="form-control"
              />
            </div>
            {!_validations.gasAmount && (
              <label className="error">{_validationsErrors.gasAmount}</label>
            )}
          </div>
          <div className="col-md-4">
            <div
              className={
                'form-group form-group-default required' +
                (_validations.gasPrice ? '' : ' has-error')
              }
            >
              <label>Gas Price</label>
              <input
                type="number"
                placeholder="Enter Gas Price in Gwei"
                value={scheduleStore.gasPrice}
                onBlur={this.validate('gasPrice')}
                onChange={this.onChange('gasPrice')}
                className="form-control"
              />
            </div>
            {!_validations.gasPrice && (
              <label className="error">{_validationsErrors.gasPrice}</label>
            )}
          </div>
        </div>
        {!scheduleStore.isTokenTransfer && (
          <div className="checkbox check-primary">
            <input
              type="checkbox"
              id="checkboxAddData"
              onChange={this.toggleField('useData')}
              checked={scheduleStore.useData}
            />
            <label htmlFor="checkboxAddData">Add Data</label>
          </div>
        )}
        {!scheduleStore.isTokenTransfer &&
          scheduleStore.useData && (
            <div className="row">
              <div className="col-md-4">
                <div
                  className={
                    'form-group form-group-default required' +
                    (_validations.yourData ? '' : ' has-error')
                  }
                >
                  <label>Your Data</label>
                  <input
                    type="text"
                    placeholder="Enter Your Data"
                    value={scheduleStore.yourData}
                    onBlur={this.validate('yourData')}
                    onChange={this.onChangeCheck('yourData')}
                    className="form-control"
                  />
                </div>
                {!_validations.yourData && (
                  <label className="error">{_validationsErrors.yourData}</label>
                )}
              </div>
            </div>
          )}
      </div>
    );
  }
}

export default InfoSettings;
