import { finish, path, taken } from "./split-gen";
import { Coord, Grid, copyGrid } from "./utils";

class SolutionLeg {
  steps: Coord[];
  moves: Coord[];

  constructor(pos: Coord, moves: Coord[]) {
    this.steps = [pos];
    this.moves = moves;
  }

  getStart() {
    this.steps.splice(1);
    return this.steps[0];
  }

  addStep(pos: Coord) {
    this.steps.push(pos);
  }

  getSteps() {
    return this.steps.map((step) => step.clone());
  }
}

class Solution {
  legs: SolutionLeg[];

  constructor(startPos: number) {
    this.legs = [
      new SolutionLeg(new Coord(startPos, 0), [new Coord(startPos, 1)]),
    ];
  }

  getRecentPivot() {
    if (this.legs.length === 0) return null;

    return this.legs[this.legs.length - 1].getStart();
  }

  getPrevPivot() {
    this.legs.pop();

    if (this.legs.length === 0) return null;

    return this.legs[this.legs.length - 1].getStart();
  }

  addLeg(pos: Coord, moves: Coord[]) {
    this.legs.push(new SolutionLeg(pos, moves));
  }

  addStep(pos: Coord) {
    this.legs[this.legs.length - 1].addStep(pos);
  }

  getSteps() {
    return this.legs.reduce((acc, leg) => {
      const steps = leg.getSteps();
      acc.push(...steps);
      return acc;
    }, [] as Coord[]);
  }
}

type HistoryItem = {
  type: typeof taken | typeof finish;
  pos: Coord;
};

class SolutionHistory {
  history: HistoryItem[][];

  constructor() {
    this.history = [[]];
  }

  addStep(type: typeof taken | typeof finish, pos: Coord) {
    this.history[this.history.length - 1].push({
      type,
      pos,
    });
  }

  addSteps(type: typeof taken | typeof finish, steps: Coord[]) {
    this.history[this.history.length - 1].push(
      ...steps.map((step) => ({
        type,
        pos: step,
      }))
    );
  }

  addGrid() {
    this.history.push([]);
  }

  forEach(grid: Grid, cb: (copy: Grid, step: number) => void) {
    let counter = 0;

    let copy = copyGrid(grid);

    this.history.forEach((historyGrid) => {
      historyGrid.forEach((item) => {
        copy[item.pos.y][item.pos.x] = item.type;
        cb(copyGrid(copy), counter);
        counter++;
      });
      copy = copy.map((row) =>
        row.map((item) => (item === taken || item === finish ? path : item))
      );
    });
  }
}

function getAvailableMoves(grid: Grid, visited: boolean[][], pos: Coord) {
  const availableMoves: Coord[] = [];

  const moves = [
    new Coord(pos.x - 1, pos.y),
    new Coord(pos.x + 1, pos.y),
    new Coord(pos.x, pos.y - 1),
    new Coord(pos.x, pos.y + 1),
  ];

  moves.forEach((move) => {
    if (
      move.x >= 0 &&
      move.x < grid.length &&
      move.y >= 0 &&
      move.y < grid.length
    ) {
      if (!visited[move.y][move.x]) {
        const pos = grid[move.y][move.x];
        if (pos === path) availableMoves.push(move);
      }
    }
  });

  return availableMoves;
}

export function solveMaze(
  grid: Grid,
  drawCb: (grid: Grid) => void,
  delay: number
) {
  const history = new SolutionHistory();

  const startPos = grid[0].indexOf(path);

  let solution = new Solution(startPos);
  let currentPos = new Coord(startPos, 0);
  let visited = grid.map((row) => row.map(() => false));

  while (currentPos.y < grid.length - 1) {
    visited[currentPos.y][currentPos.x] = true;
    solution.addStep(currentPos.clone());

    history.addStep(taken, currentPos.clone());

    const availableMoves = getAvailableMoves(grid, visited, currentPos);

    for (let i = 0; i < availableMoves.length; i++) {
      if (availableMoves[i].y === grid.length - 1) {
        currentPos = availableMoves[i];
      }
    }

    if (availableMoves.length === 0) {
      const pivot = (function getPivot(newPos: Coord | null) {
        if (newPos === null) {
          return null;
        } else if (currentPos.equals(newPos)) {
          return getPivot(solution.getPrevPivot());
        }
        return newPos;
      })(solution.getRecentPivot());

      if (pivot === null) {
        return "No solution";
      }

      currentPos = pivot.clone();
    } else if (availableMoves.length >= 1) {
      if (availableMoves.length > 1) {
        solution.addLeg(
          currentPos.clone(),
          availableMoves.map((move) => move.clone())
        );
      }

      currentPos = availableMoves.sort((a, b) => b.y - a.y)[0];
    }
  }

  history.addGrid();
  history.addSteps(taken, solution.getSteps());
  history.addStep(finish, currentPos.clone());

  if (delay === 0) {
    console.log("draw");
    drawCb(grid);
  } else {
    history.forEach(grid, (copy, count) => {
      setTimeout(() => {
        drawCb(copy);
      }, count * delay);
    });
  }

  return null;
}
