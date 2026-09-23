import { fileURLToPath } from "node:url";
import { Language, Parser } from "web-tree-sitter";

/**
 * 相对 import.meta.url 解析，而不是相对 cwd。
 * 原来写的是 Language.load("./gdscript.wasm")，一换工作目录或打包就必挂。
 *
 * TODO(打包)：dist/ 里没有 gdscript.wasm，发布时需要把 wasm 一起复制过去，
 * 或改成内联 base64 + Language.load(Buffer)。现在只保证从源码树跑是对的。
 */
const WASM_URL = new URL("../../gdscript.wasm", import.meta.url);

let cached: Promise<Parser> | null = null;

async function create(): Promise<Parser> {
  await Parser.init();
  const lang = await Language.load(fileURLToPath(WASM_URL));
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
