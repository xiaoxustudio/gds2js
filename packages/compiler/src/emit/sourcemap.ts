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
    if (v > 0) digit |= 0b100000;
    out += B64[digit]!;
  } while (v > 0);
  return out;
}

/** 把行粒度映射编成 v3 的 `mappings` 串：每行至多一段（生成列恒 0），按 genLine 建槽位；输入按 genLine 升序，同 genLine 只留第一条。 */
export function encodeMappings(sorted: LineMapping[]): string {
  const byGen = dedupeByGenLine([...sorted].sort((a, b) => a.genLine - b.genLine));
  const maxLine = byGen.reduce((n, m) => Math.max(n, m.genLine), -1);
  const lines: string[] = new Array<string>(maxLine + 1).fill("");

  let prevSrcIdx = 0;
  let prevSrcLine = 0;
  let prevSrcCol = 0;
  for (const m of byGen) {
    const seg = [
      vlq(0),
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
