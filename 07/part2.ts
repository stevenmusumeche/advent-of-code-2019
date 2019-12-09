import { withTime } from "../utils";
import fs from "fs";

const getInput = (): string[] => {
  const input = fs.readFileSync(__dirname + "/input.txt");
  return input.toString().split(",");
};

const testCases = [
  {
    input: [
      3,
      26,
      1001,
      26,
      -4,
      26,
      3,
      27,
      1002,
      27,
      2,
      27,
      1,
      27,
      26,
      27,
      4,
      27,
      1001,
      28,
      -1,
      28,
      1005,
      28,
      6,
      99,
      0,
      0,
      5
    ].map(String),
    expectedThrust: 139629729,
    expectedPhase: [9, 8, 7, 6, 5].map(String)
  },
  {
    input: [
      3,
      52,
      1001,
      52,
      -5,
      52,
      3,
      53,
      1,
      52,
      56,
      54,
      1007,
      54,
      5,
      55,
      1005,
      55,
      26,
      1001,
      54,
      -5,
      54,
      1105,
      1,
      12,
      1,
      53,
      54,
      53,
      1008,
      54,
      0,
      55,
      1001,
      55,
      1,
      55,
      2,
      53,
      55,
      53,
      4,
      53,
      1001,
      56,
      -1,
      56,
      1005,
      56,
      6,
      99,
      0,
      0,
      0,
      0,
      10
    ].map(String),
    expectedThrust: 18216,
    expectedPhase: [9, 7, 8, 5, 6].map(String)
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
  let memories = [
    { memory: { ...programInput }, ip: 0, initialized: false },
    { memory: { ...programInput }, ip: 0, initialized: false },
    { memory: { ...programInput }, ip: 0, initialized: false },
    { memory: { ...programInput }, ip: 0, initialized: false },
    { memory: { ...programInput }, ip: 0, initialized: false }
  ];
  inputs = ["0"]; // initialize with 0 output
  const phases = perm.split("");
  let curAmp = 0;

  while (true) {
    const cur = memories[curAmp];
    if (!cur.initialized) {
      inputs.unshift(phases[curAmp]);
      cur.initialized = true;
    }
    const result = run(cur.memory, cur.ip);
    if (result.done) {
      break;
    } else {
      memories[curAmp] = { ...memories[curAmp], ...result };
      curAmp = curAmp === 4 ? 0 : curAmp + 1;
    }
  }

  if (!inputs.length) throw new Error("invariant");
  return inputs[0];

  // phases.forEach((phase, i) => {
  //   // add the output from the previous run as the input to this run
  //   inputs.unshift(phase);
  //   run(programInput);
  // });

  // if (!inputs.length) throw new Error("invariant");
  // return inputs[0];
}

interface RunResult {
  memory: string[];
  ip: number;
  done: boolean;
}

function run(memory: string[], ip = 0): RunResult {
  const { opCode, modes, instruction } = parseInstruction(memory[ip]);

  if (opCode === "99") {
    return { done: true, ip, memory };
  }

  let destIndex, aVal, bVal, output, comparator;

  //console.log({ pt: instructionPointer, instruction, opCode, modes });

  switch (opCode) {
    // addition
    case "01":
    // multiplication
    case "02":
      destIndex = modes[2] === POSITION_MODE ? Number(memory[ip + 3]) : ip + 3;
      aVal = Number(
        modes[0] === POSITION_MODE
          ? memory[Number(memory[ip + 1])]
          : memory[Number(ip + 1)]
      );
      bVal = Number(
        modes[1] === POSITION_MODE
          ? memory[Number(memory[ip + 2])]
          : memory[Number(ip + 2)]
      );
      if (opCode === "01") {
        memory[destIndex] = String(aVal + bVal);
      } else {
        memory[destIndex] = String(aVal * bVal);
      }
      ip += 4;
      break;
    // input
    case "03":
      destIndex = Number(memory[ip + 1]);
      const input = inputs.shift();

      if (!input) throw Error("invariant");
      memory[destIndex] = input;

      ip += 2;
      break;
    // output
    case "04":
      if (modes[0] === POSITION_MODE) {
        output = Number(memory[Number(memory[ip + 1])]);
      } else {
        output = Number(memory[ip + 1]);
      }

      inputs.push(String(output));

      ip += 2;
      return { done: false, ip, memory };
    // jump-if-true
    case "05":
    // jump-if-false
    case "06":
      aVal = Number(
        modes[0] === POSITION_MODE
          ? memory[Number(memory[ip + 1])]
          : memory[Number(ip + 1)]
      );
      bVal = Number(
        modes[1] === POSITION_MODE
          ? memory[Number(memory[ip + 2])]
          : memory[Number(ip + 2)]
      );

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
      aVal = Number(
        modes[0] === POSITION_MODE
          ? memory[Number(memory[ip + 1])]
          : memory[Number(ip + 1)]
      );
      bVal = Number(
        modes[1] === POSITION_MODE
          ? memory[Number(memory[ip + 2])]
          : memory[Number(ip + 2)]
      );
      const cPosition =
        modes[2] === POSITION_MODE ? Number(memory[ip + 3]) : Number(ip + 3);

      comparator =
        opCode === "07"
          ? (a: number, b: number) => a < b
          : (a: any, b: any) => a === b;

      memory[cPosition] = comparator(aVal, bVal) ? "1" : "0";
      ip += 4;

      break;
    default:
      throw new Error(`Unknown OP Code ${opCode} at position ${ip}`);
  }

  return run(memory, ip);
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

function getPermutations(string = "56789"): string[] {
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
