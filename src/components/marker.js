import React, { PureComponent } from 'react';
import { Circle } from 'react-konva';
import PropTypes from 'prop-types';

class Marker extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {};
  }
  render() {
    return (
      <Circle
        y={this.props.y * this.props.size + this.props.size / 2 - 1}
        x={this.props.x * this.props.size + this.props.size / 2 - 2}
        width={this.props.size - 5}
        height={this.props.size - 5}
        fill={`#009900`}
      />
    );
  }
}

Marker.propTypes = {
  x: PropTypes.number,
  y: PropTypes.number,
  size: PropTypes.number
};

export default Marker;
