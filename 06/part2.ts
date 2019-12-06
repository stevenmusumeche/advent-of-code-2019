import { withTime } from "../utils";
import fs, { access } from "fs";
import { inspect, callbackify } from "util";

const ROOT_NODE_ID = "COM";

const testInput = `COM)B
B)C
C)D
D)E
E)F
B)G
G)H
D)I
E)J
J)K
K)L
K)YOU
I)SAN`;

const getInput = (): string => {
  const input = fs.readFileSync(__dirname + "/input.txt");
  return input.toString();
};

interface ParentMap {
  [nodeId: string]: string;
}
let parentMap: ParentMap = {};

withTime(main);
function main() {
  const input = getInput();
  //const input = testInput;
  const parsed = parseInput(input);
  const tree = makeTree(parsed);
  addDepths(tree);

  const root = tree.get(ROOT_NODE_ID);
  if (!root) throw invariant();
  buildParentMap(root);

  const me = tree.get("YOU");
  const santa = tree.get("SAN");
  if (!me || !santa) throw invariant();
  const myPath = buildPathToRoot(me);
  const santaPath = buildPathToRoot(santa);

  let dist = 0;
  for (let nodeId of myPath) {
    dist++;
    if (santaPath.includes(nodeId)) {
      const answer =
        dist - 1 + santaPath.findIndex(santaNodeId => santaNodeId === nodeId);
      // shortest common parent
      console.log({
        answer
      });
      return;
    }
  }

  //const checksum = calcChecksum(tree);
  //console.log({ checksum });
}

function buildPathToRoot(node: Node): string[] {
  let path = [];
  let queue = [];
  queue.push(node.id);
  while (queue.length > 0) {
    let cur = queue.shift() as string;
    if (parentMap[cur]) {
      path.push(parentMap[cur]);
      queue.push(parentMap[cur]);
    }
  }
  return path;
}

function buildParentMap(node: Node, cb?: Function) {
  if (cb) cb(node);
  node.visited = true;
  node.children.forEach(childNode => {
    if (!childNode.visited) {
      parentMap[childNode.id] = node.id;
      buildParentMap(childNode, cb);
    }
  });
}

function calcChecksum(tree: Tree): number {
  let checksum = 0;
  for (const node of tree.values()) {
    checksum += node.depth || 0;
  }
  return checksum;
}

function addDepths(tree: Tree) {
  const root = tree.get(ROOT_NODE_ID);
  if (!root) throw invariant();
  root.depth = 0;
  const queue = [root];
  while (queue.length > 0) {
    let cur = queue.shift();
    if (!cur) throw invariant();

    cur.children.forEach(child => {
      if (!cur) throw invariant();
      child.depth = (cur.depth || 0) + 1;
      queue.push(child);
    });
  }
}

type Tree = Map<string, Node>;
interface Node {
  id: string;
  children: Node[];
  depth?: number;
  visited: boolean;
}
function makeTree(input: Input[]) {
  const tree: Tree = new Map();
  input.forEach(({ parentId, satelliteId }) => {
    const parent = getNode(tree, parentId);
    const satellite = getNode(tree, satelliteId);
    parent.children.push(satellite);
  });
  return tree;
}

function getNode(nodes: Map<string, Node>, nodeId: string): Node {
  // init if needed
  if (!nodes.has(nodeId)) {
    const newNode = { id: nodeId, children: [], visited: false };
    nodes.set(nodeId, newNode);
    return newNode;
  }

  const node = nodes.get(nodeId);
  if (!node) throw invariant();
  return node;
}

interface Input {
  parentId: string;
  satelliteId: string;
}
function parseInput(input: string): Input[] {
  return input.split("\n").reduce((acc, cur) => {
    const matches = cur.match(/^(?<parent>.*?)\)(?<satellite>.*?)$/);
    if (!matches || !matches.groups) throw new Error(`Parse error on ${cur}`);

    acc.push({
      parentId: matches.groups.parent,
      satelliteId: matches.groups.satellite
    });

    return acc;
  }, [] as Input[]);
}

function invariant(msg?: string) {
  return new Error(msg || "invariant");
}
