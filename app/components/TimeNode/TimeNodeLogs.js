import React, { Component } from 'react';

class TimeNodeLogs extends Component {
  render() {
    return (
      <div id="timeNodeLogs">
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
            <p className="no-margin"><span>01/01/2018 00:00:00</span> Wallet support: Disabled</p>
            <p className="no-margin"><span>01/01/2018 00:00:01</span> Executing from account:</p>
            <p className="no-margin"><span>01/01/2018 00:00:02</span> 0xf9fcacad8c20b15c891a9cbe2dadaf5c4a55eb62 | Balance: 19.965403334740745878</p>
          </div>
        </div>
      </div>
    );
  }
}

export default TimeNodeLogs;
