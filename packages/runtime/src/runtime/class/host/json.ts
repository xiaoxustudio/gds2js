import { Tag, V, intToBig, intToNum, tagName, type IntPayload, type Variant } from "../../tags";
import { UnsupportedError } from "../../errors";
import { GdScriptObject } from "../object/script-object";
import { GArray, GDict, show } from "../../values";
import { GBytes, packItems } from "../bytes/packed";
import { strNumDecimals, strSci } from "../../numfmt";
import { asString } from "../../method/core";

export class GdJson extends GdScriptObject {
  __gd_engine_class__ = "JSON";
  __gd_json_data: Variant = V.nil();
  __gd_json_error_line = 0;
  __gd_json_error_message = "";
}

export function jsonNew(): Variant {
  return V.object(new GdJson());
}

export function asJson(v: Variant): GdJson | null {
  return v.t === Tag.OBJECT && v.v instanceof GdJson ? (v.v as GdJson) : null;
}

const ESCAPES: Record<number, string> = {
  8: "\\b",
  9: "\\t",
  10: "\\n",
  11: "\\v",
  12: "\\f",
  13: "\\r",
  34: "\\\"",
  92: "\\\\",
};

function escString(s: string): string {
  let out = "\"";
  for (const ch of s) {
    const code = ch.codePointAt(0) as number;
    const esc = ESCAPES[code];
    out += esc === undefined ? ch : esc;
  }
  return out + "\"";
}

/**
 * 实测到的两支无穷印法：`1e99999` / `-1e99999`，两种模式同形；NaN 没量过。
 * 默认那一支是 15 位有效数字的定点形（尾零裁掉但留一位小数），`full_float` 那一支是科学计数、
 * 没有小数点也没有指数的补 `.0`；`-0.0` 两支都给 `0.0`。
 */
function numJson(x: number, full: boolean): string {
  if (Number.isNaN(x)) throw new UnsupportedError("json-number-nan", "JSON.stringify 遇上 NaN 那一形没量过（引擎的门面里只读到 inf 与 -inf）");
  if (!Number.isFinite(x)) return x > 0 ? "1e99999" : "-1e99999";
  if (x === 0) return "0.0";
  if (!full) {
    const d = Math.floor(Math.log10(Math.abs(x)));
    const fixed = strNumDecimals(x, Math.max(0, Math.min(32, 14 - d)));
    return fixed.includes(".") ? fixed : `${fixed}.0`;
  }
  const sci = strSci(x);
  return sci.includes(".") || sci.includes("e") ? sci : `${sci}.0`;
}

function codepointLess(a: string, b: string): boolean {
  const n = Math.min(a.length, b.length);
  for (let i = 0, j = 0; i < n; i++, j++) {
    const ca = a.codePointAt(i) as number;
    const cb = b.codePointAt(j) as number;
    if (ca !== cb) return ca < cb;
    if (ca > 0xffff) i++;
    if (cb > 0xffff) j++;
  }
  return a.length < b.length;
}

const KEY_RANK: Record<number, number> = {
  [Tag.NIL]: 0,
  [Tag.BOOL]: 1,
  [Tag.INT]: 2,
  [Tag.FLOAT]: 3,
  [Tag.STRING]: 4,
  [Tag.STRING_NAME]: 4,
};

function keyLess(a: Variant, b: Variant): number {
  const ra = KEY_RANK[a.t] ?? 9;
  const rb = KEY_RANK[b.t] ?? 9;
  if (ra !== rb) return ra - rb;
  if (a.t === Tag.BOOL) return (a.v ? 1 : 0) - (b.v ? 1 : 0);
  if (a.t === Tag.INT) {
    const na = BigInt.asIntN(64, intToBig(a.v as IntPayload));
    const nb = BigInt.asIntN(64, intToBig(b.v as IntPayload));
    return na < nb ? -1 : na > nb ? 1 : 0;
  }
  if (a.t === Tag.FLOAT) {
    const fa = a.v as number;
    const fb = b.v as number;
    return fa < fb ? -1 : fa > fb ? 1 : 0;
  }
  if (a.t === Tag.STRING || a.t === Tag.STRING_NAME) return codepointLess(String(a.v), String(b.v)) ? -1 : 1;
  throw new UnsupportedError("json-key-sort", `JSON.stringify 的键排序只量过 null / 布尔 / 数 / 字符串（收到 ${tagName(a.t)}）`);
}

