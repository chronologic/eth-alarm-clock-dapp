import React, { Component } from 'react';

class URLNotFound extends Component {
  render() {
    return (
      <div className="container-fluid padding-25 sm-padding-10">
        <h1 className="view-title">Error 404</h1>
        <div className="widget-12 card no-border widget-loader-circle no-margin">
          <div className="card-body">
            URL not found
          </div>
        </div>
      </div>
    );
  }
}

export default URLNotFound;
