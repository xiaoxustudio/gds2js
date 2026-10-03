/** 构建期由 tools/cli-native.mjs 同名换实现：原生 exe 里解析器是 libtree-sitter over FFI，不是 web-tree-sitter 的 wasm。 */
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { Language, Parser } from "web-tree-sitter";
import { selfFile } from "../home";
import type { CsTree } from "./cst";
import { toCsTree } from "./wasm-cst";

/** wasm 要相对 `import.meta.url` 定位而不是相对 cwd；产物形态不同、放置位置也不同，逐个候选试。 */
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
  // 交回自己的 CST 记录：web-tree-sitter 的包名不能顺着签名流进 lower。
  return toCsTree(tree.rootNode, src);
}
