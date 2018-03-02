import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { inject, observer } from 'mobx-react';
import { LOG_TYPE } from '../../lib/worker-logger';
@inject('timeNodeStore')
@observer
class TimeNodeLogs extends Component {
  constructor(props) {
    super(props);
  }

  updateType(event) {
    this.props.timeNodeStore.logType = event.currentTarget.dataset.logType;
  }

  formatUnix(unix) {
    return moment.unix(unix).format('DD/MM/YYYY HH:mm:ss');
  }

  render() {
    return (
      <div id="timeNodeLogs">
        <div className="m-b-20">
          <div className="btn-group" data-toggle="buttons">
            <label className="btn btn-default active" aria-pressed="true" data-log-type={ LOG_TYPE.BASIC } onClick={this.updateType.bind(this)}>
              <input type="radio" name="options" />
              Basic
            </label>
            <label className="btn btn-default" aria-pressed="true" data-log-type={ LOG_TYPE.DETAILED } onClick={this.updateType.bind(this)}>
              <input type="radio" name="options" checked="" />
              Detailed
            </label>
          </div>
        </div>

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
            {this.props.timeNodeStore.logs.map((log, index) => {
              return (
                <p key={index} className="no-margin">
                  <span>{this.formatUnix(log.timestamp)}</span> [{log.type.toUpperCase()}] {log.message}
                </p>
              );
            })}
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
