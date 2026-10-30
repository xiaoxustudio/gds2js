import { GodotRuntimeError, UnsupportedError } from "./errors";
import { hexUpper, strToFloat } from "./numstr";
import { Tag, tagName, V, intToBig, type IntPayload, type Variant } from "./tags";
import { CASE_LOWER_FIX, CASE_UPPER_FIX } from "./case-table";
import { gdIsDigit, gdIsLower, gdIsSep, gdIsUpper } from "./case-flags";
import { asVec2 } from "./vector2";
import { asVec3 } from "./vector3";
import { asVec4 } from "./vector4";
import { asVec2i } from "./vector2i";
import { asAABB, asBasis, asPlane, asQuaternion, asRect2, asRect2i, asTransform2D, asTransform3D } from "./composite-classes";
import { asVec3i } from "./vector3i";
import { asVec4i } from "./vector4i";
import { asColor } from "./color";
import { GBytes, packTypeName, utf8Decode } from "./packed";
import { isUnicodeIdContinue, isUnicodeIdStart } from "./unicode-identifier";
import { isCallable } from "./callable";
import { asRid } from "./rid";
import { asNodePath, nodePathText } from "./node-path";
import { findLower, findUpper } from "./ucaps";

import { strFloat } from "./numfmt";

export function posOobSay(key: string, base: string | undefined, valueType: string): string {
  return base === undefined
    ? `Invalid access of index '${key}' on a base object of type: '${valueType}'.`
    : `Out of bounds get index '${key}' (on base: '${base}')`;
}

export function codepoints(s: string): string[] {
  const out: string[] = [];
  for (const ch of s) out.push(ch);
  return out;
}

export function strLength(s: string): number {
  return codepoints(s).length;
}

export function strAt(s: string, i: number, base?: string): string {
  const chars = codepoints(s);
  const c = chars[i];
  if (c === undefined) {
    throw new GodotRuntimeError("string-index", posOobSay(String(i), base, "String"));
  }
  return c;
}

export function strSubstr(s: string, from: number, len = -1): string {
  const chars = codepoints(s);
  if (from < 0 || from >= chars.length) return "";
  return (len < 0 ? chars.slice(from) : chars.slice(from, from + len)).join("");
}

export function strEdge(s: string, n: number, side: "left" | "right"): string {
  const len = strLength(s);
  const k = n < 0 ? len + n : n;
  if (k <= 0) return "";
  if (k >= len) return s;
  const chars = codepoints(s);
  return (side === "left" ? chars.slice(0, k) : chars.slice(len - k)).join("");
}

export function strContains(hay: string, needle: string): boolean {
  return needle !== "" && hay.includes(needle);
}

export function strSplitCapped(s: string, delim: string, allowEmpty: boolean, maxSplit: number): string[] {
  const sepLen = delim.length;
  const cuts: number[] = [];
  if (sepLen === 0) {
    const chars = [...s];
    let at = 0;
    for (let i = 0; i < chars.length - 1; i++) {
      at += (chars[i] as string).length;
      cuts.push(at);
    }
  } else {
    for (let i = 0; i + sepLen <= s.length; ) {
      if (s.startsWith(delim, i)) {
        cuts.push(i);
        i += sepLen;
      } else i += 1;
    }
  }
  const out: string[] = [];
  let readFrom = 0;
  let count = 0;
  let pi = 0;
  while (pi < cuts.length && count < maxSplit) {
    let p = cuts[pi] as number;
    if (!allowEmpty) {
      while (p === readFrom) {
        readFrom = p + sepLen;
        pi++;
        if (pi >= cuts.length) {
          p = -1;
          break;
        }
        p = cuts[pi] as number;
      }
      if (p === -1) break;
    }
    count++;
    out.push(s.slice(readFrom, p));
    readFrom = p + sepLen;
    pi++;
  }
  if (!allowEmpty) {
    while (sepLen > 0 && readFrom < s.length && s.startsWith(delim, readFrom)) readFrom += sepLen;
  }
  const tail = s.slice(readFrom);
  if (allowEmpty || tail !== "") out.push(tail);
  return out;
}

export function strSplit(s: string, delim: string, allowEmpty: boolean): string[] {
  let parts: string[];
  if (delim === "") {
    const chars = [...s];
    parts = chars.length === 0 ? [""] : chars;
  } else if (/[\uD800-\uDFFF]/.test(s) || /[\uD800-\uDFFF]/.test(delim)) {
    const chars = [...s];
    const dchars = [...delim];
    parts = [];
    let cur = "";
    let i = 0;
    while (i < chars.length) {
      if (i + dchars.length <= chars.length && dchars.every((c, j) => chars[i + j] === c)) {
        parts.push(cur);
        cur = "";
        i += dchars.length;
      } else {
        cur += chars[i];
        i++;
      }
    }
    parts.push(cur);
  } else {
    parts = s.split(delim);
  }
  return allowEmpty ? parts : parts.filter((p) => p !== "");
}

export function strCmp(x: string, y: string): number {
  if (!/[\uD800-\uDFFF]/.test(x) && !/[\uD800-\uDFFF]/.test(y)) {
    return x === y ? 0 : x < y ? -1 : 1;
  }
  const xa = [...x];
  const ya = [...y];
  const n = Math.min(xa.length, ya.length);
  for (let i = 0; i < n; i++) {
    const cx = xa[i]!.codePointAt(0)!;
    const cy = ya[i]!.codePointAt(0)!;
    if (cx !== cy) return cx < cy ? -1 : 1;
  }
  if (xa.length === ya.length) return 0;
  return xa.length < ya.length ? -1 : 1;
}

export function strCase(s: string, dir: "upper" | "lower"): string {
  const table = dir === "upper" ? CASE_UPPER_FIX : CASE_LOWER_FIX;
  const out: string[] = [];
  for (const ch of s) {
    const fixed = table[ch];
    if (fixed !== undefined) {
      out.push(fixed);
      continue;
    }
    const mapped = dir === "upper" ? ch.toUpperCase() : ch.toLowerCase();
    if ([...mapped].length === 1) {
      out.push(mapped);
      continue;
    }
    throw new UnsupportedError(
      "case-mapping",
      `to_${dir === "upper" ? "upper" : "lower"}：字符 ${ch}（U+${hexUpper(ch.codePointAt(0) ?? 0)}）的 Godot 简单映射没有实测数据（JS 给 "${mapped}"，Godot 只会给单码点）。` +
        `重跑 tools/case-probe.mjs + tools/golden.mjs 000-probe-cs + tools/case-table.mjs 生成表格`,
    );
  }
  return out.join("");
}

