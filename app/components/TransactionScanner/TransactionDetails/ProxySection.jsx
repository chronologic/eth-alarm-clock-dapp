import React, { Component } from 'react';
import PropTypes from 'prop-types';

const CustomProxyData = props => {
  const { customProxySend, handleProxyDataClick, proxyDataCheckBox, proxyInputOnChange } = props;

  return (
    <div>
      <div className="checkbox check-primary">
        <input
          type="checkbox"
          id="checkboxProxyData"
          defaultChecked={proxyDataCheckBox}
          onClick={handleProxyDataClick}
        />
        <label htmlFor="checkboxProxyData">Custom Proxy Data</label>
      </div>
      {
        proxyDataCheckBox &&
        <div className="form-group form-group-default required">
          <label>Your Data</label>
          <input
            type="text"
            placeholder="address _destination, bytes _data"
            className="form-control"
            onChange={proxyInputOnChange}
          />
          <button 
            className="btn btn-white btn-cons pull-right"
            onClick={customProxySend}
          >
            Proxy!
          </button>
        </div>
      }
    </div> 
  )
}

const ProxySection = props => {
  const { afterExecutionWindow, customProxyData, customProxySend, handleProxyDataClick, isOwner, proxyDataCheckBox, proxyInputOnChange, sendTokensToOwner, tokenTransferDetails } = props;

  const tableRows = tokenTransferDetails.map(details => {
    const formattedBal = Number(details.balance) / 10 ** details.decimals + ' ' + details.symbol;
    return (
      <tr className="row">
        <td className="d-inline-block col-4 col-md-4">{details.name}</td>
        <td className="d-inline-block col-4 col-md-4">{formattedBal}</td>
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
          <CustomProxyData
            customProxyData={customProxyData}
            customProxySend={customProxySend}
            handleProxyDataClick={handleProxyDataClick}
            proxyDataCheckBox={proxyDataCheckBox}
            proxyInputOnChange={proxyInputOnChange}
          />
        </div>
      </div>
    );
  }

  if (isOwner && !afterExecutionWindow) {
    return <div>You are the owner. Please wait until after conclusion of execution window when proxy call feature will enable.</div>;
  }

  return <div />
}

ProxySection.propTypes = {
  afterExecutionWindow: PropTypes.bool,
  isOwner: PropTypes.bool,
  tokenTransferDetails: PropTypes.array
}

export default ProxySection;