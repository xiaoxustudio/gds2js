import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { Language, Parser } from "web-tree-sitter";
import { seaFile } from "../home";

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
  // 自包含 exe（SEA）里 import.meta.url 指向二进制自己，候选路径全都无意义 —— 用解出来的那份
  const fromHome = seaFile("gdscript.wasm");
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
  // web-tree-sitter 的 JS 在 self 产物里是被内联的，它按 `import.meta.url` 找自己那颗运行时
  // wasm —— exe 里那就是 exe 同目录，必 ENOENT。home 里有解出来的那份就指过去；
  // 非 SEA 一律 undefined，保持它原本的解析路径一字不动。
  const glue = seaFile("node_modules/web-tree-sitter/web-tree-sitter.wasm");
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

export type Tree = Awaited<ReturnType<typeof parseSource>>;
export type SyntaxNode = Tree["rootNode"];

export async function parseSource(src: string) {
  const parser = await getParser();
  const tree = parser.parse(src);
  if (!tree) throw new Error("tree-sitter 解析返回空树");
  return tree;
}
