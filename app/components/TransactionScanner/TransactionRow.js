import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { inject } from 'mobx-react';
import moment from 'moment';
import ValueDisplay from '../Common/ValueDisplay';

class TEMPORAL_UNIT {
  static BLOCK = 1;
  static TIMESTAMP = 2;
}

const INITIAL_STATE = {
  time: ''
};

@inject('eacService')
class TransactionsRow extends Component {
  state = INITIAL_STATE

  async componentDidMount() {
    const { transaction } = this.props;

    await transaction.fillData();

    const isTimestamp = transaction.temporalUnit === TEMPORAL_UNIT.TIMESTAMP;

    let status = transaction.wasCalled ? 'Executed' : 'Scheduled';

    if (transaction.isCancelled) {
      status = 'Cancelled';
    }

    let time;

    if (isTimestamp) {
      time = transaction.windowStart;
    } else {
      time = await this.props.eacService.Util.getTimestampForBlock(transaction.windowStart.toNumber());
    }

    time = moment.unix(time).format('YYYY-MM-DD HH:MM');
    
    let timeWindow = transaction.windowSize * 15;

    if (isTimestamp) {
      timeWindow = transaction.windowSize;
    }

    timeWindow = moment.duration(timeWindow, 'seconds').format('d [days], h [hours], m [minutes]');

    this.setState({
      bounty: transaction.bounty,
      deposit: transaction.requiredDeposit,
      time,
      status,
      timeWindow,
      value: transaction.callValue
    });
  }

  render() {
    const { transaction } = this.props;
    const { bounty, deposit, status, time, timeWindow, value } = this.state;

    return (
      <tr>
        <td className="v-align-middle semi-bold"><a href="#">{transaction.address}</a></td>
        <td className="v-align-middle">{time}</td>
        <td className="v-align-middle semi-bold"><ValueDisplay priceInWei={bounty}/></td>
        <td className="v-align-middle"><ValueDisplay priceInWei={value}/></td>
        <td className="v-align-middle"><ValueDisplay priceInWei={deposit}/></td>
        <td className="v-align-middle">{timeWindow}</td>
        <td className="v-align-middle"><a href="#">{status}</a></td>
      </tr>
    );
  }
}

TransactionsRow.propTypes = {
  transaction: PropTypes.object.isRequired,
  eacService: PropTypes.any
};

export default TransactionsRow;