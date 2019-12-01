import fs from 'fs';

/**
 * To find the fuel required for a module, take its mass, divide by three, round down, and subtract 2.
 */
const calcFuel = (mass: number): number => {
  return Math.floor(mass / 3) - 2
}

const getInput = (): number[] => {
  const input = fs.readFileSync(__dirname + '/input1.txt');
  return input.toString().split("\n").map(Number);
}

(async function main() {
  const input = getInput();
  
  const sum = input.reduce((acc, cur) => {
    acc += calcFuel(cur);
    return acc;
  }, 0)

  console.log('Answer', sum);
})();