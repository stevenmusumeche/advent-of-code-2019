import { withTime } from "../utils";
import fs from "fs";

const getInput = (): number[] => {
  const input = fs.readFileSync(__dirname + "/input.txt");
  return input
    .toString()
    .split("")
    .map(Number);
};

const tests = [
  {
    input: "12345678".split("").map(Number),
    numPhases: 4,
    expected: "01029498"
  },
  {
    input: "80871224585914546619083218645595".split("").map(Number),
    numPhases: 100,
    expected: "24176176"
  },
  {
    input: "69317163492948606335995924319873".split("").map(Number),
    numPhases: 100,
    expected: "52432133"
  }
];
const basePattern = [0, 1, 0, -1];

withTime(main);
function main() {
  tests.forEach(({ input, numPhases, expected }) => {
    const answer = run(input, numPhases);
    console.log({ answer, expected });
  });

  const answer = run(getInput(), 100);
  console.log({ answer });
}

function run(input: number[], numPhases: number): string {
  let curInput = [...input];
  for (let phase = 0; phase < numPhases; phase++) {
    let nextInput = [];
    for (let slot = 0; slot < curInput.length; slot++) {
      let pattern = calcPattern(slot, basePattern);
      let curSum = 0;
      for (let i = 0; i < curInput.length; i++) {
        const pI = (i + 1) % pattern.length;
        const patternMult = pattern[pI];
        curSum += curInput[i] * patternMult;
      }
      const onesDigit = Math.abs(curSum % 10);
      nextInput.push(onesDigit);
    }
    curInput = nextInput;
  }
  const answer = curInput.slice(0, 8);
  return answer.join("");
}

function calcPattern(digitIndex: number, basePattern: number[]): number[] {
  const pattern: number[] = [];
  basePattern.forEach(digit => {
    pattern.push(...new Array(digitIndex + 1).fill(digit));
  });

  return pattern;
}