export function lowerOne(ch: string): string {
  return String.fromCodePoint(findLower(ch.codePointAt(0) as number));
}

export function matchAt(chars: string[], at: number, needle: string[], insensitive: boolean): boolean {
  if (at + needle.length > chars.length) return false;
  for (let j = 0; j < needle.length; j++) {
    const a = chars[at + j] as string;
    const b = needle[j] as string;
    if (a === b) continue;
    if (insensitive && lowerOne(a) === lowerOne(b)) continue;
    return false;
  }
  return true;
}

export function strReplace(hay: string, what: string, by: string, insensitive = false): string {
  if (what === "") return hay;
  const chars = [...hay];
  const needle = [...what];
  const out: string[] = [];
  let i = 0;
  while (i < chars.length) {
    if (matchAt(chars, i, needle, insensitive)) {
      out.push(by);
      i += needle.length;
    } else {
      out.push(chars[i] as string);
      i += 1;
    }
  }
  return out.join("");
}

export function strReplaceChar(s: string, key: number, withCp: number): string {
  if (key === 0 || withCp === 0) return s;
  const by = String.fromCodePoint(withCp);
  let out = "";
  for (const ch of s) out += (ch.codePointAt(0) as number) === key ? by : ch;
  return out;
}

export function strReplaceChars(s: string, keys: string, withCp: number): string {
  if (withCp === 0) return s;
  const set = codepointSet(keys);
  if (set.size === 0) return s;
  const by = String.fromCodePoint(withCp);
  let out = "";
  for (const ch of s) out += set.has(ch.codePointAt(0) as number) ? by : ch;
  return out;
}

export function strRemoveChar(s: string, what: number): string {
  if (what === 0) return s;
  let out = "";
  for (const ch of s) if ((ch.codePointAt(0) as number) !== what) out += ch;
  return out;
}

export function strRemoveChars(s: string, chars: string): string {
  const set = codepointSet(chars);
  if (set.size === 0) return s;
  let out = "";
  for (const ch of s) if (!set.has(ch.codePointAt(0) as number)) out += ch;
  return out;
}

export function strReverse(s: string): string {
  const cs = Array.from(s);
  cs.reverse();
  return cs.join("");
}

export function strBigramsList(s: string): string[] {
  const cs = Array.from(s);
  const out: string[] = [];
  for (let i = 0; i + 1 < cs.length; i++) out.push((cs[i] as string) + (cs[i + 1] as string));
  return out;
}

export function strSliceCount(s: string, delim: string): number {
  if (s.length === 0 || delim.length === 0) return 0;
  let pos = 0;
  let n = 1;
  for (;;) {
    const at = s.indexOf(delim, pos);
    if (at < 0) return n;
    n += 1;
    pos = at + delim.length;
  }
}

export function strRsplit(s: string, delim: string, allowEmpty: boolean, maxsplit: number): string[] {
  const out: string[] = [];
  const chars = delim.length === 0 ? Array.from(s) : null;
  if (chars !== null) {
    let remaining = chars.length;
    for (;;) {
      if (maxsplit > 0 && maxsplit === out.length) {
        if (allowEmpty || remaining > 0) out.push(chars.slice(0, remaining).join(""));
        break;
      }
      let left = remaining - 1;
      if (left === 0) left -= 1;
      if (left < 0) {
        out.push(chars.slice(0, remaining).join(""));
        break;
      }
      const start = left;
      if (allowEmpty || start < remaining) out.push(chars.slice(start, remaining).join(""));
      remaining = left;
    }
    out.reverse();
    return out;
  }
  let remaining = s.length;
  for (;;) {
    if (remaining < delim.length || (maxsplit > 0 && maxsplit === out.length)) {
      if (allowEmpty || remaining > 0) out.push(s.slice(0, remaining));
      break;
    }
    const left = s.lastIndexOf(delim, remaining - delim.length);
    if (left < 0) {
      out.push(s.slice(0, remaining));
      break;
    }
    const start = left + delim.length;
    if (allowEmpty || start < remaining) out.push(s.slice(start, remaining));
    remaining = left;
  }
  out.reverse();
  return out;
}

export function strSplitFloats(s: string, delim: string, allowEmpty: boolean): number[] {
  const out: number[] = [];
  if (s.length === 0) return out;
  if (delim.length === 0) {
    out.push(strToFloat(s));
    return out;
  }
  let from = 0;
  for (;;) {
    let end = s.indexOf(delim, from);
    if (end < 0) end = s.length;
    if (allowEmpty || end > from) out.push(strToFloat(s.slice(from, end)));
    if (end === s.length) break;
    from = end + delim.length;
  }
  return out;
}

export function strLpad(s: string, minLength: number, character: string): string {
  const pad = minLength - strLength(s);
  return pad > 0 ? repeatCp(character, pad) + s : s;
}

export function strRpad(s: string, minLength: number, character: string): string {
  const pad = minLength - strLength(s);
  return pad > 0 ? s + repeatCp(character, pad) : s;
}

export function repeatCp(s: string, n: number): string {
  const cs = Array.from(s);
  let out = "";
  for (let i = 0; i < n; i++) for (const c of cs) out += c;
  return out;
}

export function strPadDecimals(s: string, digits: number): string {
  let t = s;
  let c = t.indexOf(".");
  if (c === -1) {
    if (digits <= 0) return t;
    t += ".";
    c = t.length - 1;
  } else if (digits <= 0) {
    return t.slice(0, c);
  }
  if (t.length - (c + 1) > digits) return t.slice(0, c + digits + 1);
  return t + "0".repeat(digits - t.length + (c + 1));
}

