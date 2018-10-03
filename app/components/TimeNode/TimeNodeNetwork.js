import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';
import { ActiveTimeNodesGraph, TimeBountiesGraph } from './Network';

// 2 min
const TWO_MIN = 120 * 1000;
const TEN_MIN = 10 * 60 * 1000;

@inject('keenStore')
@inject('timeNodeStore')
@observer
class TimeNodeNetwork extends Component {
  render() {
    const { historyActiveTimeNodes, latestActiveTimeNodes } = this.props.keenStore;

    const shouldShowActiveTnsGraph =
      latestActiveTimeNodes.length > 0 || Object.keys(historyActiveTimeNodes).length > 0;

    const activeTnsGraph = shouldShowActiveTnsGraph ? (
      <ActiveTimeNodesGraph onRef={ref => (this.activeTnsGraph = ref)} refreshInterval={TWO_MIN} />
    ) : (
      <p>No data yet.</p>
    );

    return (
      <div id="timeNodeNetwork">
        <div className="row">
          <div className="col-md-6">
            <div data-pages="card" className="card card-default">
              <div className="card-header">
                <div className="card-title">Active TimeNodes (last 24h)</div>
                {shouldShowActiveTnsGraph && (
                  <div className="card-controls">
                    <ul>
                      <li>
                        <a
                          data-toggle="refresh"
                          className="card-refresh"
                          onClick={() => this.activeTnsGraph.refreshChart()}
                        >
                          <i className="card-icon card-icon-refresh" />
                        </a>
                      </li>
                    </ul>
                  </div>
                )}
              </div>
              <div className="card-body">{activeTnsGraph}</div>
            </div>
          </div>

          <div className="col-md-6">
            <div data-pages="card" className="card card-default">
              <div className="card-header">
                <div className="card-title">Average TimeBounty (last 24h)</div>
                <div className="card-controls">
                  <ul>
                    <li>
                      <a
                        data-toggle="refresh"
                        className="card-refresh"
                        onClick={() => this.timeBountiesGraph.refreshChart()}
                      >
                        <i className="card-icon card-icon-refresh" />
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="card-body">
                <TimeBountiesGraph
                  onRef={ref => (this.timeBountiesGraph = ref)}
                  data={this.props.timeNodeStore.bountiesGraphData}
                  refreshInterval={TEN_MIN}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

TimeNodeNetwork.propTypes = {
  keenStore: PropTypes.any,
  timeNodeStore: PropTypes.any
};

export default TimeNodeNetwork;
