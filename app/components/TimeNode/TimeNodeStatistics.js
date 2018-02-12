import React, { Component } from 'react';

class TimeNodeStatistics extends Component {
  render() {
    return (
      <div id="timeNodeStatistics">
        <h2 className="py-4">Your TimeNode is currently running <button className="btn btn-danger">Stop</button></h2>

        <div className="row">

          <div className="col-md-3">
            <div data-pages="card" className="card card-default">
              <div className="card-header">
                <div className="card-title">Bounty</div>
                <div className="card-controls">
                  <ul>
                    <li>
                      <a data-toggle="refresh" className="card-refresh" href="#"><i className="card-icon card-icon-refresh"></i></a>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="card-body">
                <h1>1234.5 ETH</h1>
              </div>
            </div>
          </div>

          <div className="col-md-3">
            <div data-pages="card" className="card card-default">
              <div className="card-header">
                <div className="card-title">Executed</div>
                <div className="card-controls">
                  <ul>
                    <li>
                      <a data-toggle="refresh" className="card-refresh" href="#"><i className="card-icon card-icon-refresh"></i></a>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="card-body">
              </div>
            </div>
          </div>

          <div className="col-md-3">
            <div data-pages="card" className="card card-default">
              <div className="card-header">
                <div className="card-title">Balance</div>
                <div className="card-controls">
                  <ul>
                    <li>
                      <a data-toggle="refresh" className="card-refresh" href="#"><i className="card-icon card-icon-refresh"></i></a>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-6">ETH</div>
                  <div className="col-md-6">99</div>
                </div>
                <hr className="mt-2 mb-2"/>
                <div className="row">
                  <div className="col-md-6">DAY</div>
                  <div className="col-md-6">2000</div>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    );
  }
}

export default TimeNodeStatistics;
