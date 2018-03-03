import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { inject } from 'mobx-react';
import moment from 'moment';
import ValueDisplay from '../Common/ValueDisplay';
import { Link } from 'react-router-dom';

const INITIAL_STATE = {
  time: ''
};

@inject('eacService')
@inject('transactionStore')
class TransactionsRow extends Component {
  state = INITIAL_STATE

  _isMounted = false

  async getPreparedState() {
    const { transaction, transactionStore } = this.props;

    await transaction.fillData();

    const isTimestamp = transactionStore.isTxUnitTimestamp(transaction);

    const status = await transactionStore.getTxStatus(transaction);

    let time;

    if (isTimestamp) {
      time = transaction.windowStart;
    } else {
      time = await this.props.eacService.Util.getTimestampForBlock(transaction.windowStart.toNumber());
    }

    time = moment.unix(time).format('YYYY-MM-DD HH:MM');

    let timeWindow = transaction.windowSize.toNumber();

    if (!isTimestamp) {
      timeWindow = timeWindow * 15;
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
    this.getUpdatedState();
    const { showStatus, transaction } = this.props;
    const { bounty, deposit, status, time, timeWindow, value } = this.state;

    return (
      <tr>
        <td className="v-align-middle semi-bold"><Link to={`/transactions/${transaction.address}`}>{transaction.address}</Link></td>
        <td className="v-align-middle">{time}</td>
        <td className="v-align-middle semi-bold"><ValueDisplay priceInWei={bounty}/></td>
        <td className="v-align-middle"><ValueDisplay priceInWei={value}/></td>
        <td className="v-align-middle"><ValueDisplay priceInWei={deposit}/></td>
        <td className="v-align-middle">{timeWindow}</td>
        {showStatus && <td className="v-align-middle"><a href="#">{status}</a></td>}
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