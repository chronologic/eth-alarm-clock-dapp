import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { transactionCache } from '../../../stores/index';

const CancelSection = props => {
  const { cancelButtonEnabled, cancelBtnRef, cancelTransaction, claimWindowStart, executionWindowEnd, isOwner, owner } = props;

  return (
    <div className="row mt-4">
      <div className="col">
        <div className="alert alert-info">
          {!isOwner && (
            <React.Fragment>
              In order to cancel this transaction you must be the owner.
              Please switch to account <b>{owner}</b>{' '}
              (transaction owner).
              <br />
              <br />
            </React.Fragment>
          )}
          The transaction can be cancelled:
          <br />
          <ol className="list-normalized">
            <li>
              Before <b>{claimWindowStart}</b>{' '}
              (Claim Window Start)
            </li>
            <li>
              When wasn&#39;t executed by any TimeNode after{' '}
              <b>{executionWindowEnd}</b>
              (Execution Window End)
            </li>
            <li>When it hasn&#39;t been already cancelled</li>
            <li>Only by its owner</li>
          </ol>
          <div className="mt-3">
            <button
              className="btn btn-danger btn-cons"
              disabled={!cancelButtonEnabled}
              onClick={cancelTransaction}
              type="button"
              ref={cancelBtnRef}
            >
              <span>Cancel</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}

export default CancelSection;
