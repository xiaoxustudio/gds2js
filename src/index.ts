import { readFileSync } from "node:fs";
import { parseSource } from "./parse/parser";

const file = process.argv[2] ?? "examples/test1.gd";
const tree = await parseSource(readFileSync(file, "utf8"));
console.log(tree.rootNode.toString());
