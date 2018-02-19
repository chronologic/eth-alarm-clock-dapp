import React from 'react'
import PropTypes from 'prop-types'

class PoweredByEAC extends React.Component {
  render() {
    return (
      <div className={ this.props.className }>
        <img src="img/powered-by-eac.svg" alt="logo" data-src="img/powered-by-eac.png" height="36" />
      </div>
    )
  }
}

PoweredByEAC.propTypes = {
  className: PropTypes.string
}

export default PoweredByEAC;