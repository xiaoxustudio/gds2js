import { numVal } from "../numfmt";
import { codepoints, strCEscape, valueTypeName } from "../string-ops";
import { UnsupportedError } from "../errors";
import { strToInt } from "../numstr";
import { Tag, tagName, V, type Variant } from "../tags";
import { GVector2, vector2 } from "../vector2";
import { rect2 } from "../rect2";
import { rect2i } from "../rect2i";
import { aabb } from "../aabb";
import { plane } from "../plane";
import { vector3 } from "../vector3";
import { GVector4, vector4 } from "../vector4";
import { vector2i } from "../vector2i";
import { vector3i } from "../vector3i";
import { vector4i } from "../vector4i";
import { color } from "../color";
import { GBytes, packItems, packTypeName, toElem } from "../packed";
import type { PackElem, PackKind } from "../packed";
import { parseGdDouble } from "../../shared/double";
import { floatConstructText, rtosFix } from "../grisu2";
import { isCallable } from "../callable";
import { asRid, ridText } from "../rid";
import { asNodePath, nodePathText } from "../node-path";
import { GArray, GDict } from "./containers";
import { show } from "./core";

export type ScriptPropFace = { props: Array<{ name: string; value: Variant }>; unmodeledBase: string | null };

export let scriptPropsHook: ((inner: object) => ScriptPropFace | null) | null = null;

export function registerScriptPropsHook(f: (inner: object) => ScriptPropFace | null): void {
  scriptPropsHook = f;
}

let varToStrValueHook: ((inner: object) => string | null) | null = null;

export function registerVarToStrValueHook(f: (inner: object) => string | null): void {
  varToStrValueHook = f;
}

function vsQuote(s: string): string {
  let out = '"';
  for (const ch of s) {
    if (ch === '"' || ch === "\\") out += "\\" + ch;
    else out += ch;
  }
  return out + '"';
}

const VS_KEY_RANK: Partial<Record<number, number>> = {
  [Tag.NIL]: 0,
  [Tag.BOOL]: 1,
  [Tag.INT]: 2,
  [Tag.FLOAT]: 3,
  [Tag.STRING]: 4,
  [Tag.STRING_NAME]: 5,
};

const VS_RANK_NODE_PATH = 6;

function vsKeyRank(v: Variant): number | undefined {
  return asNodePath(v) !== null ? VS_RANK_NODE_PATH : VS_KEY_RANK[v.t];
}

function vsKeyCompare(a: Variant, b: Variant): number {
  const ra = vsKeyRank(a);
  const rb = vsKeyRank(b);
  if (ra === undefined || rb === undefined) {
    throw new UnsupportedError("var-to-str-key", `var_to_str() 的字典键只实测过 null / bool / int / float / String / StringName / NodePath（收到 ${valueTypeName(a)}）`);
  }
  if (ra !== rb) return ra - rb;
  if (asNodePath(a) !== null) return 0;
  if (a.t === Tag.BOOL) return (a.v ? 1 : 0) - (b.v ? 1 : 0);
  if (a.t === Tag.STRING || a.t === Tag.STRING_NAME) {
    const x = codepoints(a.v as string);
    const y = codepoints(b.v as string);
    const n = Math.min(x.length, y.length);
    for (let i = 0; i < n; i++) {
      const dx = (x[i] as string).codePointAt(0)!;
      const dy = (y[i] as string).codePointAt(0)!;
      if (dx !== dy) return dx - dy;
    }
    return x.length - y.length;
  }
  return numVal(a) - numVal(b);
}