function keyText(k: Variant): string {
  switch (k.t) {
    case Tag.NIL:
      return "<null>";
    case Tag.BOOL:
      return k.v ? "true" : "false";
    case Tag.INT:
      return intToNum(k.v as IntPayload).toFixed(0);
    case Tag.FLOAT:
      return strNumDecimals(k.v as number, 15);
    case Tag.STRING:
    case Tag.STRING_NAME:
      return String(k.v);
    default:
      return show(k);
  }
}

function packAsArray(kind: string): boolean {
  return kind === "string" || kind === "vector2" || kind === "vector3" || kind === "color";
}

interface Writer {
  full: boolean;
  sort: boolean;
  indent: string;
  out: string;
}

function pad(w: Writer, depth: number): string {
  return w.indent === "" ? "" : "\n" + w.indent.repeat(depth);
}

function writeValue(w: Writer, v: Variant, depth: number): void {
  switch (v.t) {
    case Tag.NIL:
      w.out += "null";
      return;
    case Tag.BOOL:
      w.out += v.v ? "true" : "false";
      return;
    case Tag.INT:
      w.out += intToNum(v.v as IntPayload).toFixed(0);
      return;
    case Tag.FLOAT:
      w.out += numJson(v.v as number, w.full);
      return;
    case Tag.STRING:
    case Tag.STRING_NAME:
      w.out += escString(String(v.v));
      return;
    case Tag.ARRAY: {
      const items = (v.v as GArray).raw();
      if (items.length === 0) {
        w.out += "[]";
        return;
      }
      w.out += "[";
      items.forEach((e, i) => {
        if (i > 0) w.out += ",";
        w.out += pad(w, depth + 1);
        writeValue(w, e as Variant, depth + 1);
      });
      w.out += pad(w, depth) + "]";
      return;
    }
    case Tag.DICT: {
      const d = v.v as GDict;
      const keys = [...(d.keys() as Variant[])];
      if (w.sort) keys.sort(keyLess);
      if (keys.length === 0) {
        w.out += "{}";
        return;
      }
      w.out += "{";
      keys.forEach((k, i) => {
        if (i > 0) w.out += ",";
        w.out += pad(w, depth + 1);
        w.out += escString(keyText(k));
        w.out += w.indent === "" ? ":" : ": ";
        writeValue(w, d.get(k) as Variant, depth + 1);
      });
      w.out += pad(w, depth) + "}";
      return;
    }
    case Tag.OBJECT: {
      const packed = v.v instanceof GBytes ? (v.v as GBytes) : null;
      if (packed !== null && packAsArray(packed.kind)) {
        writeValue(w, V.array(GArray.of(packItems(packed))), depth);
        return;
      }
      w.out += escString(show(v));
      return;
    }
    default:
      w.out += escString(show(v));
  }
}

export function jsonStringify(value: Variant, indent: string, sort: boolean, full: boolean): string {
  const w: Writer = { full, sort, indent, out: "" };
  writeValue(w, value, 0);
  return w.out;
}

/**
 * 解析失败那一形整体响亮拒：引擎会打 `ERROR: Parse JSON failed. Error at line N: …` 并让
 * `get_error_message()` 回那句文本，而 json.cpp 那套消息集还没实测完 —— 不猜、不只回 null。
 */
function refuse(at: number): never {
  throw new UnsupportedError(
    "json-parse-failure",
    `JSON 解析失败（第 ${String(at)} 位）那一形没落地：引擎要连 ERROR 块与 get_error_message() 的消息集一起复现，那套文本还没实测`,
  );
}

