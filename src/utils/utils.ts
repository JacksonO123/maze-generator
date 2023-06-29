export function copyGrid(grid: Grid) {
  return [...grid.map((row) => [...row])];
}

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

  clone() {
    return new Coord(this.x, this.y);
  }

  equals(coord: Coord) {
    return this.x === coord.x && this.y === coord.y;
  }
}
