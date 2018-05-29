import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { observer, inject } from 'mobx-react';
import { Networks } from '../../config/web3Config';

@inject('web3Service')
@observer
class NetworkChooser extends Component {
  constructor() {
    super();
    this.state = {
      network: Networks[0]
    };
  }

  async componentDidMount() {
    const { web3Service } = this.props;
    await web3Service.awaitInitialized();

    if (web3Service.network != this.state.network) {
      this.setState({
        network: web3Service.network
      });
    }
  }

  _handleChange(event) {
    return event;
    // console.log(event.target.value);
  }

  render() {
    return (
      <select value={this.state.network.id} onChange={this._handleChange}>
        {Object.keys(Networks).map(index => (
          <option key={index} value={index}>
            {Networks[index].name}
          </option>
        ))}
      </select>
    );
  }
}

NetworkChooser.propTypes = {
  web3Service: PropTypes.any
};

export default NetworkChooser;