const STR_ESC: Record<string, string> = { "\"": "\"", "\\": "\\", "/": "/", b: "\b", f: "\f", n: "\n", r: "\r", t: "\t" };

class JsonReader {
  i = 0;
  constructor(readonly s: string) {}

  ws(): void {
    while (this.i < this.s.length) {
      const c = this.s[this.i] as string;
      if (c === " " || c === "\t" || c === "\n" || c === "\r") this.i++;
      else break;
    }
  }

  literal(text: string, v: Variant): Variant {
    if (this.s.startsWith(text, this.i)) {
      this.i += text.length;
      return v;
    }
    return refuse(this.i);
  }

  number(): Variant {
    const start = this.i;
    if (this.s[this.i] === "-") this.i++;
    while (this.i < this.s.length && /[0-9]/.test(this.s[this.i] as string)) this.i++;
    if (this.s[this.i] === ".") {
      this.i++;
      while (this.i < this.s.length && /[0-9]/.test(this.s[this.i] as string)) this.i++;
    }
    const e = this.s[this.i];
    if (e === "e" || e === "E") {
      this.i++;
      const sign = this.s[this.i];
      if (sign === "+" || sign === "-") this.i++;
      while (this.i < this.s.length && /[0-9]/.test(this.s[this.i] as string)) this.i++;
    }
    const text = this.s.slice(start, this.i);
    if (text === "" || text === "-") refuse(start);
    const n = Number(text);
    if (!Number.isFinite(n)) refuse(start);
    return V.float(n);
  }

  string(): string {
    if (this.s[this.i] !== "\"") refuse(this.i);
    this.i++;
    let out = "";
    for (;;) {
      if (this.i >= this.s.length) refuse(this.i);
      const c = this.s[this.i] as string;
      if (c === "\"") {
        this.i++;
        return out;
      }
      if (c !== "\\") {
        out += c;
        this.i++;
        continue;
      }
      this.i++;
      const k = this.s[this.i] as string;
      if (k === "u") {
        const hex = this.s.slice(this.i + 1, this.i + 5);
        if (!/^[0-9a-fA-F]{4}$/.test(hex)) refuse(this.i);
        const code = Number.parseInt(hex, 16);
        if (code >= 0xd800 && code <= 0xdbff) refuse(this.i);
        out += String.fromCharCode(code);
        this.i += 5;
        continue;
      }
      const mapped = STR_ESC[k];
      if (mapped === undefined) refuse(this.i);
      out += mapped;
      this.i++;
    }
  }

  value(): Variant {
    this.ws();
    const c = this.s[this.i];
    if (c === undefined) refuse(this.i);
    if (c === "{") return this.object();
    if (c === "[") return this.array();
    if (c === "\"") return V.str(this.string());
    if (c === "t") return this.literal("true", V.bool(true));
    if (c === "f") return this.literal("false", V.bool(false));
    if (c === "n") return this.literal("null", V.nil());
    if (c === "-" || (c >= "0" && c <= "9")) return this.number();
    return refuse(this.i);
  }

  array(): Variant {
    this.i++;
    const items: Variant[] = [];
    this.ws();
    if (this.s[this.i] === "]") {
      this.i++;
      return V.array(GArray.of(items));
    }
    for (;;) {
      items.push(this.value());
      this.ws();
      const c = this.s[this.i];
      if (c === ",") {
        this.i++;
        continue;
      }
      if (c === "]") {
        this.i++;
        return V.array(GArray.of(items));
      }
      return refuse(this.i);
    }
  }

