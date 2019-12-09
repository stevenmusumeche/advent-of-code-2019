import { withTime } from "../utils";
import fs from "fs";

const getInput = (): string[] => {
  const input = fs.readFileSync(__dirname + "/input.txt");
  return input.toString().split(",");
};

const testCases = [
  {
    input: [3, 15, 3, 16, 1002, 16, 10, 16, 1, 16, 15, 15, 4, 15, 99, 0, 0].map(
      String
    ),
    expectedThrust: 43210,
    expectedPhase: [4, 3, 2, 1, 0].map(String)
  },
  {
    input: [
      3,
      23,
      3,
      24,
      1002,
      24,
      10,
      24,
      1002,
      23,
      -1,
      23,
      101,
      5,
      23,
      23,
      1,
      24,
      23,
      23,
      4,
      23,
      99,
      0,
      0
    ].map(String),
    expectedThrust: 54321,
    expectedPhase: [0, 1, 2, 3, 4].map(String)
  },
  {
    input: [
      3,
      31,
      3,
      32,
      1002,
      32,
      10,
      32,
      1001,
      31,
      -2,
      31,
      1007,
      31,
      0,
      33,
      1002,
      33,
      7,
      33,
      1,
      33,
      31,
      31,
      1,
      32,
      31,
      31,
      4,
      31,
      99,
      0,
      0,
      0
    ].map(String),
    expectedThrust: 65210,
    expectedPhase: [1, 0, 4, 3, 2].map(String)
  }
];

const POSITION_MODE = "0";
const IMMEDIATE_MODE = "1";

let inputs: string[];

withTime(main);
function main() {
  const perms = getPermutations();

  // testCases.forEach(({ input, expectedPhase, expectedThrust }) => {
  //   const programInput = input;
  //   let max = { perm: "", thrust: 0 };
  //   perms.forEach(perm => {
  //     const output = runPermutation(programInput, perm);
  //     if (Number(output) > max.thrust) {
  //       max = { perm, thrust: Number(output) };
  //     }
  //   });

  //   console.log(
  //     `Expected ${max.thrust} to be ${expectedThrust} and ${
  //       max.perm
  //     } to be ${expectedPhase.join("")}`
  //   );
  // });

  const programInput = getInput();
  let max = { perm: "", thrust: 0 };
  perms.forEach(perm => {
    const output = runPermutation(programInput, perm);
    if (Number(output) > max.thrust) {
      max = { perm, thrust: Number(output) };
    }
  });

  console.log(max);
}

function runPermutation(programInput: string[], perm: string): string {
  inputs = ["0"]; // initialize with 0 output
  const phases = perm.split("");
  phases.forEach(phase => {
    // add the output from the previous run as the input to this run
    inputs.unshift(phase);
    run(programInput);
  });

  if (!inputs.length) throw new Error("invariant");
  return inputs[0];
}

function getPermutations(string = "01234"): string[] {
  const results = [];

  if (string.length === 1) {
    results.push(string);
    return results;
  }

  for (var i = 0; i < string.length; i++) {
    var firstChar = string[i];
    var charsLeft = string.substring(0, i) + string.substring(i + 1);
    var innerPermutations = getPermutations(charsLeft);
    for (var j = 0; j < innerPermutations.length; j++) {
      results.push(firstChar + innerPermutations[j]);
    }
  }
  return results;
}

function run(memory: string[], instructionPointer = 0): string[] {
  const { opCode, modes, instruction } = parseInstruction(
    memory[instructionPointer]
  );

  if (opCode === "99") {
    // console.log("HALTED 99");
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
      const input = inputs.shift();

      if (!input) throw Error("invariant");
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

      inputs.push(String(output));

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