export function strTrimPrefix(s: string, prefix: string): string {
  return s.startsWith(prefix) ? s.slice(prefix.length) : s;
}

export function strTrimSuffix(s: string, suffix: string): string {
  return s.endsWith(suffix) ? s.slice(0, s.length - suffix.length) : s;
}

export function strStripEscapes(s: string): string {
  let out = "";
  for (const ch of s) if ((ch.codePointAt(0) as number) >= 32) out += ch;
  return out;
}

export function strCUnescape(s: string): string {
  const pairs: [string, string][] = [["\\a", "\u0007"], ["\\b", "\b"], ["\\f", "\f"], ["\\n", "\n"], ["\\r", "\r"], ["\\t", "\t"], ["\\v", "\v"], ["\\'", "'"], ["\\\"", "\""], ["\\\\", "\\"]];
  let out = s;
  for (const [from, to] of pairs) out = out.split(from).join(to);
  return out;
}

export function strJsonEscape(s: string): string {
  let out = s.split("\\").join("\\\\");
  const pairs: [string, string][] = [["\b", "\\b"], ["\f", "\\f"], ["\n", "\\n"], ["\r", "\\r"], ["\t", "\\t"], ["\v", "\\v"]];
  for (const [from, to] of pairs) out = out.split(from).join(to);
  return out.split("\"").join("\\\"");
}

export function strXmlEscape(s: string, quotes: boolean): string {
  let out = s.split("&").join("&amp;").split("<").join("&lt;").split(">").join("&gt;");
  if (quotes) out = out.split("'").join("&apos;").split("\"").join("&quot;");
  return out;
}

export function strIndent(s: string, prefix: string): string {
  const cs = Array.from(s);
  let out = "";
  let lineStart = 0;
  for (let i = 0; i < cs.length; i++) {
    if (cs[i] === "\n") {
      if (i === lineStart) out += "\n";
      else out += prefix + cs.slice(lineStart, i + 1).join("");
      lineStart = i + 1;
    }
  }
  if (lineStart !== cs.length) out += prefix + cs.slice(lineStart).join("");
  return out;
}

export function strDedent(s: string): string {
  const cs = Array.from(s);
  let out = "";
  let indent = "";
  let hasIndent = false;
  let hasText = false;
  let lineStart = 0;
  let indentStop = -1;
  for (let i = 0; i < cs.length; i++) {
    const c = cs[i] as string;
    if (c === "\n") {
      if (hasText) out += cs.slice(indentStop, i).join("");
      out += "\n";
      hasText = false;
      lineStart = i + 1;
      indentStop = -1;
    } else if (!hasText) {
      if ((c.codePointAt(0) as number) > 32) {
        hasText = true;
        if (!hasIndent) {
          hasIndent = true;
          indent = cs.slice(lineStart, i).join("");
          indentStop = i;
        }
      }
      if (hasIndent && indentStop < 0) {
        const j = i - lineStart;
        if (j >= indent.length || c !== indent[j]) indentStop = i;
      }
    }
  }
  if (hasText) out += cs.slice(indentStop).join("");
  return out;
}

export const INVALID_FILENAME_CHARS = [":", "/", "\\", "?", "*", "\"", "|", "%", "<", ">"];

export const INVALID_NODE_NAME_CHARS = [".", ":", "@", "/", "\""];

export function strValidateFilename(s: string): string {
  let out = strStripEdges(s);
  for (const ch of INVALID_FILENAME_CHARS) out = out.split(ch).join("_");
  return out;
}

export function strValidateNodeName(s: string): string {
  let out = s;
  for (const ch of INVALID_NODE_NAME_CHARS) out = out.split(ch).join("_");
  return out;
}

export function strWildcardMatch(s: string, wildcard: string): boolean {
  if (wildcard.length === 0 || s.length === 0) return false;
  const p = Array.from(wildcard);
  const t = Array.from(s);
  const walk = (pi: number, ti: number): boolean => {
    const pc = p[pi];
    if (pc === undefined) return ti === t.length;
    if (pc === "*") return walk(pi + 1, ti) || (ti < t.length && walk(pi, ti + 1));
    if (pc === "?") return ti < t.length && t[ti] !== "." && walk(pi + 1, ti + 1);
    return ti < t.length && t[ti] === pc && walk(pi + 1, ti + 1);
  };
  return walk(0, 0);
}

export function strNoCaseCmp(a: string, b: string): number {
  const x = Array.from(a);
  const y = Array.from(b);
  const n = Math.min(x.length, y.length);
  for (let i = 0; i < n; i++) {
    const ca = findUpper((x[i] as string).codePointAt(0) as number);
    const cb = findUpper((y[i] as string).codePointAt(0) as number);
    if (ca < cb) return -1;
    if (ca > cb) return 1;
  }
  return x.length === y.length ? 0 : x.length < y.length ? -1 : 1;
}

export function isDigitCp(ch: string): boolean {
  const c = ch.codePointAt(0) as number;
  return c >= 0x30 && c <= 0x39;
}

export function naturalCmpBase(x: string[], y: string[], i0: number, j0: number, insensitive: boolean): number {
  let i = i0;
  let j = j0;
  while (x[i] === "." || y[j] === ".") {
    const xc = x[i];
    i += 1;
    if (xc !== ".") return 1;
    const yc = y[j];
    j += 1;
    if (yc !== ".") return -1;
    if (y[j] === undefined) return 1;
    if (x[i] === undefined) return -1;
  }
  while (i < x.length) {
    if (j >= y.length) return 1;
    const cx = x[i] as string;
    const cy = y[j] as string;
    if (isDigitCp(cx)) {
      if (!isDigitCp(cy)) return -1;
      let xi = i;
      let yj = j;
      while (xi < x.length && isDigitCp(x[xi] as string)) xi++;
      while (yj < y.length && isDigitCp(y[yj] as string)) yj++;
      let xa = i;
      let yb = j;
      while (x[xa] === "0") xa++;
      while (y[yb] === "0") yb++;
      const lx = xi - xa;
      const ly = yj - yb;
      if (lx < ly) return -1;
      if (lx > ly) return 1;
      while (xa < xi && yb < yj) {
        const dx = (x[xa] as string).codePointAt(0) as number;
        const dy = (y[yb] as string).codePointAt(0) as number;
        if (dx < dy) return -1;
        if (dx > dy) return 1;
        xa++;
        yb++;
      }
      i = xi;
      j = yj;
    } else if (isDigitCp(cy)) {
      return 1;
    } else {
      const ux = insensitive ? findUpper(cx.codePointAt(0) as number) : (cx.codePointAt(0) as number);
      const uy = insensitive ? findUpper(cy.codePointAt(0) as number) : (cy.codePointAt(0) as number);
      if (ux < uy) return -1;
      if (ux > uy) return 1;
      i++;
      j++;
    }
  }
  return j < y.length ? -1 : 0;
}

