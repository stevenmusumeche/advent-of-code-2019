import { withTime } from "../utils";
import { run } from "../util/intcode-computer";
import fs from "fs";

const getInput = (): string[] => {
  const input = fs.readFileSync(__dirname + "/input.txt");
  return input.toString().split(",");
};

enum MovementCommand {
  NORTH = 1,
  SOUTH = 2,
  WEST = 3,
  EAST = 4
}

enum Status {
  WALL = 0,
  MOVED = 1,
  FOUND = 2
}

withTime(main);
function main() {
  // init the generator
  const memory = getInput();
  const gen = run(memory, 0, 0);
  console.log("[controller] starting generator");
  gen.next();
  let foo = 0;
  while (true && foo < 5) {
    foo++;
    // provide input
    const nextDirection = MovementCommand.SOUTH;
    console.log("[controller] providing input", nextDirection);
    const { value } = gen.next(nextDirection);
    console.log("[controller] got output", value);

    // continue
    const { done } = gen.next();
    if (done) break;
  }
}
