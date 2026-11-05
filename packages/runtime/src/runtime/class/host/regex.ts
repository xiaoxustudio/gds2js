import { UnsupportedError } from "../../errors";
import { NULL_OBJECT } from "../identity/null-object";
import { GdScriptObject } from "../object/script-object";
import { GBytes } from "../bytes/packed";
import { GArray, GDict } from "../../values";
import { Tag, V, intToNum, type Variant } from "../../tags";
import { asString } from "../../method/core";

export class GdRegEx extends GdScriptObject {
  __gd_engine_class__ = "RegEx";
  pattern = "";
  js: RegExp | null = null;
  groupCount = 0;
  names: string[] = [];
  entries: [string, number][] = [];
}

export class GdRegExMatch extends GdScriptObject {
  __gd_engine_class__ = "RegExMatch";
  subject = "";
  starts: number[] = [];
  ends: number[] = [];
  strings: string[] = [];
  entries: [string, number][] = [];
}

export function regExNew(): Variant {
  return V.object(new GdRegEx());
}

export function asRegEx(v: Variant): GdRegEx | null {
  return v.t === Tag.OBJECT && v.v instanceof GdRegEx ? (v.v as GdRegEx) : null;
}

export function asRegExMatch(v: Variant): GdRegExMatch | null {
  return v.t === Tag.OBJECT && v.v instanceof GdRegExMatch ? (v.v as GdRegExMatch) : null;
}

const PATTERNS: readonly string[] = [
  "\\d+",
  "^\\d+$",
  "a.c",
  "[b-d]+",
  "(\\w+)@(\\w+)",
  "a|ab",
  "(?:ab)+",
  "a*",
  "a+",
  "a{2,3}",
  "(?<name>\\w+)-\\k<name>",
  "\\bword\\b",
  "^[0-9]{3}-[0-9]{4}$",
  "[^,]+",
  "\\s+",
  "\\w+",
  "(?i)abc",
  "a(?=b)",
  "(a|b)*",
  "\\.",
  "\\$\\d+",
  "(\\d)(\\w)",
  "$",
  "^",
  "[[:alpha:]]+",
  "a??b",
  "(?<user>\\w+)@(?<host>\\w+)",
  "(?<head>\\w+): (?<tail>\\w+)",
  "(a)?b",
  "\\S+",
  "[\\s]+",
  "[^\\s]+",
];

export const REGEX_PATTERNS: ReadonlySet<string> = new Set(PATTERNS);

function refusePattern(pattern: string, why: string): never {
  throw new UnsupportedError("rx-pattern", `RegEx 的 pattern ${JSON.stringify(pattern)} 不在实测名单里（${why}）：名单只收逐个量过 search / search_all / sub 读数的字面量`);
}