export function strNaturalCaseCmp(a: string, b: string): number {
  return naturalCmpBase(Array.from(a), Array.from(b), 0, 0, false);
}

export function strNaturalNoCaseCmp(a: string, b: string): number {
  return naturalCmpBase(Array.from(a), Array.from(b), 0, 0, true);
}

export function fileCmpCommon(x: string[], y: string[]): [number, number, number] {
  let i = 0;
  let j = 0;
  while ((x[i] === "_" && y[j] !== undefined) || (x[i] !== undefined && y[j] === "_")) {
    if (x[i] !== "_") return [x[i] === "." ? -1 : 1, i, j];
    if (y[j] !== "_") return [y[j] === "." ? 1 : -1, i, j];
    i++;
    j++;
  }
  return [0, i, j];
}

export function strFileCaseCmp(a: string, b: string): number {
  const x = Array.from(a);
  const y = Array.from(b);
  const [r, i, j] = fileCmpCommon(x, y);
  return r !== 0 ? r : naturalCmpBase(x, y, i, j, false);
}

export function strFileNoCaseCmp(a: string, b: string): number {
  const x = Array.from(a);
  const y = Array.from(b);
  const [r, i, j] = fileCmpCommon(x, y);
  return r !== 0 ? r : naturalCmpBase(x, y, i, j, true);
}

export function strContainsN(s: string, needle: string): boolean {
  return strFind(s, needle, 0, false, true) !== -1;
}

export function strWildcardMatchN(s: string, wildcard: string): boolean {
  if (wildcard.length === 0 || s.length === 0) return false;
  const p = Array.from(wildcard);
  const t = Array.from(s);
  const walk = (pi: number, ti: number): boolean => {
    const pc = p[pi];
    if (pc === undefined) return ti === t.length;
    if (pc === "*") return walk(pi + 1, ti) || (ti < t.length && walk(pi, ti + 1));
    if (pc === "?") return ti < t.length && t[ti] !== "." && walk(pi + 1, ti + 1);
    return ti < t.length && findUpper((t[ti] as string).codePointAt(0) as number) === findUpper(pc.codePointAt(0) as number) && walk(pi + 1, ti + 1);
  };
  return walk(0, 0);
}

export function strIsSubsequenceOf(s: string, target: string, insensitive: boolean): boolean {
  const src = Array.from(s);
  if (src.length === 0) return true;
  const tgt = Array.from(target);
  if (src.length > tgt.length) return false;
  let i = 0;
  for (let j = 0; j < tgt.length && i < src.length; j++) {
    const a = (src[i] as string).codePointAt(0) as number;
    const b = (tgt[j] as string).codePointAt(0) as number;
    if (insensitive ? findLower(a) === findLower(b) : a === b) i++;
  }
  return i === src.length;
}

export function strLstrip(s: string, chars: string): string {
  const cs = Array.from(s);
  let i = 0;
  while (i < cs.length && chars.includes(cs[i] as string)) i++;
  return cs.slice(i).join("");
}

export function strRstrip(s: string, chars: string): string {
  const cs = Array.from(s);
  let i = cs.length - 1;
  while (i >= 0 && chars.includes(cs[i] as string)) i--;
  return cs.slice(0, i + 1).join("");
}

export function strPascalCase(s: string): string {
  const words = strStripEdges(separateCompoundWords(s));
  const parts = words.split(" ");
  let out = "";
  for (const part of parts) {
    if (part.length === 0) continue;
    const cs = Array.from(part);
    out += String.fromCodePoint(findUpper((cs[0] as string).codePointAt(0) as number)) + cs.slice(1).join("");
  }
  return out;
}

export function strXmlUnescape(s: string): string {
  const named: [string, string][] = [["&amp;", "&"], ["&lt;", "<"], ["&gt;", ">"], ["&quot;", "\""], ["&apos;", "'"]];
  let out = "";
  let i = 0;
  while (i < s.length) {
    if (s[i] !== "&") {
      out += s[i];
      i += 1;
      continue;
    }
    let hit = false;
    for (const [from, to] of named) {
      if (s.startsWith(from, i)) {
        out += to;
        i += from.length;
        hit = true;
        break;
      }
    }
    if (hit) continue;
    const rest = s.slice(i);
    const dec = /^&#([0-9]+);/.exec(rest);
    const hex = dec === null ? /^&#x([0-9a-fA-F]+);/.exec(rest) : null;
    if (dec !== null || hex !== null) {
      const cp = dec !== null ? Number(dec[1]) : parseInt(hex?.[1] as string, 16);
      const len = (dec ?? hex)?.[0].length as number;
      if (cp > 0 && cp <= 0x10ffff && !(cp >= 0xd800 && cp <= 0xdfff)) {
        out += String.fromCodePoint(cp);
        i += len;
        continue;
      }
    }
    out += "&";
    i += 1;
  }
  return out;
}

export function strIsValidHtmlColor(s: string): boolean {
  if (s.length === 0) return false;
  const start = s[0] === "#" ? 1 : 0;
  const n = s.length - start;
  if (!(n === 3 || n === 4 || n === 6 || n === 8)) return false;
  for (let i = start; i < s.length; i++) {
    const c = (s[i] as string).codePointAt(0) as number;
    const ok = (c >= 0x30 && c <= 0x39) || (c >= 0x41 && c <= 0x46) || (c >= 0x61 && c <= 0x66);
    if (!ok) return false;
  }
  return true;
}

