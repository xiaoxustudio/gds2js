import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { getAsset, isSea } from "node:sea";
import { Language, Parser } from "web-tree-sitter";

/**
 * wasm 定位分三种运行形态，两个 wasm 都能纯内存喂给 tree-sitter
 * （`Parser.init({ wasmBinary })` + `Language.load(Uint8Array)`，均已直证）：
 *
 * 1. Node SEA 单文件：core / grammar 作为 asset 内嵌，从 `node:sea` 取字节。
 * 2. @yao-pkg/pkg 单文件：core / grammar 打进快照，用 fs 读回（`process.pkg` 为真）。
 * 3. 普通形态（源码树 / dist / 装包）：相对 import.meta.url 找磁盘 wasm。
 *    原来写 "./gdscript.wasm"，一换工作目录就挂，所以逐个候选试：
 *      源码树  src/parse/parser.ts  → 仓库根 ../../gdscript.wasm
 *      打包    dist/parser-xxx.mjs  → ../gdscript.wasm（build 脚本会复制进去）
 */
const GRAMMAR_ASSET = "gdscript.wasm";
const CORE_ASSET = "web-tree-sitter.wasm";
const WASM_CANDIDATES = ["../../gdscript.wasm", "../gdscript.wasm", "./gdscript.wasm"];

const runningAsPkg = Boolean((process as unknown as { pkg?: unknown }).pkg);

function seaBytes(key: string): Uint8Array {
  const raw = getAsset(key);
  if (raw === undefined) throw new Error(`SEA 内嵌资源缺失：${key}`);
  return new Uint8Array(raw);
}

/** pkg 下按几个可能的落点找内嵌 wasm：快照目录、exe 同级目录。 */
function pkgBytes(name: string): Uint8Array {
  const bases = [__dirname, dirname(process.execPath)];
  for (const b of bases) {
    const p = join(b, name);
    if (existsSync(p)) return new Uint8Array(readFileSync(p));
  }
  throw new Error(`pkg 快照里找不到内嵌 wasm：${name}（试过 ${bases.join(" , ")}）`);
}

function loadCoreWasm(): Uint8Array | null {
  if (isSea()) return seaBytes(CORE_ASSET);
  if (runningAsPkg) return pkgBytes(CORE_ASSET);
  return null; // 普通形态：交给 web-tree-sitter 自己按 import.meta.url 解析
}

function loadGrammar(): Promise<Language> {
  if (isSea()) return Language.load(seaBytes(GRAMMAR_ASSET));
  if (runningAsPkg) return Language.load(pkgBytes(GRAMMAR_ASSET));
  return Language.load(resolveWasmPath());
}

function resolveWasmPath(): string {
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
  const core = loadCoreWasm();
  // 有字节就直接喂 Emscripten，绕开 web-tree-sitter 自己的文件定位（单文件里定位不准）。
  await Parser.init(core ? { wasmBinary: core.buffer.slice(core.byteOffset, core.byteOffset + core.byteLength) } : undefined);
  const lang = await loadGrammar();
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
