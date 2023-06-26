import { finish, path, taken, wall } from "./split-gen";
import { Coord, Grid, copyGrid } from "./utils";

export function solveMaze(
  grid: Grid,
  drawCb: (grid: Grid) => void,
  delay: number
) {
  const history: Coord[] = [];

  const startPos = grid[0].indexOf(path);

  const pivotPoints: Coord[] = [];
  let currentPos = new Coord(startPos, 0);

  while (currentPos.y < grid.length - 1) {
    grid[currentPos.y][currentPos.x] = taken;

    history.push(currentPos.clone());

    const availableMoves: Coord[] = [];

    const moves = [
      new Coord(currentPos.x - 1, currentPos.y),
      new Coord(currentPos.x + 1, currentPos.y),
      new Coord(currentPos.x, currentPos.y - 1),
      new Coord(currentPos.x, currentPos.y + 1),
    ];

    moves.forEach((move) => {
      if (
        move.x >= 0 &&
        move.x < grid.length &&
        move.y >= 0 &&
        move.y < grid.length
      ) {
        const pos = grid[move.y][move.x];
        if (pos === path) availableMoves.push(move);
      }
    });

    for (let i = 0; i < availableMoves.length; i++) {
      if (availableMoves[i].y === grid.length - 1) {
        currentPos = availableMoves[i];
      }
    }

    if (availableMoves.length === 0) {
      const newPos = pivotPoints.pop();

      if (!newPos) {
        return "No solution";
      }

      currentPos = newPos;
    } else if (availableMoves.length >= 1) {
      if (availableMoves.length > 1) {
        pivotPoints.push(currentPos.clone());
      }

      currentPos = availableMoves.sort((a, b) => b.y - a.y)[0];
    }
  }

  grid[currentPos.y][currentPos.x] = finish;

  history.push(currentPos.clone());

  if (delay === 0) {
    drawCb(grid);
  } else {
    const copy = copyGrid(grid).map((row) =>
      row.map((item) => (item !== path && item !== wall ? path : item))
    ) as Grid;

    for (let i = 0; i < history.length; i++) {
      setTimeout(() => {
        if (i < history.length - 1) {
          copy[history[i].y][history[i].x] = taken;
        } else {
          copy[history[i].y][history[i].x] = finish;
        }

        drawCb(copy);
      }, i * delay);
    }
  }

  return null;
}
