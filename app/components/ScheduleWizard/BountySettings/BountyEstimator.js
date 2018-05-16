import React, { Component } from 'react';
import PropTypes from 'prop-types';

class BountyEstimator extends Component {
  render() {
    // Percentages of the total line in color
    const totalWidthPercent = 100;
    const redLinePercent = 30;
    const yellowLinePercent = 20;
    const greenLinePercent = 48;
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
              <td className="p-0" style={{ width: `${redLinePercent}%` }}>{this.props.bountyMin}</td>
                <td className="text-center p-0" style={{ width: `${yellowLinePercent}%` }}>{this.props.bountyAvg}</td>
              <td className="text-right p-0" style={{ width: `${greenLinePercent}%` }}>{this.props.bountyMax}</td>
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
