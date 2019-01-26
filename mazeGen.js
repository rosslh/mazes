const fs = require(`fs`);

const getUnvisitedNeighbors = (current, cells, nx, ny) => {
  const { y, x } = current;
  const out = [];
  if (x > 0) {
    out.push(cells[y][x - 1]);
  }
  if (y > 0) {
    out.push(cells[y - 1][x]);
  }
  if (x < nx - 1) {
    out.push(cells[y][x + 1]);
  }
  if (y < ny - 1) {
    out.push(cells[y + 1][x]);
  }
  return out.filter(c => !c.visited);
};

const unvisitedCellsExist = cells => {
  for (const row of cells) {
    if (row.some(x => !x.visited)) return true;
  }
  return false;
};

const removeBottomWall = (cell, cells) => {
  cells[cell.y][cell.x].walls.bottom = 0;
};

const removeRightWall = (cell, cells) => {
  cells[cell.y][cell.x].walls.right = 0;
};

// n is even
const generate = (nx, ny) => {
  const cells = [];
  const pathStack = [];
  let currentCell = { x: 0, y: 0 };

  for (let y = 0; y < ny; y++) {
    cells.push([]);
    for (let x = 0; x < nx; x++) {
      cells[y].push({
        x,
        y,
        walls: {
          right: 1,
          bottom: 1
        },
        visited: false
      });
    }
  }
  cells[0][0].visited = true;

  while (unvisitedCellsExist(cells)) {
    const neighbors = getUnvisitedNeighbors(currentCell, cells, nx, ny);
    if (neighbors.length) {
      const next = neighbors[Math.floor(Math.random() * neighbors.length)];
      if (next.x !== currentCell.x && next.y !== currentCell.y) {
        throw new Error(`Invalid neighbor`);
      }
      if (next.x < currentCell.x) {
        removeRightWall(next, cells);
      } else if (next.x > currentCell.x) {
        removeRightWall(currentCell, cells);
      } else if (next.y < currentCell.y) {
        removeBottomWall(next, cells);
      } else if (next.y > currentCell.y) {
        removeBottomWall(currentCell, cells);
      } else {
        throw new Error(`Invalid neighbor`);
      }
      pathStack.push(currentCell);
      currentCell = { x: next.x, y: next.y };
      cells[currentCell.y][currentCell.x].visited = true;
    } else if (pathStack.length) {
      if (Math.random() < 0.5) {
        currentCell = pathStack.pop();
      } else {
        const index = Math.floor(Math.random() * pathStack.length);
        [currentCell] = pathStack.splice(index, 1);
      }
    } else {
      throw new Error(`Something went very wrong`);
    }
  }

  return cells.map(y =>
    y.map(c => {
      delete c.visited;
      return c;
    })
  ); // remove visited properties
};

fs.writeFile(
  `maze.json`,
  JSON.stringify(
    {
      cells: generate(25, 40)
    },
    null,
    2
  ),
  `utf8`,
  error => {
    if (error) throw error;
  }
);
// display(generate(30));
