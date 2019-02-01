import React, { Component } from 'react';
import PropTypes from 'prop-types';
import GroupedRadioToggle from '../Common/GroupedRadioToggle';

const PRESET_TIME_BOUNTIES = ['0.02', '0.04', '0.08'];

class TimeBountyField extends Component {
  state = {
    advanced: false
  };

  render() {
    const { onChange, onBlur, isValid, timeBounty } = this.props;
    const { advanced } = this.state;

    return (
      <>
        {!advanced && (
          <>
            <div className="row">
              <div className="col-12">TIME BOUNTY</div>
            </div>
            <br />
          </>
        )}
        <div className="TimeBountyField">
          <div className="TimeBountyField-input">
            {advanced ? (
              <div className="row">
                <div className="col-md-12">
                  <div
                    className={
                      'form-group form-group-default required ' + (isValid ? '' : ' has-error')
                    }
                  >
                    <label>Time Bounty</label>
                    <input
                      className="form-control"
                      type="number"
                      value={timeBounty}
                      placeholder="Custom"
                      onChange={onChange}
                      onBlur={onBlur}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <GroupedRadioToggle
                options={PRESET_TIME_BOUNTIES}
                isValid={isValid}
                onChangeHandler={onChange}
                selectedValue={timeBounty}
              />
            )}
            <a onClick={this.toggleAdvanced} className="TimeBountyField-advanced-toggle">
              {advanced ? `- Simple` : `+ Advanced`}
            </a>
          </div>

          {!isValid && (
            <div className="alert alert-warning small">
              You don&apos;t have enough funds or the value is invalid.
            </div>
          )}
        </div>
      </>
    );
  }

  toggleAdvanced = () =>
    this.setState(prevState => ({
      advanced: !prevState.advanced
    }));
}

TimeBountyField.propTypes = {
  onChange: PropTypes.any,
  onBlur: PropTypes.any,
  isValid: PropTypes.any,
  timeBounty: PropTypes.any
};

export default TimeBountyField;
