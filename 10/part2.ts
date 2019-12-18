import { withTime } from "../utils";

interface Point {
  x: number;
  y: number;
}

const mapTests = [
  //   `.#....#####...#..
  // ##...##.#####..##
  // ##...#...#.#####.
  // ..#.....#...###..
  // ..#.#.....#....##`

  //   `#.#...#.#.
  // .###....#.
  // .#....#...
  // ##.#.#.#.#
  // ....#.#.#.
  // .##..###.#
  // ..#...##..
  // ..##....##
  // ......#...
  // .####.###.`

  //   `.#..##.###...#######
  // ##.############..##.
  // .#.######.########.#
  // .###.#######.####.#.
  // #####.##.#.##.###.##
  // ..#####..#.#########
  // ####################
  // #.####....###.#.#.##
  // ##.#################
  // #####.##.###..####..
  // ..######..##.#######
  // ####.##.####...##..#
  // .#####..#.######.###
  // ##...#.##########...
  // #.##########.#######
  // .####.#.###.###.#.##
  // ....##.##.###..#####
  // .#.#.###########.###
  // #.#.#.#####.####.###
  // ###.##.####.##.#..##`,

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
    const asteroids = parseMap(map);
    const winner = findBestStation(asteroids);
    const zappedAt200 = zapAsteroids(winner, asteroids, 200);
    console.log(zappedAt200.x * 100 + zappedAt200.y);
  });
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

function zapAsteroids(from: Winner, asteroids: Point[], limit: number): Point {
  let remaining = [...asteroids];

  const slopes = [...getUniqueSlopes(from, remaining)]
    // sort by slope value
    .sort((a, b) => a[0] - b[0])
    // sort asteroids by euclidean distance to source
    .map(slope => {
      slope[1].sort((a, b) => {
        return a.distance - b.distance;
      });
      return slope;
    });
  //console.dir(slopes, { depth: 3 });

  let currentZap = 0;
  let cur;
  while (slopes.length && currentZap < limit) {
    let slope = slopes.shift();
    if (slope) {
      currentZap++;
      const [angle, contenders] = slope;
      const [toBeRemoved, ...rest] = contenders;
      cur = toBeRemoved;

      // remove from main asteroid listing
      remaining = remaining.filter(
        point => !(point.x === toBeRemoved.x && point.y === toBeRemoved.y)
      );

      // if this slope had more asteroids, add the slope with the remaining asteroids back to the queue
      if (rest.length) {
        slopes.push([angle, rest]);
      }
    }
  }
  return cur as Point;
}

interface Winner {
  x: number;
  y: number;
  numVisible: number;
  slopes: Map<number, Point[]>;
}
function findBestStation(asteroids: Point[]): Winner {
  let winner: Winner = {} as any;

  asteroids.forEach(source => {
    const slopes = getUniqueSlopes(source, asteroids);

    if (winner.numVisible === undefined || slopes.size > winner.numVisible) {
      winner = { x: source.x, y: source.y, numVisible: slopes.size, slopes };
    }
  });

  return winner;
}

interface PointWithDistance extends Point {
  distance: number;
}
function getUniqueSlopes(
  from: Point,
  asteroids: Point[]
): Map<number, PointWithDistance[]> {
  const slopes = new Map<number, PointWithDistance[]>();
  asteroids
    .filter(dest => !pointsEqual(from, dest))
    .forEach(dest => {
      let angle = getSlope(from, dest);
      if (!slopes.get(angle)) {
        slopes.set(angle, []);
      }
      slopes
        .get(angle)
        ?.push({ ...dest, distance: calcEuclideanDistance(from, dest) });
    });

  return slopes;
}

function getSlope(source: Point, dest: Point): number {
  let radian = Math.atan2(dest.y - source.y, dest.x - source.x);
  return mod((radian * 180) / Math.PI + 90, 360);
}

function mod(a: number, b: number) {
  return a - Math.floor(a / b) * b;
}

function pointsEqual(source: Point, dest: Point) {
  return source.x === dest.x && source.y === dest.y;
}

function calcEuclideanDistance(a: Point, b: Point): number {
  return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
}
