import { withTime } from "../utils";
import fs from "fs";

const getInput = (): string[] => {
  const input = fs.readFileSync(__dirname + "/input.txt");
  return input.toString().split(",");
};

enum Color {
  BLACK = 0,
  WHITE = 1
}

enum Direction {
  UP = 0,
  RIGHT = 1,
  DOWN = 2,
  LEFT = 3
}

enum DirInstruction {
  LEFT = 0,
  RIGHT = 1
}

interface GridPiece {
  color: Color;
  numPaints: number;
}

interface Point {
  x: number;
  y: number;
}

type Grid = Map<string, GridPiece>;

const POSITION_MODE = "0";
const IMMEDIATE_MODE = "1";
const RELATIVE_MODE = "2";

let input: string = String(Color.BLACK);
let outputQueue: number[] = [];
let location: Point = { x: 0, y: 0 };
let curDirection = Direction.UP;
let grid: Grid = new Map();

withTime(main);
function main() {
  const input = getInput();
  const memory = run(input, 0, 0);

  console.log("=====");
  console.log(grid.size);
  console.log("=====");
}

function processOutput(output: number) {
  outputQueue.push(output);

  // wait for both instructions
  if (outputQueue.length < 2) return;

  // remove the current instructions from the queue
  const [color, direction] = outputQueue.splice(0, 2);

  // paint current location and increment it's visit count
  const curGridPice = getCurrentPos(location);
  grid.set(key(location), {
    ...curGridPice,
    color,
    numPaints: curGridPice.numPaints + 1
  });

  // change direction and move to a new location
  const { xAdjustment, yAdjustment, newDirection } = getMovers(direction);
  const newLocation = {
    x: location.x + xAdjustment,
    y: location.y + yAdjustment
  };
  location = newLocation;
  curDirection = newDirection;

  // pass the new position's color as input
  input = String(getCurrentPos(location).color);
}

function getMovers(directionToMove: DirInstruction) {
  if (curDirection === Direction.UP) {
    if (directionToMove === DirInstruction.LEFT) {
      return { xAdjustment: -1, yAdjustment: 0, newDirection: Direction.LEFT };
    } else {
      return { xAdjustment: 1, yAdjustment: 0, newDirection: Direction.RIGHT };
    }
  } else if (curDirection === Direction.RIGHT) {
    if (directionToMove === DirInstruction.LEFT) {
      return { xAdjustment: 0, yAdjustment: -1, newDirection: Direction.UP };
    } else {
      return { xAdjustment: 0, yAdjustment: 1, newDirection: Direction.DOWN };
    }
  } else if (curDirection === Direction.DOWN) {
    if (directionToMove === DirInstruction.LEFT) {
      return { xAdjustment: 1, yAdjustment: 0, newDirection: Direction.RIGHT };
    } else {
      return { xAdjustment: -1, yAdjustment: 0, newDirection: Direction.LEFT };
    }
  } else if (curDirection === Direction.LEFT) {
    if (directionToMove === DirInstruction.LEFT) {
      return { xAdjustment: 0, yAdjustment: 1, newDirection: Direction.DOWN };
    } else {
      return { xAdjustment: 0, yAdjustment: -1, newDirection: Direction.UP };
    }
  }

  throw new Error("invariant");
}

function getCurrentPos(location: Point): GridPiece {
  if (grid.has(key(location))) {
    return grid.get(key(location))!;
  }

  return { color: Color.BLACK, numPaints: 0 };
}

function key(location: Point) {
  return `${location.x},${location.y}`;
}

function run(memory: string[], ip: number, rb: number): string[] {
  while (true) {
    const { opCode, modes, instruction } = parseInstruction(memory[ip]);

    if (opCode === "99") {
      process.stdout.write("\n");
      break;
    }

    let destIndex, aVal, bVal, output, comparator;

    switch (opCode) {
      // addition
      case "01":
      // multiplication
      case "02":
        destIndex = getIndex(modes[2], memory, ip + 3, rb);
        aVal = getParameterValue(modes[0], memory, ip + 1, rb);
        bVal = getParameterValue(modes[1], memory, ip + 2, rb);
        if (opCode === "01") {
          memory[destIndex] = String(aVal + bVal);
        } else {
          memory[destIndex] = String(aVal * bVal);
        }
        ip += 4;
        break;
      // input
      case "03":
        destIndex = getIndex(modes[0], memory, ip + 1, rb);
        memory[destIndex] = input;
        ip += 2;
        break;
      // output
      case "04":
        output = getParameterValue(modes[0], memory, ip + 1, rb);
        processOutput(output);
        ip += 2;
        break;
      // jump-if-true
      case "05":
      // jump-if-false
      case "06":
        aVal = getParameterValue(modes[0], memory, ip + 1, rb);
        bVal = getParameterValue(modes[1], memory, ip + 2, rb);
        comparator =
          opCode === "05" ? (x: number) => x !== 0 : (x: number) => x === 0;
        if (comparator(aVal)) {
          ip = bVal;
        } else {
          ip += 3;
        }

        break;
      // less than
      case "07":
      // equals
      case "08":
        aVal = getParameterValue(modes[0], memory, ip + 1, rb);
        bVal = getParameterValue(modes[1], memory, ip + 2, rb);
        const cPosition = getIndex(modes[2], memory, ip + 3, rb);

        comparator =
          opCode === "07"
            ? (a: number, b: number) => a < b
            : (a: any, b: any) => a === b;

        memory[cPosition] = comparator(aVal, bVal) ? "1" : "0";
        ip += 4;

        break;
      // adjust the relative base
      case "09":
        aVal = getParameterValue(modes[0], memory, ip + 1, rb);
        rb += aVal;
        ip += 2;
        break;
      default:
        throw new Error(`Unknown OP Code ${opCode} at position ${ip}`);
    }
  }

  return memory;
}

interface Instruction {
  instruction: string;
  opCode: string;
  modes: [string, string, string];
}
function parseInstruction(instruction: string): Instruction {
  if (instruction.length < 2) instruction = instruction.padStart(2, "0");
  const opCode = instruction.substr(instruction.length - 2, 2);

  const modes = instruction
    .substring(0, instruction.length - 2)
    .padStart(3, "0")
    .split("");

  return {
    instruction,
    opCode,
    modes: [modes[2], modes[1], modes[0]]
  };
}

function getIndex(mode: string, memory: string[], ip: number, rb: number) {
  if (mode === POSITION_MODE) {
    if (memory[ip] === undefined) {
      memory[ip] = "0";
    }
    return Number(memory[ip]);
  } else if (mode === IMMEDIATE_MODE) {
    return ip;
  } else if (mode === RELATIVE_MODE) {
    return Number(memory[ip]) + rb;
  }
  throw new Error("invariant");
}

function getParameterValue(
  mode: string,
  memory: string[],
  ip: number,
  rb: number
): number {
  const index = getIndex(mode, memory, ip, rb);
  if (memory[index] === undefined) {
    memory[index] = "0";
  }
  return Number(memory[index]);
}
