import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { Language, Parser } from "web-tree-sitter";
import { selfFile } from "../home";
import type { CsTree } from "./cst";
import { toCsTree } from "./wasm-cst";

/**
 * wasm 相对 import.meta.url 定位，而不是相对 cwd —— 原来写 "./gdscript.wasm"，
 * 一换工作目录就挂。
 *
 * 位置随产物形态变化，所以逐个候选试：
 *   源码树  src/parse/parser.ts  → 仓库根 ../../gdscript.wasm
 *   打包    dist/parser-xxx.mjs  → ../gdscript.wasm（build 脚本会复制进去）
 *   装包    node_modules/gds2js/dist/… → 包根 ../gdscript.wasm
 */
const WASM_CANDIDATES = ["../../gdscript.wasm", "../gdscript.wasm", "./gdscript.wasm"];

function resolveWasm(): string {
  const fromHome = selfFile("gdscript.wasm");
  if (fromHome) return fromHome;
  for (const spec of WASM_CANDIDATES) {
    const p = fileURLToPath(new URL(spec, import.meta.url));
    if (existsSync(p)) return p;
  }
  throw new Error(
    `找不到 gdscript.wasm（试过 ${WASM_CANDIDATES.join(" , ")}，基于 ${import.meta.url}）`,
  );
}

let cached: Promise<Parser> | null = null;

async function create(): Promise<Parser> {
  const glue = selfFile("node_modules/web-tree-sitter/web-tree-sitter.wasm");
  await Parser.init(glue ? { locateFile: () => glue } : undefined);
  const lang = await Language.load(resolveWasm());
  const parser = new Parser();
  parser.setLanguage(lang);
  return parser;
}

/** tree-sitter 初始化要读 wasm，别每次解析都重来一遍。 */
export async function getParser(): Promise<Parser> {
  cached ??= create();
  return cached;
}

export async function parseSource(src: string): Promise<CsTree> {
  const parser = await getParser();
  const tree = parser.parse(src);
  if (!tree) throw new Error("tree-sitter 解析返回空树");
  // 交回的是**我们自己的 CST 记录**（`./cst`）：web-tree-sitter 的包名不能顺着签名流进 lower，
  // 否则整条链都沾上「这个包要跑在 --dynamic 岛里」（S227 里 lower 那两处 SC2004 就是这么来的）。
  // 而且形状必须是记录不是类 —— 类实例喂不进记录形参（S231 的 SC2002）。
  return toCsTree(tree.rootNode, src);
}
