import React, { Component } from 'react';
import PropTypes from 'prop-types';

class ExecutionWindowPreset extends Component {

  constructor (props) {
    super(props);
    this.state = {
      value: props.value,
      selected: props.selected
    };
  }

  render() {

    let classes = ["btn", "btn-default", "w-100"];
    if(this.state.selected) {
      classes.push('active');
    }

    return (
      <label className={classes.join(' ')}>
        <input type="radio" name="exeWindOptions" value={this.state.value} defaultChecked={this.state.selected}/>{this.state.value} min
      </label>
    );
  }
}

ExecutionWindowPreset.propTypes = {
  value: PropTypes.number,
  selected: PropTypes.bool  
};

export default ExecutionWindowPreset;