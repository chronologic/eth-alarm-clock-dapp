import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';
import { ActiveTimeNodesGraph, TimeBountiesGraph } from './Network';
import { BeatLoader } from 'react-spinners';

const TEN_MIN = 10 * 60 * 1000;

@inject('keenStore')
@inject('timeNodeStore')
@observer
class TimeNodeNetwork extends Component {
  render() {
    const { bountiesGraphData, updatingBountiesGraphInProgress } = this.props.timeNodeStore;
    const { historyActiveTimeNodes, gettingActiveTimeNodesHistory } = this.props.keenStore;

    const shouldShowActiveTimeNodesGraph =
      historyActiveTimeNodes.length >= 24 && !gettingActiveTimeNodesHistory;
    const shouldShowTimeBountiesGraph =
      bountiesGraphData !== null && !updatingBountiesGraphInProgress;

    return (
      <div id="timeNodeNetwork">
        <div className="row">
          <div className="col-md-6">
            <div data-pages="card" className="card card-default">
              <div className="card-header">
                <div className="card-title">Active TimeNodes (last 24h)</div>
                <div className="card-controls">
                  <ul>
                    <li>
                      {shouldShowActiveTimeNodesGraph ? (
                        <a
                          data-toggle="refresh"
                          className="card-refresh"
                          onClick={async () =>
                            await this.props.keenStore.refreshActiveTimeNodesHistory()
                          }
                        >
                          <i className="card-icon card-icon-refresh" />
                        </a>
                      ) : (
                        <BeatLoader size={6} />
                      )}
                    </li>
                  </ul>
                </div>
              </div>
              <div className="card-body horizontal-center">
                <ActiveTimeNodesGraph
                  data={historyActiveTimeNodes}
                  onRef={ref => (this.activeTnsGraph = ref)}
                  refreshInterval={TEN_MIN}
                />
              </div>
            </div>
          </div>

          <div className="col-md-6">
            <div data-pages="card" className="card card-default">
              <div className="card-header">
                <div className="card-title">Average TimeBounty (last 24h)</div>
                <div className="card-controls">
                  <ul>
                    <li>
                      {shouldShowTimeBountiesGraph ? (
                        <a
                          data-toggle="refresh"
                          className="card-refresh"
                          onClick={() => this.props.timeNodeStore.updateBountiesGraph()}
                        >
                          {' '}
                          <i className="card-icon card-icon-refresh" />{' '}
                        </a>
                      ) : (
                        <BeatLoader size={6} />
                      )}
                    </li>
                  </ul>
                </div>
              </div>
              <div className="card-body horizontal-center">
                <TimeBountiesGraph
                  onRef={ref => (this.timeBountiesGraph = ref)}
                  data={bountiesGraphData}
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
