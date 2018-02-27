import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { inject, observer } from 'mobx-react';
import { LOGGER_MSG_TYPES } from '../../lib/worker-logger.js';

@inject('timeNodeStore')
@observer
class TimeNodeLogs extends Component {
  constructor(props) {
    super(props);
  }

  updateFilters() {
    let types = [];

    if (this.checkboxCache.checked) types.push(LOGGER_MSG_TYPES.CACHE);
    if (this.checkboxInfo.checked) types.push(LOGGER_MSG_TYPES.INFO);
    if (this.checkboxDebug.checked) types.push(LOGGER_MSG_TYPES.DEBUG);
    if (this.checkboxError.checked) types.push(LOGGER_MSG_TYPES.ERROR);

    this.props.timeNodeStore.showLogTypes = types;
  }

  formatUnix(unix) {
    return moment.unix(unix).format('DD/MM/YYYY HH:mm:ss');
  }

  render() {
    return (
      <div id="timeNodeLogs">
        <div className="row">

          <div className="col-md-2 m-b-20">
            <p><b>Filter:</b></p>

            <div className="row">

              <div className="col-6 col-md-12">
                <div className="checkbox check-primary my-1">
                  <input type="checkbox"
                    id="checkboxCache"
                    defaultChecked={this.props.timeNodeStore.showLogTypes.includes(LOGGER_MSG_TYPES.CACHE)}
                    ref={(el) => this.checkboxCache = el}
                    onChange={() => this.updateFilters()} />
                  <label htmlFor="checkboxCache">{LOGGER_MSG_TYPES.CACHE}</label>
                </div>
              </div>

              <div className="col-6 col-md-12">
                <div className="checkbox check-info my-1">
                  <input type="checkbox"
                    id="checkboxInfo"
                    defaultChecked={this.props.timeNodeStore.showLogTypes.includes(LOGGER_MSG_TYPES.INFO)}
                    ref={(el) => this.checkboxInfo = el}
                    onChange={() => this.updateFilters()} />
                  <label htmlFor="checkboxInfo">{LOGGER_MSG_TYPES.INFO}</label>
                </div>
              </div>

              <div className="col-6 col-md-12">
                <div className="checkbox check-warning my-1">
                  <input type="checkbox"
                    id="checkboxDebug"
                    defaultChecked={this.props.timeNodeStore.showLogTypes.includes(LOGGER_MSG_TYPES.DEBUG)}
                    ref={(el) => this.checkboxDebug = el}
                    onChange={() => this.updateFilters()} />
                  <label htmlFor="checkboxDebug">{LOGGER_MSG_TYPES.DEBUG}</label>
                </div>
              </div>

              <div className="col-6 col-md-12">
                <div className="checkbox check-danger my-1">
                  <input type="checkbox"
                    id="checkboxError"
                    defaultChecked={this.props.timeNodeStore.showLogTypes.includes(LOGGER_MSG_TYPES.ERROR)}
                    ref={(el) => this.checkboxError = el}
                    onChange={() => this.updateFilters()} />
                  <label htmlFor="checkboxError">{LOGGER_MSG_TYPES.ERROR}</label>
                </div>
              </div>

            </div>
          </div>

          <div className="col-md-10">
            <div data-pages="card" className="card card-default">
              <div className="card-header">
                <div className="card-title">Logs</div>
                <div className="card-controls">
                  <ul>
                    <li>
                      <a data-toggle="refresh" className="card-refresh" href="#"><i className="card-icon card-icon-refresh"></i></a>
                    </li>
                  </ul>
                </div>
              </div>
              <div id="timenodeLogsField" className="card-body">
                {this.props.timeNodeStore.filteredLogs.map((log, index) => {
                  return (
                    <p key={index} className="no-margin">
                      <span>{this.formatUnix(log.timestamp)}</span> [{log.type.toUpperCase()}] {log.message}
                    </p>
                  );
                })}
              </div>
            </div>
          </div>

        </div>
      </div>
    );
  }
}

TimeNodeLogs.propTypes = {
  timeNodeStore: PropTypes.any
};

export default TimeNodeLogs;
