import { Tag, V, intToBig, intToNum, tagName, type IntPayload, type Variant } from "../../tags";
import { UnsupportedError } from "../../errors";
import { GdScriptObject } from "../object/script-object";
import { GArray, GDict, show } from "../../values";
import { GBytes, packItems } from "../bytes/packed";
import { strNumDecimals, strSci } from "../../numfmt";
import { asString } from "../../method/core";
import { asVec2, vector2, GVector2 } from "../vector/vector2";
import { asVec2i, vector2i, GVector2i } from "../vector/vector2i";
import { asVec3, vector3, GVector3 } from "../vector/vector3";
import { asVec3i, vector3i, GVector3i } from "../vector/vector3i";
import { asVec4, vector4, GVector4 } from "../vector/vector4";
import { asVec4i, vector4i, GVector4i } from "../vector/vector4i";
import { asRect2, rect2, GRect2 } from "../shape/rect";
import { asRect2i, rect2i, GRect2i } from "../shape/rect";
import { asAABB, aabb, GAABB } from "../shape/aabb";
import { asPlane, plane, GPlane } from "../orient/plane";
import { asQuaternion, quaternion, GQuaternion } from "../orient/quaternion";
import { asTransform2D, transform2d, GTransform2D } from "../orient/transform2d";
import { asTransform3D, transform3d, GTransform3D } from "../orient/transform3d";
import { asBasis, basis, GBasis } from "../orient/basis";
import { asProjection, projection, GProjection } from "../orient/projection";
import { asColor, color, GColor } from "../color/color";
import { asNodePath, nodePathText, nodePathValue } from "../identity/node-path";
import { asRid, ridCtor } from "../identity/rid";
import { nullCallable, isCallable } from "../identity/callable";
import { Signal } from "../identity/signal";
import { packCtor, packTypeName, type PackKind } from "../bytes/packed";

export class GdJson extends GdScriptObject {
  __gd_engine_class__ = "JSON";
  __gd_json_data: Variant = V.nil();
  __gd_json_text = "";
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
    if (esc !== undefined) out += esc;
    else out += ch;
  }
  return out + "\"";
}

/**
 * 实测到的两支无穷印法：`1e99999` / `-1e99999`，两种模式同形；NaN 印 `null`（引擎另有一次性 WARNING 块，不复刻）。
 * 默认那一支是 15 位有效数字的定点形（尾零裁掉但留一位小数），`full_float` 那一支是科学计数、
 * 没有小数点也没有指数的补 `.0`；`-0.0` 两支都给 `0.0`。
 */
