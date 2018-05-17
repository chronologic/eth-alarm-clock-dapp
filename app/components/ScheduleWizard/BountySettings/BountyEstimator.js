import React, { Component } from 'react';
import PropTypes from 'prop-types';
import BigNumber from 'bignumber.js';

class BountyEstimator extends Component {
  render() {
    const { bounties } = this.props;

    let bountyAvg, bountyMax, bountyMin;

    let sum = new BigNumber(0);
    bounties.forEach(bounty => {
      sum = sum.plus(bounty);
    });

    bountyAvg = sum.dividedBy(bounties.length).toNumber().toFixed(3);
    bountyMax = Math.max(...bounties).toFixed(3);
    bountyMin = Math.min(...bounties).toFixed(3);

    // Calculate the percentages of line to show
    const minMeanDiff = bountyAvg - bountyMin;
    const maxMeanDiff = bountyMax - bountyAvg;
    const minMaxRatio = maxMeanDiff / minMeanDiff;

    // Percentages of the total line in color
    const totalWidthPercent = 100;
    const redLinePercent = 39 * (1 / minMaxRatio);
    const yellowLinePercent = 20;
    const greenLinePercent = 39 * minMaxRatio;
    const tickPercent = 1;

    const redLine = <div className="progress-bar bg-danger" role="progressbar" style={{ width: `${redLinePercent}%` }} />;
    const halfYellowLine = <div className="progress-bar bg-warning" role="progressbar" style={{ width: `${yellowLinePercent / 2}%` }} />;
    const greenLine = <div className="progress-bar bg-success" role="progressbar" style={{ width: `${greenLinePercent}%` }} />;
    const tick = <div className="progress-bar bg-black" role="progressbar" style={{ width: `${tickPercent}%` }} />;

    return (
      <div id="bountyEstimator">
        <table className="progress-markers" style={{ width: `${totalWidthPercent}%` }}>
          <tbody>
            <tr>
              <td className="p-0" style={{ width: `${redLinePercent}%` }}>Min</td>
              <td className="text-center p-0" style={{ width: `${yellowLinePercent}%` }}>Mean</td>
              <td className="text-right p-0" style={{ width: `${greenLinePercent}%` }}>Max</td>
            </tr>
          </tbody>
        </table>
        <div className="bounty-indicator">
          <div className="progress m-2">
            {tick} {redLine} {halfYellowLine} {tick} {halfYellowLine} {greenLine} {tick}
          </div>
        </div>
        <table className="progress-markers" style={{ width: `${totalWidthPercent}%` }}>
          <tbody>
            <tr>
              <td className="p-0" style={{ width: `${redLinePercent}%` }}>{bountyMin} {bountyMin ? ' ETH' : ''}</td>
              <td className="text-center p-0" style={{ width: `${yellowLinePercent}%` }}>{bountyAvg} {bountyMin ? ' ETH' : ''}</td>
              <td className="text-right p-0" style={{ width: `${greenLinePercent}%` }}>{bountyMax} {bountyMin ? ' ETH' : ''}</td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }
}

BountyEstimator.propTypes = {
  bounties: PropTypes.array,
  bountyMin: PropTypes.string,
  bountyAvg: PropTypes.string,
  bountyMax: PropTypes.string,
};

export default BountyEstimator;