export function parseIpv4(s: string, start: number): boolean {
  let cur = 0;
  let next = 0;
  let parsed = false;
  for (let i = start; i < s.length; i++) {
    const c = s[i] as string;
    if (c === ".") {
      if (!parsed) return false;
      parsed = false;
      next = 0;
      cur++;
      if (cur > 3) return false;
    } else if (c >= "0" && c <= "9") {
      parsed = true;
      next = next * 10 + (c.charCodeAt(0) - 48);
      if (next > 255) return false;
    } else {
      return false;
    }
  }
  return parsed && cur === 3;
}

export function bswap16(x: number): number {
  return ((x & 0xff) << 8) | (x >> 8);
}

export function parseIpv6(s: string): boolean {
  const len = s.length;
  const buf = Array.from(s);
  const field = new Uint16Array(8);
  let cur = 0;
  let shift = -1;
  for (let i = 0; i < len; i++) {
    for (let j = i; j < len; j++) {
      const c = buf[j] as string;
      if (c === ":") {
        if (j + 1 === len) return false;
        if (buf[j + 1] === ":") {
          if (shift > -1) return false;
          if (j === 0) shift = cur;
          else shift = cur + 1;
          j++;
        } else if (i === j) {
          return false;
        }
        i = j;
        break;
      }
      if (j - i > 3) return false;
      if (c >= "0" && c <= "9") field[cur] = ((field[cur] as number) << 4) | (c.charCodeAt(0) - 48);
      else if (c >= "a" && c <= "f") field[cur] = ((field[cur] as number) << 4) | (10 + c.charCodeAt(0) - 97);
      else if (c >= "A" && c <= "F") field[cur] = ((field[cur] as number) << 4) | (10 + c.charCodeAt(0) - 65);
      else if (c === ".") {
        if (cur < 1 || field[cur - 1] !== 0xffff) return false;
        if (shift < 0 && cur !== 6) return false;
        field[cur] = 0;
        field[cur - 1] = 0;
        while (cur > 0) {
          cur--;
          if (field[cur] !== 0) return false;
        }
        field[5] = 0xffff;
        return parseIpv4(s.slice(i), 0);
      } else {
        return false;
      }
      if (j + 1 === len) i = j;
    }
    field[cur] = bswap16(field[cur] as number);
    cur++;
    if (cur > 8 || (cur === 8 && i + 1 !== len)) return false;
  }
  if (shift < 0) return cur === 8;
  if (shift > 7) return false;
  return true;
}

export function strIsValidIpAddress(s: string): boolean {
  if (s.length < 40 && s.includes(":")) return parseIpv6(s);
  if (s.length < 16) return parseIpv4(s, 0);
  return false;
}

export function strIsAbsolutePath(s: string): boolean {
  if (s.length > 1) return s[0] === "/" || s[0] === "\\" || s.includes(":/") || s.includes(":\\");
  if (s.length === 1) return s[0] === "/" || s[0] === "\\";
  return false;
}

export function strIsRelativePath(s: string): boolean {
  return !strIsAbsolutePath(s);
}

export function lastSep(s: string): number {
  return Math.max(s.lastIndexOf("/"), s.lastIndexOf("\\"));
}

export function strGetFile(s: string): string {
  const sep = lastSep(s);
  return sep === -1 ? s : s.slice(sep + 1);
}

export function strGetExtension(s: string): string {
  const pos = s.lastIndexOf(".");
  if (pos < 0 || pos < lastSep(s)) return "";
  return s.slice(pos + 1);
}

export function strGetBasename(s: string): string {
  const pos = s.lastIndexOf(".");
  if (pos < 0 || pos < lastSep(s)) return s;
  return s.slice(0, pos);
}

export function strPathJoin(s: string, file: string): string {
  if (s.length === 0) return file;
  if (s[s.length - 1] === "/" || (file.length > 0 && file[0] === "/")) return s + file;
  return s + "/" + file;
}

export function strGetBaseDir(s: string): string {
  let end = 0;
  const scheme = s.indexOf("://");
  if (scheme !== -1) end = scheme + 3;
  if (end === 0) {
    const drivePos = s.indexOf(":/") !== -1 ? s.indexOf(":/") : s.indexOf(":\\");
    if (drivePos !== -1) end = drivePos + 2;
  }
  if (end === 0 && (s.startsWith("//") || s.startsWith("\\\\"))) {
    let basepos = s.indexOf("/", 2);
    if (basepos === -1) basepos = s.indexOf("\\", 2);
    let servpos = s.indexOf("/", basepos + 1);
    if (servpos === -1) servpos = s.indexOf("\\", basepos + 1);
    if (servpos !== -1) end = servpos + 1;
  }
  if (end === 0 && s.startsWith("/")) end = 1;
  const rs = end !== 0 ? s.slice(end) : s;
  const base = end !== 0 ? s.slice(0, end) : "";
  const sep = lastSep(rs);
  if (sep === -1) return base;
  return base + rs.slice(0, sep);
}

export function strSimplifyPath(input: string): string {
  let s = input;
  let drive = "";
  let found = false;
  const p = s.indexOf("://");
  if (p > 0) {
    let only = true;
    for (let i = 0; i < p; i++) {
      const c = (s[i] as string).codePointAt(0) as number;
      if (!((c >= 0x30 && c <= 0x39) || (c >= 0x41 && c <= 0x5a) || (c >= 0x61 && c <= 0x7a))) {
        only = false;
        break;
      }
    }
    if (only) {
      found = true;
      drive = s.slice(0, p + 3);
      s = s.slice(p + 3);
    }
  }
  if (!found) {
    if (s.startsWith("//") || s.startsWith("\\\\")) {
      drive = s.slice(0, 2);
      s = s.slice(2);
    } else if (s.startsWith("/") || s.startsWith("\\")) {
      drive = s.slice(0, 1);
      s = s.slice(1);
    } else {
      let q = s.indexOf(":/");
      if (q === -1) q = s.indexOf(":\\");
      if (q !== -1 && q < s.indexOf("/")) {
        drive = s.slice(0, q + 2);
        s = s.slice(q + 2);
      }
    }
  }
  s = s.split("\\").join("/");
  while (s.includes("//")) s = s.split("//").join("/");
  const dirs = s.split("/").filter((d) => d !== "");
  const absolute = strIsAbsolutePath(input) && !input.startsWith("res://");
  for (let i = 0; i < dirs.length; i++) {
    const d = dirs[i] as string;
    if (d === ".") {
      dirs.splice(i, 1);
      i -= 1;
    } else if (d === "..") {
      if (i !== 0 && dirs[i - 1] !== "..") {
        dirs.splice(i, 1);
        dirs.splice(i - 1, 1);
        i -= 2;
      } else if (absolute && i === 0) {
        dirs.splice(i, 1);
        i -= 1;
      }
    }
  }
  return drive + dirs.join("/");
}

