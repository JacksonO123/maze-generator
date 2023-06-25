import {
  Color,
  SceneCollection,
  Simulation,
  Square,
  Vector,
} from "simulationjs";
import "./App.css";
import { generate, lonelyWall } from "./utils/split-gen";

const App = () => {
  let canvasRef: HTMLCanvasElement;
  let canvas: Simulation;
  let mazeSquares: SceneCollection;
  let maze: number[][];

  const size = 500;
  const gridSize = 21;

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

      console.log(lonelyWall(maze, x, y));
    });
  });

  function drawMaze(maze: number[][]) {
    const squareSize = size / gridSize;

    mazeSquares.empty();
    maze.forEach((row, i) => {
      row.forEach((item, j) => {
        const x = j * squareSize + squareSize / 2;
        const y = i * squareSize + squareSize / 2;
        if (item === 0) {
          const square = new Square(
            new Vector(x, y),
            squareSize,
            squareSize,
            new Color(0, 0, 0)
          );
          mazeSquares.add(square);
        }
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
