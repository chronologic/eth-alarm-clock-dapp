import React, { Component } from 'react';
import PropTypes from 'prop-types';

class BountyEstimator extends Component {
  render() {
    return (
      <div id="bountyEstimator">
        <table className="progress-markers" style={{ width: '100%' }}>
          <tbody>
            <tr>
              <td className="p-0" style={{ width: '30%' }}>Min</td>
              <td className="text-center p-0" style={{ width: '20%' }}>Mean</td>
              <td className="text-right p-0" style={{ width: '50%' }}>Max</td>
            </tr>
          </tbody>
        </table>
        <div className="bounty-indicator">
          <div className="progress m-2">
            <div className="progress-bar bg-danger" role="progressbar" style={{ width: '30%' }} />
            <div className="progress-bar bg-warning" role="progressbar" style={{ width: '20%' }} />
            <div className="progress-bar bg-success" role="progressbar" style={{ width: '50%' }} />
          </div>
        </div>
        <table className="progress-markers" style={{ width: '100%' }}>
          <tbody>
            <tr>
              <td className="p-0" style={{ width: '30%' }}>{this.props.bountyMin}</td>
              <td className="text-center p-0" style={{ width: '20%' }}>{this.props.bountyAvg}</td>
              <td className="text-right p-0" style={{ width: '50%' }}>{this.props.bountyMax}</td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }
}

BountyEstimator.propTypes = {
  bountyMin: PropTypes.string,
  bountyAvg: PropTypes.string,
  bountyMax: PropTypes.string,
};

export default BountyEstimator;
