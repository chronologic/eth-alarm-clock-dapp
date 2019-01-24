import React from 'react';
import PropTypes from 'prop-types';

const GroupedRadioToggle = ({ isValid, options, selectedValue, onChangeHandler }) => (
  <div className={`GroupedRadioToggle ${!isValid ? 'invalid' : ''}`}>
    {options.map((option, index) => (
      <label
        key={index}
        className={`GroupedRadioToggle-button btn btn-default ${
          option === selectedValue ? 'active' : ''
        }`}
      >
        <input
          type="radio"
          className="GroupedRadioToggle-input"
          value={option}
          onChange={onChangeHandler}
          checked={option === selectedValue}
        />
        &nbsp;{option}
      </label>
    ))}
  </div>
);

GroupedRadioToggle.propTypes = {
  isValid: PropTypes.any,
  options: PropTypes.any,
  selectedValue: PropTypes.any,
  onChangeHandler: PropTypes.any
};

export default GroupedRadioToggle;
