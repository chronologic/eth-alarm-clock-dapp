import React, { Component } from 'react';
import PropTypes from 'prop-types';

const ProxySection = props => {
  const { afterExecutionWindow, isOwner, sendTokensToOwner, tokenTransferDetails } = props;

  const tableRows = tokenTransferDetails.map(details => {
    return (
      <tr className="row">
        <td className="d-inline-block col-4 col-md-4">{details.name}</td>
        <td className="d-inline-block col-4 col-md-4">{Number(details.balance) / 10 ** details.decimals + ' ' + details.symbol}</td>
        <button 
          className="btn btn-white btn-cons pull-right"
          onClick={() => sendTokensToOwner(details.address, details.balance)}
        >
          Send!
        </button>
      </tr>
    )
  })

  if (isOwner && afterExecutionWindow) {
    return (
      <div className="row mt-4">
        <div className="col">
          <table className="table d-block">
            <tbody className="d-block">
            {tableRows}
            </tbody>
          </table>
          {/* <label>Proxy Call:</label>
          <input
            type="text" 
            placeholder="Proxy Data" 
            value=""
            onBlur={validate('proxyData')}
            onChange={onChangeCheck('proxyData')}
            className="form-control" />
          <button className="btn btn-white btn-cons pull-right" type="button">
            Submit
          </button> */}
        </div>
      </div>
    );
  }

  if (isOwner && !afterExecutionWindow) {
    return <div>Please wait until after conclusion of execution window to send proxy call.</div>;
  }

  return <div>didn't match</div>
}

ProxySection.propTypes = {
  afterExecutionWindow: PropTypes.bool,
  isOwner: PropTypes.bool,
  tokenTransferDetails: PropTypes.array
}

export default ProxySection;