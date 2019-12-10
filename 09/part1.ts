import { withTime } from "../utils";
import fs from "fs";

const getInput = (): string[] => {
  const input = fs.readFileSync(__dirname + "/input.txt");
  return input.toString().split(",");
};

const testCases = [
  // { input: ["1002", "4", "3", "4", "33"] },
  // { input: ["0003", "4", "99", "4", "33"] },
  // { input: ["0103", "4", "99", "4", "33"] },
  // { input: ["0004", "50"] },
  // { input: ["1101", "100", "-1", "4", "0"] },
  {
    input: [
      109,
      1,
      204,
      -1,
      1001,
      100,
      1,
      100,
      1008,
      100,
      16,
      101,
      1006,
      101,
      0,
      99
    ].map(String)
  },
  { input: [1102, 34915192, 34915192, 7, 4, 7, 99, 0].map(String) },
  { input: [104, 1125899906842624, 99].map(String) }
];

const POSITION_MODE = "0";
const IMMEDIATE_MODE = "1";
const RELATIVE_MODE = "2";

const input = "1";

withTime(main);
function main() {
  // testCases.forEach(({ input }) => {
  //   const memory = run(input, 0, 0);
  //   //console.log(memory);
  // });

  const input = getInput();
  const memory = run(input, 0, 0);
}

function run(memory: string[], ip: number, rb: number): string[] {
  const { opCode, modes, instruction } = parseInstruction(memory[ip]);

  if (opCode === "99") {
    process.stdout.write("\n");
    return memory;
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
      process.stdout.write(`${output} `);
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

  return run(memory, ip, rb);
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
