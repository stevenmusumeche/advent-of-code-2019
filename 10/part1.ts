import fs from "fs";
import { withTime } from "../utils";

interface Point {
  x: number;
  y: number;
}

const mapTests = [
  `.#..#
.....
#####
....#
...##`,

  `......#.#.
#..#.#....
..#######.
.#.#.###..
.#..#.....
..#....#.#
#..#....#.
.##.#..###
##...#..#.
.#....####`,

  `#.#...#.#.
.###....#.
.#....#...
##.#.#.#.#
....#.#.#.
.##..###.#
..#...##..
..##....##
......#...
.####.###.`,

  `.#..#..###
####.###.#
....###.#.
..###.##.#
##.##.#.#.
....###..#
..#.#..#.#
#..#.#.###
.##...##.#
.....#.#..`,

  `.#..##.###...#######
##.############..##.
.#.######.########.#
.###.#######.####.#.
#####.##.#.##.###.##
..#####..#.#########
####################
#.####....###.#.#.##
##.#################
#####.##.###..####..
..######..##.#######
####.##.####...##..#
.#####..#.######.###
##...#.##########...
#.##########.#######
.####.#.###.###.#.##
....##.##.###..#####
.#.#.###########.###
#.#.#.#####.####.###
###.##.####.##.#..##`,

  `.#..#..#..#...#..#...###....##.#....
.#.........#.#....#...........####.#
#..##.##.#....#...#.#....#..........
......###..#.#...............#.....#
......#......#....#..##....##.......
....................#..............#
..#....##...#.....#..#..........#..#
..#.#.....#..#..#..#.#....#.###.##.#
.........##.#..#.......#.........#..
.##..#..##....#.#...#.#.####.....#..
.##....#.#....#.......#......##....#
..#...#.#...##......#####..#......#.
##..#...#.....#...###..#..........#.
......##..#.##..#.....#.......##..#.
#..##..#..#.....#.#.####........#.#.
#......#..........###...#..#....##..
.......#...#....#.##.#..##......#...
.............##.......#.#.#..#...##.
..#..##...#...............#..#......
##....#...#.#....#..#.....##..##....
.#...##...........#..#..............
.............#....###...#.##....#.#.
#..#.#..#...#....#.....#............
....#.###....##....##...............
....#..........#..#..#.......#.#....
#..#....##.....#............#..#....
...##.............#...#.....#..###..
...#.......#........###.##..#..##.##
.#.##.#...##..#.#........#.....#....
#......#....#......#....###.#.....#.
......#.##......#...#.#.##.##...#...
..#...#.#........#....#...........#.
......#.##..#..#.....#......##..#...
..##.........#......#..##.#.#.......
.#....#..#....###..#....##..........
..............#....##...#.####...##.`
];

let winner: { x?: number; y?: number; numVisible?: number };

withTime(main);
function main() {
  mapTests.forEach(map => {
    winner = {};
    const asteroids = parseMap(map);

    asteroids.forEach(source => {
      const slopes = new Set<number>();
      asteroids.forEach(dest => {
        if (!(source.x === dest.x && source.y === dest.y)) {
          let angle =
            (Math.atan2(dest.x - source.x, dest.y - source.y) * 180) / Math.PI +
            90;
          if (angle < 0) angle += 360;
          slopes.add(angle);
        }
      });

      if (winner.numVisible === undefined || slopes.size > winner.numVisible) {
        winner = { x: source.x, y: source.y, numVisible: slopes.size };
      }
    });

    console.log("winner", winner);
  });
}

function anyPointHasAsteroid(pointsBetween: Point[], asteroids: Point[]) {
  return pointsBetween.some(point => {
    return asteroids.some(
      asteroid => asteroid.x === point.x && asteroid.y === point.y
    );
  });
}

function displayCurrent(origin: Point, dest: Point) {
  console.log("\n====================\n");
  console.log(origin, " -> ", dest);
  console.log();
}

function assert(actual: Point[], expected: Point[]) {
  actual.sort(sortCoords);
  expected.sort(sortCoords);

  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    console.log("❌");
    console.log("received", actual);
    console.log("expected", expected);
  } else {
    console.log("✅");
  }
}

function sortCoords(a: Point, b: Point) {
  return a.x > b.x ? 1 : -1;
}

function parseMap(map: string): Point[] {
  const asteroids: Point[] = [];
  const parsedMap = map.split("\n").map(line => line.split(""));
  for (let y = 0; y < parsedMap.length; y++) {
    for (let x = 0; x < parsedMap[y].length; x++) {
      if (parsedMap[y][x] === "#") {
        asteroids.push({ x, y });
      }
    }
  }

  return asteroids;
}
