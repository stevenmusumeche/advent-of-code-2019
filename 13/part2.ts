import fs from "fs";
import {
  run,
  setOutputHandler,
  setOnInput,
  setInput
} from "../util/intcode-computer";
import { withTime } from "../utils";

const outputBuffer: number[] = [];
type Screen = Map<string, Tile>;
const screen: Screen = new Map();

enum Tile {
  EMPTY = 0,
  WALL = 1,
  BLOCK = 2,
  PADDLE = 3,
  BALL = 4
}
const validTiles = Object.values(Tile).filter((x: any) => !isNaN(x));

withTime(main);
function main() {
  const program = getInput();
  program[0] = "2";
  setOutputHandler(handleOutput);
  setOnInput(onInput);
  run(program, 0, 0);
}

type Point = { x: number; y: number };
function onInput() {
  const { minX, minY, maxX, maxY } = getGridSizes(screen);
  let paddlePos: Point;
  let ballPos: Point;

  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      const tile = screen.get(key(x, y));
      if (!tile) {
        //process.stdout.write("░░");
      } else {
        let char = "  ";
        switch (tile) {
          case Tile.WALL:
            char = "██";
            break;
          case Tile.BLOCK:
            char = "▒▒";
            break;
          case Tile.PADDLE:
            paddlePos = { x, y };
            char = "██";
            break;
          case Tile.BALL:
            ballPos = { x, y };
            char = "  ";
            break;
        }
        //process.stdout.write(char);
      }
    }
    //process.stdout.write("\n");
  }

  // console.log({ paddlePos: paddlePos!, ballPos: ballPos! });
  if (paddlePos!.x > ballPos!.x) {
    setInput("-1");
  } else if (paddlePos!.x < ballPos!.x) {
    setInput("1");
  } else {
    setInput("0");
  }
}

function handleOutput(output: number) {
  outputBuffer.push(output);
  if (outputBuffer.length < 3) {
    return;
  }

  const [x, y, tileId] = outputBuffer.splice(0, 3);
  if (isScore(x, y, tileId)) {
    console.log("SCORE", tileId);
  } else {
    screen.set(key(x, y), tileId);
  }
}

function getGridSizes(screen: Screen) {
  return [...screen.keys()].reduce(
    (acc, cur) => {
      const [x, y] = cur.split(",").map(Number);
      if (x > acc.maxX) return { ...acc, maxX: x };
      if (x < acc.minX) return { ...acc, minX: x };
      if (y > acc.maxY) return { ...acc, maxY: y };
      if (y < acc.minY) return { ...acc, minY: y };
      return acc;
    },
    {
      minX: Number.MAX_SAFE_INTEGER,
      minY: Number.MAX_SAFE_INTEGER,
      maxX: Number.MIN_SAFE_INTEGER,
      maxY: Number.MIN_SAFE_INTEGER
    }
  );
}

function isScore(x: number, y: number, tileId: any) {
  return x === -1 && y === 0 && !validTiles.includes(tileId);
}

function getInput(): string[] {
  const input = fs.readFileSync(__dirname + "/input.txt");
  return input.toString().split(",");
}

function key(x: number, y: number): string {
  return `${x},${y}`;
}
