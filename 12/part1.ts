import { withTime } from "../utils";

interface Point {
  x: number;
  y: number;
  z: number;
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
const numSteps = 1000;

withTime(main);
function main() {
  const combos = getIndexCombos(numMoons);

  //let moons = parseInput(testInput);
  let moons = parseInput(input);
  let step = 0;
  while (step < numSteps) {
    combos.forEach(([i, j]) => {
      ["x", "y", "z"].forEach(field => {
        mutateVelocity(moons, i, j, field as any);
      });
    });
    moons = applyVelocity(moons);

    step++;
  }
  console.log(moons);
  console.log(
    moons.reduce((acc, cur) => {
      acc += getEnergy(cur);
      return acc;
    }, 0)
  );
}

function getEnergy(moon: Moon): number {
  const potential =
    Math.abs(moon.position.x) +
    Math.abs(moon.position.y) +
    Math.abs(moon.position.z);

  const kenetic =
    Math.abs(moon.velocity.x) +
    Math.abs(moon.velocity.y) +
    Math.abs(moon.velocity.z);

  return potential * kenetic;
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
