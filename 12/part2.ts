import { withTime } from "../utils";
import { cloneDeep } from "lodash";

interface Point {
  x: number;
  y: number;
  z: number;
  [foo: string]: number;
}

interface Moon {
  position: Point;
  velocity: Point;
}

// const testInput = `<x=-1, y=0, z=2>
// <x=2, y=-10, z=-7>
// <x=4, y=-8, z=8>
// <x=3, y=5, z=-1>`;
const testInput = `<x=-8, y=-10, z=0>
<x=5, y=5, z=10>
<x=2, y=-7, z=3>
<x=9, y=-8, z=-3>`;

const input = `<x=1, y=3, z=-11>
<x=17, y=-10, z=-8>
<x=-1, y=-15, z=2>
<x=12, y=-4, z=-4>`;

const numMoons = 4;

withTime(main);
function main() {
  const combos = getIndexCombos(numMoons);
  let moons = parseInput(input);
  const origMoons = cloneDeep(moons);

  let step = 0;
  let cycleLens = { x: 0, y: 0, z: 0 } as any;
  while (cycleLens.x === 0 || cycleLens.y === 0 || cycleLens.z === 0) {
    combos.forEach(([i, j]) => {
      ["x", "y", "z"].forEach(field => {
        mutateVelocity(moons, i, j, field as any);
      });
    });
    moons = applyVelocity(moons);

    ["x", "y", "z"].forEach((field: string) => {
      const matches = moons.every((moon, i) => {
        return (
          moon.position[field] === origMoons[i].position[field] &&
          moon.velocity[field] === origMoons[i].velocity[field]
        );
      });

      if (matches && !cycleLens[field]) {
        cycleLens[field] = step + 1;
      }
    });

    step++;
  }

  console.log(cycleLens);
  console.log(leastCommonMultiple([cycleLens.x, cycleLens.y, cycleLens.z]));
}

function leastCommonMultiple(nums: number[]): number {
  // Least common multiple of a list of integers
  var n = 1;
  for (var i = 0; i < nums.length; ++i) {
    n = leastCommonMultiple2Args(nums[i], n);
  }
  return n;
}

function leastCommonMultiple2Args(a: number, b: number) {
  // Least common multiple of 2 integers
  return (a * b) / greatestCommonDenominator(a, b);
}

function greatestCommonDenominator(a: number, b: number): number {
  // Greatest common divisor of 2 integers
  if (!b) return b === 0 ? a : NaN;
  return greatestCommonDenominator(b, a % b);
}

function applyVelocity(moons: Moon[]) {
  return moons.map((moon, i) => {
    moon.position.x += moon.velocity.x;
    moon.position.y += moon.velocity.y;
    moon.position.z += moon.velocity.z;

    return moon;
  });
}

function mutateVelocity(
  moons: Moon[],
  moon1Idx: number,
  moon2Idx: number,
  field: "x" | "y" | "z"
) {
  const a = moons[moon1Idx];
  const b = moons[moon2Idx];
  if (a.position[field] > b.position[field]) {
    moons[moon1Idx].velocity[field] -= 1;
    moons[moon2Idx].velocity[field] += 1;
  } else if (a.position[field] < b.position[field]) {
    moons[moon1Idx].velocity[field] += 1;
    moons[moon2Idx].velocity[field] -= 1;
  }
}

function getIndexCombos(numElements: number): [number, number][] {
  const combos: [number, number][] = [];
  for (let i = 0; i < numElements - 1; i++) {
    for (let j = i + 1; j < numElements; j++) {
      combos.push([i, j]);
    }
  }
  return combos;
}

function parseInput(input: string): Moon[] {
  return input.split("\n").map(line => {
    const re = /<x=(?<x>[\-\d]+), y=(?<y>[\-\d]+), z=(?<z>[\-\d]+)>/im;
    const matches = line.match(re);
    if (!matches || !matches.groups) throw new Error("invariant");

    return {
      position: {
        x: Number(matches.groups.x),
        y: Number(matches.groups.y),
        z: Number(matches.groups.z)
      },
      velocity: { x: 0, y: 0, z: 0 }
    };
  });
}