function translate(pattern: string): { source: string; flags: string } {
  let body = pattern;
  let flags = "";
  if (body.startsWith("(?i)")) {
    body = body.slice(4);
    flags = "i";
  }
  if (/\(\?[^:=<]/.test(body) || body.endsWith("(?")) {
    refusePattern(pattern, "分组只量过 ( ) / (?: ) / (?= ) / (?<名> ) 那几形，内联标志只量过开头的 (?i)");
  }
  if (body.includes("[:")) {
    if (!body.includes("[[:alpha:]]")) refusePattern(pattern, "POSIX 字符类只量过 [:alpha:] 那一支");
    body = body.split("[[:alpha:]]").join("[A-Za-z]");
  }
  if (/\\\d/.test(body)) refusePattern(pattern, "数字后向引用 \\1 那一支引擎按 unknown substring 处理，没量过可移植写法");
  return { source: dollarBeforeFinalNewline(translateSpaces(pattern, body)), flags };
}

const ASCII_SPACE = " \\t\\n\\r\\f\\v";

function translateSpaces(pattern: string, body: string): string {
  let out = "";
  let inClass = false;
  for (let i = 0; i < body.length; i++) {
    const ch = body[i] as string;
    if (ch === "\\") {
      const next = body[i + 1] ?? "";
      if (next === "s") {
        out += inClass ? ASCII_SPACE : `[${ASCII_SPACE}]`;
        i += 1;
        continue;
      }
      if (next === "S") {
        if (inClass) refusePattern(pattern, "字符类里的 \\S 那一形没量过");
        out += `[^${ASCII_SPACE}]`;
        i += 1;
        continue;
      }
      out += ch + next;
      i += 1;
      continue;
    }
    if (ch === "[") inClass = true;
    else if (ch === "]") inClass = false;
    out += ch;
  }
  return out;
}

function scanGroups(pattern: string): { count: number; entries: [string, number][] } {
  let count = 0;
  const entries: [string, number][] = [];
  let inClass = false;
  for (let i = 0; i < pattern.length; i++) {
    const ch = pattern[i] as string;
    if (ch === "\\") {
      i += 1;
      continue;
    }
    if (inClass) {
      if (ch === "]") inClass = false;
      continue;
    }
    if (ch === "[") {
      inClass = true;
      continue;
    }
    if (ch !== "(") continue;
    if (pattern[i + 1] !== "?") {
      count += 1;
      continue;
    }
    const named = /^\(\?<([A-Za-z_][A-Za-z0-9_]*)>/.exec(pattern.slice(i));
    if (named !== null) {
      count += 1;
      entries.push([named[1] as string, count]);
      i += named[0].length - 1;
    }
  }
  return { count, entries };
}

export function regexCompile(rx: GdRegEx, pattern: string): number {
  rx.pattern = pattern;
  rx.js = null;
  rx.groupCount = 0;
  rx.names = [];
  rx.entries = [];
  if (!REGEX_PATTERNS.has(pattern)) {
    refusePattern(pattern, "探头语料 000-probe-rx-* 里没有这支");
  }
  const { source, flags } = translate(pattern);
  const { count, entries } = scanGroups(pattern);
  rx.js = new RegExp(source, "gu" + flags);
  rx.groupCount = count;
  rx.entries = entries;
  rx.names = entries.map((e) => e[0]).sort();
  return 0;
}

export function regexIsValid(rx: GdRegEx): boolean {
  return rx.js !== null;
}

export function regexClear(rx: GdRegEx): void {
  rx.js = null;
  rx.groupCount = 0;
  rx.names = [];
  rx.entries = [];
}

export function regexNames(rx: GdRegEx): Variant {
  return V.array(GArray.of(rx.names.map((n) => V.str(n))));
}

function dollarBeforeFinalNewline(body: string): string {
  let out = "";
  let inClass = false;
  for (let i = 0; i < body.length; i++) {
    const ch = body[i] as string;
    if (ch === "\\") {
      out += ch + (body[i + 1] ?? "");
      i += 1;
      continue;
    }
    if (inClass) {
      out += ch;
      if (ch === "]") inClass = false;
      continue;
    }
    if (ch === "[") {
      inClass = true;
      out += ch;
      continue;
    }
    out += ch === "$" ? "(?=\\n?$)" : ch;
  }
  return out;
}

function guardSubject(text: string): void {
  if (/[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/.test(text)) {
    throw new UnsupportedError("rx-subject-encoding", `RegEx 的文本实参里有孤立代理（${JSON.stringify(text.slice(0, 24))}）：引擎在字符串构造时就把它们换成 U+FFFD，这一层没建模`);
  }
}

function cpToUnit(text: string, cp: number): number {
  let unit = 0;
  let count = 0;
  while (count < cp && unit < text.length) {
    const code = text.charCodeAt(unit);
    unit += code >= 0xd800 && code <= 0xdbff && unit + 1 < text.length ? 2 : 1;
    count += 1;
  }
  return unit;
}

function unitToCp(text: string, unit: number): number {
  let count = 0;
  for (let at = 0; at < unit && at < text.length; at++) {
    const code = text.charCodeAt(at);
    if (code >= 0xd800 && code <= 0xdbff && at + 1 < text.length) at += 1;
    count += 1;
  }
  return count;
}

function stepUnit(text: string, unit: number): number {
  const code = text.charCodeAt(unit);
  return unit + (code >= 0xd800 && code <= 0xdbff && unit + 1 < text.length ? 2 : 1);
}

function nullObject(): Variant {
  return V.object(NULL_OBJECT);
}

function buildMatch(rx: GdRegEx, text: string, m: RegExpExecArray): GdRegExMatch {
  const rd = new GdRegExMatch();
  rd.subject = text;
  const whole = m[0] as string;
  rd.strings.push(whole);
  rd.starts.push(unitToCp(text, m.index));
  rd.ends.push(unitToCp(text, m.index + whole.length));
  let cursor = 0;
  for (let g = 1; g <= rx.groupCount; g++) {
    const value = m[g];
    if (value === undefined) {
      rd.strings.push("");
      rd.starts.push(-1);
      rd.ends.push(-1);
      continue;
    }
    const at = value === "" ? cursor : whole.indexOf(value, cursor);
    rd.strings.push(value);
    rd.starts.push(unitToCp(text, m.index + at));
    rd.ends.push(unitToCp(text, m.index + at + value.length));
    cursor = at + value.length;
  }
  rd.entries = [...rx.entries];
  return rd;
}

export function regexSearch(rx: GdRegEx, text: string, from: number): Variant {
  guardSubject(text);
  if (rx.js === null) return nullObject();
  rx.js.lastIndex = cpToUnit(text, from);
  const m = rx.js.exec(text);
  if (m === null) return nullObject();
  if (m.index === rx.js.lastIndex) rx.js.lastIndex = stepUnit(text, m.index);
  return V.object(buildMatch(rx, text, m));
}

export function regexSearchAll(rx: GdRegEx, text: string, from: number): Variant {
  guardSubject(text);
  const items: Variant[] = [];
  if (rx.js === null) return V.array(GArray.of(items));
  rx.js.lastIndex = cpToUnit(text, from);
  for (;;) {
    const m = rx.js.exec(text);
    if (m === null) break;
    items.push(V.object(buildMatch(rx, text, m)));
    if (m.index === rx.js.lastIndex) rx.js.lastIndex = stepUnit(text, m.index);
  }
  return V.array(GArray.of(items));
}

export function matchNames(rd: GdRegExMatch): Variant {
  const d = new GDict();
  for (const [name, slot] of rd.entries) {
    d.set(V.str(name), V.int(slot));
  }
  return V.dict(d);
}

export function matchStrings(rd: GdRegExMatch): Variant {
  return V.object(GBytes.of(rd.strings, "string"));
}

function replacementParts(rx: GdRegEx, by: string): ((m: RegExpExecArray) => string)[] {
  const parts: ((m: RegExpExecArray) => string)[] = [];
  let literal = "";
  const maxGroup = Math.max(rx.groupCount, 1);
  const flush = (): void => {
    if (literal === "") return;
    const fixed = literal;
    literal = "";
    parts.push(() => fixed);
  };
  for (let i = 0; i < by.length; i++) {
    const ch = by[i] as string;
    if (ch === "\\") {
      throw new UnsupportedError("rx-replacement", `RegEx.sub 的替换串 ${JSON.stringify(by)} 里有反斜杠：引擎那一支报 unknown substring，没量过可移植的写法`);
    }
    if (ch !== "$") {
      literal += ch;
      continue;
    }
    const next = by[i + 1];
    if (next === "$") {
      literal += "$";
      i += 1;
      continue;
    }
    flush();
    if (next === undefined) {
      throw new UnsupportedError("rx-replacement", `RegEx.sub 的替换串 ${JSON.stringify(by)} 以 $ 收尾：这一形没量过`);
    }
    if (next === "{") {
      const close = by.indexOf("}", i);
      const name = close < 0 ? "" : by.slice(i + 2, close);
      const slot = rx.entries.find((e) => e[0] === name);
      if (close < 0 || !/^[A-Za-z_][A-Za-z0-9_]*$/.test(name) || slot === undefined) {
        throw new UnsupportedError("rx-replacement", `RegEx.sub 的替换串 ${JSON.stringify(by)} 里的 \\${"${"}…${"}"} 不是实测过的「pattern 里有的名字」那一形`);
      }
      const group = slot[1];
      parts.push((m) => m[group] ?? "");
      i = close;
      continue;
    }
    if (!/\d/.test(next)) {
      throw new UnsupportedError("rx-replacement", `RegEx.sub 的替换串 ${JSON.stringify(by)} 里的 $${next} 没量过（只收 $0..$9、\\${"${"}名${"}"} 与 $$）`);
    }
    let j = i + 1;
    let digits = "";
    while (j < by.length && /\d/.test(by[j] as string)) {
      digits += by[j] as string;
      j += 1;
    }
    const group = Number(digits);
    if (digits.length > 1 || group > maxGroup) {
      throw new UnsupportedError("rx-replacement", `RegEx.sub 的替换串 ${JSON.stringify(by)} 里的 $${digits} 越过实测范围（这支 pattern 最多 ${String(maxGroup)} 组，只量过单个十位组号）`);
    }
    parts.push((m) => m[group] ?? "");
    i = j - 1;
  }
  flush();
  return parts;
}

export function regexSub(rx: GdRegEx, text: string, by: string, count: number, from: number): string {
  guardSubject(text);
  const parts = replacementParts(rx, by);
  if (rx.js === null) return "";
  const fromUnit = cpToUnit(text, from);
  let out = text.slice(0, fromUnit);
  let cursor = fromUnit;
  let done = 0;
  rx.js.lastIndex = fromUnit;
  for (;;) {
    const m = rx.js.exec(text);
    if (m === null) break;
    const start = m.index;
    const end = start + (m[0] as string).length;
    out += text.slice(cursor, start) + parts.map((p) => p(m)).join("");
    cursor = end;
    done += 1;
    if (count <= 0 && done >= 1) break;
    if (start === rx.js.lastIndex) rx.js.lastIndex = stepUnit(text, start);
  }
  return out + text.slice(cursor);
}

function textArg(args: Variant[], at: number, who: string): string {
  const v = args[at] as Variant | undefined;
  if (v === undefined) throw new UnsupportedError("rx-arity", `RegEx.${who}() 的第 ${String(at + 1)} 参没给`);
  if (v.t !== Tag.STRING) throw new UnsupportedError("rx-arg-type", `RegEx.${who}() 的第 ${String(at + 1)} 参只量过 String（收到的是别的东西）`);
  return asString(v, `RegEx.${who}() 的第 ${String(at + 1)} 参`);
}

function intArg(args: Variant[], at: number, who: string, dflt: number): number {
  const v = args[at] as Variant | undefined;
  if (v === undefined) return dflt;
  if (v.t !== Tag.INT) throw new UnsupportedError("rx-arg-type", `RegEx.${who}() 的第 ${String(at + 1)} 参只量过 int（收到的是别的东西）`);
  return intToNum(v.v as number | bigint);
}

function tooMany(args: Variant[], max: number, who: string): void {
  if (args.length > max) {
    throw new UnsupportedError("rx-arity", `RegEx.${who}() 只量过前 ${String(max)} 参（收到 ${String(args.length)} 个）`);
  }
}

export function regExMethod(rx0: GdRegEx, name: string, args: Variant[]): Variant {
  switch (name) {
    case "compile": {
      tooMany(args, 1, "compile");
      return V.int(regexCompile(rx0, textArg(args, 0, "compile")));
    }
    case "search": {
      tooMany(args, 2, "search");
      return regexSearch(rx0, textArg(args, 0, "search"), intArg(args, 1, "search", 0));
    }
    case "search_all": {
      tooMany(args, 2, "search_all");
      return regexSearchAll(rx0, textArg(args, 0, "search_all"), intArg(args, 1, "search_all", 0));
    }
    case "sub": {
      tooMany(args, 4, "sub");
      const text = textArg(args, 0, "sub");
      const by = textArg(args, 1, "sub");
      return V.str(regexSub(rx0, text, by, intArg(args, 2, "sub", 0), intArg(args, 3, "sub", 0)));
    }
    case "is_valid":
      tooMany(args, 0, "is_valid");
      return V.bool(regexIsValid(rx0));
    case "get_pattern":
      tooMany(args, 0, "get_pattern");
      return V.str(rx0.pattern);
    case "get_names":
      tooMany(args, 0, "get_names");
      return regexNames(rx0);
    case "get_group_count":
      tooMany(args, 0, "get_group_count");
      return V.int(rx0.groupCount);
    case "clear":
      tooMany(args, 0, "clear");
      regexClear(rx0);
      return V.nil();
    default:
      throw new UnsupportedError("rx-method", `RegEx 实例的 .${name}() 没建模（量过的是 compile / search / search_all / sub / is_valid / get_pattern / get_names / get_group_count / clear；create_from_string 返回新实例，那一支的面没量完）`);
  }
}

export function regExMatchMethod(rd: GdRegExMatch, name: string, args: Variant[]): Variant {
  const who = `RegExMatch.${name}`;
  switch (name) {
    case "get_start":
    case "get_end": {
      tooMany(args, 1, who);
      const group = intArg(args, 0, who, 0);
      const at = name === "get_start" ? rd.starts[group] : rd.ends[group];
      return V.int(at === undefined ? -1 : at);
    }
    case "get_string": {
      tooMany(args, 1, who);
      const group = intArg(args, 0, who, 0);
      return V.str(rd.strings[group] ?? "");
    }
    case "get_strings":
      tooMany(args, 0, who);
      return matchStrings(rd);
    case "get_names":
      tooMany(args, 0, who);
      return matchNames(rd);
    case "get_group_count":
      tooMany(args, 0, who);
      return V.int(rd.strings.length - 1);
    case "get_subject":
      tooMany(args, 0, who);
      return V.str(rd.subject);
    default:
      throw new UnsupportedError("rxm-method", `RegExMatch 的 .${name}() 没建模（量过的是 get_start / get_end / get_string / get_strings / get_names / get_group_count / get_subject；get_named_group 那支引擎里根本不存在）`);
  }
}
