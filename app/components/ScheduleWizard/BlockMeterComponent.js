import React, { Component } from 'react';

class BlockMeterComponent extends Component {
    render() {
        return (
            <div>
                <meter min="0" max="10" value="1"></meter>
            </div>
        );
    }
}

export default BlockMeterComponent;