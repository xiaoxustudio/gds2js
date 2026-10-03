/** 构建期由 tools/cli-native.mjs 同名换实现（复制本文件为 parser.ts）：同一个 `parseSource`，
 * 树从 libtree-sitter（`--ffi`）来，不再碰 web-tree-sitter。
 * CST 形状是 `./cst` 的普通记录 —— 类实例喂不进记录形参（SC2002），两侧都交记录。 */
import { buildCsTree, type NodeTable } from "./native";
import type { CsTree } from "./cst";

declare function gdsInit(): number;
declare function gdsParseNodes(src: string, len: number): number;
declare function gdsNodesBytes(): number;
declare function gdsNodesInto(buf: Uint8Array, cap: number): number;
declare function gdsNamesBytes(): number;
declare function gdsNamesInto(buf: Uint8Array, cap: number): number;

let ready = false;

function ensureLanguage(): void {
  if (ready) return;
  if (gdsInit() !== 1) throw new Error("tree-sitter 装载 gdscript 语言失败");
  ready = true;
}

function tableFromFfi(src: string): NodeTable {
  const nb = gdsNodesBytes();
  const recBuf = new Uint8Array(nb);
  gdsNodesInto(recBuf, nb);
  const mb = gdsNamesBytes();
  const names = new Uint8Array(mb);
  gdsNamesInto(names, mb);
  return { rec: new Int32Array(recBuf.buffer), names, src };
}

export async function parseSource(src: string): Promise<CsTree> {
  ensureLanguage();
  if (gdsParseNodes(src, src.length) < 0) throw new Error("gds_parse_nodes 失败（parser 没装载？）");
  return buildCsTree(tableFromFfi(src));
}
