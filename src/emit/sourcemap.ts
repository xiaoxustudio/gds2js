/**
 * Source Map v3 的行粒度编码。
 *
 * gds2js 的产物是给人 import/调试的 JS 模块，运行时报错默认指向生成代码 —— sourcemap
 * 把它映射回 .gd 源行。v1 只做**行粒度**（生成列恒 0）：够用（栈帧定位到行），
 * 且能纯增量实现，不动 emitter 产出的一个字节。
 */

/** 一条映射：生成第 genLine 行（0-based）→ 源第 srcLine/srcCol 行（0-based）。 */
export interface LineMapping {
  genLine: number;
  srcLine: number;
  srcCol: number;
}

export interface RawSourceMap {
  version: 3;
  file: string;
  sources: string[];
  names: string[];
  mappings: string;
  sourceRoot?: string;
}

const B64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

/** 有符号整数 → VLQ base64 串。 */
function vlq(value: number): string {
  let v = value < 0 ? ((-value) << 1) | 1 : value << 1;
  let out = "";
  do {
    let digit = v & 0b11111;
    v >>>= 5;
    if (v > 0) digit |= 0b100000; // 还有后续分组，置 continuation bit
    out += B64[digit]!;
  } while (v > 0);
  return out;
}

/**
 * 把一组映射编成 v3 的 mappings 串。
 * mappings 内部全是「相对上一段的增量」。行粒度下每行至多一个段（生成列恒 0），
 * 所以直接按生成行建槽位、只替换有映射的行，避免增量游标把连续行错插成空段。
 * 输入按 genLine 升序；同 genLine 只保留第一条。
 */
export function encodeMappings(sorted: LineMapping[]): string {
  const byGen = dedupeByGenLine([...sorted].sort((a, b) => a.genLine - b.genLine));
  const maxLine = byGen.reduce((n, m) => Math.max(n, m.genLine), -1);
  const lines: string[] = new Array<string>(maxLine + 1).fill("");

  // 源字段是跨整张图累计的增量；生成列每行从 0 起，行粒度下恒为 0。
  let prevSrcIdx = 0;
  let prevSrcLine = 0;
  let prevSrcCol = 0;
  for (const m of byGen) {
    const seg = [
      vlq(0), // 生成列
      vlq(0 - prevSrcIdx),
      vlq(m.srcLine - prevSrcLine),
      vlq(m.srcCol - prevSrcCol),
    ].join("");
    lines[m.genLine] = seg;
    prevSrcIdx = 0;
    prevSrcLine = m.srcLine;
    prevSrcCol = m.srcCol;
  }
  return lines.join(";");
}

function dedupeByGenLine(ms: LineMapping[]): LineMapping[] {
  const seen = new Set<number>();
  const out: LineMapping[] = [];
  for (const m of ms) {
    if (seen.has(m.genLine)) continue;
    seen.add(m.genLine);
    out.push(m);
  }
  return out;
}

/** 组装成可 JSON.stringify 的 map 对象。 */
export function buildSourceMap(params: {
  file: string;
  source: string;
  mappings: LineMapping[];
}): RawSourceMap {
  return {
    version: 3,
    file: params.file,
    sources: [params.source],
    names: [],
    mappings: encodeMappings(params.mappings),
  };
}
