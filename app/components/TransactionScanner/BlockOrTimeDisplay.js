import { Component } from 'react';
import PropTypes from 'prop-types';
import { inject } from 'mobx-react';
import moment from 'moment';
import { CONFIG } from '../../lib/consts';

const INITIAL_STATE = {
  block: '',
  time: ''
};

@inject('web3Service')
@inject('eacService')
class BlockOrTimeDisplay extends Component {
  state = INITIAL_STATE;

  _isMounted = false;

  getTime(seconds) {
    const { duration } = this.props;

    if (duration) {
      return moment.duration(seconds, 'seconds').format('d [days], h [hours], m [minutes]');
    }

    return moment
      .unix(seconds)
      .tz(moment.tz.guess())
      .format('YYYY-MM-DD HH:mm z');
  }

  async getLastBlockTimestamp() {
    const { eacService } = this.props;

    return await eacService.Util.getTimestamp();
  }

  async getTimeForBlock(block) {
    const { eacService } = this.props;

    const currentBlock = await eacService.Util.getBlockNumber();

    if (currentBlock > block) {
      return await eacService.Util.getTimestampForBlock(block);
    }

    const difference = block - currentBlock;

    const currentBlockTimestamp = await eacService.Util.getTimestampForBlock(currentBlock);

    return currentBlockTimestamp + difference * CONFIG.averageBlockTime;
  }

  async updateState(props = this.props) {
    const { duration, model, isTimestamp } = props;

    if (model === null || typeof model === 'undefined') {
      return null;
    }

    let block;

    let timestamp = model.toNumber();

    if (!isTimestamp) {
      block = model.toNumber();

      if (duration) {
        timestamp = timestamp * 15;
      } else {
        timestamp = await this.getTimeForBlock(block);
      }
    }

    if (!this._isMounted) {
      return;
    }

    this.setState({
      block,
      time: this.getTime(timestamp)
    });
  }

  async UNSAFE_componentWillReceiveProps(nextProps) {
    await this.updateState(nextProps);
  }

  async componentDidMount() {
    this._isMounted = true;

    await this.updateState();
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  render() {
    const { duration } = this.props;
    const { block, time } = this.state;

    if (block) {
      return `${block} ${duration ? 'blocks ' : ''}(${time})`;
    }

    return time;
  }
}

BlockOrTimeDisplay.propTypes = {
  duration: PropTypes.bool,
  isTimestamp: PropTypes.any,
  model: PropTypes.any,
  eacService: PropTypes.any,
  web3Service: PropTypes.any
};

export { BlockOrTimeDisplay };
