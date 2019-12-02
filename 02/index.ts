import { inspect } from "util";
import fs from "fs";
import { isEqual } from "lodash";

let program: number[] = [];

const testInputs = [
  {
    input: [1, 9, 10, 3, 2, 3, 11, 0, 99, 30, 40, 50],
    expected: [3500, 9, 10, 70, 2, 3, 11, 0, 99, 30, 40, 50]
  },
  { input: [1, 0, 0, 0, 99], expected: [2, 0, 0, 0, 99] },
  { input: [2, 3, 0, 3, 99], expected: [2, 3, 0, 6, 99] },
  { input: [2, 4, 4, 5, 99, 0], expected: [2, 4, 4, 5, 99, 9801] },
  {
    input: [1, 1, 1, 4, 99, 5, 6, 0, 99],
    expected: [30, 1, 1, 4, 2, 5, 6, 0, 99]
  }
];

const runTests = () => {
  testInputs.forEach(({ input, expected }, i) => {
    program = input;
    run();
    if (isEqual(expected, program)) {
      console.log(`✅ Test ${i + 1}`);
    } else {
      console.log(`❌ Test ${i + 1}`);
      console.log("Expected", expected);
      console.log("Actual  ", program);
    }
  });
};

const run = (position = 0) => {
  const opCode = program[position];
  if (opCode === 99) return;

  const aIndex = program[position + 1];
  const bIndex = program[position + 2];
  const aVal = program[aIndex];
  const bVal = program[bIndex];
  const destIndex = program[position + 3];

  switch (opCode) {
    case 1:
      program[destIndex] = aVal + bVal;
      break;
    case 2:
      program[destIndex] = aVal * bVal;
      break;
    default:
      throw new Error(`Unknown OP Code ${opCode} at position ${position}`);
  }

  position += 4;
  run(position);
};

const getRealInput = (): number[] => {
  const input = fs.readFileSync(__dirname + "/input.txt");
  let cleaned = input
    .toString()
    .split(",")
    .map(Number);
  cleaned[1] = 12;
  cleaned[2] = 2;

  return cleaned;
};

(async function main() {
  runTests();

  program = getRealInput();
  run();

  // console.log(
  //   inspect(program, { maxArrayLength: null, depth: null, colors: true })
  // );
  console.log("Answer", program[0]);
})();
