import {
  Color,
  SceneCollection,
  Simulation,
  Square,
  Vector,
} from "simulationjs";
import "./App.css";
import { generate, hasDiagonalConnection, path, wall } from "./utils/split-gen";

export type Grid = number[][];

export class Coord {
  x: number;
  y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  stringify() {
    return `${this.x}:${this.y}`;
  }

  static fromString(str: string) {
    const parts = str.split(":");

    const x = +parts[0];
    const y = +parts[1];

    return new Coord(x, y);
  }
}

const App = () => {
  let canvasRef: HTMLCanvasElement;
  let canvas: Simulation;
  let mazeSquares: SceneCollection;
  let maze: Grid;

  const size = 500;
  const gridSize = 41;

  setTimeout(() => {
    canvas = new Simulation(canvasRef);
    canvas.setSize(size, size);
    canvas.setBgColor(new Color(255, 255, 255));
    canvas.start();

    mazeSquares = new SceneCollection("squares");
    canvas.add(mazeSquares);

    maze = generate(gridSize, (grid) => drawMaze(grid));
    drawMaze(maze);

    canvas.on("click", (e: MouseEvent) => {
      const p = new Vector(e.offsetX, e.offsetY);

      const x = Math.floor(p.x / (size / gridSize));
      const y = Math.floor(p.y / (size / gridSize));

      console.log({
        topLeft: hasDiagonalConnection(maze, x, y, -1, -1),
        topRight: hasDiagonalConnection(maze, x, y, 1, -1),
        bottomLeft: hasDiagonalConnection(maze, x, y, -1, 1),
        bottomRight: hasDiagonalConnection(maze, x, y, 1, 1),
      });

      console.log(x, y);
    });
  });

  function drawMaze(maze: Grid) {
    const squareSize = size / gridSize;

    mazeSquares.empty();
    maze.forEach((row, i) => {
      row.forEach((item, j) => {
        const x = j * squareSize + squareSize / 2;
        const y = i * squareSize + squareSize / 2;
        const square = new Square(
          new Vector(x, y),
          squareSize,
          squareSize,
          item === wall
            ? new Color(0, 0, 0)
            : item === path
            ? new Color(255, 255, 255)
            : new Color(0, 0, 255)
        );
        mazeSquares.add(square);
      });
    });
  }

  function resetGrid() {
    maze = generate(gridSize, (grid) => drawMaze(grid));
    drawMaze(maze);
  }

  return (
    <div class="app">
      <div class="controls">
        <button onClick={resetGrid}>Reset</button>
      </div>
      {/* @ts-ignore */}
      <canvas ref={canvasRef} />
    </div>
  );
};

export default App;
