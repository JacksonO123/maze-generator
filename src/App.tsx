import {
  Color,
  SceneCollection,
  Simulation,
  Square,
  Vector,
} from "simulationjs";
import "./App.scss";
import { finish, generate, path, taken, wall } from "./utils/split-gen";
import { solveMaze } from "./utils/solve";
import { Grid, copyGrid } from "./utils/utils";
import { createSignal } from "solid-js";

const App = () => {
  let canvasRef: HTMLCanvasElement;
  let canvas: Simulation;
  let mazeSquares: SceneCollection;
  let maze: Grid;

  const size = 500;
  const gridSize = 41;

  const [error, setError] = createSignal<string | null>(null);

  setTimeout(() => {
    canvas = new Simulation(canvasRef);
    canvas.setSize(size, size);
    canvas.setBgColor(new Color(255, 255, 255));
    canvas.start();

    mazeSquares = new SceneCollection("squares");
    canvas.add(mazeSquares);

    maze = generate(gridSize, (grid) => drawMaze(grid));
    drawMaze(maze);
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
            : item === taken
            ? new Color(0, 0, 255)
            : item === finish
            ? new Color(255, 0, 0)
            : new Color(0, 255, 0)
        );
        mazeSquares.add(square);
      });
    });
  }

  function resetGrid() {
    maze = generate(gridSize, (grid) => drawMaze(grid));
    drawMaze(maze);
  }

  function handleSolveMaze() {
    const err = solveMaze(copyGrid(maze), (grid) => drawMaze(grid), 15);
    setError(err);
  }

  return (
    <div class="app">
      <div class="controls">
        <h1>Controls</h1>
        <button onClick={handleSolveMaze}>Solve</button>
        <button onClick={resetGrid}>Reset</button>
        {error() !== null && <span class="error">{error()}</span>}
      </div>
      {/* @ts-ignore */}
      <canvas ref={canvasRef} />
    </div>
  );
};

export default App;