export function varToStr(v: Variant): string {
  switch (v.t) {
    case Tag.NIL:
      return "null";
    case Tag.BOOL:
      return v.v ? "true" : "false";
    case Tag.INT:
      return String(v.v);
    case Tag.FLOAT:
      return floatConstructText(v.v as number);
    case Tag.STRING:
      return vsQuote(v.v as string);
    case Tag.STRING_NAME:
      return `&${vsQuote(v.v as string)}`;
    case Tag.ARRAY: {
      const items = (v.v as GArray).raw();
      const parts: string[] = [];
      for (const item of items) parts.push(varToStr(item));
      return `[${parts.join(", ")}]`;
    }
    case Tag.DICT: {
      const d = v.v as GDict;
      const keys = d.keys();
      if (keys.length === 0) return "{}";
      const vals = d.values();
      const pairs = keys.map((k, i) => [k, vals[i] as Variant] as const);
      pairs.sort((a, b) => vsKeyCompare(a[0], b[0]));
      const lines: string[] = [];
      for (const [k, val] of pairs) lines.push(`${varToStr(k)}: ${varToStr(val)}`);
      return `{\n${lines.join(",\n")}\n}`;
    }
    case Tag.OBJECT: {
      const inner = v.v;
      if (inner instanceof GBytes) {
        const items = packItems(inner as GBytes);
        const flat: string[] = [];
        for (const item of items) {
          if (item.t === Tag.OBJECT && item.v instanceof GVector4) {
            const g = item.v as GVector4;
            flat.push(rtosFix(g.x, true), rtosFix(g.y, true), rtosFix(g.z, true), rtosFix(g.w, true));
            continue;
          }
          if (item.t === Tag.OBJECT) {
            throw new UnsupportedError("var-to-str-pack", `var_to_str() 的 ${packTypeName(inner.kind)} 里有对象元素，那一形还没量出`);
          }
          flat.push(item.t === Tag.FLOAT ? rtosFix(item.v as number, true) : varToStr(item));
        }
        return `${packTypeName(inner.kind)}(${flat.join(", ")})`;
      }
      const npV = asNodePath(v);
      if (npV !== null) return `NodePath("${strCEscape(nodePathText(npV))}")`;
      const ridV = asRid(v);
      if (ridV !== null) return ridText(ridV);
      if (isCallable(v)) return "Callable()";
      const valueText = varToStrValueHook === null ? null : varToStrValueHook(inner as object);
      if (valueText !== null) return valueText;
      throw new UnsupportedError("var-to-str-type", `var_to_str() 遇到没实测过的对象类型 ${valueTypeName(v)}`);
    }
    default:
      throw new UnsupportedError("var-to-str-type", `var_to_str() 遇到没实测过的类型 ${tagName(v.t)}`);
  }
}

const SV_VALUE_CTORS = new Set(["Vector2", "Vector2i", "Vector3", "Vector3i", "Vector4", "Vector4i", "Color", "Rect2", "Rect2i", "AABB", "Plane"]);

const SV_PACK_CTORS: Record<string, PackKind> = {
  PackedByteArray: "byte",
  PackedInt32Array: "int32",
  PackedInt64Array: "int64",
  PackedFloat32Array: "float32",
  PackedFloat64Array: "float64",
  PackedStringArray: "string",
  PackedVector2Array: "vector2",
};

const SV_UNSHIPPED_CTORS = new Set(["Quaternion", "PackedVector3Array", "PackedColorArray"]);

function svIsDigit(c: string): boolean {
  return c >= "0" && c <= "9";
}

function svIsIdentStart(c: string): boolean {
  return (c >= "a" && c <= "z") || (c >= "A" && c <= "Z") || c === "_";
}

function svHexVal(c: string): number | null {
  const o = c.charCodeAt(0);
  if (o >= 0x30 && o <= 0x39) return o - 0x30;
  if (o >= 0x41 && o <= 0x46) return o - 0x41 + 10;
  if (o >= 0x61 && o <= 0x66) return o - 0x61 + 10;
  return null;
}

/** 构造参数只量过数字：`Vector2("1", 2)` 与 `Vector2(Vector2(1, 2), 3)` 实测都是 null。 */
function svNumArg(v: Variant | null): Variant | null {
  if (v === null || (v.t !== Tag.INT && v.t !== Tag.FLOAT)) return null;
  return v;
}

