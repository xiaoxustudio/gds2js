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
