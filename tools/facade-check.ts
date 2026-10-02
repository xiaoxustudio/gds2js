/**
 * #14 的门面等价性检查（`pnpm test:facade`）：把 wasm 那侧的树**拍平**成 FFI 会交回的那张节点表
 * （前序 + depth + UTF-8 字节区间 + `\0` 分隔的 kind 名池），再让 `src/parse/native.ts` 的门面把它重建回来，
 * 与 wasm 的原树逐节点比 `type / text / children / namedChildren / isNamed / hasError / startIndex / endIndex`。
 *
 * 为什么先在 node 侧比：门面的两处真风险跟 C 无关 —— ① 字节区间换算回 JS 下标（S222 量到 8637 个节点两者不等），
 * ② 由「前序 + depth」复原父子关系。这两处过了，接上 FFI 只是换一张表的来源；过不了就先别碰解析器。
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import type { Node as WasmNode } from "web-tree-sitter";
import { getParser } from "../src/parse/parser";
import { toCsTree } from "../src/parse/wasm-cst";
import { buildCsTree, type NodeTable } from "../src/parse/native";
import type { CsNode } from "../src/parse/cst";

const ROOT = join(import.meta.dirname, "..");

function walkFiles(dir: string, out: string[]): string[] {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) {
      if (name === ".gen" || name === ".godot" || name === ".gds2js-export" || name === "node_modules") continue;
      walkFiles(p, out);
    } else if (name.endsWith(".gd")) out.push(p);
  }
  return out;
}

const REC = 7;

/** 照 C 侧 `gds_parse_nodes` 的形状把树拍平（kind 名与字段名进池，区间换成 UTF-8 字节） */
function tableFromWasm(src: string, root: WasmNode): NodeTable {
  const rows: number[] = [];
  const pool: number[] = [];
  const poolAt = new Map<string, number>();
  const nameOf = (t: string): number => {
    const hit = poolAt.get(t);
    if (hit !== undefined) return hit;
    const at = pool.length;
    poolAt.set(t, at);
    for (let i = 0; i < t.length; i++) pool.push(t.charCodeAt(i));
    pool.push(0);
    return at;
  };
  const byteOf = (jsIndex: number): number => Buffer.byteLength(src.slice(0, jsIndex), "utf8");
  const go = (node: WasmNode, depth: number, field: string): void => {
    rows.push(
      depth,
      nameOf(node.type),
      byteOf(node.startIndex),
      byteOf(node.endIndex),
      node.isNamed ? 1 : 0,
      node.hasError ? 1 : 0,
      nameOf(field),
    );
    const kids = node.children;
    for (let i = 0; i < kids.length; i++) {
      go(kids[i] as WasmNode, depth + 1, node.fieldNameForChild(i) ?? "");
    }
  };
  // 池首固定是空串：记录里那一格为 0 就是「这个孩子在父亲那里没有字段名」，与 C 侧同一套约定
  nameOf("");
  go(root, 0, "");
  return { rec: Int32Array.from(rows), names: Uint8Array.from(pool), src };
}

type Diff = { file: string; path: string; field: string; a: string; b: string };

/** A/B 两条路都是 `CsNode` 记录，比的是 `lower` 真会读的每一格（S228 数出来的那份成员清单）。 */
function compare(file: string, a: CsNode, b: CsNode, path: string): Diff | null {
  const pairs: Array<[string, unknown, unknown]> = [
    ["type", a.type, b.type],
    ["startIndex", a.startIndex, b.startIndex],
    ["endIndex", a.endIndex, b.endIndex],
    ["text", a.text, b.text],
    ["isNamed", a.isNamed, b.isNamed],
    ["hasError", a.hasError, b.hasError],
    ["fieldName", a.fieldName, b.fieldName],
    ["startPosition.row", a.startPosition.row, b.startPosition.row],
    ["startPosition.column", a.startPosition.column, b.startPosition.column],
    ["children", a.children.length, b.children.length],
    ["namedChildren", a.namedChildren.length, b.namedChildren.length],
  ];
  for (const [field, x, y] of pairs) {
    if (x !== y) return { file, path, field, a: String(x).slice(0, 60), b: String(y).slice(0, 60) };
  }
  for (let i = 0; i < a.children.length; i++) {
    const bad = compare(file, a.children[i] as CsNode, (b.children as CsNode[])[i] as CsNode, `${path}/${a.type}#${String(i)}`);
    if (bad !== null) return bad;
  }
  return null;
}

const files = walkFiles(join(ROOT, "corpus"), []).sort();
const parser = await getParser();
let checked = 0;
let nodes = 0;
const bad: Diff[] = [];
for (const abs of files) {
  const src = readFileSync(abs, "utf8");
  const wasm = parser.parse(src);
  if (wasm === null) throw new Error(`${abs}：wasm 解析返回空树`);
  const table = tableFromWasm(src, wasm.rootNode);
  nodes += table.rec.length / REC;
  checked++;
  const diff = compare(abs.slice(ROOT.length + 1), toCsTree(wasm.rootNode, src).rootNode, buildCsTree(table).rootNode, "source");
  if (diff !== null) {
    bad.push(diff);
    if (bad.length >= 5) break;
  }
}

console.log(`门面等价性：${String(checked)}/${String(files.length)} 份、${String(nodes)} 个节点，A/B 两条物化路逐字段比`);
for (const d of bad) {
  console.log(`  不一致 ${d.file} 位置 ${d.path} 字段 ${d.field}：A=${JSON.stringify(d.a)} B=${JSON.stringify(d.b)}`);
}
if (bad.length > 0 || checked < files.length) {
  console.log(`失败 ${String(bad.length)} 处`);
  process.exit(1);
}
console.log("全部一致");