export function strToVar(v: Variant): Variant {
  if (v.t !== Tag.STRING) {
    throw new UnsupportedError("str-to-var-arg", `str_to_var() 收到 ${tagName(v.t)}：只量过 String 那一支，其余形状不猜`);
  }
  const cs = codepoints(v.v as string);
  let i = 0;

  const ws = (): void => {
    while (i < cs.length) {
      const c = cs[i] as string;
      if (c === " " || c === "\t" || c === "\n" || c === "\r") i++;
      else break;
    }
  };
  const at = (c: string): boolean => cs[i] === c;
  const eat = (c: string): boolean => {
    if (cs[i] !== c) return false;
    i++;
    return true;
  };

  const number = (): Variant | null => {
    const start = i;
    let neg = false;
    if (at("-")) {
      neg = true;
      i++;
      if (i >= cs.length || !svIsDigit(cs[i] as string)) {
        if (matchWord("inf")) return V.float(-Infinity);
        i = start;
        return null;
      }
    }
    let text = neg ? "-" : "";
    while (i < cs.length && svIsDigit(cs[i] as string)) text += cs[i++];
    if (text.length === (neg ? 1 : 0)) {
      i = start;
      return null;
    }
    let isFloat = false;
    let frac = "";
    if (at(".")) {
      isFloat = true;
      i++;
      while (i < cs.length && svIsDigit(cs[i] as string)) frac += cs[i++];
    }
    let exp = "";
    if (at("e") || at("E")) {
      isFloat = true;
      i++;
      let expSign = "";
      if (eat("-")) expSign = "-";
      else eat("+");
      let digits = "";
      while (i < cs.length && svIsDigit(cs[i] as string)) digits += cs[i++];
      if (digits.length > 0) exp = `e${expSign}${digits}`;
    }
    if (!isFloat) return V.int(strToInt(text));
    return V.float(parseGdDouble(`${text}${frac.length > 0 ? `.${frac}` : ""}${exp}`));
  };

  const string = (asName: boolean): Variant | null => {
    i++;
    let out = "";
    for (;;) {
      if (i >= cs.length) return null;
      const c = cs[i++] as string;
      if (c === '"') break;
      if (c !== "\\") {
        out += c;
        continue;
      }
      const e = cs[i++];
      if (e === undefined) return null;
      switch (e) {
        case "n":
          out += "\n";
          break;
        case "t":
          out += "\t";
          break;
        case "r":
          out += "\r";
          break;
        case "b":
          out += "\b";
          break;
        case "f":
          out += "\f";
          break;
        case '"':
        case "'":
        case "\\":
        case "/":
          out += e;
          break;
        case "u": {
          let val = 0;
          for (let k = 0; k < 4; k++) {
            if (i >= cs.length) return null;
            const h = svHexVal(cs[i] as string);
            if (h === null) return null;
            val = val * 16 + h;
            i++;
          }
          if (val >= 0xd800 && val <= 0xdfff) return null;
          out += String.fromCodePoint(val === 0 ? 0xfffd : val);
          break;
        }
        case "U": {
          let val = 0;
          for (let k = 0; k < 6; k++) {
            if (i >= cs.length) return null;
            const h = svHexVal(cs[i] as string);
            if (h === null) return null;
            val = val * 16 + h;
            i++;
          }
          if (val >= 0xd800 && val <= 0xdfff) return null;
          out += String.fromCodePoint(val === 0 || val > 0x10ffff ? 0xfffd : val);
          break;
        }
        default:
          out += e;
      }
    }
    return asName ? V.stringName(out) : V.str(out);
  };

  const matchWord = (word: string): boolean => {
    for (let k = 0; k < word.length; k++) {
      if (cs[i + k] !== word[k]) return false;
    }
    const after = cs[i + word.length];
    if (after !== undefined && (svIsIdentStart(after) || svIsDigit(after))) return false;
    i += word.length;
    return true;
  };

  const array = (): Variant | null => {
    i++;
    const g = GArray.of([]);
    ws();
    if (eat("]")) return V.array(g);
    for (;;) {
      const item = value();
      if (item === null) return null;
      g.append(item);
      ws();
      if (eat(",")) {
        ws();
        if (eat("]")) return V.array(g);
        continue;
      }
      if (eat("]")) return V.array(g);
      return null;
    }
  };

  const dict = (): Variant | null => {
    i++;
    const d = new GDict();
    ws();
    if (eat("}")) return V.dict(d);
    for (;;) {
      const k = value();
      if (k === null) return null;
      ws();
      if (!eat(":")) return null;
      const val = value();
      if (val === null) return null;
      d.set(k, val);
      ws();
      if (eat(",")) {
        ws();
        if (eat("}")) return V.dict(d);
        continue;
      }
      if (eat("}")) return V.dict(d);
      return null;
    }
  };

  const ctor = (word: string): Variant | null => {
    if (SV_UNSHIPPED_CTORS.has(word)) {
      throw new UnsupportedError("str-to-var-type", `str_to_var() 的 ${word}(...) 引擎给得出值（实测 Rect2 是 typeof 7、Quaternion 是 15），我们没这个形状`);
    }
    if (!SV_VALUE_CTORS.has(word) && SV_PACK_CTORS[word] === undefined) {
      throw new UnsupportedError("str-to-var-shape", `str_to_var() 的构造式名字「${word}」没量过：实测只有 NoSuchType 那种引擎不认的给 null，分不清就不猜`);
    }
    const kind = SV_PACK_CTORS[word];
    i++;
    const args: Variant[] = [];
    ws();
    if (!eat(")")) {
      for (;;) {
        const a = kind === "string" ? (at('"') ? string(false) : null) : svNumArg(number());
        if (a === null) return null;
        args.push(a);
        ws();
        if (eat(",")) {
          ws();
          if (at(")")) return null;
          continue;
        }
        if (eat(")")) break;
        return null;
      }
    }
    const n = (k: number): number => numVal(args[k] as Variant);
    if (word === "Vector2") return args.length === 2 ? vector2(n(0), n(1)) : null;
    if (word === "Vector3") return args.length === 3 ? vector3(n(0), n(1), n(2)) : null;
    if (word === "Vector2i") return args.length === 2 ? vector2i(Math.trunc(n(0)), Math.trunc(n(1))) : null;
    if (word === "Vector3i") return args.length === 3 ? vector3i(Math.trunc(n(0)), Math.trunc(n(1)), Math.trunc(n(2))) : null;
    if (word === "Vector4") return args.length === 4 ? vector4(n(0), n(1), n(2), n(3)) : null;
    if (word === "Vector4i") return args.length === 4 ? vector4i(Math.trunc(n(0)), Math.trunc(n(1)), Math.trunc(n(2)), Math.trunc(n(3))) : null;
    if (word === "Color") return args.length === 4 ? color(n(0), n(1), n(2), n(3)) : null;
    if (word === "Rect2") return args.length === 4 ? rect2(n(0), n(1), n(2), n(3)) : null;
    if (word === "Rect2i") return args.length === 4 ? rect2i(Math.trunc(n(0)), Math.trunc(n(1)), Math.trunc(n(2)), Math.trunc(n(3))) : null;
    if (word === "AABB") return args.length === 6 ? aabb(n(0), n(1), n(2), n(3), n(4), n(5)) : null;
    if (word === "Plane") return args.length === 4 ? plane(n(0), n(1), n(2), n(3)) : null;
    const pack = SV_PACK_CTORS[word] as PackKind;
    if (pack === "vector2") {
      if (args.length % 2 !== 0) {
        throw new UnsupportedError("str-to-var-shape", `PackedVector2Array(...) 的奇数参数个数没量过（实测只量了 (1, 2) 这一格）`);
      }
      const items: PackElem[] = [];
      for (let k = 0; k + 1 < args.length; k += 2) items.push(new GVector2(n(k), n(k + 1)));
      return V.object(new GBytes(items, pack));
    }
    return V.object(new GBytes(args.map((a) => toElem(pack, a)), pack));
  };

  function value(): Variant | null {
    ws();
    if (i >= cs.length) return null;
    const c = cs[i] as string;
    if (c === "[") return array();
    if (c === "{") return dict();
    if (c === '"') return string(false);
    if (c === "&") {
      if (cs[i + 1] !== '"') return null;
      i++;
      return string(true);
    }
    if (c === "-" || svIsDigit(c)) return number();
    if (!svIsIdentStart(c)) return null;
    const start = i;
    let word = "";
    while (i < cs.length && (svIsIdentStart(cs[i] as string) || svIsDigit(cs[i] as string))) word += cs[i++];
    if (word === "null") return V.nil();
    if (word === "true") return V.bool(true);
    if (word === "false") return V.bool(false);
    if (word === "inf") return V.float(Infinity);
    if (word === "inf_neg") return V.float(-Infinity);
    if (word === "nan") return V.float(NaN);
    ws();
    if (at("(")) return ctor(word);
    i = start;
    return null;
  }

  const got = value();
  return got === null ? V.nil() : got;
}

export function showArgsSep(args: Variant[], sep: string): string {
  let out = "";
  for (let i = 0; i < args.length; i++) {
    if (i > 0) out += sep;
    out += show(args[i] as Variant);
  }
  return out;
}

/** `print(a, b, c)` 的口径：**先把所有实参求值完，才开始逐个转字符串**，所以整串实参交到这里按顺序 show、用空串拼。 */
export function showArgs(args: Variant[]): string {
  return showArgsSep(args, "");
}
