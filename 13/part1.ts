import fs from "fs";
import { run, setOutputHandler } from "../util/intcode-computer";
import { withTime } from "../utils";

const outputBuffer: number[] = [];
const screen = new Map<string, Tile>();

enum Tile {
  EMPTY = 0,
  WALL = 1,
  BLOCK = 2,
  PADDLE = 3,
  BALL = 4
}

withTime(main);
function main() {
  const program = getInput();
  setOutputHandler(handleOutput);
  run(program, 0, 0);

  const numBlocks = Array.from(screen.values()).reduce((acc, cur) => {
    if (cur === Tile.BLOCK) acc++;
    return acc;
  }, 0);

  console.log({ numBlocks });
}

function handleOutput(output: number) {
  outputBuffer.push(output);
  if (outputBuffer.length < 3) {
    return;
  }

  const [x, y, tileId] = outputBuffer.splice(0, 3);

  screen.set(key(x, y), tileId);
}

function getInput(): string[] {
  const input = fs.readFileSync(__dirname + "/input.txt");
  return input.toString().split(",");
}

function key(x: number, y: number): string {
  return `${x},${y}`;
}
