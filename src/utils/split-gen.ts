import { Coord, Grid } from "../App";

export const wall = 0 as const;
export const path = 1 as const;

function initGrid(size: number) {
  const res: Grid = [];

  for (let i = 0; i < size; i++) {
    const temp: number[] = [];
    for (let j = 0; j < size; j++) {
      temp.push(wall);
    }
    res.push(temp);
  }

  return res;
}

function splitIteration(
  grid: Grid,
  xStart: number,
  yStart: number,
  xBound: number,
  yBound: number,
  history: Grid[]
) {
  if (xBound - xStart < 3) return grid;
  if (yBound - yStart < 3) return grid;

  const randomRow = Math.min(randomRangeEven(yBound, yStart) + 1, yBound - 2);
  const randomCol = Math.min(randomRangeEven(xBound, xStart) + 1, xBound - 2);

  let randomSplitCol = Math.min(randomRange(yBound, yStart) + 1, yBound - 2);
  let randomSplitRow = Math.min(randomRange(xBound, xStart) + 1, xBound - 2);

  for (let i = yStart; i < yBound; i++) {
    if (i === 0 || i === grid.length - 1) continue;
    if (randomSplitRow === i) continue;

    grid[randomCol][i] = path;
  }

  for (let i = xStart; i < xBound; i++) {
    if (i === 0 || i === grid.length - 1) continue;
    if (randomSplitCol === i) continue;

    grid[i][randomRow] = path;
  }

  const copy = [...grid.map((row) => [...row])];
  history.push(copy);

  grid = splitIteration(grid, xStart, yStart, randomCol, randomRow, history);
  grid = splitIteration(grid, xStart, randomRow, randomCol, yBound, history);
  grid = splitIteration(grid, randomCol, yStart, xBound, randomRow, history);
  grid = splitIteration(grid, randomCol, randomRow, xBound, yBound, history);

  return grid;
}

function lonelyWall(grid: Grid, x: number, y: number) {
  if (x - 1 < 0 || x + 1 > grid.length || y - 1 < 0 || y + 1 > grid.length)
    return false;

  return (
    grid[y]?.[x - 1] === path &&
    grid[y]?.[x + 1] === path &&
    grid[y - 1]?.[x] === path &&
    grid[y + 1]?.[x] === path
  );
}

function fixWalls(grid: Grid) {
  for (let i = 0; i < grid.length; i++) {
    grid[i][0] = wall;
    grid[i][grid.length - 1] = wall;
    grid[0][i] = wall;
    grid[grid.length - 1][i] = wall;
  }

  return grid;
}

function fixLonelyWalls(grid: Grid) {
  const toAdd: Coord[] = [];

  for (let i = 0; i < grid.length; i++) {
    for (let j = 0; j < grid.length; j++) {
      // // for less grouping
      // if (grid[j][i] === path) continue;

      const positions = [
        [i, j - 1],
        [i, j + 1],
        [i - 1, j],
        [i + 1, j],
      ].filter((item) => item !== null);

      if (lonelyWall(grid, j, i)) {
        let toAdd = positions[Math.floor(Math.random() * positions.length)];

        if (toAdd) {
          grid[toAdd[0]][toAdd[1]] = wall;
        }
      }
    }
  }

  toAdd.forEach((item) => {
    grid[item.y][item.x] = wall;
  });

  return grid;
}

export function hasDiagonalConnection(
  grid: Grid,
  x: number,
  y: number,
  xOffset: number,
  yOffset: number
) {
  return (
    grid[y]?.[x] === wall &&
    grid[y + yOffset]?.[x + xOffset] === wall &&
    grid[y]?.[x + xOffset] === path &&
    grid[y + yOffset]?.[x] === path
  );
}

function fixDiagonalConnections(grid: Grid, cuttoff = 0) {
  const offsetCounts: Coord[] = [
    new Coord(-1, -1),
    new Coord(1, -1),
    new Coord(-1, 1),
    new Coord(1, 1),
  ];

  for (let i = 0; i < grid.length; i++) {
    for (let j = 0; j < grid.length; j++) {
      if (grid[i][j] === path) continue;

      const toAdd: Coord[] = [];
      const posCount = new Map<string, number>();

      const updateCounts = (offset: string) => {
        const oldVal = posCount.get(offset);

        if (oldVal === undefined) {
          posCount.set(offset, 1);
        } else {
          posCount.set(offset, oldVal + 1);
        }
      };

      for (const offset of offsetCounts) {
        const res = hasDiagonalConnection(grid, j, i, offset.x, offset.y);
        if (res) {
          const pos1 = new Coord(j + offset.x, i).stringify();
          updateCounts(pos1);

          const pos2 = new Coord(j, i + offset.y).stringify();
          updateCounts(pos2);
        }
      }

      const entries = [...posCount.entries()];
      if (entries.length > 0) {
        const filtered = entries.filter((item, _) => item[1] > cuttoff);
        if (filtered.length > 0) {
          toAdd.push(Coord.fromString(filtered[0][0]));
        }
      }

      toAdd.forEach((pos) => {
        grid[pos.y][pos.x] = wall;
      });
    }
  }

  return grid;
}

function fixMaze(grid: Grid) {
  grid = fixWalls(grid);
  grid = fixLonelyWalls(grid);
  grid = fixDiagonalConnections(grid, 1);
  grid = fixDiagonalConnections(grid);

  return grid;
}

export function generate(size: number, drawCb: (grid: Grid) => void) {
  let grid = initGrid(size);

  const history: Grid[] = [];
  grid = splitIteration(grid, 0, 0, grid.length, grid.length, history);

  grid = fixMaze(grid);
  history.push([...grid.map((row) => [...row])]);

  // // for animating
  // const delay = 500;

  // history.forEach((grid, i) => {
  //   setTimeout(() => {
  //     drawCb(grid);
  //   }, delay * i);
  //j});

  let index = history.length - 1;
  addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") {
      index = Math.max(0, index - 1);
    } else if (e.key === "ArrowRight") {
      index = Math.min(history.length - 1, index + 1);
    }
    drawCb(history[index]);
  });

  return grid;
}

function randomRange(max: number, min: number) {
  return Math.floor(Math.random() * (max - min)) + min;
}

function randomRangeEven(max: number, min: number) {
  const num = randomRange(max, min);
  return Math.floor(num / 2) * 2;
}
