import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { inject } from 'mobx-react';
import moment from 'moment';
import ValueDisplay from '../Common/ValueDisplay';
import { Link } from 'react-router-dom';
import { CONFIG } from '../../lib/consts';

const INITIAL_STATE = {
  time: ''
};

@inject('eacService')
@inject('transactionStore')
class TransactionsRow extends Component {
  state = INITIAL_STATE;

  _isMounted = false;

  async getPreparedState() {
    const { eacService, transaction, transactionStore } = this.props;

    const isTimestamp = transactionStore.isTxUnitTimestamp(transaction);

    const status = await transactionStore.getTxStatus(transaction);

    let time;

    if (isTimestamp) {
      time = transaction.windowStart;
    } else {
      const currentBlock = await eacService.Util.getBlockNumber();
      const windowStart = transaction.windowStart.toNumber();

      if (currentBlock > windowStart) {
        time = await eacService.Util.getTimestampForBlock(transaction.windowStart.toNumber());
      } else {
        const difference = windowStart - currentBlock;

        const currentBlockTimestamp = await eacService.Util.getTimestampForBlock(currentBlock);

        time = currentBlockTimestamp + difference * CONFIG.averageBlockTime;
      }
    }

    time = moment.unix(time).format('YYYY-MM-DD HH:mm');

    let timeWindow = transaction.windowSize.toNumber();

    if (!isTimestamp) {
      timeWindow = timeWindow * CONFIG.averageBlockTime;
    }

    timeWindow = moment.duration(timeWindow, 'seconds').format('d [days], h [hours], m [minutes]');

    return {
      bounty: transaction.bounty,
      deposit: transaction.requiredDeposit,
      time,
      status,
      timeWindow,
      value: transaction.callValue
    };
  }

  async getUpdatedState() {
    const preparedState = await this.getPreparedState();

    if (!this._isMounted) {
      return;
    }

    this.setState(preparedState);
  }

  async componentDidMount() {
    this._isMounted = true;

    await this.getUpdatedState();
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
        <td className="v-align-middle semi-bold">
          <ValueDisplay priceInWei={bounty} />
        </td>
        <td className="v-align-middle">
          <ValueDisplay priceInWei={value} />
        </td>
        <td className="v-align-middle">
          <ValueDisplay priceInWei={deposit} />
        </td>
        <td className="v-align-middle">{timeWindow}</td>
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
