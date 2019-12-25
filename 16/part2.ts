import { withTime } from "../utils";
import fs from "fs";

const getInput = (): number[] => {
  const input = fs.readFileSync(__dirname + "/input.txt");
  return input
    .toString()
    .repeat(10000)
    .split("")
    .map(Number);
};

const tests = [
  {
    input: "03036732577212944063491565474664"
      .repeat(10000)
      .split("")
      .map(Number),
    numPhases: 100,
    expected: "84462026"
  },
  {
    input: "02935109699940807407585447034323"
      .repeat(10000)
      .split("")
      .map(Number),
    numPhases: 100,
    expected: "78725270"
  },
  {
    input: "03081770884921959731165446850517"
      .repeat(10000)
      .split("")
      .map(Number),
    numPhases: 100,
    expected: "53553731"
  }
];
const basePattern = [0, 1, 0, -1];

withTime(main);
function main() {
  tests.forEach(({ input, numPhases, expected }) => {
    const offset = parseInt(input.slice(0, 7).join(""), 10);
    const answer = run(input, numPhases, offset);
    console.log({ answer, expected });
  });

  const input = getInput();
  const offset = parseInt(input.slice(0, 7).join(""), 10);
  const answer = run(input, 100, offset);
  console.log({ answer });
}

function run(input: number[], numPhases: number, offset: number): string {
  let curInput = [...input];
  let nextInput = new Array(input.length);
  // the code only works for input with offset which is after the 0.5 mark
  for (let phase = 0; phase < numPhases; phase++) {
    let sum = 0;
    for (let slot = nextInput.length - 1; slot >= 0; slot--) {
      sum = (sum + curInput[slot]) % 10;
      nextInput[slot] = sum;
    }
    curInput = nextInput;
  }

  return curInput.slice(offset, offset + 8).join("");
}

function calcPattern(digitIndex: number, basePattern: number[]): number[] {
  const pattern: number[] = [];
  basePattern.forEach(digit => {
    pattern.push(...new Array(digitIndex + 1).fill(digit));
  });

  return pattern;
}
