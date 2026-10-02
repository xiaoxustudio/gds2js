/** 原生 CST：把 FFI 交回来的节点表物化成 `./cst` 那套普通记录。 */
import type { CsNode, CsPoint, CsTree } from "./cst";

/** 一条记录七个 int32：depth、kind 名在名字池里的偏移、startByte、endByte、isNamed、hasError、本节点在父亲那里的字段名偏移（0 = 池首那个空串，即没有字段名）。 */
const REC = 7;

export type NodeTable = {
  /** C 侧 `gds_parse_nodes` 的返回：前序遍历的定长记录 */
  rec: Int32Array;
  /** `\0` 分隔的名字池（kind 名与字段名共用一张） */
  names: Uint8Array;
  /** 这份表对应的源码 */
  src: string;
};

function nameAt(table: NodeTable, at: number): string {
  const names = table.names;
  let end = at;
  while (end < names.length && (names[end] as number) !== 0) end++;
  let s = "";
  let i = at;
  while (i < end) {
    s += String.fromCharCode(names[i] as number);
    i++;
  }
  return s;
}

/** byte→JS 码元下标表：每个字节指向它所属字符的 JS 起始下标，落在多字节序列中间的字节退化到该字符开头。 */
function byteToJsIndex(src: string): Int32Array {
  let total = 0;
  for (let i = 0; i < src.length; i++) total += utf8LenOfCodeUnit(src.charCodeAt(i) as number);
  const map = new Int32Array(total + 1);
  let byte = 0;
  let i = 0;
  while (i < src.length) {
    const code = src.codePointAt(i) as number;
    const jsLen = code > 0xffff ? 2 : 1;
    const byteLen = utf8LenOfCode(code);
    for (let k = 0; k < byteLen; k++) map[byte + k] = i;
    byte += byteLen;
    i += jsLen;
  }
  map[total] = src.length;
  return map;
}

function utf8LenOfCode(code: number): number {
  return code < 0x80 ? 1 : code < 0x800 ? 2 : code < 0x10000 ? 3 : 4;
}

/** 代理对的两半各自不是独立字符：各算 2 字节，合起来正好是那个字符的 4 字节。 */
function utf8LenOfCodeUnit(unit: number): number {
  return unit < 0x80 ? 1 : unit < 0x800 ? 2 : unit < 0xd800 || unit >= 0xe000 ? 3 : 2;
}

/** 前序 + depth 复原父子：一个栈走一遍，栈顶始终是「还在长孩子的最近那个祖先」。 */
function childRowsOf(rec: Int32Array): number[][] {
  const total = rec.length / REC;
  const out: number[][] = [];
  for (let r = 0; r < total; r++) out.push([]);
  const stack: number[] = [];
  for (let r = 0; r < total; r++) {
    const d = rec[r * REC] as number;
    while (stack.length > 0 && (rec[(stack[stack.length - 1] as number) * REC] as number) >= d) stack.pop();
    if (stack.length > 0) (out[stack[stack.length - 1] as number] as number[]).push(r);
    stack.push(r);
  }
  return out;
}

/** 交回 `CsTree`：每节点一个普通记录对象，无方法也无父指针；`startPosition` 的列按 JS 码元算。 */
export function buildCsTree(table: NodeTable): CsTree {
  const rec = table.rec;
  const total = rec.length / REC;
  if (total === 0) throw new Error("原生节点表是空的（gds_parse_nodes 没跑到？）");
  const childRows = childRowsOf(rec);
  const b2j = byteToJsIndex(table.src);
  const starts: number[] = [0];
  for (let i = 0; i < table.src.length; i++) {
    if (table.src.charCodeAt(i) === 10) starts.push(i + 1);
  }

  const pointAt = (jsIndex: number): CsPoint => {
    let lo = 0;
    let hi = starts.length - 1;
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1;
      if ((starts[mid] as number) <= jsIndex) lo = mid;
      else hi = mid - 1;
    }
    return { row: lo, column: jsIndex - (starts[lo] as number) };
  };

  const jsAt = (byte: number): number => b2j[byte < b2j.length ? byte : b2j.length - 1] as number;

  const build = (row: number, fieldName: string): CsNode => {
    const base = row * REC;
    const start = jsAt(rec[base + 2] as number);
    const end = jsAt(rec[base + 3] as number);
    const children: CsNode[] = [];
    for (const c of childRows[row] as number[]) {
      children.push(build(c, nameAt(table, rec[c * REC + 6] as number)));
    }
    return {
      type: nameAt(table, rec[base + 1] as number),
      text: table.src.slice(start, end),
      isNamed: (rec[base + 4] as number) !== 0,
      hasError: (rec[base + 5] as number) !== 0,
      startIndex: start,
      endIndex: end,
      startPosition: pointAt(start),
      fieldName,
      children,
      namedChildren: children.filter((k) => k.isNamed),
    };
  };

  return { rootNode: build(0, "") };
}
