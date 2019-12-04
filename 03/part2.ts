import fs from "fs";
import { withTime } from "../utils";

type Coordinate = { x: number; y: number };
interface BoardPieceData {
  0?: boolean;
  1?: boolean;
  steps0?: number;
  steps1?: number;
}
let board: Map<string, BoardPieceData>;

const emptyPiece: BoardPieceData = { 0: false, 1: false, steps0: 0, steps1: 0 };

const getInput = () => {
  const input = fs.readFileSync(__dirname + "/input.txt");
  return input
    .toString()
    .split("\n")
    .map(x => x.split(","));
};

function resetBoard() {
  board = new Map();
  board.set("0,0", { 0: true, 1: true, steps0: 0, steps1: 0 });
}

const testCases = [
  {
    paths: [
      ["R3", "D2"],
      ["U2", "L2", "D4", "R6", "U2", "L1"]
    ],
    expected: 18
  },
  {
    paths: [
      ["R75", "D30", "R83", "U83", "L12", "D49", "R71", "U7", "L72"],
      ["U62", "R66", "U55", "R34", "D71", "R55", "D58", "R83"]
    ],
    expected: 610
  },
  {
    paths: [
      [
        "R98",
        "U47",
        "R26",
        "D63",
        "R33",
        "U87",
        "L62",
        "D20",
        "R33",
        "U53",
        "R51"
      ],
      ["U98", "R91", "D20", "R16", "D67", "R40", "U7", "R15", "U6", "R7"]
    ],
    expected: 410
  }
];

function main() {
  // REAL INPUT
  const paths = getInput();
  resetBoard();
  let pathIndex: 0 | 1 = 0;
  paths.forEach(path => {
    runPath(path, pathIndex);
    pathIndex++;
  });
  const crossers = findCrossers();
  const answer = getMinDistance(crossers);

  console.log({ answer });

  // TEST INPUT
  testCases.forEach(({ paths, expected }) => {
    resetBoard();

    let pathIndex: 0 | 1 = 0;
    paths.forEach(path => {
      runPath(path, pathIndex);
      pathIndex++;
    });
    const crossers = findCrossers();
    const answer = getMinDistance(crossers);

    console.log({ answer, expected });
    console.log("-------------------");
  });
}

withTime(main);

function runPath(path: string[], pathIndex: 0 | 1) {
  let coords = [0, 0];
  let numSteps = 0;
  path.forEach(instruction => {
    numSteps--; // don't increment for the piece we just visited
    const [x, y] = coords;

    const direction = instruction[0];
    const count = Number(instruction.substring(1));

    if (direction === "U") {
      for (let i = y; i <= y + count; i++) {
        numSteps++;
        setVisited(x, i, pathIndex, numSteps);
      }
      coords[1] = coords[1] + count;
    } else if (direction === "D") {
      for (let i = y; i >= y - count; i--) {
        numSteps++;
        setVisited(x, i, pathIndex, numSteps);
      }
      coords[1] = coords[1] - count;
    } else if (direction === "R") {
      for (let i = x; i <= x + count; i++) {
        numSteps++;
        setVisited(i, y, pathIndex, numSteps);
      }
      coords[0] = coords[0] + count;
    } else if (direction === "L") {
      for (let i = x; i >= x - count; i--) {
        numSteps++;
        setVisited(i, y, pathIndex, numSteps);
      }
      coords[0] = coords[0] - count;
    }
  });
}

function getMinDistance(crossers: Contender[]) {
  return crossers.reduce((acc, cur) => {
    if (cur.length < acc) acc = cur.length;
    return acc;
  }, Number.MAX_SAFE_INTEGER);
}

interface Contender extends Coordinate {
  length: number;
}

function findCrossers(): Contender[] {
  const crossers = [];

  for (let [key, value] of board.entries()) {
    if (value[0] === true && value[1] === true && key !== "0,0") {
      const { x, y } = getCoordsFromKey(key);

      crossers.push({
        x,
        y,
        length: (value.steps0 || 0) + (value.steps1 || 0)
      });
    }
  }

  return crossers;
}

function setVisited(x: number, y: number, path: 0 | 1, numSteps: number) {
  const key = makeKey(x, y);

  // initialize if first visit
  if (!board.has(key)) {
    board.set(key, { ...emptyPiece });
  }

  const newVal = board.get(key) || {};
  newVal[path] = true;
  // @ts-ignore
  newVal[`steps${path}`] = newVal[`steps${path}`] || numSteps;
}

function getCoordsFromKey(key: string): Coordinate {
  const [x, y] = key.split(",").map(Number);
  return { x, y };
}

function makeKey(x: number, y: number): string {
  return `${x},${y}`;
}

function getManhattanDistance(a: Coordinate, b: Coordinate) {
  return Math.abs(a.x - b.x) + Math.abs(a.y + b.y);
}
