import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouteData } from 'react-static';
import { Stage, Layer } from 'react-konva';
import { css } from '@emotion/core';
import MazeTile from './mazeTile';
import Player from './player';
import Marker from './marker';

const assertDefined = (thing, label, context) => {
  if (thing == null) {
    throw new Error(`${label}: ${thing} at ${context}`);
  }
};

class Maze extends Component {
  constructor(props) {
    super(props);
    this.state = {
      marker: null,
      tileSize: 20,
      playerPositionX: 0,
      playerPositionY: 0,
      searchPath: []
    };
    this.handleKeydown = this.handleKeydown.bind(this);
  }

  componentDidMount() {
    document.addEventListener(`keydown`, this.handleKeydown, false);
    this.intervalId = setInterval(this.approachMarker.bind(this), 200);
  }

  componentWillUnmount() {
    document.removeEventListener(`keydown`, this.handleKeydown, false);
    clearInterval(this.intervalId);
  }

  handleKeydown(event) {
    if (event.keyCode === 37) {
      this.moveLeft();
    } else if (event.keyCode === 38) {
      this.moveUp();
    } else if (event.keyCode === 39) {
      this.moveRight();
    } else if (event.keyCode === 40) {
      this.moveDown();
    }
    event.preventDefault();
  }

  moveRight(throwErr) {
    let { playerPositionX } = this.state;
    const { playerPositionY } = this.state;
    if (
      playerPositionX !== this.props.maze.cells[0].length &&
      !this.props.maze.cells[playerPositionY][playerPositionX].walls.right
    ) {
      playerPositionX += 1;
      this.setState({ playerPositionX });
    } else if (throwErr) {
      throw new Error(`Blocked by wall`);
    }
  }

  moveLeft(throwErr) {
    let { playerPositionX } = this.state;
    const { playerPositionY } = this.state;
    if (
      playerPositionX !== 0 &&
      !this.props.maze.cells[playerPositionY][playerPositionX - 1].walls.right
    ) {
      playerPositionX -= 1;
      this.setState({ playerPositionX });
    } else if (throwErr) {
      throw new Error(`Blocked by wall`);
    }
  }

  moveUp(throwErr) {
    const { playerPositionX } = this.state;
    let { playerPositionY } = this.state;
    if (
      playerPositionY !== 0 &&
      !this.props.maze.cells[playerPositionY - 1][playerPositionX].walls.bottom
    ) {
      playerPositionY -= 1;
      this.setState({ playerPositionY });
    } else if (throwErr) {
      throw new Error(`Blocked by wall`);
    }
  }

  moveDown(throwErr) {
    const { playerPositionX } = this.state;
    let { playerPositionY } = this.state;
    if (
      playerPositionY !== this.props.maze.cells.length &&
      !this.props.maze.cells[playerPositionY][playerPositionX].walls.bottom
    ) {
      playerPositionY += 1;
      this.setState({ playerPositionY });
    } else if (throwErr) {
      throw new Error(`Blocked by wall`);
    }
  }

  coordToTile(n) {
    return Math.floor(n / this.state.tileSize);
  }

  setMarker(e) {
    const coords = e.target.getStage().getPointerPosition();
    const marker = {
      x: this.coordToTile(coords.x),
      y: this.coordToTile(coords.y)
    };
    if (
      this.state.marker &&
      marker.x === this.state.marker.x &&
      marker.y === this.state.marker.y
    ) {
      this.setState({
        marker: null
      });
    } else {
      this.setState({ marker, searchPath: [] });
    }
  }

  getMovementOptions(x, y) {
    assertDefined(x, `x`, `getMovementOptions`);
    assertDefined(y, `y`, `getMovementOptions`);
    return [
      {
        id: `left`,
        x: x - 1,
        y
      },
      {
        id: `right`,
        x: x + 1,
        y
      },
      {
        id: `down`,
        x,
        y: y + 1
      },
      {
        id: `up`,
        x,
        y: y - 1
      }
    ].filter(option => {
      if (
        option.x < 0 ||
        option.y < 0 ||
        option.x > this.props.maze.cells[0].length ||
        option.y > this.props.maze.cells.length ||
        this.state.searchPath.find(el => el.x === option.x && el.y === option.y)
      ) {
        return false;
      }

      if (option.id === `left`) {
        return !this.props.maze.cells[option.y][option.x].walls.right;
      }
      if (option.id === `right`) {
        return !this.props.maze.cells[y][x].walls.right;
      }

      if (option.id === `down`) {
        return !this.props.maze.cells[y][x].walls.bottom;
      }
      if (option.id === `up`) {
        return !this.props.maze.cells[option.y][option.x].walls.bottom;
      }

      return true;
    });
  }

