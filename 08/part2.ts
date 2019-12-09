import { withTime } from "../utils";
import fs from "fs";

const BLACK = "0";
const WHITE = "1";
const TRANS = "2";

const getInput = (): string[] => {
  const input = fs.readFileSync(__dirname + "/input.txt");
  return input.toString().split("");
};

const testCases = [
  { imageData: "0222112222120000".split(""), width: 2, height: 2 }
];

withTime(main);
function main() {
  // testCases.forEach(testCase => {
  //   const layers = buildLayers(testCase);
  //   const result = buildComposite(layers);

  //   for (let row = 0; row < testCase.height; row++) {
  //     const startIndex = row * testCase.width;
  //     console.log(
  //       result.slice(startIndex, startIndex + testCase.width).join("")
  //     );
  //   }
  // });

  const width = 25;
  const height = 6;
  const layers = buildLayers({ imageData: getInput(), width, height });
  const result = buildComposite(layers);

  for (let row = 0; row < height; row++) {
    const startIndex = row * width;
    console.log(
      result
        .slice(startIndex, startIndex + width)
        .map(x => (x === "0" ? "   " : ` x `))
        .join("")
    );
  }
}

function buildComposite(layers: string[][]) {
  const numLayers = layers.length;
  const numDigitsPerLayer = layers[0].length;
  const result = new Array(numDigitsPerLayer).fill(TRANS);
  for (let position = 0; position < numDigitsPerLayer; position++) {
    inner: for (let curLayer = 0; curLayer < numLayers; curLayer++) {
      const layer = layers[curLayer];
      const char = layer[position];
      if (result[position] !== TRANS) break inner;
      result[position] = char;
      if (char === BLACK || char === WHITE) break inner;
    }
  }
  return result;
}

function buildLayers(input: {
  imageData: string[];
  width: number;
  height: number;
}) {
  const pxPerLayer = input.width * input.height;
  const numLayers = input.imageData.length / pxPerLayer;
  const layers = [];
  let layerNum = 0;
  while (layerNum < numLayers) {
    const pxIndex = layerNum * pxPerLayer;
    const layer = input.imageData.slice(pxIndex, pxIndex + pxPerLayer);
    layers.push(layer);
    layerNum++;
  }
  return layers;
}

// type CharMap = { [num: string]: number };
// function buildCharMap(layer: string[]): CharMap {
//   let initial: CharMap = {};
//   for (let i = 0; i < 10; i++) {
//     initial[i] = 0;
//   }
//   return layer.reduce((acc, cur) => {
//     acc[cur]++;
//     return acc;
//   }, initial);
// }