  object(): Variant {
    this.i++;
    const d = new GDict();
    this.ws();
    if (this.s[this.i] === "}") {
      this.i++;
      return V.dict(d);
    }
    for (;;) {
      this.ws();
      const key = this.string();
      this.ws();
      if (this.s[this.i] !== ":") refuse(this.i);
      this.i++;
      d.set(V.str(key), this.value());
      this.ws();
      const c = this.s[this.i];
      if (c === ",") {
        this.i++;
        continue;
      }
      if (c === "}") {
        this.i++;
        return V.dict(d);
      }
      return refuse(this.i);
    }
  }
}

/** 成功才回值；尾部有多余内容、任何语法问题都走 `refuse`。 */
export function jsonParse(text: string): Variant {
  const r = new JsonReader(text);
  const v = r.value();
  r.ws();
  if (r.i !== text.length) refuse(r.i);
  return v;
}

function boolArg(args: Variant[], at: number, name: string, dflt: boolean): boolean {
  const v = args[at] as Variant | undefined;
  if (v === undefined) return dflt;
  if (v.t !== Tag.BOOL) throw new UnsupportedError("json-arg-type", `JSON.${name}() 的第 ${String(at + 1)} 参只量过 bool（收到 ${tagName(v.t)}）`);
  return v.v === true;
}

function textArg(args: Variant[], at: number, name: string, dflt: string): string {
  const v = args[at] as Variant | undefined;
  if (v === undefined) return dflt;
  return asString(v, `JSON.${name}() 的第 ${String(at + 1)} 参`);
}

function stringifyArgs(name: string, args: Variant[]): string {
  if (args.length < 1 || args.length > 4) {
    throw new UnsupportedError("json-arity", `JSON.${name}() 只量过 1 到 4 个实参（收到 ${String(args.length)} 个）`);
  }
  const indent = textArg(args, 1, name, "");
  const sort = boolArg(args, 2, name, true);
  const full = boolArg(args, 3, name, false);
  return jsonStringify(args[0] as Variant, indent, sort, full);
}

export const JSON_STATIC_NAMES = new Set(["stringify", "parse_string"]);

export function jsonStatic(name: string, args: Variant[]): Variant {
  if (name === "stringify") return V.str(stringifyArgs(name, args));
  return jsonParseResult(textArg(args, 0, name, ""));
}

/** 解析失败那一形走 json.ts 的响亮拒；这里只负责把成功值与实例状态接起来。 */
function jsonParseResult(text: string): Variant {
  return jsonParse(text);
}

function parseCode(j: GdJson, args: Variant[]): Variant {
  const text = textArg(args, 0, "parse", "");
  if (args.length !== 1) throw new UnsupportedError("json-arity", `JSON.parse() 只量过 1 个实参（收到 ${String(args.length)} 个）`);
  j.__gd_json_data = jsonParseResult(text);
  j.__gd_json_error_line = 0;
  return V.int(0);
}

export function jsonMethod(inner: GdJson, name: string, args: Variant[]): Variant {
  switch (name) {
    case "stringify":
      return V.str(stringifyArgs(name, args));
    case "parse_string": {
      const v = jsonParseResult(textArg(args, 0, name, ""));
      inner.__gd_json_error_line = 0;
      return v;
    }
    case "parse":
      return parseCode(inner, args);
    case "get_data":
      if (args.length !== 0) throw new UnsupportedError("json-arity", `get_data() 只量过 0 个实参（收到 ${String(args.length)} 个）`);
      return inner.__gd_json_data;
    case "get_error_message":
      if (args.length !== 0) throw new UnsupportedError("json-arity", `get_error_message() 只量过 0 个实参（收到 ${String(args.length)} 个）`);
      return V.str(inner.__gd_json_error_message);
    case "get_error_line":
      if (args.length !== 0) throw new UnsupportedError("json-arity", `get_error_line() 只量过 0 个实参（收到 ${String(args.length)} 个）`);
      return V.int(inner.__gd_json_error_line);
    default:
      throw new UnsupportedError(
        "json-method",
        `JSON.${name}() 这一支没量过（get_error_column / get_error_global_column / get_error_token 引擎根本没有，parse 失败那几支的消息集还没实测）`,
      );
  }
}

