import { withTime } from "../utils";

const testInputs = [
  [123455, 123455, 1],
  [123444, 123446, 2],
  [111110, 111112, 0],
  [111110, 111123, 1],
  [588998, 588999, 1],
  [123444, 123444, 0],
  [124444, 124444, 0],
  [123456, 123466, 1]
];

function main() {
  // test inputs
  testInputs.forEach(input => {
    const [start, end, expected] = input;

    let candidates = 0;
    for (let i = start; i <= end; i++) {
      const candidate = String(i);

      if (hasValidDoubleDigits(candidate) && hasOnlyIncrementing(candidate)) {
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

    if (hasValidDoubleDigits(candidate) && hasOnlyIncrementing(candidate)) {
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

function hasValidDoubleDigits(candidate: string): boolean {
  const len = candidate.length;

  for (let i = 0; i < len - 1; i++) {
    if (
      candidate[i] === candidate[i + 1] &&
      !hasBefore(candidate, i) &&
      !hasAfter2(candidate, i)
    ) {
      return true;
    }
  }
  return false;
}

function hasBefore(candidate: string, i: number): boolean {
  if (i === 0) return false;

  return candidate[i] === candidate[i - 1];
}

function hasAfter2(candidate: string, i: number): boolean {
  if (i === candidate.length - 2) return false;

  return candidate[i] === candidate[i + 2];
}