function numJson(x: number, full: boolean): string {
  if (Number.isNaN(x)) return "null";
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

export const JSON_STATIC_NAMES = new Set(["stringify", "parse_string", "from_native", "to_native"]);

const TYPE_KEY = "type";
const ARGS_KEY = "args";

function typeDict(name: string, args: Variant[]): Variant {
  const d = new GDict();
  d.set(V.str(TYPE_KEY), V.stringName(name));
  d.set(V.str(ARGS_KEY), V.array(GArray.of(args)));
  return V.dict(d);
}

function fnum(x: number): string {
  if (Number.isNaN(x)) return "nan";
  if (x === Infinity) return "inf";
  if (x === -Infinity) return "-inf";
  return String(x);
}

function enc(v: Variant): Variant {
  switch (v.t) {
    case Tag.NIL:
    case Tag.BOOL:
      return v;
    case Tag.INT:
      return V.str("i:" + show(v));
    case Tag.FLOAT:
      return V.str("f:" + fnum(v.v as number));
    case Tag.STRING:
      return V.str("s:" + String(v.v));
    case Tag.STRING_NAME:
      return V.str("sn:" + String(v.v));
    case Tag.ARRAY: {
      const items: Variant[] = [];
      for (const it of (v.v as GArray).raw()) items.push(enc(it));
      return V.array(GArray.of(items));
    }
    case Tag.DICT: {
      const args: Variant[] = [];
      for (const k of (v.v as GDict).keys()) {
        args.push(enc(k));
        args.push(enc((v.v as GDict).getRequired(k)));
      }
      return typeDict("Dictionary", args);
    }
    case Tag.OBJECT: {
      const np = asNodePath(v);
      if (np !== null) return V.str("np:" + nodePathText(np));
      if (isCallable(v)) return typeDict("Callable", []);
      if (v.v instanceof Signal) return typeDict("Signal", []);
      const rid = asRid(v);
      if (rid !== null) return typeDict("RID", []);
      const v2 = asVec2(v);
      if (v2 !== null) return typeDict("Vector2", [V.float(v2.x), V.float(v2.y)]);
      const v2i = asVec2i(v);
      if (v2i !== null) return typeDict("Vector2i", [V.int(v2i.x), V.int(v2i.y)]);
      const v3 = asVec3(v);
      if (v3 !== null) return typeDict("Vector3", [V.float(v3.x), V.float(v3.y), V.float(v3.z)]);
      const v3i = asVec3i(v);
      if (v3i !== null) return typeDict("Vector3i", [V.int(v3i.x), V.int(v3i.y), V.int(v3i.z)]);
      const v4 = asVec4(v);
      if (v4 !== null) return typeDict("Vector4", [V.float(v4.x), V.float(v4.y), V.float(v4.z), V.float(v4.w)]);
      const v4i = asVec4i(v);
      if (v4i !== null) return typeDict("Vector4i", [V.int(v4i.x), V.int(v4i.y), V.int(v4i.z), V.int(v4i.w)]);
      const r2 = asRect2(v);
      if (r2 !== null) return typeDict("Rect2", [V.float(r2.x), V.float(r2.y), V.float(r2.w), V.float(r2.h)]);
      const r2i = asRect2i(v);
      if (r2i !== null) return typeDict("Rect2i", [V.int(r2i.x), V.int(r2i.y), V.int(r2i.w), V.int(r2i.h)]);
      const pl = asPlane(v);
      if (pl !== null) return typeDict("Plane", [V.float(pl.nx), V.float(pl.ny), V.float(pl.nz), V.float(pl.d)]);
      const q = asQuaternion(v);
      if (q !== null) return typeDict("Quaternion", [V.float(q.x), V.float(q.y), V.float(q.z), V.float(q.w)]);
      const t2 = asTransform2D(v);
      if (t2 !== null) return typeDict("Transform2D", [V.float(t2.xx), V.float(t2.xy), V.float(t2.yx), V.float(t2.yy), V.float(t2.ox), V.float(t2.oy)]);
      const b = asBasis(v);
      if (b !== null) return typeDict("Basis", [V.float(b.x0), V.float(b.x1), V.float(b.x2), V.float(b.y0), V.float(b.y1), V.float(b.y2), V.float(b.z0), V.float(b.z1), V.float(b.z2)]);
      const t3 = asTransform3D(v);
      if (t3 !== null) return typeDict("Transform3D", [V.float(t3.x0), V.float(t3.x1), V.float(t3.x2), V.float(t3.y0), V.float(t3.y1), V.float(t3.y2), V.float(t3.z0), V.float(t3.z1), V.float(t3.z2), V.float(t3.ox), V.float(t3.oy), V.float(t3.oz)]);
      const pj = asProjection(v);
      if (pj !== null) return typeDict("Projection", [V.float(pj.x.x), V.float(pj.x.y), V.float(pj.x.z), V.float(pj.x.w), V.float(pj.y.x), V.float(pj.y.y), V.float(pj.y.z), V.float(pj.y.w), V.float(pj.z.x), V.float(pj.z.y), V.float(pj.z.z), V.float(pj.z.w), V.float(pj.w.x), V.float(pj.w.y), V.float(pj.w.z), V.float(pj.w.w)]);
      const c = asColor(v);
      if (c !== null) return typeDict("Color", [V.float(c.r), V.float(c.g), V.float(c.b), V.float(c.a)]);
      const ab = asAABB(v);
      if (ab !== null) return typeDict("AABB", [V.float(ab.x), V.float(ab.y), V.float(ab.z), V.float(ab.sx), V.float(ab.sy), V.float(ab.sz)]);
      if (v.v instanceof GBytes) {
        const items: Variant[] = [];
        for (const it of packItems(v.v as GBytes)) items.push(enc(it));
        return typeDict(packTypeName((v.v as GBytes).kind), items);
      }
      return V.nil();
    }
    default:
      return V.nil();
  }
}

function dec(v: Variant): Variant {
  if (v.t === Tag.STRING) {
    const s = v.v as string;
    if (s.startsWith("i:")) return V.int(BigInt(s.slice(2)));
    if (s.startsWith("f:")) {
      const sub = s.slice(2);
      if (sub === "inf") return V.float(Infinity);
      if (sub === "-inf") return V.float(-Infinity);
      if (sub === "nan") return V.float(NaN);
      return V.float(Number(sub));
    }
    if (s.startsWith("s:")) return V.str(s.slice(2));
    if (s.startsWith("sn:")) return V.stringName(s.slice(3));
    if (s.startsWith("np:")) return nodePathValue(s.slice(3));
    return V.nil();
  }
  if (v.t === Tag.ARRAY) {
    const items: Variant[] = [];
    for (const it of (v.v as GArray).raw()) items.push(dec(it));
    return V.array(GArray.of(items));
  }
  if (v.t === Tag.DICT) {
    const d = v.v as GDict;
    const t = d.get(V.str(TYPE_KEY));
    if (t === undefined) return V.nil();
    const name = String(t.v);
    const argsRaw = d.get(V.str(ARGS_KEY));
    const args: Variant[] = argsRaw === undefined ? [] : (argsRaw.v as GArray).raw().map((x) => dec(x));
    const nums = () => args.map((a) => Number(a.v));
    const ints = () => args.map((a) => Number(a.v));
    if (name === "Dictionary") {
      const out = new GDict();
      for (let i = 0; i + 1 < args.length; i += 2) out.set(args[i] as Variant, args[i + 1] as Variant);
      return V.dict(out);
    }
    if (name === "RID") return ridCtor([]);
    if (name === "Callable") return nullCallable();
    if (name === "Signal") return V.object(new Signal(""));
    if (name === "Vector2") { const n = nums(); return vector2(n[0] as number, n[1] as number); }
    if (name === "Vector2i") { const n = ints(); return vector2i(n[0] as number, n[1] as number); }
    if (name === "Vector3") { const n = nums(); return vector3(n[0] as number, n[1] as number, n[2] as number); }
    if (name === "Vector3i") { const n = ints(); return vector3i(n[0] as number, n[1] as number, n[2] as number); }
    if (name === "Vector4") { const n = nums(); return vector4(n[0] as number, n[1] as number, n[2] as number, n[3] as number); }
    if (name === "Vector4i") { const n = ints(); return vector4i(n[0] as number, n[1] as number, n[2] as number, n[3] as number); }
    if (name === "Rect2") { const n = nums(); return rect2(n[0] as number, n[1] as number, n[2] as number, n[3] as number); }
    if (name === "Rect2i") { const n = ints(); return rect2i(n[0] as number, n[1] as number, n[2] as number, n[3] as number); }
    if (name === "Plane") { const n = nums(); return plane(n[0] as number, n[1] as number, n[2] as number, n[3] as number); }
    if (name === "Quaternion") { const n = nums(); return quaternion(n[0] as number, n[1] as number, n[2] as number, n[3] as number); }
    if (name === "Transform2D") { const n = nums(); return transform2d(n[0] as number, n[1] as number, n[2] as number, n[3] as number, n[4] as number, n[5] as number); }
    if (name === "Basis") { const n = nums(); return basis(n[0] as number, n[1] as number, n[2] as number, n[3] as number, n[4] as number, n[5] as number, n[6] as number, n[7] as number, n[8] as number); }
    if (name === "Transform3D") { const n = nums(); return transform3d(n[0] as number, n[1] as number, n[2] as number, n[3] as number, n[4] as number, n[5] as number, n[6] as number, n[7] as number, n[8] as number, n[9] as number, n[10] as number, n[11] as number); }
    if (name === "Projection") { const n = nums(); return projection(new GVector4(n[0] as number, n[1] as number, n[2] as number, n[3] as number), new GVector4(n[4] as number, n[5] as number, n[6] as number, n[7] as number), new GVector4(n[8] as number, n[9] as number, n[10] as number, n[11] as number), new GVector4(n[12] as number, n[13] as number, n[14] as number, n[15] as number)); }
    if (name === "Color") { const n = nums(); return color(n[0] as number, n[1] as number, n[2] as number, n[3] as number); }
    if (name === "AABB") { const n = nums(); return aabb(n[0] as number, n[1] as number, n[2] as number, n[3] as number, n[4] as number, n[5] as number); }
    const PACK_NAMES: Record<string, PackKind> = {
      PackedByteArray: "byte", PackedInt32Array: "int32", PackedInt64Array: "int64",
      PackedFloat32Array: "float32", PackedFloat64Array: "float64", PackedStringArray: "string",
      PackedVector2Array: "vector2", PackedVector3Array: "vector3", PackedVector4Array: "vector4",
      PackedColorArray: "color",
    };
    const pk = PACK_NAMES[name];
    if (pk !== undefined) return packCtor(pk, args);
    return V.nil();
  }
  return v;
}

export function jsonStatic(name: string, args: Variant[]): Variant {
  if (name === "stringify") return V.str(stringifyArgs(name, args));
  if (name === "from_native") {
    if (args.length < 1) throw new UnsupportedError("json-arity", "JSON.from_native() 少了实参");
    return enc(args[0] as Variant);
  }
  if (name === "to_native") {
    if (args.length < 1) throw new UnsupportedError("json-arity", "JSON.to_native() 少了实参");
    return dec(args[0] as Variant);
  }
  if (name === "parse_string") {
    const text = textArg(args, 0, name, "");
    return jsonParseResult(text);
  }
  return jsonParseResult(textArg(args, 0, name, ""));
}

/** 解析失败那一形走 json.ts 的响亮拒；这里只负责把成功值与实例状态接起来。 */
function jsonParseResult(text: string): Variant {
  return jsonParse(text);
}

function parseCode(j: GdJson, args: Variant[]): Variant {
  if (args.length < 1 || args.length > 2) throw new UnsupportedError("json-arity", `JSON.parse() 只量过 1 到 2 个实参（收到 ${String(args.length)} 个）`);
  const text = textArg(args, 0, "parse", "");
  const keep = args.length === 2 ? boolArg(args, 1, "parse", false) : false;
  j.__gd_json_data = jsonParseResult(text);
  j.__gd_json_text = keep ? text : "";
  j.__gd_json_error_line = 0;
  return V.int(0);
}

export function jsonMethod(inner: GdJson, name: string, args: Variant[]): Variant {
  switch (name) {
    case "stringify":
      return V.str(stringifyArgs(name, args));
    case "parse_string": {
      const text = textArg(args, 0, name, "");
      const v = jsonParseResult(text);
      inner.__gd_json_text = text;
      inner.__gd_json_error_line = 0;
      return v;
    }
    case "parse":
      return parseCode(inner, args);
    case "get_data":
      if (args.length !== 0) throw new UnsupportedError("json-arity", `get_data() 只量过 0 个实参（收到 ${String(args.length)} 个）`);
      return inner.__gd_json_data;
    case "set_data":
      if (args.length !== 1) throw new UnsupportedError("json-arity", "set_data() 只量过 1 个实参");
      inner.__gd_json_data = args[0] as Variant;
      return V.nil();
    case "get_parsed_text":
      if (args.length !== 0) throw new UnsupportedError("json-arity", "get_parsed_text() 只量过 0 个实参");
      return V.str(inner.__gd_json_text);
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

