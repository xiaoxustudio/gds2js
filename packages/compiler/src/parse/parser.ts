import { Language, Parser } from "web-tree-sitter";
import { selfFile } from "../home";
import { resolveWasm } from "../paths";
import type { CsTree } from "./cst";
import { parseSync } from "./descent";
import { toCsTree } from "./wasm-cst";

let cached: Promise<Parser> | null = null;

async function create(): Promise<Parser> {
  const glue = selfFile("node_modules/web-tree-sitter/web-tree-sitter.wasm");
  await Parser.init(glue ? { locateFile: () => glue } : undefined);
  const lang = await Language.load(resolveWasm(import.meta.url));
  const parser = new Parser();
  parser.setLanguage(lang);
  return parser;
}

/** tree-sitter 初始化要读 wasm，别每次解析都重来一遍。 */
export async function getParser(): Promise<Parser> {
  cached ??= create();
  return cached;
}

/** 永远走 tree-sitter，不看影子开关：差分台要靠它当 oracle，开关一开就自比等于没有门。收口时随整支一起删。 */
export async function parseWithTreeSitter(src: string): Promise<CsTree> {
  const parser = await getParser();
  const tree = parser.parse(src);
  if (!tree) throw new Error("tree-sitter 解析返回空树");
  return toCsTree(tree.rootNode, src);
}

/**
 * 影子开关：`GDS_PARSER=ts` 走手写递归下降解析器，不设则仍走 tree-sitter。
 * 迁移期两条路同时在盘上，差分台与全量门靠这个开关对账；收口时整块删掉 tree-sitter 这一支。
 * 签名保持 async 不动 —— 145 个单测、compile/project.ts、tools/compile.ts 与 tools/bench.ts 全在 await 它。
 */
export async function parseSource(src: string): Promise<CsTree> {
  if (process.env.GDS_PARSER === "ts") return parseSync(src);
  return parseWithTreeSitter(src);
}
