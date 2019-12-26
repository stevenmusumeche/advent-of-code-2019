import { withTime } from "../utils";
import fs from "fs";
import { run } from "../util/intcode-computer";

let x = 0;
let y = 0;
let grid = new Map<string, string>();

const testGrid = `..#..........
..#..........
#######...###
#.#...#...#.#
#############
..#...#...#..
..#####...^..`
  .split("\n")
  .map(r => r.split(""));

withTime(main);
function main() {
  const input = getInput();

  const it = run(input, 0, 0);
  while (true) {
    const { value, done } = it.next();
    if (done) break;
    addToGrid(value as number);
  }

  // for (let x = 0; x < testGrid.length; x++) {
  //   for (let y = 0; y < testGrid[0].length; y++) {
  //     grid.set(key(x, y), testGrid[x][y]);
  //   }
  // }

  const { minX, minY, maxX, maxY } = getGridSizes(grid);

  // console.log({ minX, minY, maxX, maxY });
  // { minX: 0, minY: 0, maxX: 38, maxY: 28 }

  // console.log(grid);

  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      const piece = grid.get(key(x, y));

      process.stdout.write(piece!);
    }
    process.stdout.write("\n");
  }

  console.log("\n======\n");

  let alignParamSum = 0;
  for (let x = minX + 1; x <= maxX - 1; x++) {
    for (let y = minY + 1; y <= maxY - 1; y++) {
      let piece;
      if (isIntersection(x, y)) {
        piece = "0";
        alignParamSum += (x - minX) * (y - minY);
      } else {
        piece = grid.get(key(x, y));
      }

      process.stdout.write(piece!);
    }
    process.stdout.write("\n");
  }

  console.log({ alignParamSum });
}

function isIntersection(x: number, y: number) {
  const selfChar = grid.get(key(x, y));
  const charAbove = grid.get(key(x, y - 1));
  const charBelow = grid.get(key(x, y + 1));
  const charLeft = grid.get(key(x - 1, y));
  const charRight = grid.get(key(x + 1, y));

  return (
    selfChar !== "." &&
    charAbove !== "." &&
    charBelow !== "." &&
    charLeft !== "." &&
    charRight !== "."
  );
}

function getGridSizes(grid: Map<string, string>) {
  return [...grid.keys()].reduce(
    (acc, cur) => {
      const [x, y] = cur.split(",").map(Number);
      if (x > acc.maxX) acc = { ...acc, maxX: x };
      if (x < acc.minX) acc = { ...acc, minX: x };
      if (y > acc.maxY) acc = { ...acc, maxY: y };
      if (y < acc.minY) acc = { ...acc, minY: y };
      return acc;
    },
    {
      minX: Number.MAX_SAFE_INTEGER,
      minY: Number.MAX_SAFE_INTEGER,
      maxX: Number.MIN_SAFE_INTEGER,
      maxY: Number.MIN_SAFE_INTEGER
    }
  );
}

function addToGrid(val: number) {
  if (val === 10) {
    console.log("wip[out", x, y);

    y = 0;
    x++;
  } else {
    grid.set(key(x, y), String.fromCharCode(val));
    y++;
  }
}

function getInput(): string[] {
  const input = fs.readFileSync(__dirname + "/input.txt");
  return input.toString().split(",");
}

function key(x: number, y: number): string {
  return `${x},${y}`;
}
