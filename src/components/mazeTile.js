import React, { Fragment, PureComponent } from 'react';
import { Rect } from 'react-konva';
import PropTypes from 'prop-types';

class MazeTile extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      opacity: 0,
      visited: false
    };
  }

  static getDerivedStateFromProps(props, state) {
    if (state.visited) {
      return { opacity: 1 };
    }

    const xDiff = Math.abs(props.playerX - props.x);
    const yDiff = Math.abs(props.playerY - props.y);

    if (xDiff > 10 || yDiff > 10) {
      return { opacity: 0 };
    }
    if (Math.sqrt(xDiff ** 2 + yDiff ** 2) <= 10) {
      return { opacity: 1, visited: true };
    }
    return { opacity: 0 };
  }

  render() {
    return (
      <Fragment>
        {this.props.walls.bottom ? (
          <Rect
            x={this.props.x * this.props.size}
            y={this.props.y * this.props.size + this.props.size - 3}
            width={this.props.size}
            height={3}
            fill="#000"
            opacity={this.state.opacity}
          />
        ) : null}
        {this.props.walls.right ? (
          <Rect
            x={this.props.x * this.props.size + this.props.size - 3}
            y={this.props.y * this.props.size - 3}
            width={3}
            height={this.props.size + 3}
            fill={`#000`}
            opacity={this.state.opacity}
          />
        ) : null}
        {this.props.x === 0 ? (
          <Rect
            x={0}
            y={this.props.y * this.props.size}
            width={3}
            height={this.props.size}
            fill={`#000`}
            opacity={this.state.opacity}
          />
        ) : null}
        {this.props.y === 0 ? (
          <Rect
            y={0}
            x={this.props.x * this.props.size}
            width={this.props.size}
            height={3}
            fill={`#000`}
            opacity={this.state.opacity}
          />
        ) : null}
      </Fragment>
    );
  }
}

MazeTile.propTypes = {
  x: PropTypes.number,
  y: PropTypes.number,
  walls: PropTypes.any,
  playerX: PropTypes.number,
  playerY: PropTypes.number,
  size: PropTypes.number
};

export default MazeTile;