  distance(x1, y1, x2, y2) {
    return Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2);
  }

  getMovementScore(x, y, depth) {
    assertDefined(x, `x`, `getMovementScore`);
    assertDefined(y, `y`, `getMovementScore`);
    if (depth) {
      const options = this.getMovementOptions(x, y).map(option =>
        this.getMovementScore(option.x, option.y, depth - 1)
      );

      let lowestScore = this.distance(
        x,
        y,
        this.state.marker.x,
        this.state.marker.y
      );
      let lowestDistance = lowestScore;

      options.forEach(option => {
        const distance = this.distance(
          option.x,
          option.y,
          this.state.marker.x,
          this.state.marker.y
        );
        if (option.score < lowestScore) {
          lowestScore = option.score;
          lowestDistance = distance;
        } else if (option.score === lowestScore && distance < lowestDistance) {
          lowestScore = option.score;
          lowestDistance = distance;
        }
      });
      assertDefined(lowestScore, `lowestScore`, `getMovementScore`);
      return {
        score: lowestScore,
        distance: this.distance(x, y, this.state.marker.x, this.state.marker.y),
        x,
        y
      };
    }

    // base case: depth = 0
    const score = this.distance(x, y, this.state.marker.x, this.state.marker.y);
    return {
      score,
      x,
      y
    };
  }

  approachMarker() {
    if (!this.state.marker) {
      return -1;
    }

    assertDefined(this.state.playerPositionX, `player x`, `approachMarker`);
    assertDefined(this.state.playerPositionY, `player y`, `approachMarker`);
    assertDefined(this.state.marker.x, `marker.x`, `approachMarker`);
    assertDefined(this.state.marker.y, `marker.y`, `approachMarker`);

    const x = this.state.playerPositionX;
    const y = this.state.playerPositionY;

    const options = this.getMovementOptions(x, y).map(option =>
      this.getMovementScore(option.x, option.y, 6)
    );

    let lowestScore = this.distance(
      x,
      y,
      this.state.marker.x,
      this.state.marker.y
    );
    let nextStepX = x;
    let nextStepY = y;

    options.forEach(option => {
      assertDefined(option.x, `option.x`, `option selection in approachMarker`);
      assertDefined(option.y, `option.y`, `option selection in approachMarker`);
      assertDefined(
        option.score,
        `option.score`,
        `option selection in approachMarker`
      );
      assertDefined(
        option.distance,
        `option.distance`,
        `option selection in approachMarker`
      );

      if (option.score < lowestScore) {
        lowestScore = option.score;
        nextStepX = option.x;
        nextStepY = option.y;
      }
    });

    assertDefined(nextStepX, `nextStepX`, `end of approachMarker`);
    assertDefined(nextStepY, `nextStepY`, `end of approachMarker`);

    if (
      (x === this.state.marker.x && y === this.state.marker.y) ||
      (x === nextStepX && y === nextStepY)
    ) {
      this.setState({ marker: null, searchPath: [] });
    } else {
      const { searchPath } = this.state;
      searchPath.push({ x: nextStepX, y: nextStepY });
      this.setState({
        playerPositionX: nextStepX,
        playerPositionY: nextStepY,
        searchPath
      });
    }
    return 1;
  }

  render() {
    return (
      <div
        css={css`
          margin: 2rem;
        `}
      >
        <Stage
          onClick={e => this.setMarker(e)}
          onFocus={() => {}}
          width={this.state.tileSize * this.props.maze.cells[0].length}
          height={2000}
        >
          <Layer>
            {this.props.maze.cells.flat().map(cell => (
              <MazeTile
                key={`${cell.x},${cell.y}`}
                {...cell}
                size={this.state.tileSize}
                playerX={this.state.playerPositionX}
                playerY={this.state.playerPositionY}
              />
            ))}
            <Player
              size={this.state.tileSize}
              x={this.state.playerPositionX}
              y={this.state.playerPositionY}
            />
            {this.state.marker ? (
              <Marker
                x={this.state.marker.x}
                y={this.state.marker.y}
                size={this.state.tileSize}
              />
            ) : null}
          </Layer>
        </Stage>
      </div>
    );
  }
}

Maze.propTypes = {
  maze: PropTypes.any
};

export default withRouteData(Maze);
