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
    this.state = {
      showCache: true,
      showInfo: true,
      showDebug: true,
      showError: true
    };
  }

  updateFilter(type) {
    if (type === LOGGER_MSG_TYPES.CACHE) {
      this.setState({
        showCache: event.target.checked
      });
    }
  }

  formatUnix(unix) {
    return moment.unix(unix).format('DD/MM/YYYY HH:mm:ss');
  }

  render() {
    return (
      <div id="timeNodeLogs">
        <div className="row">

          <div className="col-9 col-sm-9 col-md-10">
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
              <div className="card-body">
                {this.props.timeNodeStore.logs.map(([ timestamp, message, type ], index) => {
                  return (
                    <p key={index} className="no-margin">
                      <span>{this.formatUnix(timestamp)}</span> [{type.toUpperCase()}] {message}
                    </p>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="col-3 col-sm-3 col-md-2">
            <p><b>Filter:</b></p>

            <div className="checkbox check-primary">
              <input type="checkbox"
                defaultChecked={this.state.showCache}
                id="checkboxCache"
                onChange={() => this.updateFilter(LOGGER_MSG_TYPES.CACHE)}/>
              <label htmlFor="checkboxCache">{LOGGER_MSG_TYPES.CACHE}</label>
            </div>

            <div className="checkbox check-info">
              <input type="checkbox" defaultChecked={this.state.showInfo} id="checkboxInfo"/>
              <label htmlFor="checkboxInfo">{LOGGER_MSG_TYPES.INFO}</label>
            </div>

            <div className="checkbox check-warning">
              <input type="checkbox" defaultChecked={this.state.showDebug} id="checkboxDebug"/>
              <label htmlFor="checkboxDebug">{LOGGER_MSG_TYPES.DEBUG}</label>
            </div>

            <div className="checkbox check-danger">
              <input type="checkbox" defaultChecked={this.state.showError} id="checkboxError"/>
              <label htmlFor="checkboxError">{LOGGER_MSG_TYPES.ERROR}</label>
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
