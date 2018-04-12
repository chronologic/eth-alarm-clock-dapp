import React, { Component } from 'react';
import intl from 'react-intl-universal';

class URLNotFound extends Component {
  render() {
    return (
      <div className="container-fluid">
        <div className="card">
          <div className="card-body absolute-center">
            <span>
              <h1 className="error-number">404</h1>
              <h2 className="semi-bold">{intl.get('404.SORRY-NOT-FOUND')}</h2>
              <p className="p-b-10">
                {intl.get('404.PAGE-DOES-NOT-EXIST', { report_url: '#' })}
                &nbsp;
                <a href='#'>{intl.get('404.REPORT-THIS')}</a>
              </p>
            </span>
          </div>
        </div>
      </div>
    );
  }
}

export default URLNotFound;
