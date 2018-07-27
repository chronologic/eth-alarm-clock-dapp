import React, { Component } from 'react';
import PropTypes from 'prop-types';

export default class Select extends Component {
  handleChange() {
    const { onChange } = this.props;

    if (onChange) {
      onChange(...arguments);
    }
  }

  handleBlur() {
    const { onBlur } = this.props;

    if (onBlur) {
      onBlur(...arguments);
    }
  }

  componentDidMount() {
    const jQuery = window.jQuery;

    if (!jQuery) {
      return;
    }

    jQuery(this.selectRef)
      .select2(this.props.setupOptions)
      .on('change', event => this.handleChange(event))
      .on('blur', event => this.handleBlur(event));
  }

  render() {
    const { value } = this.props;

    return (
      <select
        ref={ref => (this.selectRef = ref)}
        onChange={this.handleChange}
        onBlur={this.handleBlur}
        value={value}
      >
        {this.props.children}
      </select>
    );
  }

  componentDidUpdate(prevProps) {
    if (prevProps.value === this.props.value) {
      return;
    }

    this.selectRef.value = this.props.value;

    const event = new Event('change');
    this.selectRef.dispatchEvent(event);
  }
}

Select.propTypes = {
  children: PropTypes.any,
  onBlur: PropTypes.any,
  onChange: PropTypes.func,
  setupOptions: PropTypes.object,
  value: PropTypes.any
};