export function codepointSet(s: string): Set<number> {
  const set = new Set<number>();
  for (const ch of s) set.add(ch.codePointAt(0) as number);
  return set;
}

export function strIsValidUnicodeIdentifier(s: string): boolean {
  const chars = [...s];
  if (chars.length === 0) return false;
  for (let i = 0; i < chars.length; i++) {
    const cp = (chars[i] as string).codePointAt(0) as number;
    if (i === 0 ? !isUnicodeIdStart(cp) : !isUnicodeIdContinue(cp)) return false;
  }
  return true;
}

export function strIsValidAsciiIdentifier(s: string): boolean {
  const chars = [...s];
  if (chars.length === 0) return false;
  for (let i = 0; i < chars.length; i++) {
    const c = (chars[i] as string).codePointAt(0) as number;
    const ok = (c >= 0x61 && c <= 0x7a) || (c >= 0x41 && c <= 0x5a) || c === 0x5f || (i > 0 && c >= 0x30 && c <= 0x39);
    if (!ok) return false;
  }
  return true;
}

export function strFind(hay: string, needle: string, from: number, last: boolean, insensitive = false): number {
  const chars = [...hay];
  const nd = [...needle];
  if (nd.length === 0) return -1;
  const slots = chars.length - nd.length + 1;
  let at = from;
  if (at < 0) {
    at = slots + at;
    if (at < 0) return -1;
  }
  if (!last) {
    for (let i = at; i < slots; i++) if (matchAt(chars, i, nd, insensitive)) return i;
    return -1;
  }
  if (at > slots - 1) return -1;
  for (let i = at; i >= 0; i--) if (matchAt(chars, i, nd, insensitive)) return i;
  return -1;
}

export function stripSpaces(s: string): string {
  let lo = 0;
  let hi = s.length;
  while (lo < hi && s[lo] === " ") lo++;
  while (hi > lo && s[hi - 1] === " ") hi--;
  return s.slice(lo, hi);
}

export function separateCompoundWords(s: string): string {
  const chars = [...s];
  if (chars.length === 0) return s;
  const upper: boolean[] = [];
  const lower: boolean[] = [];
  const digit: boolean[] = [];
  for (const ch of chars) {
    const cp = ch.codePointAt(0) as number;
    upper.push(gdIsUpper(cp));
    lower.push(gdIsLower(cp));
    digit.push(gdIsDigit(cp));
  }
  const pieces: string[] = [];
  let start = 0;
  for (let i = 1; i < chars.length; i++) {
    const nextLower = i + 1 < chars.length && lower[i + 1] === true;
    const condA = lower[i - 1] === true && upper[i] === true;
    const condB = (upper[i - 1] === true || digit[i - 1] === true) && upper[i] === true && nextLower;
    const condC = digit[i - 1] === true && lower[i] === true && nextLower;
    const condD = (upper[i - 1] === true || lower[i - 1] === true) && digit[i] === true;
    if (condA || condB || condC || condD) {
      pieces.push(chars.slice(start, i).join(""), " ");
      start = i;
    }
  }
  pieces.push(chars.slice(start).join(""));
  const folded = [...pieces.join("")]
    .map((ch) => (gdIsSep(ch.codePointAt(0) as number) ? " " : ch))
    .join("");
  return strCase(folded, "lower");
}

export function strCapitalize(s: string): string {
  const words = stripSpaces(separateCompoundWords(s)).split(" ");
  const out: string[] = [];
  for (const w of words) {
    if (w === "") continue;
    out.push(strCase(strAt(w, 0), "upper") + strSubstr(w, 1));
  }
  return out.join(" ");
}

export function strStripEdges(s: string, left = true, right = true): string {
  const cs = codepoints(s);
  const spaceAt = (i: number): boolean => {
    const cp = cs[i]!.codePointAt(0)!;
    return cp > 0 && cp <= 0x20;
  };
  let a = 0;
  let b = cs.length;
  while (left && a < b && spaceAt(a)) a++;
  while (right && b > a && spaceAt(b - 1)) b--;
  return cs.slice(a, b).join("");
}

export function strGetSlice(s: string, delim: string, n: number): string {
  if (n < 0 || delim === "") return "";
  const parts = strSplit(s, delim, true);
  if (parts.length === 1) return s;
  return parts[n] ?? "";
}

export function strPadZeros(s: string, digits: number): string {
  const chars = codepoints(s);
  const found = chars.indexOf(".");
  const end = found === -1 ? chars.length : found;
  if (end === 0) return s;
  let begin = 0;
  while (begin < end) {
    const c = (chars[begin] as string).codePointAt(0)!;
    if (c >= 48 && c <= 57) break;
    begin++;
  }
  const zeros = digits - (end - begin);
  if (zeros <= 0) return s;
  return chars.slice(0, begin).join("") + strRepeat("0", zeros) + chars.slice(begin).join("");
}

export function strGetSlicec(s: string, splitter: number, slice: number): string {
  if (s === "" || slice < 0) return "";
  const chars = codepoints(s);
  let prev = 0;
  let count = 0;
  for (let i = 0; i <= chars.length; i++) {
    const atEnd = i === chars.length;
    const c = atEnd ? 0 : (chars[i] as string).codePointAt(0)!;
    if (atEnd || c === splitter) {
      if (slice === count) return chars.slice(prev, i).join("");
      if (atEnd) return "";
      count++;
      prev = i + 1;
    }
  }
  return "";
}

