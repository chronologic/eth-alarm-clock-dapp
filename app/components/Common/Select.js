import React, { Component } from 'react';
import PropTypes from 'prop-types';

export default class Select extends Component {
  handleChange() {
    this.props.onChange(...arguments);
  }

  componentDidMount() {
    const jQuery = window.jQuery;

    if (!jQuery) {
      return;
    }

    jQuery(this.selectRef)
      .select2(this.props.setupOptions)
      .on('change', event => this.handleChange(event));
  }

  render() {
    return (
      <select ref={ref => (this.selectRef = ref)} onChange={this.handleChange}>
        {this.props.children}
      </select>
    );
  }
}

Select.propTypes = {
  children: PropTypes.any,
  onChange: PropTypes.func,
  setupOptions: PropTypes.object
};
