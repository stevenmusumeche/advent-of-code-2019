import { withTime } from "../utils";

const testInputs = [
  [111110, 111112, 2],
  [123456, 123466, 1]
];

function main() {
  // test inputs
  testInputs.forEach(input => {
    const [start, end, expected] = input;

    let candidates = 0;
    for (let i = start; i <= end; i++) {
      const candidate = String(i);

      if (hasDoubleDigits(candidate) && hasOnlyIncrementing(candidate)) {
        candidates++;
      }
    }

    console.log({ answer: candidates, expected });
  });

  // real input
  const start = 183564;
  const end = 657474;

  let candidates = 0;
  for (let i = start; i <= end; i++) {
    const candidate = String(i);

    if (hasDoubleDigits(candidate) && hasOnlyIncrementing(candidate)) {
      candidates++;
    }
  }

  console.log({ answer: candidates });
}
withTime(main);

function hasOnlyIncrementing(candidate: string): boolean {
  const len = candidate.length;
  for (let i = 0; i < len - 1; i++) {
    if (Number(candidate[i]) > Number(candidate[i + 1])) return false;
  }
  return true;
}

function hasDoubleDigits(candidate: string): boolean {
  const len = candidate.length;
  for (let i = 0; i < len - 1; i++) {
    if (candidate[i] === candidate[i + 1]) return true;
  }
  return false;
}
