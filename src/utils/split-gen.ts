const wall = 0;
const path = 1;

function initGrid(size: number) {
  const res: number[][] = [];

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
  grid: number[][],
  xStart: number,
  yStart: number,
  xBound: number,
  yBound: number,
  history: number[][][]
) {
  if (xBound - xStart < 3) return grid;
  if (yBound - yStart < 3) return grid;

  const randomRow = Math.min(randomRangeEven(yBound, yStart) + 1, yBound - 2);
  const randomCol = Math.min(randomRangeEven(xBound, xStart) + 1, xBound - 2);

  const randomSplitCol = Math.min(randomRange(yBound, yStart) + 1, yBound - 2);
  const randomSplitRow = Math.min(randomRange(yBound, yStart) + 1, xBound - 2);

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

export function lonelyWall(grid: number[][], x: number, y: number) {
  if (x - 1 < 0 || x + 1 > grid.length || y - 1 < 0 || y + 1 > grid.length)
    return false;

  return (
    grid[y]?.[x - 1] === path &&
    grid[y]?.[x + 1] === path &&
    grid[y - 1]?.[x] === path &&
    grid[y + 1]?.[x] === path
  );
}

function fixMaze(grid: number[][]) {
  const toAdd: [number, number][] = [];

  for (let i = 0; i < grid.length; i++) {
    grid[i][0] = wall;
    grid[i][grid.length - 1] = wall;
    grid[0][i] = wall;
    grid[grid.length - 1][i] = wall;
  }

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
    grid[item[0]][item[1]] = wall;
  });

  return grid;
}

export function generate(size: number, drawCb: (grid: number[][]) => void) {
  let grid = initGrid(size);

  const history: number[][][] = [];
  grid = splitIteration(grid, 0, 0, grid.length, grid.length, history);

  grid = fixMaze(grid);
  history.push([...grid.map((row) => [...row])]);

  // // for animating
  // const delay = 0;

  // history.forEach((grid, i) => {
  //   setTimeout(() => {
  //     drawCb(grid);
  //   }, delay * i);
  // });

  return grid;
}

function randomRange(max: number, min: number) {
  return Math.floor(Math.random() * (max - min)) + min;
}

function randomRangeEven(max: number, min: number) {
  const num = randomRange(max, min);
  return Math.floor(num / 2) * 2;
}
