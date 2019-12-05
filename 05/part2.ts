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
  { input: ["3", "0", "4", "0", "99"] }
];

const POSITION_MODE = "0";
const IMMEDIATE_MODE = "1";

const input = "5";

withTime(main);
function main() {
  // testCases.forEach(({ input }) => {
  //   const memory = run(input, 0);
  //   console.log(memory);
  // });

  const input = getInput();
  const memory = run(input, 0);
}

function run(memory: string[], instructionPointer = 0): string[] {
  //if (instructionPointer >= memory.length) return memory;
  const { opCode, modes, instruction } = parseInstruction(
    memory[instructionPointer]
  );

  if (opCode === "99") {
    console.log("HALTED 99");
    return memory;
  }

  let destIndex, aVal, bVal, output, comparator;

  //console.log({ pt: instructionPointer, instruction, opCode, modes });

  switch (opCode) {
    // addition
    case "01":
    // multiplication
    case "02":
      destIndex =
        modes[2] === POSITION_MODE
          ? Number(memory[instructionPointer + 3])
          : instructionPointer + 3;
      aVal = Number(
        modes[0] === POSITION_MODE
          ? memory[Number(memory[instructionPointer + 1])]
          : memory[Number(instructionPointer + 1)]
      );
      bVal = Number(
        modes[1] === POSITION_MODE
          ? memory[Number(memory[instructionPointer + 2])]
          : memory[Number(instructionPointer + 2)]
      );
      if (opCode === "01") {
        memory[destIndex] = String(aVal + bVal);
      } else {
        memory[destIndex] = String(aVal * bVal);
      }
      instructionPointer += 4;
      break;
    // input
    case "03":
      destIndex = Number(memory[instructionPointer + 1]);
      memory[destIndex] = input;

      instructionPointer += 2;
      break;
    // output
    case "04":
      if (modes[0] === POSITION_MODE) {
        output = Number(memory[Number(memory[instructionPointer + 1])]);
      } else {
        output = Number(memory[instructionPointer + 1]);
      }

      console.log({ output });

      instructionPointer += 2;
      break;
    // jump-if-true
    case "05":
    // jump-if-false
    case "06":
      aVal = Number(
        modes[0] === POSITION_MODE
          ? memory[Number(memory[instructionPointer + 1])]
          : memory[Number(instructionPointer + 1)]
      );
      bVal = Number(
        modes[1] === POSITION_MODE
          ? memory[Number(memory[instructionPointer + 2])]
          : memory[Number(instructionPointer + 2)]
      );

      comparator =
        opCode === "05" ? (x: number) => x !== 0 : (x: number) => x === 0;
      if (comparator(aVal)) {
        instructionPointer = bVal;
      } else {
        instructionPointer += 3;
      }

      break;
    // less than
    case "07":
    // equals
    case "08":
      aVal = Number(
        modes[0] === POSITION_MODE
          ? memory[Number(memory[instructionPointer + 1])]
          : memory[Number(instructionPointer + 1)]
      );
      bVal = Number(
        modes[1] === POSITION_MODE
          ? memory[Number(memory[instructionPointer + 2])]
          : memory[Number(instructionPointer + 2)]
      );
      const cPosition =
        modes[2] === POSITION_MODE
          ? Number(memory[instructionPointer + 3])
          : Number(instructionPointer + 3);

      comparator =
        opCode === "07"
          ? (a: number, b: number) => a < b
          : (a: any, b: any) => a === b;

      memory[cPosition] = comparator(aVal, bVal) ? "1" : "0";
      instructionPointer += 4;

      break;
    default:
      throw new Error(
        `Unknown OP Code ${opCode} at position ${instructionPointer}`
      );
  }

  return run(memory, instructionPointer);
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
