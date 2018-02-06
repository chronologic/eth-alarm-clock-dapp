import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { inject } from 'mobx-react';
import moment from 'moment';

const INITIAL_STATE = {
  time: ''
};

@inject('eacService')
class TransactionsRow extends Component {
  state = INITIAL_STATE

  async componentDidMount() {
    const { transaction } = this.props;
    await transaction.fillData();

    let status = transaction.wasCalled ? 'Executed' : 'Pending';

    if (transaction.isCancelled) {
      status = 'Cancelled';
    }

    let time = await this.props.eacService.Util.getTimestampForBlock(transaction.windowStart.toNumber());

    time = moment.unix(time).format('YYYY-MM-DD HH:MM');
    
    this.setState({
      time,
      status
    });
  }

  render() {
    return (
      <tr>
        <td className="v-align-middle semi-bold"><a href="#">{this.props.transaction.address}</a></td>
        <td className="v-align-middle">{this.state.time}</td>
        <td className="v-align-middle semi-bold">0.001 ETH</td>
        <td className="v-align-middle">10 ETH</td>
        <td className="v-align-middle">1 ETH</td>
        <td className="v-align-middle">5 min</td>
        <td className="v-align-middle"><a href="#">{this.state.status}</a></td>
      </tr>
    );
  }
}

TransactionsRow.propTypes = {
  transaction: PropTypes.object.isRequired,
  eacService: PropTypes.any
};

export default TransactionsRow;