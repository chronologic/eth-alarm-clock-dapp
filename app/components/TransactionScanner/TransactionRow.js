import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { inject } from 'mobx-react';
import moment from 'moment';
import { ValueDisplay } from '../Common';
import { Link } from 'react-router-dom';
import { CONFIG } from '../../lib/consts';
import { TRANSACTION_STATUS } from '../../stores/TransactionStore';

const INITIAL_STATE = {
  asyncPropsFetched: false,
  bounty: 0,
  deposit: 0,
  isTimestamp: false,
  time: '',
  status: TRANSACTION_STATUS.FAILED,
  timeWindow: 0,
  value: 0
};

export const TRANSACTION_ROW_TEST_ATTRS = {
  BOUNTY_COLUMN: 'transaction-column-bounty',
  WINDOW_SIZE_COLUMN: 'transaction-column-window-size'
};

@inject('eacService')
@inject('transactionStore')
class TransactionsRow extends Component {
  state = INITIAL_STATE;

  _isMounted = false;

  async getAsyncStateProps() {
    const { eacService, transaction, transactionStore } = this.props;

    const { isTimestamp } = this.state;

    const status = await transactionStore.getTxStatus(transaction, moment().unix());

    const asyncStateProps = {
      asyncPropsFetched: true,
      status
    };

    if (!isTimestamp) {
      const currentBlock = await eacService.Util.getBlockNumber();
      const windowStart = transaction.windowStart.toNumber();

      let time;

      if (currentBlock > windowStart) {
        time = await eacService.Util.getTimestampForBlock(transaction.windowStart.toNumber());
      } else {
        const difference = windowStart - currentBlock;

        const currentBlockTimestamp = await eacService.Util.getTimestampForBlock(currentBlock);

        time = currentBlockTimestamp + difference * CONFIG.averageBlockTime;
      }

      asyncStateProps.time = TransactionsRow.getFormattedTimestamp(time);
    }

    return asyncStateProps;
  }

  static getFormattedTimestamp(timestamp) {
    return moment.unix(timestamp).format('YYYY-MM-DD HH:mm');
  }

  static getDerivedStateFromProps(nextProps) {
    const { transaction, transactionStore } = nextProps;

    const isTimestamp = transactionStore.isTxUnitTimestamp(transaction);

    const state = {
      asyncPropsFetched: false,
      bounty: transaction.bounty,
      deposit: transaction.requiredDeposit,
      isTimestamp,
      value: transaction.callValue
    };

    if (isTimestamp) {
      state.time = TransactionsRow.getFormattedTimestamp(transaction.windowStart);
    }

    let timeWindow = transaction.windowSize.toNumber();

    if (!isTimestamp) {
      timeWindow = timeWindow * CONFIG.averageBlockTime;
    }

    state.timeWindow = moment
      .duration(timeWindow, 'seconds')
      .format('d [days], h [hours], m [minutes]');

    return state;
  }

  async updateAsyncStateProps() {
    const asyncStateProps = await this.getAsyncStateProps();

    if (!this._isMounted) {
      return;
    }

    this.setState(asyncStateProps);
  }

  async componentDidMount() {
    this._isMounted = true;

    await this.updateAsyncStateProps();
  }

  async componentDidUpdate(prevProps) {
    if (
      this.props.transaction.address !== prevProps.transaction.address &&
      !this.state.asyncPropsFetched
    ) {
      await this.updateAsyncStateProps();
    }
  }

  async componentWillUnmount() {
    this._isMounted = false;
  }

  render() {
    const { showStatus, transaction } = this.props;
    const { bounty, deposit, status, time, timeWindow, value } = this.state;

    return (
      <tr>
        <td className="v-align-middle semi-bold">
          <Link to={`/transactions/${transaction.address}`}>{transaction.address}</Link>
        </td>
        <td className="v-align-middle">{time}</td>
        <td
          className="v-align-middle semi-bold"
          data-test={TRANSACTION_ROW_TEST_ATTRS.BOUNTY_COLUMN}
        >
          <ValueDisplay priceInWei={bounty} />
        </td>
        <td className="v-align-middle">
          <ValueDisplay priceInWei={value} />
        </td>
        <td className="v-align-middle">
          <ValueDisplay priceInWei={deposit} />
        </td>
        <td className="v-align-middle" data-test={TRANSACTION_ROW_TEST_ATTRS.WINDOW_SIZE_COLUMN}>
          {timeWindow}
        </td>
        {showStatus && (
          <td className="v-align-middle">
            <a href="#">{status}</a>
          </td>
        )}
      </tr>
    );
  }
}

TransactionsRow.propTypes = {
  transaction: PropTypes.object.isRequired,
  eacService: PropTypes.any,
  transactionStore: PropTypes.any,
  showStatus: PropTypes.bool
};

export default TransactionsRow;
