import fs from "fs";

type Coordinate = { x: number; y: number };
interface BoardPieceData {
  0?: boolean;
  1?: boolean;
}
let board: Map<string, BoardPieceData>;

const getInput = () => {
  const input = fs.readFileSync(__dirname + "/input.txt");
  return input
    .toString()
    .split("\n")
    .map(x => x.split(","));
};

function resetBoard() {
  board = new Map();
  board.set("0,0", { 0: true, 1: true });
}

const testCases = [
  {
    paths: [
      ["R5", "D3"],
      ["U6", "R3", "D9"]
    ],
    expected: 3
  },
  {
    paths: [
      ["R75", "D30", "R83", "U83", "L12", "D49", "R71", "U7", "L72"],
      ["U62", "R66", "U55", "R34", "D71", "R55", "D58", "R83"]
    ],
    expected: 159
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
    expected: 135
  }
];

(function main() {
  // REAL INPUT
  const paths = getInput();
  resetBoard();
  let pathIndex: 0 | 1 = 0;
  paths.forEach(path => {
    runPath(path, pathIndex);
    pathIndex++;
  });
  const crossers = drawBoard();
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
    const crossers = drawBoard();
    const answer = getMinDistance(crossers);

    console.log({ answer, expected });
    console.log("-------------------");
  });
})();

function runPath(path: string[], pathIndex: 0 | 1) {
  let coords = [0, 0];
  path.forEach(instruction => {
    const [x, y] = coords;
    const direction = instruction[0];
    const count = Number(instruction.substring(1));

    if (direction === "U") {
      for (let i = y; i <= y + count; i++) {
        setVisited(x, i, pathIndex);
      }
      coords[1] = coords[1] + count;
    } else if (direction === "D") {
      for (let i = y; i >= y - count; i--) {
        setVisited(x, i, pathIndex);
      }
      coords[1] = coords[1] - count;
    } else if (direction === "R") {
      for (let i = x; i <= x + count; i++) {
        setVisited(i, y, pathIndex);
      }
      coords[0] = coords[0] + count;
    } else if (direction === "L") {
      for (let i = x; i >= x - count; i--) {
        setVisited(i, y, pathIndex);
      }
      coords[0] = coords[0] - count;
    }
  });
}

function getMinDistance(crossers: Contender[]) {
  return crossers.reduce((acc, cur) => {
    if (cur.dist < acc) acc = cur.dist;
    return acc;
  }, Number.MAX_SAFE_INTEGER);
}

interface Contender extends Coordinate {
  dist: number;
}

function drawBoard(): Contender[] {
  const crossers = [];

  for (let [key, value] of board.entries()) {
    if (value[0] === true && value[1] === true && key !== "0,0") {
      const { x, y } = getCoordsFromKey(key);
      crossers.push({
        x,
        y,
        dist: getManhattanDistance({ x: 0, y: 0 }, { x, y })
      });
    }
  }

  return crossers;
}

function setVisited(x: number, y: number, path: 0 | 1) {
  const key = makeKey(x, y);

  // initialize if first visit
  if (!board.has(key)) {
    board.set(key, { 0: false, 1: false });
  }

  const newVal = board.get(key) || {};
  newVal[path] = true;
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
