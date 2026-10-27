import { PUNCT, TAB_WIDTH, isDigit, isIdentPart, isIdentStart, type Tok } from "./tokens";

export type LexTok = Tok & { lineStart: boolean; indent: number };

export type LexIssue = { at: number; row: number; col: number; message: string };

export type LexResult = { tokens: LexTok[]; issues: LexIssue[] };

type Delim = { quote: string; triple: boolean; raw: boolean; name: boolean; nodePath: boolean };

const STR_PREFIX: Record<string, "raw" | "name" | "nodePath"> = { r: "raw", "&": "name", "^": "nodePath", "@": "nodePath" };

/** 语法的 extras 里那三个零宽字符：不算缩进空白，只推进列号。 */
const ZERO_WIDTH = new Set(["\uFEFF", "\u2060", "\u200B"]);

function lineTable(src: string): number[] {
  const starts = [0];
  for (let i = 0; i < src.length; i++) if (src[i] === "\n") starts.push(i + 1);
  return starts;
}

function rowOf(starts: number[], idx: number): number {
  let lo = 0;
  let hi = starts.length - 1;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (starts[mid]! <= idx) lo = mid;
    else hi = mid - 1;
  }
  return lo;
}

function isHex(c: string): boolean {
  return isDigit(c) || (c >= "a" && c <= "f") || (c >= "A" && c <= "F");
}

function runOf(src: string, at: number, n: number, test: (c: string) => boolean): number {
  let i = at;
  let seen = 0;
  while (seen < n && i < src.length && test(src[i]!)) {
    i++;
    seen++;
  }
  return seen === n ? i : -1;
}

/** grammar.js 的 escape_sequence：`\` 后接 u 四位hex / U 六位hex / x 两位hex / o 三位八进制 / CRLF / 任一非 uxo 字符。 */
export function escapeEnd(src: string, backslash: number): number {
  const c = src[backslash + 1];
  if (c === undefined) return -1;
  if (c === "u") return runOf(src, backslash + 2, 4, isHex);
  if (c === "U") return runOf(src, backslash + 2, 6, isHex);
  if (c === "x") return runOf(src, backslash + 2, 2, isHex);
  if (c === "o") return runOf(src, backslash + 2, 3, (d) => d >= "0" && d <= "7");
  if (c === "\r") return src[backslash + 2] === "\n" ? backslash + 3 : -1;
  return backslash + 2;
}

/** grammar.js 的 `repeat1(/[0-9]+_?/)`：至少一位数字，后面可选一个下划线，可重复。
 *  下划线只是分隔符，不能打头 —— 否则 `super._init()` 里的 `._` 会被读成一个 float。 */
const digits = (src: string, i: number): number => {
  let j = i;
  for (;;) {
    let k = j;
    while (k < src.length && isDigit(src[k]!)) k++;
    if (k === j) return j;
    if (src[k] === "_") k++;
    j = k;
  }
};

function numberEnd(src: string, at: number): { end: number; kind: "int" | "float" } {
  if (src[at] === "0") {
    const p = src[at + 1];
    const radix =
      p === "x" || p === "X" ? isHex : p === "o" || p === "O" ? (c: string) => c >= "0" && c <= "7" : p === "b" || p === "B" ? (c: string) => c === "0" || c === "1" : null;
    if (radix !== null) {
      let j = at + 2;
      let reps = 0;
      for (;;) {
        let k = j;
        if (src[k] === "_") k++;
        let d = k;
        while (d < src.length && radix(src[d]!)) d++;
        if (d === k) break;
        j = d;
        reps++;
      }
      if (reps > 0) return { end: j, kind: "int" };
    }
  }
  let i = digits(src, at);
  let float = false;
  if (src[i] === "." && src[i + 1] !== ".") {
    float = true;
    i = digits(src, i + 1);
  }
  const e = src[i];
  if (e === "e" || e === "E") {
    let j = i + 1;
    if (src[j] === "+" || src[j] === "-") j++;
    const after = digits(src, j);
    if (after > j) {
      float = true;
      i = after;
    }
  }
  return { end: i, kind: float ? "float" : "int" };
}

function dotNumberEnd(src: string, at: number): number {
  let i = digits(src, at + 1);
  if (i === at + 1) return -1;
  const e = src[i];
  if (e === "e" || e === "E") {
    let j = i + 1;
    if (src[j] === "+" || src[j] === "-") j++;
    const after = digits(src, j);
    if (after > j) i = after;
  }
  return i;
}

function readDelim(src: string, at: number): { delim: Delim; end: number } | null {
  let i = at;
  let raw = false;
  let name = false;
  let nodePath = false;
  const flag = STR_PREFIX[src[i] ?? ""];
  if (flag !== undefined) {
    if (flag === "raw") raw = true;
    else if (flag === "name") name = true;
    else nodePath = true;
    i++;
  }
  const q = src[i];
  if (q !== '"' && q !== "'") return null;
  const triple = src[i + 1] === q && src[i + 2] === q;
  return { delim: { quote: q, triple, raw, name, nodePath }, end: triple ? i + 3 : i + 1 };
}

