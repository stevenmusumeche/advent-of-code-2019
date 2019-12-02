import { inspect } from "util";
import fs from "fs";

const getInput = (): number[] => {
  const input = fs.readFileSync(__dirname + "/input.txt");
  return input
    .toString()
    .split(",")
    .map(Number);
};

const TARGET = 19690720;
let orig: number[] = getInput();

const run = (memory: number[], instructionPointer = 0): number[] => {
  const opCode = memory[instructionPointer];
  if (opCode === 99) return memory;

  const aIndex = memory[instructionPointer + 1];
  const bIndex = memory[instructionPointer + 2];
  const destIndex = memory[instructionPointer + 3];

  const aVal = memory[aIndex];
  const bVal = memory[bIndex];

  switch (opCode) {
    case 1:
      memory[destIndex] = aVal + bVal;
      break;
    case 2:
      memory[destIndex] = aVal * bVal;
      break;
    default:
      throw new Error(
        `Unknown OP Code ${opCode} at position ${instructionPointer}`
      );
  }

  instructionPointer += 4;
  return run(memory, instructionPointer);
};

const getOutput = (noun: number, verb: number) => {
  let memory = [...orig];
  memory[1] = noun;
  memory[2] = verb;

  memory = run(memory);
  return memory[0];
};

(function main() {
  for (let noun = 0; noun <= 99; noun++) {
    for (let verb = 0; verb <= 99; verb++) {
      const output = getOutput(noun, verb);
      if (output === TARGET) {
        const answer = 100 * noun + verb;
        console.log({ answer });
      }
    }
  }
})();