export function strInsertAt(s: string, pos: number, what: string): string {
  const cs = codepoints(s);
  if (pos < 0) return s;
  const at = pos > cs.length ? cs.length : pos;
  return cs.slice(0, at).join("") + what + cs.slice(at).join("");
}

export function strEraseAt(s: string, pos: number, len: number): string {
  const cs = codepoints(s);
  if (pos < 0) return "";
  if (len <= 0 || pos >= cs.length) return s;
  const end = pos + len > cs.length ? cs.length : pos + len;
  return cs.slice(0, pos).join("") + cs.slice(end).join("");
}

export function strRepeat(s: string, n: number): string {
  if (n <= 0) return "";
  let out = "";
  for (let i = 0; i < n; i++) out += s;
  return out;
}

export function strSimilarity(a: string, b: string): number {
  if (a === b) return 1;
  const ac = codepoints(a);
  const bc = codepoints(b);
  if (ac.length < 2 || bc.length < 2) return 0;
  const src = strBigrams(ac);
  const tgt = strBigrams(bc);
  let inter = 0;
  for (const x of src) {
    if (tgt.includes(x)) inter++;
  }
  return Math.fround((2 * inter) / (src.length + tgt.length));
}

export function strBigrams(chars: string[]): string[] {
  const out: string[] = [];
  for (let i = 0; i + 1 < chars.length; i++) out.push((chars[i] as string) + (chars[i + 1] as string));
  return out;
}

export function strStartsWith(s: string, pre: string): boolean {
  const a = codepoints(s);
  const b = codepoints(pre);
  if (b.length > a.length) return false;
  for (let i = 0; i < b.length; i++) if (a[i] !== b[i]) return false;
  return true;
}

export function strEndsWith(s: string, suf: string): boolean {
  const a = codepoints(s);
  const b = codepoints(suf);
  if (b.length > a.length) return false;
  const off = a.length - b.length;
  for (let i = 0; i < b.length; i++) if (a[off + i] !== b[i]) return false;
  return true;
}

export function strUnicodeAt(s: string, i: number): number {
  const c = codepoints(s)[i];
  if (c === undefined) return 0;
  return c.codePointAt(0) as number;
}

export function strCount(hay: string, needle: string, insensitive = false, from = 0, to = 0): number {
  if (needle === "") return 0;
  const cs = codepoints(hay);
  const step = codepoints(needle).length;
  if (cs.length < step) return 0;
  if (from < 0 || to < 0) return 0;
  const end = to === 0 ? cs.length : Math.min(to, cs.length);
  if (from >= end) return 0;
  const win = cs.slice(from, end).join("");
  let n = 0;
  let at = 0;
  for (;;) {
    const i = strFind(win, needle, at, false, insensitive);
    if (i < 0) break;
    n++;
    at = i + step;
  }
  return n;
}

export const BAD_FILENAME = new Set(["\"", "%", "*", "/", ":", "<", ">", "?", "\\", "|"]);

export function strIsValidFilename(s: string): boolean {
  if (s === "") return false;
  for (const ch of codepoints(s)) if (BAD_FILENAME.has(ch)) return false;
  return true;
}

export const URI_UNRESERVED = /^(?:[A-Za-z0-9]|[-._~])$/;

export function hex2(b: number): string {
  const d = "0123456789ABCDEF";
  return d.charAt(Math.floor(b / 16)) + d.charAt(b % 16);
}

export function strUriEncode(s: string): string {
  const enc = new TextEncoder();
  let out = "";
  for (const ch of codepoints(s)) {
    if (URI_UNRESERVED.test(ch)) out += ch;
    else for (const b of enc.encode(ch)) out += "%" + hex2(b);
  }
  return out;
}

export function strUriDecode(s: string, plusToSpace = true): string {
  const src = Array.from(new TextEncoder().encode(s));
  const res: number[] = [];
  for (let i = 0; i < src.length; i++) {
    const b = src[i] as number;
    if (b === 0x25 && i + 2 < src.length) {
      const o1 = src[i + 1] as number;
      if (!uriHexOk(o1)) {
        res.push(0x25);
      } else {
        const o2 = src[i + 2] as number;
        if (uriHexOk(o2)) {
          const hi = uriHexDigit(o1);
          const lo = uriHexDigit(o2);
          res.push(hi < 0 ? 0 : lo < 0 ? hi : hi * 16 + lo);
          i += 2;
        }
      }
    } else if (b === 0x2b && plusToSpace) {
      res.push(0x20);
    } else {
      res.push(b);
    }
  }
  const nul = res.indexOf(0);
  return utf8Decode(nul === -1 ? res : res.slice(0, nul));
}

export function uriHexDigit(c: number): number {
  if (c >= 0x30 && c <= 0x39) return c - 0x30;
  if (c >= 0x41 && c <= 0x46) return c - 0x41 + 10;
  if (c >= 0x61 && c <= 0x66) return c - 0x61 + 10;
  return -1;
}

export function uriHexOk(c: number): boolean {
  return (c >= 0x30 && c <= 0x39) || (c >= 0x41 && c <= 0x5a);
}

export const C_ESCAPES = new Map<number, string>([
  [7, "\\a"],
  [8, "\\b"],
  [9, "\\t"],
  [10, "\\n"],
  [11, "\\v"],
  [12, "\\f"],
  [13, "\\r"],
  [34, '\\"'],
  [39, "\\'"],
  [92, "\\\\"],
]);

export function strCEscape(s: string): string {
  let out = "";
  for (const ch of codepoints(s)) {
    const e = C_ESCAPES.get(ch.codePointAt(0) as number);
    out += e === undefined ? ch : e;
  }
  return out;
}

export const INT64_MAX_B = 9223372036854775807n;

export function strBinToInt(s: string): bigint {
  const cs = codepoints(s);
  let i = 0;
  let neg = false;
  if (cs[0] === "-") {
    neg = true;
    i = 1;
  }
  if (cs[i] === "0" && (cs[i + 1] === "b" || cs[i + 1] === "B")) i += 2;
  let acc = 0n;
  if (i >= cs.length) return 0n;
  for (; i < cs.length; i++) {
    const c = cs[i];
    if (c !== "0" && c !== "1") return 0n;
    acc = acc * 2n + (c === "1" ? 1n : 0n);
    if (acc > INT64_MAX_B) return INT64_MAX_B;
  }
  return neg ? -acc : acc;
}

