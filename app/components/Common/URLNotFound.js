import React, { Component } from 'react';

class URLNotFound extends Component {
  render() {
    return (
      <div className="container-fluid">
        <div className="card">
          <div className="card-body absolute-center">
            <span>
              <h1 className="error-number">404</h1>
              <h2 className="semi-bold">Sorry but we couldn't find this page</h2>
              <p className="p-b-10">This page you are looking for does not exist. <a href="#">Report this?</a></p>
            </span>
          </div>
        </div>
      </div>
    );
  }
}

export default URLNotFound;
