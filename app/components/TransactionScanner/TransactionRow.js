import React, { Component } from 'react';
import PropTypes from 'prop-types';

// DATE FORMAT: YYYY-MM-DD HH:MM

const INITIAL_STATE = {
  time: 'time'
};

class TransactionsRow extends Component {
  state = INITIAL_STATE

  async componentDidMount() {
    const { transaction } = this.props;
    await transaction.fillData();

    let status = transaction.wasCalled ? 'Executed' : 'Pending';

    if (transaction.isCancelled) {
      status = 'Cancelled';
    }
    
    this.setState({
      time: transaction.windowStart.toNumber(),
      status
    });
  }

  render() {
    return (
      <tr>
        <td className="v-align-middle semi-bold"><a href="#">{this.props.transaction.address}</a></td>
        <td className="v-align-middle">{this.state.time}2019-01-23 12:32</td>
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
  transaction: PropTypes.object.isRequired
};

export default TransactionsRow;