import React from 'react'
import PropTypes from 'prop-types'

class PoweredByEAC extends React.Component {
  render() {
    return (
      <div className={ this.props.className }>
        <a href="https://github.com/ethereum-alarm-clock" target="_blank" rel="noopener noreferrer">
          <img src="img/powered-by-eac.svg" alt="logo" data-src="img/powered-by-eac.svg" height="36" />
        </a>
      </div>
    )
  }
}

PoweredByEAC.propTypes = {
  className: PropTypes.string
}

export default PoweredByEAC;