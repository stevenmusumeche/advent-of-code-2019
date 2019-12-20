import { withTime } from "../utils";
import { run, setInput, setOutputHandler } from "../util/intcode-computer";
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
  }
  // { input: [1102, 34915192, 34915192, 7, 4, 7, 99, 0].map(String) },
  // { input: [104, 1125899906842624, 99].map(String) }
];

withTime(main);
function main() {
  // testCases.forEach(({ input }) => {
  //   setInput("2");
  //   setOutputHandler(output => {
  //     console.log(output);
  //   });
  //   const memory = run(input, 0, 0);
  //   //console.log(memory);
  // });

  const input = getInput();
  setInput("2");
  setOutputHandler(output => {
    console.log(output);
  });
  const memory = run(input, 0, 0);
}
