import { withTime } from "../utils";
import fs from "fs";

const getInput = (): string[] => {
  const input = fs.readFileSync(__dirname + "/input.txt");
  return input.toString().split("");
};

const testCases = [
  { imageData: "123456789012".split(""), width: 3, height: 2 }
];

withTime(main);
function main() {
  // testCases.forEach(testCase => {
  //   const layers = buildLayers(testCase);
  //   const layerWithFewestZeros = getLayerWithFewestZeros(layers);
  //   const answer =
  //     layerWithFewestZeros.charMap["1"] * layerWithFewestZeros.charMap["2"];

  //   console.log({ answer });
  // });

  const input = { imageData: getInput(), width: 25, height: 6 };
  const layers = buildLayers(input);
  const layerWithFewestZeros = getLayerWithFewestZeros(layers);
  const answer =
    layerWithFewestZeros.charMap["1"] * layerWithFewestZeros.charMap["2"];

  console.log({ answer });
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

type CharMap = { [num: string]: number };
function buildCharMap(layer: string[]): CharMap {
  let initial: CharMap = {};
  for (let i = 0; i < 10; i++) {
    initial[i] = 0;
  }
  return layer.reduce((acc, cur) => {
    acc[cur]++;
    return acc;
  }, initial);
}

function getLayerWithFewestZeros(
  layers: string[][]
): { layer: string[]; charMap: CharMap } {
  const layerWithFewestZeros = layers.reduce(
    (acc, cur) => {
      const charMap = buildCharMap(cur);
      const numZeros = charMap["0"];

      if (numZeros < acc.count) {
        acc = { layer: cur, count: numZeros, charMap };
      }

      return acc;
    },
    { layer: [] as string[], count: Number.MAX_SAFE_INTEGER, charMap: {} }
  );

  return layerWithFewestZeros;
}
