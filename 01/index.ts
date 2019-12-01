import fs from "fs";

/**
 * To find the fuel required for a module, take its mass, divide by three, round down, and subtract 2.
 */
const calcFuel = (mass: number): number => {
  const calculation = Math.floor(mass / 3) - 2;
  return calculation > 0 ? calculation : 0;
};

const getInput = (): number[] => {
  const input = fs.readFileSync(__dirname + "/input1.txt");
  return input
    .toString()
    .split("\n")
    .map(Number);
};

const calcFuelForFuel = (mass: number): number => {
  const calculation = calcFuel(mass);
  if (calculation <= 0) return calculation;
  return calculation + calcFuelForFuel(calculation);
};

(async function main() {
  const input = getInput();

  const sum = input.reduce((acc, cur) => {
    const moduleFuel = calcFuel(cur);
    acc += moduleFuel + calcFuelForFuel(moduleFuel);
    return acc;
  }, 0);

  console.log("Answer", sum);
})();