export function strCaseStyle(s: string, style: "snake" | "kebab" | "camel"): string {
  const words = stripSpaces(separateCompoundWords(s)).split(" ").filter((w) => w !== "");
  if (style === "camel") {
    let out = "";
    for (let i = 0; i < words.length; i++) {
      const w = words[i] as string;
      out += i === 0 ? strCase(w, "lower") : strCase(strAt(w, 0), "upper") + strSubstr(w, 1);
    }
    return out;
  }
  const joined: string[] = [];
  for (const w of words) joined.push(strCase(w, "lower"));
  return joined.join(style === "snake" ? "_" : "-");
}

export function strColor(n: number): string {
  if (Number.isNaN(n)) return "nan";
  if (!Number.isFinite(n)) return n > 0 ? "inf" : "-inf";
  if (n === 0) return Object.is(n, -0) ? "-0.0" : "0.0";
  if (Number.isInteger(n)) return strFloat(n);
  const t = n.toFixed(4).replace(/0+$/, "");
  return t.endsWith(".") ? `${t}0` : t;
}

/** 引擎给 Plane.D 与 Quaternion 分量的那一形：六位小数、去尾零（`2` / `0.707107`）。 */
export function num6Text(n: number): string {
  if (!Number.isFinite(n)) return strVec2(n);
  if (Number.isInteger(n)) return String(n);
  const s = n.toFixed(6).replace(/0+$/, "");
  return s.endsWith(".") ? s + "0" : s;
}

export function strVec2(n: number): string {
  if (Number.isNaN(n)) return "nan";
  if (!Number.isFinite(n)) return n > 0 ? "inf" : "-inf";
  if (Number.isInteger(n)) return strFloat(n);
  const magnitude = Math.trunc(Math.fround(Math.log10(Math.abs(n))));
  const decimals = Math.max(0, Math.min(6, 6 - magnitude));
  if (decimals === 0) return n.toFixed(0);
  const t = n.toFixed(decimals).replace(/0+$/, "");
  return t.endsWith(".") ? `${t}0` : t;
}

export function intArgBig(v: Variant, who: string): bigint {
  switch (v.t) {
    case Tag.INT:
      return intToBig(v.v as IntPayload);
    case Tag.FLOAT: {
      const n = v.v as number;
      if (!Number.isFinite(n)) {
        throw new GodotRuntimeError("arg-int", `${who} 需要 int，收到非有限浮点 ${strFloat(n)}`);
      }
      return BigInt(Math.trunc(n));
    }
    case Tag.BOOL:
      return v.v ? 1n : 0n;
    default:
      throw new GodotRuntimeError("arg-int", `${who} 需要 int，收到 ${tagName(v.t)}`);
  }
}

export function stringChr(cp: Variant): Variant {
  if (cp.t !== Tag.INT && cp.t !== Tag.FLOAT && cp.t !== Tag.BOOL) {
    throw new GodotRuntimeError("utility-convert", `Invalid type in GDScript utility function "char()". Cannot convert argument 1 from ${valueTypeName(cp)} to int.`);
  }
  const n = intArgBig(cp, "char() 的参数");
  const bad = n <= 0n || n > 0x10ffffn || (n >= 0xd800n && n <= 0xdfff);
  return V.str(String.fromCodePoint(bad ? 0xfffd : Number(n)));
}

export function stringCtor(args: Variant[]): Variant {
  if (args.length !== 1) {
    throw new GodotRuntimeError("string-ctor-arity", `String() 只接受 1 个参数（收到 ${args.length} 个）`);
  }
  const v = args[0] as Variant;
  const np = asNodePath(v);
  if (np !== null) return V.str(nodePathText(np));
  if (v.t !== Tag.STRING && v.t !== Tag.STRING_NAME) {
    throw new GodotRuntimeError("string-ctor", `没有 String(${tagName(v.t)}) 这个构造器（Godot 是 Parse Error）`);
  }
  return V.str(v.v as string);
}

export function stringNameCtor(args: Variant[]): Variant {
  if (args.length !== 1) {
    throw new GodotRuntimeError("string-name-ctor-arity", `StringName() 只接受 1 个参数（收到 ${args.length} 个）`);
  }
  const v = args[0] as Variant;
  if (v.t !== Tag.STRING && v.t !== Tag.STRING_NAME) {
    throw new GodotRuntimeError(
      "string-name-ctor",
      `没有 StringName(${tagName(v.t)}) 这个构造器（Godot 是 Parse Error: No constructor of "StringName" matches the signature）`,
    );
  }
  return V.stringName(v.v as string);
}

export function valueTypeName(x: Variant): string {
  if (x.t === Tag.NIL) return "Nil";
  if (x.t === Tag.OBJECT && x.v instanceof GBytes) return packTypeName(x.v.kind);
  if (asVec2(x) !== null) return "Vector2";
  if (asVec3(x) !== null) return "Vector3";
  if (asVec4(x) !== null) return "Vector4";
  if (asVec2i(x) !== null) return "Vector2i";
  if (asTransform2D(x) !== null) return "Transform2D";
  if (asTransform3D(x) !== null) return "Transform3D";
  if (asQuaternion(x) !== null) return "Quaternion";
  if (asPlane(x) !== null) return "Plane";
  if (asAABB(x) !== null) return "AABB";
  if (asRect2(x) !== null) return "Rect2";
  if (asRect2i(x) !== null) return "Rect2i";
  if (asVec3i(x) !== null) return "Vector3i";
  if (asVec4i(x) !== null) return "Vector4i";
  if (asColor(x) !== null) return "Color";
  if (asRid(x) !== null) return "RID";
  if (asNodePath(x) !== null) return "NodePath";
  if (asBasis(x) !== null) return "Basis";
  if (isCallable(x)) return "Callable";
  return tagName(x.t);
}
