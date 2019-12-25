const POSITION_MODE = "0";
const IMMEDIATE_MODE = "1";
const RELATIVE_MODE = "2";

let input: string;

type OutputHandler = (output: number) => void;
let outputHandler: OutputHandler;

type OnInput = () => void;
let onInput: OnInput = () => {};

export function setInput(i: string) {
  input = i;
}

export function setOutputHandler(handler: OutputHandler) {
  outputHandler = handler;
}

export function setOnInput(handler: OnInput) {
  onInput = handler;
}

export function* run(memory: string[], ip: number, rb: number) {
  while (true) {
    const { opCode, modes, instruction } = parseInstruction(memory[ip]);
    //console.log("[cpu] running opCode", opCode);

    if (opCode === "99") {
      process.stdout.write("\n");
      break;
    }

    let destIndex, aVal, bVal, output, comparator;

    switch (opCode) {
      // addition
      case "01":
      // multiplication
      case "02":
        destIndex = getIndex(modes[2], memory, ip + 3, rb);
        aVal = getParameterValue(modes[0], memory, ip + 1, rb);
        bVal = getParameterValue(modes[1], memory, ip + 2, rb);
        if (opCode === "01") {
          memory[destIndex] = String(aVal + bVal);
        } else {
          memory[destIndex] = String(aVal * bVal);
        }
        ip += 4;
        break;
      // input
      case "03":
        //onInput();
        //console.log("[cpu] waiting for input");
        const input = yield;
        //console.log("[cpu] received input", input);

        destIndex = getIndex(modes[0], memory, ip + 1, rb);
        memory[destIndex] = input;
        ip += 2;
        break;
      // output
      case "04":
        output = getParameterValue(modes[0], memory, ip + 1, rb);
        //console.log("[cpu] providing output", output);

        yield output;

        //outputHandler(output);
        ip += 2;
        break;
      // jump-if-true
      case "05":
      // jump-if-false
      case "06":
        aVal = getParameterValue(modes[0], memory, ip + 1, rb);
        bVal = getParameterValue(modes[1], memory, ip + 2, rb);
        comparator =
          opCode === "05" ? (x: number) => x !== 0 : (x: number) => x === 0;
        if (comparator(aVal)) {
          ip = bVal;
        } else {
          ip += 3;
        }

        break;
      // less than
      case "07":
      // equals
      case "08":
        aVal = getParameterValue(modes[0], memory, ip + 1, rb);
        bVal = getParameterValue(modes[1], memory, ip + 2, rb);
        const cPosition = getIndex(modes[2], memory, ip + 3, rb);

        comparator =
          opCode === "07"
            ? (a: number, b: number) => a < b
            : (a: any, b: any) => a === b;

        memory[cPosition] = comparator(aVal, bVal) ? "1" : "0";
        ip += 4;

        break;
      // adjust the relative base
      case "09":
        aVal = getParameterValue(modes[0], memory, ip + 1, rb);
        rb += aVal;
        ip += 2;
        break;
      default:
        throw new Error(`Unknown OP Code ${opCode} at position ${ip}`);
    }
  }

  return memory;
}

interface Instruction {
  instruction: string;
  opCode: string;
  modes: [string, string, string];
}
function parseInstruction(instruction: string): Instruction {
  if (instruction.length < 2) instruction = instruction.padStart(2, "0");
  const opCode = instruction.substr(instruction.length - 2, 2);

  const modes = instruction
    .substring(0, instruction.length - 2)
    .padStart(3, "0")
    .split("");

  return {
    instruction,
    opCode,
    modes: [modes[2], modes[1], modes[0]]
  };
}

function getIndex(mode: string, memory: string[], ip: number, rb: number) {
  if (mode === POSITION_MODE) {
    if (memory[ip] === undefined) {
      memory[ip] = "0";
    }
    return Number(memory[ip]);
  } else if (mode === IMMEDIATE_MODE) {
    return ip;
  } else if (mode === RELATIVE_MODE) {
    return Number(memory[ip]) + rb;
  }
  throw new Error("invariant");
}

function getParameterValue(
  mode: string,
  memory: string[],
  ip: number,
  rb: number
): number {
  const index = getIndex(mode, memory, ip, rb);

  if (memory[index] === undefined) {
    memory[index] = "0";
  }
  return Number(memory[index]);
}