/**
 * 把源码切成 raw 记号流：不含 newline / indent / dedent（那是 `./indent` 的活），
 * 但每个记号都带上「它是不是本物理行第一个记号」与「本行的数值缩进」——
 * 缩进按 scanner.c 的口径算数值：空格 +1、tab +8，所以 8 个空格与一个 tab 同级。
 */
export function lex(src: string): LexResult {
  const starts = lineTable(src);
  const tokens: LexTok[] = [];
  const issues: LexIssue[] = [];

  let i = 0;
  let fresh = true;
  let indent = 0;

  const emit = (kind: LexTok["kind"], start: number, end: number): void => {
    const r = rowOf(starts, start);
    tokens.push({
      kind,
      text: src.slice(start, end),
      start,
      end,
      row: r,
      col: start - starts[r]!,
      lineStart: fresh,
      indent,
    });
    fresh = false;
  };
  const fail = (at: number, message: string): void => {
    const r = rowOf(starts, at);
    issues.push({ at, row: r, col: at - starts[r]!, message });
  };

  while (i < src.length) {
    const c = src[i]!;

    if (c === "\n") {
      i++;
      fresh = true;
      indent = 0;
      continue;
    }
    if (c === "\\" && (src[i + 1] === "\n" || (src[i + 1] === "\r" && src[i + 2] === "\n"))) {
      const end = src[i + 1] === "\r" ? i + 3 : i + 2;
      emit("cont", i, end);
      i = end;
      indent = 0;
      continue;
    }
    if (c === " ") {
      if (fresh) indent++;
      i++;
      continue;
    }
    if (c === "\t") {
      if (fresh) indent += TAB_WIDTH;
      i++;
      continue;
    }
    if (c === "\r" || c === "\f") {
      if (fresh) indent = 0;
      i++;
      continue;
    }
    if (ZERO_WIDTH.has(c)) {
      i++;
      continue;
    }

    if (c === "#") {
      let j = i;
      while (j < src.length && src[j] !== "\n") j++;
      const whole = src.slice(i, j);
      if (whole.startsWith("#endregion")) emit("region-end", i, j);
      else if (whole.startsWith("#region")) {
        emit("region-start", i, i + 7);
        if (j > i + 7) emit("region-label", i + 7, j);
      } else emit("comment", i, j);
      i = j;
      continue;
    }

    const delim = readDelim(src, i);
    if (delim !== null) {
      i = lexString(src, delim, i, emit, fail);
      continue;
    }

    if (isIdentStart(c)) {
      let j = i + 1;
      while (j < src.length && isIdentPart(src[j]!)) j++;
      emit("ident", i, j);
      i = j;
      continue;
    }

    if (isDigit(c)) {
      const n = numberEnd(src, i);
      emit(n.kind, i, n.end);
      i = n.end;
      continue;
    }

    if (c === ".") {
      const d = dotNumberEnd(src, i);
      if (d > 0) {
        emit("float", i, d);
        i = d;
        continue;
      }
    }

    const punct = PUNCT.find((p) => src.startsWith(p, i));
    if (punct !== undefined) {
      emit("punct", i, i + punct.length);
      i += punct.length;
      continue;
    }

    fail(i, `无法识别的字符 ${JSON.stringify(c)}`);
    i++;
    fresh = false;
  }

  const eofRow = rowOf(starts, src.length);
  tokens.push({
    kind: "eof",
    text: "",
    start: src.length,
    end: src.length,
    row: eofRow,
    col: src.length - starts[eofRow]!,
    lineStart: fresh,
    indent,
  });
  return { tokens, issues };
}

function lexString(
  src: string,
  read: { delim: Delim; end: number },
  from: number,
  emit: (kind: LexTok["kind"], start: number, end: number) => void,
  fail: (at: number, message: string) => void,
): number {
  const { delim } = read;
  emit("str-start", from, read.end);
  let i = read.end;
  const q = delim.quote;
  while (i < src.length) {
    const c = src[i]!;
    if (c === "\\" && !delim.raw) {
      const end = escapeEnd(src, i);
      if (end < 0) {
        fail(i, `字符串里的转义 \\${src[i + 1] ?? ""} 不合法`);
        i++;
        continue;
      }
      emit("escape", i, end);
      i = end;
      continue;
    }
    if (c === "\\" && delim.raw) {
      const n = src[i + 1];
      i += n === q || n === "\\" ? 2 : 1;
      continue;
    }
    if (c === q) {
      if (!delim.triple) {
        emit("str-end", i, i + 1);
        return i + 1;
      }
      if (src[i + 1] === q && src[i + 2] === q) {
        emit("str-end", i, i + 3);
        return i + 3;
      }
      i++;
      continue;
    }
    i++;
  }
  fail(from, "字符串没有闭合");
  return i;
}
