import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { inject } from 'mobx-react';

const ProxySection = props => {
  const { afterExecutionWindow, isOwner, tokenTransferDetails, transaction } = props;

  const tableRows = tokenTransferDetails.map(details => {
    return (
      <tr className="row">
        <td className="d-inline-block col-3 col-md-3">{details.name}</td>
        <td className="d-inline-block col-3 col-md-3">{details.symbol}</td>
        <td className="d-inline-block col-3 col-md-3">{details.decimals}</td>
        <button className="btn btn-white btn-cons pull-right">Send!</button>
      </tr>
    )
  })

  // const tableRows = 'hi!';

  if (isOwner && afterExecutionWindow) {
    return (
      <div className="row mt-4">
        <div className="col">
          <table className="table d-block">
            <tbody className="d-block">
            {tableRows}
            </tbody>
          </table>
          Proxy Call:
          <input type="text" placeholder="Data to Proxy" value="" className="form-control" />
          <button className="btn btn-white btn-cons pull-right" type="button">
            Submit
          </button>
        </div>
      </div>
    );
  }

  if (isOwner && !afterExecutionWindow) {
    return <div>Please wait until after conclusion of execution window to send proxy call.</div>;
  }

  return <div>didn't match</div>
}

export default ProxySection;