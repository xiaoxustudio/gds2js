import { numVal, strFloat, strHumanizeSize, strNumDecimals, strSci, wrapUnsigned64 } from "./numfmt";
import { codepoints, posOobSay, strCEscape, strColor, strReplace, strVec2, stringChr, valueTypeName } from "./string-ops";

import { GodotRuntimeError, UnsupportedError } from "./errors";
import { hexUpper, strToFloat, strToInt } from "./numstr";
import { Tag, tagName, V, intToBig, intToNum, int64ParamBig, type IntPayload, type Variant } from "./tags";
import { CASE_LOWER_FIX, CASE_UPPER_FIX } from "./case-table";
import { gdIsDigit, gdIsLower, gdIsSep, gdIsUpper } from "./case-flags";
import { GVector2, asVec2, vecCmp, vector2 } from "./vector2";
import { GVector3, asVec3, vec3Cmp, vector3 } from "./vector3";
import { GVector4, asVec4, vec4Cmp, vector4 } from "./vector4";
import { asVec2i, GVector2i, vec2iCmp, vector2i } from "./vector2i";
import { asVec3i, GVector3i, vector3i } from "./vector3i";
import { asVec4i, GVector4i, vector4i } from "./vector4i";
import { asColor, color, GColor, tryColorSlot } from "./color";
import { bytesEq, GBytes, packItems, packTypeName, registerPackStringifier, utf8Decode, toElem } from "./packed";
import type { PackElem, PackKind } from "./packed";
import { parseGdDouble } from "../shared/double";
import { floatConstructText, rtosFix } from "./grisu2";
import { isUnicodeIdContinue, isUnicodeIdStart } from "./unicode-identifier";
import { sortGodot } from "./sort";
import { callableEq, callableLabel, callableSame, isCallable, isNullCallable, type CallableBox } from "./callable";
import { GdNativeClass } from "./native-class";
import { isEncodedObjectIdBox, isNullRefValue, isWeakRefBox, NULL_OBJECT } from "./identity";
import type { GdIdentified } from "./identity";
import { asRid, ridText } from "./rid";
import { asNodePath, emptyNodePath, nodePathText, nodePathValue, sameNodePath } from "./node-path";
import { findLower, findUpper } from "./ucaps";


/** Dictionary 键编码：键必须带类型前缀，否则 1（int）与 1.0（float）会撞成同一个键。 */
export function keyOf(v: Variant): string {
  return keyOfIn(v, 0);
}

function callableKey(box: CallableBox): string {
  if (isNullCallable(box)) return "y:";
  const boundTag = box.boundOnce ? "1" : "0";
  if (box.name !== null) {
    const recv = box.object;
    if (recv === null) return `g:${box.name}:${boundTag}`;
    if (recv.t === Tag.OBJECT && !(recv.v instanceof GBytes)) {
      const id = (recv.v as GdIdentified).gdObjectId;
      if (id > 0) return `q:${String(id)}:${box.name}:${boundTag}`;
    }
    throw new UnsupportedError("dict-key-type", "这种接收者的方法 Callable 当字典键还没量过");
  }
  return `m:${String(box.gdObjectId)}`;
}

function keyOfIn(v: Variant, depth: number): string {
  switch (v.t) {
    case Tag.NIL:
      return "n:";
    case Tag.BOOL:
      return `b:${String(v.v)}`;
    case Tag.INT:
      return `i:${String(v.v)}`;
    case Tag.FLOAT:
      return `f:${String(v.v)}`;
    case Tag.STRING:
      return `s:${v.v as string}`;
    case Tag.STRING_NAME:
      return `s:${v.v as string}`;
    case Tag.ARRAY: {
      if (depth >= PRINT_DEPTH) return "…";
      const g = v.v as GArray;
      const items = g.raw();
      let out = "c:[";
      for (let i = 0; i < items.length; i++) out += (i === 0 ? "" : ",") + keyOfIn(items[i] as Variant, depth + 1);
      return out + "]";
    }
    case Tag.DICT: {
      if (depth >= PRINT_DEPTH) return "…";
      const g = v.v as GDict;
      const ks = g.keys();
      const vs = g.values();
      let out = "c:{";
      for (let i = 0; i < ks.length; i++) {
        out +=
          (i === 0 ? "" : ",") +
          keyOfIn(ks[i] as Variant, depth + 1) +
          "=>" +
          keyOfIn(vs[i] as Variant, depth + 1);
      }
      return out + "}";
    }
    case Tag.OBJECT: {
      const vec = asVec2(v);
      if (vec) return `v:${String(vec.x)},${String(vec.y)}`;
      const vec3 = asVec3(v);
      if (vec3) return `w:${String(vec3.x)},${String(vec3.y)},${String(vec3.z)}`;
      const vec2i = asVec2i(v);
      if (vec2i) return `x:${String(vec2i.x)},${String(vec2i.y)}`;
      const vec3i = asVec3i(v);
      if (vec3i) return `u:${String(vec3i.x)},${String(vec3i.y)},${String(vec3i.z)}`;
      const vec4 = asVec4(v);
      if (vec4) return `4:${String(vec4.x)},${String(vec4.y)},${String(vec4.z)},${String(vec4.w)}`;
      const vec4i = asVec4i(v);
      if (vec4i) return `5:${String(vec4i.x)},${String(vec4i.y)},${String(vec4i.z)},${String(vec4i.w)}`;
      const col = asColor(v);
      if (col)
        return `z:${String(col.r)},${String(col.g)},${String(col.b)},${String(col.a)}`;
      const ridKey = asRid(v);
      if (ridKey !== null) return "r:" + String(ridKey.id);
      const npKey = asNodePath(v);
      if (npKey !== null) return "^" + nodePathText(npKey);
      if (isCallable(v)) return callableKey(v.v as CallableBox);
      if (!(v.v instanceof GBytes)) {
        const id = (v.v as GdIdentified).gdObjectId;
        if (id > 0) return `o:${String(id)}`;
      }
      break;
    }
    default:
      break;
  }
  throw new UnsupportedError("dict-key-type", `${tagName(v.t)} 不能作为字典键（未实现）`);
}

export type ElemKind =
  | "int"
  | "float"
  | "bool"
  | "String"
  | "StringName"
  | "Vector2"
  | "Vector3"
  | "Vector2i"
  | "Vector3i"
  | "Vector4"
  | "Vector4i"
  | "Color"
  | "Array"
  | "Dictionary"
  | "Object";

export function isElemKind(name: string): name is ElemKind {
  return (
    name === "int" || name === "float" || name === "bool" || name === "String" ||
    name === "StringName" ||
    name === "Vector2" ||
    name === "Vector3" ||
    name === "Vector4" ||
    name === "Vector4i" ||
    name === "Vector2i" ||
    name === "Vector3i" ||
    name === "Color" ||
    name === "Array" ||
    name === "Dictionary"
  );
}

export function elemDefault(kind: ElemKind): Variant {
  switch (kind) {
    case "Object":
      return V.nil();
    case "int":
      return V.int(0);
    case "float":
      return V.float(0);
    case "bool":
      return V.bool(false);
    case "String":
      return V.str("");
    case "StringName":
      return V.stringName("");
    case "Vector2":
      return V.object(new GVector2(0, 0));
    case "Vector3":
      return vector3(0, 0, 0);
    case "Vector2i":
      return vector2i(0, 0);
    case "Vector3i":
      return vector3i(0, 0, 0);
    case "Vector4":
      return vector4(0, 0, 0, 0);
    case "Vector4i":
      return vector4i(0, 0, 0, 0);
    case "Color":
      return color(0, 0, 0, 1);
    case "Array":
      return V.array(new GArray());
    case "Dictionary":
      return V.dict(new GDict());
  }
}

let classFaceCheck: ((cls: string, v: Variant) => boolean) | null = null;
export function registerClassFaceCheck(fn: (cls: string, v: Variant) => boolean): void {
  classFaceCheck = fn;
}
function classFaceMatches(cls: string, v: Variant): Variant | null {
  if (classFaceCheck === null) return v;
  return classFaceCheck(cls, v) ? v : null;
}

export function elemConvert(kind: ElemKind, v: Variant): Variant | null {
  switch (kind) {
    case "Object":
      return v.t === Tag.NIL || v.t === Tag.OBJECT ? v : null;
    case "int":
      if (v.t === Tag.INT) return v;
      if (v.t === Tag.BOOL) return V.int(v.v ? 1 : 0);
      if (v.t === Tag.FLOAT) {
        const x = v.v as number;
        if (!Number.isFinite(x) || Math.abs(x) >= 2n ** 63n) return V.int(-(2n ** 63n));
        return V.int(BigInt(Math.trunc(x)));
      }
      return null;
    case "float":
      if (v.t === Tag.FLOAT) return v;
      if (v.t === Tag.INT) return V.float(intToNum(v.v as IntPayload));
      if (v.t === Tag.BOOL) return V.float(v.v ? 1 : 0);
      return null;
    case "bool":
      if (v.t === Tag.BOOL) return v;
      if (v.t === Tag.INT || v.t === Tag.FLOAT) return V.bool((v.v as number) !== 0);
      return null;
    case "String":
      if (v.t === Tag.STRING) return v;
      if (v.t === Tag.STRING_NAME) return V.str(v.v as string);
      return null;
    case "StringName":
      if (v.t === Tag.STRING_NAME) return v;
      if (v.t === Tag.STRING) return V.stringName(v.v as string);
      return null;
    case "Vector2": {
      if (v.t === Tag.OBJECT && v.v instanceof GVector2i) return V.object(new GVector2((v.v as GVector2i).x, (v.v as GVector2i).y));
      return v.t === Tag.OBJECT && v.v instanceof GVector2 ? v : null;
    }
    case "Vector3": {
      const g3i = v.t === Tag.OBJECT ? (v.v as object) : null;
      if (g3i instanceof GVector3i) return vector3(g3i.x, g3i.y, g3i.z);
      return v.t === Tag.OBJECT && v.v instanceof GVector3 ? v : null;
    }
    case "Vector2i": {
      const g2 = v.t === Tag.OBJECT ? (v.v as object) : null;
      if (g2 instanceof GVector2) return vector2i(g2.x, g2.y);
      return v.t === Tag.OBJECT && v.v instanceof GVector2i ? v : null;
    }
    case "Vector3i": {
      if (v.t === Tag.OBJECT && v.v instanceof GVector3i) return v;
      if (v.t === Tag.OBJECT && v.v instanceof GVector3) return vector3i(v.v.x, v.v.y, v.v.z);
      return null;
    }
    case "Vector4": {
      if (v.t === Tag.OBJECT && v.v instanceof GVector4) return v;
      if (v.t === Tag.OBJECT && v.v instanceof GVector4i) return vector4(v.v.x, v.v.y, v.v.z, v.v.w);
      return null;
    }
    case "Vector4i": {
      if (v.t === Tag.OBJECT && v.v instanceof GVector4i) return v;
      if (v.t === Tag.OBJECT && v.v instanceof GVector4) return vector4i(v.v.x, v.v.y, v.v.z, v.v.w);
      return null;
    }
    case "Color":
      return tryColorSlot(v);
    case "Array":
      return v.t === Tag.ARRAY ? v : null;
    case "Dictionary":
      return v.t === Tag.DICT ? v : null;
  }
}


export function arrIdx(i: number, len: number, base?: string, valueType = "Array"): number {
  const k = i < 0 ? i + len : i;
  if (k < 0 || k >= len) {
    throw new GodotRuntimeError("array-index", posOobSay(String(i), base, valueType));
  }
  return k;
}

/** 下标赋值那一侧的越界句：与读不同式，带上写入值的型（S403 量的，负数按原样印）。 */
export function arrIdxWrite(i: number, len: number, vt: string, base = "Array"): number {
  const k = i < 0 ? i + len : i;
  if (k < 0 || k >= len) {
    throw new GodotRuntimeError("array-index-write", `Invalid assignment of index '${String(i)}' (on base: '${base}') with value of type '${vt}'.`);
  }
  return k;
}

function fromEnd(i: number, len: number): number | null {
  const k = i < 0 ? i + len : i;
  return k < 0 || k >= len ? null : k;
}

const MINMAX_UNORDERABLE = new Set(["compare-operands", "color-cmp"]);

export class GArray {
  private items: Variant[];
  elem: ElemKind | null = null;
  className = "";
  scriptName = "";
  private ro = false;

  /** `make_read_only()` 置的那一面：浅的，只挡这个容器自己的写（S403 那一族的读数）。 */
  markReadOnly(): void {
    this.ro = true;
  }

  isReadOnly(): boolean {
    return this.ro;
  }

  constructor(items: Variant[] = []) {
    this.items = items;
  }

  static of(items: Variant[]): GArray {
    return new GArray(items);
  }

  stampElem(kind: ElemKind): void {
    this.elem = kind;
    this.items = this.items.map((x) => elemConvert(kind, x) ?? x);
  }

  elemKind(): ElemKind | null {
    return this.elem;
  }

  classNamed(): string {
    return this.className;
  }

  typedAny(): boolean {
    return this.elem !== null || this.className !== "";
  }

  private asElement(v: Variant): Variant | null {
    if (this.elem === null) return v;
    if (this.elem === "Object" && this.scriptName !== "") return classFaceMatches(this.scriptName, v);
    return elemConvert(this.elem, v);
  }

  private asElements(vs: Variant[]): Variant[] | null {
    if (this.elem === null) return vs;
    const out: Variant[] = [];
    for (const v of vs) {
      const c = elemConvert(this.elem, v);
      if (c === null) return null;
      out.push(c);
    }
    return out;
  }

  size(): number {
    return this.items.length;
  }

  raw(): Variant[] {
    return this.items;
  }

  get(i: number, base?: string): Variant {
    return this.items[arrIdx(i, this.items.length, base, this.elem === null ? "Array" : `Array[${this.elem}]`)]!;
  }

  set(i: number, v: Variant): void {
    const at = arrIdxWrite(i, this.items.length, valueTypeName(v), this.elem === null ? "Array" : `Array[${this.elem}]`);
    const c = this.asElement(v);
    if (c === null) return;
    this.items[at] = c;
  }

  append(v: Variant): void {
    const c = this.asElement(v);
    if (c !== null) this.items.push(c);
  }

  duplicate(deep = false, memo?: Map<unknown, Variant>): GArray {
    if (!deep) {
      const shared = new GArray([...this.items]);
      shared.elem = this.elem;
      return shared;
    }
    const m = memo ?? new Map<unknown, Variant>();
    const copy = new GArray([]);
    const seen = m.get(this);
    if (seen !== undefined) return (seen.v as GArray);
    m.set(this, V.array(copy));
    for (const it of this.items) copy.items.push(deepCopy(it, m));
    copy.elem = this.elem;
    return copy;
  }

  private asQuery(v: Variant): Variant | null {
    return this.elem === null ? v : elemConvert(this.elem, v);
  }

  has(v: Variant): boolean {
    const q = this.asQuery(v);
    return q !== null && this.items.some((x) => valueSame(x, q));
  }

  insertAt(at: number, v: Variant): boolean {
    const n = this.items.length;
    const k = at < 0 ? n + at : at;
    if (k < 0 || k > n) return false;
    const c = this.asElement(v);
    if (c === null) return false;
    this.items.splice(k, 0, c);
    return true;
  }

  erase(v: Variant): void {
    const i = this.findSame(v);
    if (i >= 0) this.items.splice(i, 1);
  }

  popFront(): Variant {
    return this.shiftAt(this.items.length ? 0 : null);
  }

  popBack(): Variant {
    return this.shiftAt(this.items.length ? this.items.length - 1 : null);
  }

  popAt(i: number): Variant {
    return this.shiftAt(fromEnd(i, this.items.length));
  }

  private shiftAt(k: number | null): Variant {
    if (k === null) return V.nil();
    return this.items.splice(k, 1)[0] as Variant;
  }

  pushFront(v: Variant): void {
    const c = this.asElement(v);
    if (c !== null) this.items.unshift(c);
  }

  removeAt(i: number): void {
    const k = fromEnd(i, this.items.length);
    if (k !== null) this.shiftAt(k);
  }

  fillWith(v: Variant): void {
    const c = this.asElement(v);
    if (c === null) return;
    for (let i = 0; i < this.items.length; i++) this.items[i] = c;
  }

  resize(n: number): void {
    if (n < 0 || n === this.items.length) return;
    if (n < this.items.length) {
      this.items.length = n;
      return;
    }
    const filler = this.elem === null ? null : elemDefault(this.elem);
    while (this.items.length < n) this.items.push(filler === null ? V.nil() : deepCopy(filler));
  }

  sliceItems(begin: number, end: number | null, step: number, deep: boolean): GArray {
    const n = this.items.length;
    const out: Variant[] = [];
    if (step !== 0) {
      let b = begin < 0 ? n + begin : begin;
      let e = end === null ? n : end < 0 ? n + end : end;
      if (step > 0) {
        b = Math.min(Math.max(b, 0), n);
        e = Math.min(Math.max(e, 0), n);
        for (let i = b; i < e; i += step) out.push(this.items[i] as Variant);
      } else {
        b = Math.min(Math.max(b, 0), n - 1);
        e = Math.max(e, -1);
        for (let i = b; i > e; i += step) out.push(this.items[i] as Variant);
      }
    }
    let cut: GArray;
    {
      const m = new Map<unknown, Variant>();
      cut = deep ? new GArray(out.map((x) => deepCopy(x, m))) : new GArray(out);
    }
    cut.elem = this.elem;
    return cut;
  }

  appendAll(other: GArray): void {
    const converted = this.asElements(other.raw());
    if (converted !== null) this.items.push(...converted);
  }

  assignFrom(other: GArray): void {
    const converted = this.asElements(other.raw());
    if (converted !== null) this.items = [...converted];
  }

  reverseItems(): void {
    this.items.reverse();
  }

  clearAll(): void {
    this.items = [];
  }

  findSame(v: Variant, from = 0): number {
    const q = this.asQuery(v);
    if (q === null) return -1;
    v = q;
    if (from < 0 || from >= this.items.length) return -1;
    for (let i = from; i < this.items.length; i++) if (valueSame(this.items[i] as Variant, v)) return i;
    return -1;
  }

  rfindSame(v: Variant, from = -1): number {
    const q = this.asQuery(v);
    if (q === null) return -1;
    v = q;
    const n = this.items.length;
    if (n === 0) return -1;
    let k = from < 0 ? n + from : from;
    if (k < 0 || k >= n) k = n - 1;
    for (let i = k; i >= 0; i--) if (valueSame(this.items[i] as Variant, v)) return i;
    return -1;
  }

  count(v: Variant): number {
    const q = this.asQuery(v);
    if (q === null) return 0;
    return this.items.reduce((m, x) => (valueSame(x, q) ? m + 1 : m), 0);
  }

  concat(other: GArray): GArray {
    return new GArray([...this.items, ...other.raw()]);
  }

  eq(other: GArray, depth = 0): boolean {
    return this.eqAt(other, depth);
  }

  private eqAt(other: GArray, depth: number): boolean {
    if (this.items === other.items) return true;
    if (depth >= COMPARE_DEPTH) return true;
    if (this.items.length !== other.items.length) return false;
    return this.items.every((x, i) => {
      const y = other.items[i];
      return y !== undefined && valueEq(x, y, depth + 1);
    });
  }

  same(other: GArray, depth = 0): boolean {
    return this.sameAt(other, depth);
  }

  private sameAt(other: GArray, depth: number): boolean {
    if (this.items === other.items) return true;
    if (depth >= COMPARE_DEPTH) return true;
    if (this.items.length !== other.items.length) return false;
    return this.items.every((x, i) => valueSame(x, other.items[i] as Variant, depth + 1));
  }

  /** `Array.sort()`：比较器是 `ops.sortLess` 那条（S357，与源里的装箱 `<` 和 `sort_custom` 的 Callable 都不是同一条），
   *  置换走引擎那份 `sort_array.h`（`packages/runtime/src/runtime/sort.ts`），不是 JS 的稳定 sort。 */
  sort(before: (a: Variant, b: Variant) => boolean): void {
    this.items = sortGodot(this.items, before);
  }

  sortCustom(before: (a: Variant, b: Variant) => boolean): void {
    this.items = sortGodot(this.items, before);
  }
  bsearch(value: Variant, before: boolean, cmp: (a: Variant, b: Variant) => boolean): number {
    let min = 0;
    let max = this.items.length;
    while (min < max) {
      const half = min + ((max - min) >> 1);
      const e = this.items[half] as Variant;
      if (before ? cmp(e, value) : !cmp(value, e)) min = half + 1;
      else max = half;
    }
    return min;
  }

  filterBy(p: (v: Variant) => Variant | null): GArray {
    const out: Variant[] = [];
    for (const x of this.items) {
      const r = p(x);
      if (r !== null && truthyOf(r)) out.push(x);
    }
    const kept = new GArray(out);
    kept.elem = this.elem;
    return kept;
  }

  mapBy(p: (v: Variant) => Variant | null): GArray {
    const out: Variant[] = [];
    for (const x of this.items) {
      const r = p(x);
      if (r !== null) out.push(r);
    }
    return new GArray(out);
  }

  anyBy(p: (v: Variant) => Variant | null): boolean {
    for (const x of this.items) {
      const r = p(x);
      if (r !== null && truthyOf(r)) return true;
    }
    return false;
  }

  allBy(p: (v: Variant) => Variant | null): boolean {
    for (const x of this.items) {
      const r = p(x);
      if (r === null || !truthyOf(r)) return false;
    }
    return true;
  }

  findCustom(p: (v: Variant) => Variant | null, from = 0): number {
    if (from < 0 || from >= this.items.length) return -1;
    for (let i = from; i < this.items.length; i++) {
      const r = p(this.items[i] as Variant);
      if (r !== null && truthyOf(r)) return i;
    }
    return -1;
  }

  rfindCustom(p: (v: Variant) => Variant | null, from = -1): number {
    const n = this.items.length;
    if (n === 0) return -1;
    let k = from < 0 ? n + from : from;
    if (k < 0 || k >= n) k = n - 1;
    for (let i = k; i >= 0; i--) {
      const r = p(this.items[i] as Variant);
      if (r !== null && truthyOf(r)) return i;
    }
    return -1;
  }

  extreme(
    wantMin: boolean,
    less: (a: Variant, b: Variant) => boolean,
  ): Variant | null {
    let best: Variant | null = null;
    for (const x of this.items) {
      if (best === null) {
        best = x;
        continue;
      }
      let before: boolean;
      try {
        before = wantMin ? less(x, best) : less(best, x);
      } catch (e) {
        const code = (e as { code?: string }).code ?? "";
        if (MINMAX_UNORDERABLE.has(code)) return null;
        if (code === "compare-string-name" && !(x.t === Tag.STRING_NAME && best.t === Tag.STRING_NAME)) return null;
        throw e;
      }
      if (before) best = x;
    }
    return best;
  }
}

export class GDict {
  private ks: Variant[] = [];
  private vs: Variant[] = [];
  private index = new Map<string, number>();
  private bkt: string[] = [];
  private prev: number[] = [];
  keyKind: ElemKind | null = null;
  valKind: ElemKind | null = null;
  private ro = false;

  markReadOnly(): void {
    this.ro = true;
  }

  isReadOnly(): boolean {
    return this.ro;
  }

  stampElem(k: ElemKind, val: ElemKind): void {
    this.keyKind = k;
    this.valKind = val;
    const ks = this.ks;
    const vs = this.vs;
    this.ks = [];
    this.vs = [];
    this.index = new Map();
    this.bkt = [];
    this.prev = [];
    for (let i = 0; i < ks.length; i++) this.set(ks[i] as Variant, vs[i] as Variant);
  }

  private conv(k: Variant, v: Variant): [Variant, Variant] | null {
    const kk = this.keyKind === null ? k : elemConvert(this.keyKind, k);
    if (kk === null) return null;
    const vv = this.valKind === null ? v : elemConvert(this.valKind, v);
    if (vv === null) return null;
    return [kk, vv];
  }

  size(): number {
    return this.ks.length;
  }

  keys(): Variant[] {
    return [...this.ks];
  }

  values(): Variant[] {
    return [...this.vs];
  }

  sortKeys(before: (a: Variant, b: Variant) => boolean): void {
    const ks = this.ks;
    const vs = this.vs;
    const order = sortGodot(ks.map((_, i) => i), (x, y) => before(ks[x] as Variant, ks[y] as Variant));
    const nk = order.map((i) => ks[i] as Variant);
    const nv = order.map((i) => vs[i] as Variant);
    this.ks = [];
    this.vs = [];
    this.index = new Map();
    this.bkt = [];
    this.prev = [];
    for (let i = 0; i < nk.length; i++) this.set(nk[i] as Variant, nv[i] as Variant);
  }

  private asQuery(k: Variant): Variant | null {
    return this.keyKind === null ? k : elemConvert(this.keyKind, k);
  }

  private slot(b: string, q: Variant): number {
    let i = this.index.get(b);
    if (i === undefined) return -1;
    if (b[0] !== "c") return i;
    while (i >= 0) {
      const k = this.ks[i];
      if (k !== undefined && valueSame(k, q)) return i;
      i = this.prev[i] as number;
    }
    return -1;
  }

  has(k: Variant): boolean {
    const q = this.asQuery(k);
    return q !== null && this.slot(keyOf(q), q) >= 0;
  }

  get(k: Variant): Variant {
    const q = this.asQuery(k);
    if (q === null) return V.nil();
    const i = this.slot(keyOf(q), q);
    if (i < 0) return V.nil();
    return this.vs[i] ?? V.nil();
  }

  /** 引擎报基名的那一拼法：定形字典带键值型，其余就是 `Dictionary`（S405 两句都用它）。 */
  typeLabel(): string {
    return this.keyKind === null || this.valKind === null ? "Dictionary" : `Dictionary[${this.keyKind}, ${this.valKind}]`;
  }

  getRequired(k: Variant): Variant {
    const q = this.asQuery(k);
    const i = q === null ? -1 : this.slot(keyOf(q), q);
    if (i < 0) {
      throw new GodotRuntimeError("dict-key", `Invalid access to property or key '${show(k)}' on a base object of type '${this.typeLabel()}'.`);
    }
    return this.vs[i] as Variant;
  }

  set(k: Variant, v: Variant): void {
    const cv = this.conv(k, v);
    if (cv === null) return;
    k = cv[0];
    v = cv[1];
    const b = keyOf(k);
    const i = this.slot(b, k);
    if (i >= 0) {
      this.vs[i] = v;
      return;
    }
    const older = this.index.get(b);
    this.index.set(b, this.ks.length);
    this.bkt.push(b);
    this.prev.push(older === undefined ? -1 : older);
    this.ks.push(k);
    this.vs.push(v);
  }

  duplicate(deep = false, memo?: Map<unknown, Variant>): GDict {
    const d = new GDict();
    d.keyKind = this.keyKind;
    d.valKind = this.valKind;
    if (deep) {
      const m = memo ?? new Map<unknown, Variant>();
      const seen = m.get(this);
      if (seen !== undefined) return (seen.v as GDict);
      m.set(this, V.dict(d));
      for (let i = 0; i < this.ks.length; i++) {
        const k = this.ks[i];
        const v = this.vs[i];
        if (k !== undefined && v !== undefined) d.set(deepCopy(k, m), deepCopy(v, m));
      }
      return d;
    }
    for (let i = 0; i < this.ks.length; i++) {
      const k = this.ks[i];
      const v = this.vs[i];
      if (k === undefined || v === undefined) continue;
      const b = this.bkt[i] as string;
      const older = d.index.get(b);
      d.index.set(b, d.ks.length);
      d.bkt.push(b);
      d.prev.push(older === undefined ? -1 : older);
      d.ks.push(k);
      d.vs.push(v);
    }
    return d;
  }

  erase(k: Variant): boolean {
    const q = this.asQuery(k);
    if (q === null) return false;
    const b = keyOf(q);
    const i = this.slot(b, q);
    if (i < 0) return false;
    const older = this.prev[i] as number;
    if (this.index.get(b) === i) {
      if (older < 0) this.index.delete(b);
      else this.index.set(b, older);
    }
    this.ks.splice(i, 1);
    this.vs.splice(i, 1);
    this.bkt.splice(i, 1);
    this.prev.splice(i, 1);
    for (let j = 0; j < this.prev.length; j++) {
      if (this.prev[j] === i) this.prev[j] = older;
      else if ((this.prev[j] as number) > i) this.prev[j] = (this.prev[j] as number) - 1;
    }
    for (const [kk, ii] of [...this.index.entries()]) {
      if (ii > i) this.index.set(kk, ii - 1);
    }
    return true;
  }

  clearAll(): void {
    this.ks = [];
    this.vs = [];
    this.index = new Map();
    this.bkt = [];
    this.prev = [];
  }

  mergeWith(other: GDict, overwrite: boolean): void {
    const ks = other.keys();
    const vs = other.values();
    for (let i = 0; i < ks.length; i++) {
      const k = ks[i] as Variant;
      if (!overwrite && this.has(k)) continue;
      this.set(k, vs[i] as Variant);
    }
  }

  hasAll(keys: GArray): boolean {
    return keys.raw().every((k) => this.has(k));
  }

  findKey(v: Variant): Variant {
    const q = this.valKind === null ? v : elemConvert(this.valKind, v);
    if (q === null) return V.nil();
    for (let i = 0; i < this.vs.length; i++) {
      if (valueSame(this.vs[i] as Variant, q)) return this.ks[i] as Variant;
    }
    return V.nil();
  }

  assignFrom(other: GDict): void {
    const ks = other.keys();
    const vs = other.values();
    this.ks = [];
    this.vs = [];
    this.index = new Map();
    this.bkt = [];
    this.prev = [];
    for (let i = 0; i < ks.length; i++) this.set(ks[i] as Variant, vs[i] as Variant);
  }

  isEmpty(): boolean {
    return this.ks.length === 0;
  }

  same(other: GDict, depth = 0): boolean {
    return this.sameAt(other, depth);
  }

  private sameAt(other: GDict, depth: number): boolean {
    if (this === other) return true;
    if (depth >= COMPARE_DEPTH) return true;
    if (this.size() !== other.size()) return false;
    return this.ks.every((k, i) => {
      for (let j = 0; j < other.ks.length; j++) {
        if (valueSame(k, other.ks[j] as Variant, depth + 1)) {
          return valueSame(this.vs[i] as Variant, other.vs[j] as Variant, depth + 1);
        }
      }
      return false;
    });
  }

  eq(other: GDict, depth = 0): boolean {
    return this.eqAt(other, depth);
  }

  private eqAt(other: GDict, depth: number): boolean {
    if (this === other) return true;
    if (depth >= COMPARE_DEPTH) return true;
    if (this.size() !== other.size()) return false;
    for (let i = 0; i < this.ks.length; i++) {
      const b = this.bkt[i];
      let found = false;
      for (let j = 0; j < other.ks.length; j++) {
        if (other.bkt[j] === b) {
          found = valueEq(this.vs[i] as Variant, other.vs[j] as Variant, depth + 1);
          break;
        }
      }
      if (!found) return false;
    }
    return true;
  }
}

function deepCopy(v: Variant, memo?: Map<unknown, Variant>): Variant {
  if (v.t === Tag.ARRAY) return V.array((v.v as GArray).duplicate(true, memo));
  if (v.t === Tag.DICT) return V.dict((v.v as GDict).duplicate(true, memo));
  return { t: v.t, v: v.v };
}

/** `Array[类名]` 标注那一族（S615 量了 `Array[RefCounted]` / `Array[Object]` / `Array[Node]`）：元素按 Object 收，类名照标注挂。 */
export function stampClassArray(v: Variant, cls: string, fromLiteral: boolean): Variant {
  return stampArray(v, "Object", fromLiteral, cls);
}

export function stampScriptArray(v: Variant, name: string, nativeBase: string, fromLiteral: boolean): Variant {
  const g = v.t === Tag.ARRAY ? (v.v as GArray) : null;
  if (g === null) throw new UnsupportedError("typed-assign", `Array[${name}] 的初值不是数组`);
  if (!fromLiteral) return assignContainer(v, `Array[${name}]`);
  g.stampElem("Object");
  g.className = nativeBase;
  g.scriptName = name;
  return v;
}

export function arrayTypeLabel(g: GArray): string {
  if (g.elem === null) return "Array";
  const name = g.scriptName !== "" ? g.scriptName : g.className;
  return `Array[${name === "" ? g.elem : name}]`;
}

/** `word` 是不带冠词的引擎拼法（S619 实参位那两句要用）。 */
export function containerFace(v: Variant): { word: string; label: string } | null {
  if (v.t === Tag.ARRAY) return { word: "array", label: arrayTypeLabel(v.v as GArray) };
  if (v.t === Tag.DICT) return { word: "dictionary", label: (v.v as GDict).typeLabel() };
  return null;
}

function needSameFace(v: Variant, target: string, say: (word: string, src: string) => string): Variant {
  const c = containerFace(v);
  if (c === null) throw new UnsupportedError("typed-assign", `定形容器的槽位只实测过 Array 与 Dictionary 源（收到 ${tagName(v.t)}）`);
  if (c.label === target) return v;
  throw new GodotRuntimeError("typed-assign", say(c.word === "array" ? "an array" : "a dictionary", c.label));
}

export function assignContainer(v: Variant, target: string): Variant {
  return needSameFace(v, target, (word, src) => `Trying to assign ${word} of type "${src}" to a variable of type "${target}".`);
}

export function returnContainer(v: Variant, target: string): Variant {
  return needSameFace(v, target, (word, src) => `Trying to return ${word} of type "${src}" where expected return type is "${target}".`);
}

export function stampArray(v: Variant, kind: ElemKind, fromLiteral: boolean, cls = ""): Variant {
  const g = v.t === Tag.ARRAY ? (v.v as GArray) : null;
  if (g === null) throw new UnsupportedError("typed-assign", `Array[${kind}] 的初值不是数组`);
  const target = `Array[${cls === "" ? kind : cls}]`;
  if (!fromLiteral) return assignContainer(v, target);
  g.stampElem(kind);
  g.className = cls;
  return v;
}

export function stampDict(v: Variant, k: ElemKind, val: ElemKind, fromLiteral: boolean): Variant {
  const d = v.t === Tag.DICT ? (v.v as GDict) : null;
  if (d === null) throw new UnsupportedError("typed-assign", `Dictionary[${k}, ${val}] 的初值不是字典`);
  if (!fromLiteral) return assignContainer(v, `Dictionary[${k}, ${val}]`);
  d.stampElem(k, val);
  return v;
}






/** `contains(needle)`：**空 needle 不算包含** —— JS 的 `includes` 恰好给 true，不特判就是静默错。 */





/** 单码点的 Godot 简单降档，供不区分大小写的比较用（Godot 的大小写表永不撑开）。 */







/** `String.reverse()`（S574）：按码点反转（`"aé😀"`→`😀éa`）。 */













/** `String.json_escape()`（S575）：反斜杠、五个控制转义、`\v`、双引号；其余控制字符原样。 */






/** `String.validate_node_name()`（S575）：只换 `.` `:` `@` `/` `"` 五个，前后空白不动。 */





















/** `String.is_valid_ip_address()`（S577）：长度门槛 16 / 40，带 `:` 走 IPv6（含嵌入 IPv4），否则走点分 IPv4。 */


















/** `get_slice`：切段取第 n 段。找不到分隔符时整串就是那一段（实测任意 n ≥ 0 都回原串），负数与越界回空。 */












export type ScriptPropFace = { props: Array<{ name: string; value: Variant }>; unmodeledBase: string | null };
let scriptPropsHook: ((inner: object) => ScriptPropFace | null) | null = null;

export function registerScriptPropsHook(f: (inner: object) => ScriptPropFace | null): void {
  scriptPropsHook = f;
}

let objectLabelHook: ((inner: object) => string | null) | null = null;

export function registerObjectLabelHook(f: (inner: object) => string | null): void {
  objectLabelHook = f;
}

let varToStrValueHook: ((inner: object) => string | null) | null = null;

export function registerVarToStrValueHook(f: (inner: object) => string | null): void {
  varToStrValueHook = f;
}

export function strFormatV(text: string, v: Variant, ph: string): string {
  const items: Array<[string, Variant]> = [];
  if (v.t === Tag.ARRAY) {
    const raw = (v.v as GArray).raw();
    for (let j = 0; j < raw.length; j++) {
      const el = raw[j] as Variant;
      if (el.t === Tag.ARRAY) {
        const pair = (el.v as GArray).raw();
        if (pair.length !== 2) continue;
        items.push([show(pair[0] as Variant), pair[1] as Variant]);
      } else {
        items.push([String(j), el]);
      }
    }
  } else if (v.t === Tag.DICT) {
    const d = v.v as GDict;
    const keys = d.keys();
    const vals = d.values();
    for (let j = 0; j < keys.length; j++) items.push([show(keys[j] as Variant), vals[j] as Variant]);
  } else if (v.t === Tag.OBJECT) {
    const face = scriptPropsHook === null ? null : scriptPropsHook(v.v as object);
    if (face === null) return text;
    if (face.unmodeledBase !== null) {
      throw new UnsupportedError("format-object", `String.format() 的实参是挂在 ${face.unmodeledBase} 上的脚本实例：引擎那一侧的属性表没量过，不猜`);
    }
    const scriptKey = ph.split("_").join("script");
    if (scriptKey !== "" && text.indexOf(scriptKey) >= 0) {
      throw new UnsupportedError("format-object", `String.format() 撞上 ${scriptKey}：引擎那一格打的是 ():<GDScript#一个进程内的号>，复现不了`);
    }
    let objOut = text;
    for (const p of face.props) {
      const key = ph.split("_").join(p.name);
      if (key === "") continue;
      objOut = strReplace(objOut, key, show(p.value));
    }
    return objOut;
  } else {
    return text;
  }
  const hasMark = ph.indexOf("_") >= 0;
  let out = text;
  for (const [key, val] of items) {
    const valText = show(val);
    if (hasMark) out = strReplace(out, ph.split("_").join(key), valText);
    else if (ph !== "") {
      const at = out.indexOf(ph);
      if (at >= 0) out = out.slice(0, at) + valText + out.slice(at + ph.length);
    }
  }
  return out;
}


/** 只按「有没有非法字符 + 是不是空串」判，Windows 保留名不管（实测 `con` 与 `..` 都是合法文件名）。 */






/** 引擎那道判据：`is_digit(ord) || is_ascii_upper_case(ord)` —— 大写字母全过，但 `G`..`Z` 到 `strtol` 那里就不是 hex 位了。 */

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

const SV_VALUE_CTORS = new Set(["Vector2", "Vector2i", "Vector3", "Vector3i", "Vector4", "Vector4i", "Color"]);
const SV_PACK_CTORS: Record<string, PackKind> = {
  PackedByteArray: "byte",
  PackedInt32Array: "int32",
  PackedInt64Array: "int64",
  PackedFloat32Array: "float32",
  PackedFloat64Array: "float64",
  PackedStringArray: "string",
  PackedVector2Array: "vector2",
};
const SV_UNSHIPPED_CTORS = new Set(["Rect2", "Quaternion", "PackedVector3Array", "PackedColorArray"]);

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


/** 只转义实测到的这十个；其它控制字符与非 ASCII 一律原样出门。 */

const TWO_63_B = 9223372036854775808;



const FMT_TYPES = new Set(["d", "o", "x", "X", "c", "s", "f", "v"]);

const FMT_ERR = {
  unsupported: "unsupported format character in operator '%'.",
  incomplete: "incomplete format in operator '%'.",
  number: "a number is required in operator '%'.",
  char: "%c requires number or single-character string in operator '%'.",
  lower: "unsigned integer is lower than minimum in operator '%'.",
  upper: "unsigned integer is greater than maximum in operator '%'.",
  vector: "%v requires a vector type (Vector2/3/4/2i/3i/4i) in operator '%'.",
  star: "* wants number or vector in operator '%'.",
  notAll: "not all arguments converted during string formatting in operator '%'.",
  notEnough: "not enough arguments for format string in operator '%'.",
};

interface FmtSpec {
  flags: string;
  width: number;
  prec: number | null;
  type: string;
  text: string;
  widthStars: number;
  precStars: number;
}

type FmtTok = { lit: string } | { spec: FmtSpec };

function padFmt(body: string, sign: string, sp: FmtSpec): string {
  const left = sp.flags.includes("-");
  const zero = !left && sp.flags.includes("0");
  if (zero && sp.width > 0) return sign + body.padStart(sp.width - sign.length, "0");
  const raw = sign + body;
  if (raw.length >= sp.width) return raw;
  return left ? raw.padEnd(sp.width) : raw.padStart(sp.width);
}

function fmtNum(a: Variant, sp: FmtSpec): number {
  if (a.t === Tag.INT) return intToNum(a.v as IntPayload);
  if (a.t === Tag.FLOAT) return a.v as number;
  throw new GodotRuntimeError("format-number", FMT_ERR.number);
}

/** `%d %x %X %o` 共用的截断：float 走 `(int64)trunc(v)`，越界给 -9223372036854775808 那一格（w04–w06）。 */
function fmtTruncMag(a: Variant, sp: FmtSpec): { neg: boolean; mag: bigint } {
  if (a.t === Tag.INT) {
    const p = intToBig(a.v as IntPayload);
    return { neg: p < 0n, mag: p < 0n ? -p : p };
  }
  const v = fmtNum(a, sp);
  const t = Number.isFinite(v) ? Math.trunc(v) : Number.NaN;
  const inRange = Number.isFinite(t) && t >= -TWO_63_B && t < TWO_63_B;
  if (!inRange) return { neg: true, mag: 2n ** 63n };
  const b = BigInt(t);
  return { neg: b < 0n, mag: b < 0n ? -b : b };
}

function fmtVecComps(a: Variant): number[] | null {
  if (a.t !== Tag.OBJECT) return null;
  const o = a.v as object;
  if (o instanceof GVector2) return [o.x, o.y];
  if (o instanceof GVector2i) return [o.x, o.y];
  if (o instanceof GVector3) return [o.x, o.y, o.z];
  if (o instanceof GVector3i) return [o.x, o.y, o.z];
  if (o instanceof GVector4) return [o.x, o.y, o.z, o.w];
  if (o instanceof GVector4i) return [o.x, o.y, o.z, o.w];
  return null;
}

/** 向量的每一支按 `%f` 的默认精度印（实测 `(1.000000, 2.000000)`，`%.2v` 给 `(1.00, 2.00)`，INF / NAN 给 `inf` / `nan`）。 */
function fmtVecPart(v: number, prec: number | null): string {
  if (!Number.isFinite(v)) return Number.isNaN(v) ? "nan" : v < 0 ? "-inf" : "inf";
  return (Object.is(v, -0) || v < 0 ? "-" : "") + Math.abs(v).toFixed(prec ?? 6);
}

export function strFormat(fmt: string, args: Variant[]): string {
  const toks: FmtTok[] = [];
  let lit = "";
  let specs = 0;
  for (let i = 0; i < fmt.length; i++) {
    if (fmt[i] !== "%") {
      lit += fmt[i];
      continue;
    }
    let k = i + 1;
    let flags = "";
    while (k < fmt.length && (fmt[k] === "-" || fmt[k] === "+" || fmt[k] === "0" || fmt[k] === "u")) {
      flags += fmt[k];
      k++;
    }
    if (fmt[k] === "%") {
      lit += "%";
      i = k;
      continue;
    }
    let width = 0;
    let widthStars = 0;
    if (fmt[k] === "*") {
      widthStars = 1;
      k++;
      while (fmt[k] === "*") {
        widthStars++;
        k++;
      }
    } else {
      while (k < fmt.length && fmt[k]! >= "0" && fmt[k]! <= "9") {
        width = width * 10 + (fmt[k]!.charCodeAt(0) - 48);
        k++;
      }
    }
    let prec: number | null = null;
    let precStars = 0;
    if (fmt[k] === ".") {
      k++;
      if (fmt[k] === "*") {
        precStars = 1;
        k++;
        while (fmt[k] === "*") {
          precStars++;
          k++;
        }
      } else {
        prec = 0;
        while (k < fmt.length && fmt[k]! >= "0" && fmt[k]! <= "9") {
          prec = prec * 10 + (fmt[k]!.charCodeAt(0) - 48);
          k++;
        }
      }
    }
    const t = fmt[k];
    if (t === undefined) throw new GodotRuntimeError("format-spec", FMT_ERR.incomplete);
    if (!FMT_TYPES.has(t)) throw new GodotRuntimeError("format-spec", FMT_ERR.unsupported);
    toks.push({ lit });
    lit = "";
    toks.push({ spec: { flags, width, prec, type: t, text: fmt.slice(i, k + 1), widthStars, precStars } });
    specs += 1 + widthStars + precStars;
    i = k;
  }
  toks.push({ lit });

  let ai = 0;
  let out = "";
  for (const tk of toks) {
    if ("lit" in tk) {
      out += tk.lit;
      continue;
    }
    const spec = tk.spec;
    let sp = spec;
    if (spec.widthStars + spec.precStars > 0) {
      let width = spec.width;
      let prec = spec.prec;
      for (let s = 0; s < spec.widthStars; s++) {
        if (ai >= args.length) throw new GodotRuntimeError("format-arity", FMT_ERR.notEnough);
        width = fmtStar(args[ai++]!);
      }
      for (let s = 0; s < spec.precStars; s++) {
        if (ai >= args.length) throw new GodotRuntimeError("format-arity", FMT_ERR.notEnough);
        prec = fmtStar(args[ai++]!);
      }
      sp = { ...spec, width, prec };
    }
    if (ai >= args.length) throw new GodotRuntimeError("format-arity", FMT_ERR.notEnough);
    const a = args[ai++]!;
    switch (sp.type) {
      case "s":
        out += padFmt(show(a), "", sp);
        break;
      case "d": {
        const { neg, mag } = fmtTruncMag(a, sp);
        out += padFmt(mag.toString(10), neg ? "-" : sp.flags.includes("+") ? "+" : "", sp);
        break;
      }
      case "f": {
        const v = fmtNum(a, sp);
        if (!Number.isFinite(v)) {
          const words = sp.flags.replace("0", "");
          const body = Number.isNaN(v) ? "nan" : "inf";
          const sign = Number.isNaN(v) ? "" : v < 0 ? "-" : sp.flags.includes("+") ? "+" : "";
          out += padFmt(body, sign, { ...sp, flags: words });
          break;
        }
        const body = Math.abs(v).toFixed(sp.prec ?? 6);
        const neg = Object.is(v, -0) || v < 0;
        out += padFmt(body, neg ? "-" : sp.flags.includes("+") ? "+" : "", sp);
        break;
      }
      case "x":
      case "X":
      case "o": {
        const { neg, mag } = fmtTruncMag(a, sp);
        const base = sp.type === "o" ? 8 : 16;
        const body = sp.type === "X" ? mag.toString(base).toUpperCase() : mag.toString(base);
        out += padFmt(body, neg ? "-" : sp.flags.includes("+") ? "+" : "", sp);
        break;
      }
      case "c": {
        if (a.t === Tag.STRING) {
          const s = a.v as string;
          if (s.length !== 1) throw new GodotRuntimeError("format-char", FMT_ERR.char);
          out += padFmt(s, "", sp);
          break;
        }
        if (a.t !== Tag.INT && a.t !== Tag.FLOAT) throw new GodotRuntimeError("format-char", FMT_ERR.char);
        const cp = a.t === Tag.INT ? intToBig(a.v as IntPayload) : fmtStarCodepoint(a.v as number);
        if (cp < 0n) throw new GodotRuntimeError("format-char", FMT_ERR.lower);
        if (cp > 1114111n) throw new GodotRuntimeError("format-char", FMT_ERR.upper);
        out += padFmt(String.fromCodePoint(Number(cp)), "", sp);
        break;
      }
      case "v": {
        const comps = fmtVecComps(a);
        if (comps === null) throw new GodotRuntimeError("format-vector", FMT_ERR.vector);
        const body = comps.map((c) => padFmt(fmtVecPart(c, sp.prec), "", sp)).join(", ");
        out += "(" + body + ")";
        break;
      }
    }
  }
  if (args.length > specs) throw new GodotRuntimeError("format-arity", FMT_ERR.notAll);
  return out;
}

/** `%` 那一路的格式化：运行期失败时引擎**不中断脚本** —— 推一块 ERROR，把格式串原样回出去
 *  （实测 `tmp/d6/s491c.py` 二十格 + `tmp/d6/s491e.py` 十二格：`"%d" % "ab"` 回 `"%d"`、`"ab" % 1` 回 `"ab"`、
 *  `"%s%s" % "ab"` 回 `"%s%s"`）。那句与解析期同文，只少了 ` in operator '%'.` 那截尾巴。 */
export function strFormatSoft(fmt: string, args: Variant[]): { text: string; fail: string | null } {
  try {
    return { text: strFormat(fmt, args), fail: null };
  } catch (err) {
    if (!(err instanceof GodotRuntimeError) || !err.code.startsWith("format-")) throw err;
    return { text: fmt, fail: err.message.replace(" in operator '%'.", ".") };
  }
}

function fmtStarCodepoint(v: number): bigint {
  if (!Number.isFinite(v)) return -(2n ** 63n);
  const t = Math.trunc(v);
  return t >= -TWO_63_B && t < TWO_63_B ? BigInt(t) : -(2n ** 63n);
}

function fmtStar(a: Variant): number {
  if (a.t === Tag.INT || a.t === Tag.FLOAT) {
    const p = a.t === Tag.INT ? intToBig(a.v as IntPayload) : BigInt(fmtStarCodepoint(a.v as number));
    return p > 0n && p <= 10000000n ? Number(p) : 0;
  }
  if (fmtVecComps(a) === null) throw new GodotRuntimeError("format-star", FMT_ERR.star);
  return 0;
}






/** `String.num(v)`：与 str()/print() 同一条浮点印法，唯一差别是 -0.0 给 `-0.0`（print 给 `0.0`）。 */





/** `num_uint64` 的实参按 **无符号** 解释（4.6.3 实测 `String.num_uint64(-1)` → `18446744073709551615`）：先折进 `[0, 2^64)`。 */

function numInBase(n: bigint, base: number, cap: boolean, unsigned: boolean): string {
  if (!Number.isInteger(base) || base < 2 || base > 36) return "";
  const B = BigInt(base);
  const sign = !unsigned && n < 0n;
  let chars = 0;
  let m = n;
  do {
    m = m / B;
    chars++;
  } while (m !== 0n);
  if (sign) chars++;
  const out: string[] = new Array(chars);
  let i = chars;
  m = n;
  do {
    const mod = m % B;
    const d = mod < 0n ? -mod : mod;
    i--;
    out[i] = d >= 10n ? String.fromCharCode((cap ? 65 : 97) + Number(d) - 10) : String.fromCharCode(48 + Number(d));
    m = m / B;
  } while (m !== 0n);
  if (sign) out[0] = "-";
  return out.join("");
}






export function stringStatic(name: string, args: Variant[] = []): Variant {
  switch (name) {
    case "chr": {
      const v = args[0];
      if (v === undefined) throw new GodotRuntimeError("arity", "String.chr() 缺少参数");
      return stringChr(V.int(Number(BigInt.asIntN(32, int64ParamBig(v, "String.chr() 的实参")))));
    }
    case "num": {
      const v = args[0];
      if (v === undefined) throw new GodotRuntimeError("arity", "String.num() 缺少参数");
      const d = args[1] === undefined ? -1 : Number(BigInt.asIntN(32, int64ParamBig(args[1], "String.num() 的 decimals")));
      if (v.t === Tag.FLOAT) return V.str(strNumDecimals(v.v as number, d));
      if (v.t === Tag.INT) return V.str(strNumDecimals(intToNum(v.v as IntPayload), d));
      if (v.t === Tag.BOOL) return V.str(strNumDecimals(v.v ? 1 : 0, d));
      throw new GodotRuntimeError("string-arg", `String.num() 不接受 ${tagName(v.t)}`);
    }
    case "num_int64":
    case "num_uint64": {
      const v = args[0];
      if (v === undefined) throw new GodotRuntimeError("arity", `String.${name}() 缺少参数`);
      const n0 = int64ParamBig(v, `String.${name}() 的参数`);
      const base = args[1] === undefined ? 10 : Number(int64ParamBig(args[1], `String.${name}() 的 base`));
      const cap = args[2] === undefined ? false : truthyOf(args[2]);
      const n = name === "num_uint64" ? wrapUnsigned64(n0) : n0;
      return V.str(numInBase(n, base, cap, name === "num_uint64"));
    }
    case "num_scientific": {
      const v = args[0];
      if (v === undefined) throw new GodotRuntimeError("arity", "String.num_scientific() 缺少参数");
      if (v.t === Tag.FLOAT) return V.str(strSci(v.v as number));
      if (v.t === Tag.INT) return V.str(strSci(intToNum(v.v as IntPayload)));
      if (v.t === Tag.BOOL) return V.str(strSci(v.v ? 1 : 0));
      throw new GodotRuntimeError("string-arg", `String.num_scientific() 不接受 ${tagName(v.t)}`);
    }
    case "humanize_size": {
      const v = args[0];
      if (v === undefined) throw new GodotRuntimeError("arity", "String.humanize_size() 缺少参数");
      return strHumanizeSize(v);
    }
    default:
      throw new UnsupportedError(
        "string-static",
        `String.${name} 未实现（实测存在的静态成员是 chr/num/num_int64/num_scientific/humanize_size；num_float 这类 Godot 根本没有）`,
      );
  }
}

/** `str(a, b, c…)`：每个实参按 print 那套渲染，然后**无分隔拼起来**。 */
export function strBuiltin(args: Variant[]): Variant {
  return V.str(args.map((v) => show(v)).join(""));
}



export function nodePathCtor(args: Variant[]): Variant {
  if (args.length === 0) return emptyNodePath();
  if (args.length === 1) {
    const v = args[0] as Variant;
    if (v.t === Tag.STRING || v.t === Tag.STRING_NAME) return nodePathValue(v.v as string);
    if (asNodePath(v) !== null) return v;
  }
  throw new GodotRuntimeError(
    "node-path-ctor",
    `No constructor of "NodePath" matches the signature "NodePath(${args.map((a) => valueTypeName(a)).join(", ")})".`,
  );
}

export function toStringNameSlot(v: Variant): Variant {
  if (v.t === Tag.STRING_NAME) return v;
  if (v.t === Tag.STRING) return V.stringName(v.v as string);
  throw new UnsupportedError("string-name-slot", `StringName 槽只收 StringName / String，收到 ${tagName(v.t)}`);
}

export const PRINT_DEPTH = 101;

export const COMPARE_DEPTH = 52;

registerPackStringifier((v) => show(v));

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

export function show(v: Variant, depth = 0): string {
  switch (v.t) {
    case Tag.NIL:
      return "<null>";
    case Tag.BOOL:
      return v.v ? "true" : "false";
    case Tag.INT:
      return String(v.v);
    case Tag.FLOAT:
      return strFloat(v.v as number);
    case Tag.STRING:
      return v.v as string;
    case Tag.STRING_NAME:
      return v.v as string;
    case Tag.ARRAY: {
      if (depth >= PRINT_DEPTH) return "[...]";
      const g = v.v as GArray;
      return `[${g.raw().map((x) => repr(x, depth + 1)).join(", ")}]`;
    }
    case Tag.DICT: {
      if (depth >= PRINT_DEPTH) return "{ ... }";
      const d = v.v as GDict;
      const vs = d.values();
      const parts = d.keys().map((k, i) => `${repr(k, depth + 1)}: ${repr(vs[i] as Variant, depth + 1)}`);
      return `{ ${parts.join(", ")} }`;
    }
    case Tag.OBJECT: {
      const inner = v.v;
      if (inner instanceof GVector2) {
        return `(${strVec2(inner.x)}, ${strVec2(inner.y)})`;
      }
      if (inner instanceof GVector3) {
        return `(${strVec2(inner.x)}, ${strVec2(inner.y)}, ${strVec2(inner.z)})`;
      }
      if (inner instanceof GVector4) {
        return `(${strVec2(inner.x)}, ${strVec2(inner.y)}, ${strVec2(inner.z)}, ${strVec2(inner.w)})`;
      }
      if (inner instanceof GVector2i) {
        return `(${String(inner.x)}, ${String(inner.y)})`;
      }
      if (inner instanceof GVector3i) {
        return `(${String(inner.x)}, ${String(inner.y)}, ${String(inner.z)})`;
      }
      if (inner instanceof GVector4i) {
        return `(${String(inner.x)}, ${String(inner.y)}, ${String(inner.z)}, ${String(inner.w)})`;
      }
      if (inner instanceof GColor) {
        return `(${strColor(inner.r)}, ${strColor(inner.g)}, ${strColor(inner.b)}, ${strColor(inner.a)})`;
      }
      if (inner instanceof GBytes) {
        return `[${packItems(inner as GBytes).map((e) => repr(e, depth + 1)).join(", ")}]`;
      }
      const innerRid = asRid(v);
      if (innerRid !== null) return ridText(innerRid);
      const innerNp = asNodePath(v);
      if (innerNp !== null) return nodePathText(innerNp);
      if (isNullRefValue(inner)) return "<Object#null>";
      if (inner instanceof GdNativeClass) return `<GDScriptNativeClass#${String(inner.gdObjectId)}>`;
      if (isWeakRefBox(inner)) return `<WeakRef#${String(inner.gdObjectId)}>`;
      if (isEncodedObjectIdBox(inner)) return `<EncodedObjectAsID#${String(inner.gdObjectId)}>`;
      const shape = objectLabelHook === null ? null : objectLabelHook(inner as object);
      if (shape !== null) return shape;
      if (isCallable(v)) {
        const label = callableLabel(inner as CallableBox);
        if (label !== null) return label;
      }
      throw new UnsupportedError("show-type", "print 不支持该对象类型");
    }
    default:
      throw new UnsupportedError("show-type", `print 不支持 ${tagName(v.t)}`);
  }
}

export function repr(v: Variant, depth = 0): string {
  if (v.t === Tag.STRING) return `"${strCEscape(v.v as string)}"`;
  if (v.t === Tag.STRING_NAME) return `&"${strCEscape(v.v as string)}"`;
  const np = asNodePath(v);
  if (np !== null) return `^"${strCEscape(nodePathText(np))}"`;
  return show(v, depth);
}

export function strJoin(sep: string, g: GArray): string {
  const items = g.raw();
  let out = "";
  for (let i = 0; i < items.length; i++) {
    if (i > 0) out += sep;
    out += show(items[i] as Variant);
  }
  return out;
}


export function valueEq(a: Variant, b: Variant, depth = 0, op = "=="): boolean {
  const ta = a.t;
  const tb = b.t;
  const a2 = asVec2(a);
  const b2 = asVec2(b);
  const a3 = asVec3(a);
  const b3 = asVec3(b);
  const ai = asVec2i(a);
  const bi = asVec2i(b);
  const ai3 = asVec3i(a);
  const bi3 = asVec3i(b);
  const a4 = asVec4(a);
  const b4 = asVec4(b);
  const ai4 = asVec4i(a);
  const bi4 = asVec4i(b);
  const ac = asColor(a);
  const bc = asColor(b);
  const ar = asRid(a);
  const br = asRid(b);
  const anp = asNodePath(a);
  const bnp = asNodePath(b);
  if (ar !== null || br !== null) {
    if (ar !== null && br !== null) return String(ar.id) === String(br.id);
    const ridOther: Variant = ar !== null ? b : a;
    if (ridOther.t === Tag.NIL) return false;
    throw new GodotRuntimeError("eq-operands", `Invalid operands '${valueTypeName(a)}' and '${valueTypeName(b)}' in operator '${op}'.`);
  }
  if (
    a2 !== null ||
    b2 !== null ||
    a3 !== null ||
    b3 !== null ||
    ai !== null ||
    bi !== null ||
    ai3 !== null ||
    bi3 !== null ||
    a4 !== null ||
    b4 !== null ||
    ai4 !== null ||
    bi4 !== null ||
    ac !== null ||
    bc !== null
  ) {
    if (a2 !== null && b2 !== null) return a2.x === b2.x && a2.y === b2.y;
    if (a3 !== null && b3 !== null) return a3.x === b3.x && a3.y === b3.y && a3.z === b3.z;
    if (a4 !== null && b4 !== null) return a4.x === b4.x && a4.y === b4.y && a4.z === b4.z && a4.w === b4.w;
    if (ai !== null && bi !== null) return ai.x === bi.x && ai.y === bi.y;
    if (ai3 !== null && bi3 !== null) return ai3.x === bi3.x && ai3.y === bi3.y && ai3.z === bi3.z;
    if (ai4 !== null && bi4 !== null) return ai4.x === bi4.x && ai4.y === bi4.y && ai4.z === bi4.z && ai4.w === bi4.w;
    if (ac !== null && bc !== null)
      return ac.r === bc.r && ac.g === bc.g && ac.b === bc.b && ac.a === bc.a;
    const other: Variant =
      a2 !== null || a3 !== null || a4 !== null || ai !== null || ai3 !== null || ai4 !== null || ac !== null ? b : a;
    if (other.t === Tag.NIL) return false;
    throw new GodotRuntimeError("eq-operands", `Invalid operands '${valueTypeName(a)}' and '${valueTypeName(b)}' in operator '=='.`);
  }
  if (anp !== null || bnp !== null) {
    if (anp !== null && bnp !== null) return sameNodePath(anp, bnp);
    const npOther: Variant = anp !== null ? b : a;
    if (npOther.t === Tag.NIL) return false;
    throw new GodotRuntimeError("eq-operands", `Invalid operands '${valueTypeName(a)}' and '${valueTypeName(b)}' in operator '${op}'.`);
  }
  if (ta === Tag.INT || ta === Tag.FLOAT) {
    if (tb === Tag.INT && ta === Tag.INT) return (a.v as IntPayload) === (b.v as IntPayload);
    if (tb === Tag.INT || tb === Tag.FLOAT) return numVal(a) === numVal(b);
    return false;
  }
  if (
    (ta === Tag.STRING || ta === Tag.STRING_NAME) &&
    (tb === Tag.STRING || tb === Tag.STRING_NAME)
  ) {
    return (a.v as string) === (b.v as string);
  }
  if (isCallable(a) !== isCallable(b)) {
    const other = isCallable(a) ? b : a;
    if (other.t === Tag.INT) {
      throw new GodotRuntimeError("eq-operands", `Invalid operands '${valueTypeName(a)}' and '${valueTypeName(b)}' in operator '=='.`);
    }
  }
  const an = a.t === Tag.OBJECT && isNullRefValue(a.v);
  const bn = b.t === Tag.OBJECT && isNullRefValue(b.v);
  if (an || bn) {
    if (an && bn) return true;
    const other = an ? b : a;
    return other.t === Tag.NIL;
  }
  if (ta !== tb) return false;
  switch (ta) {
    case Tag.NIL:
      return true;
    case Tag.BOOL:
    case Tag.STRING:
      return a.v === b.v;
    case Tag.STRING_NAME:
      return b.t === Tag.STRING_NAME && a.v === b.v;
    case Tag.ARRAY:
      return (a.v as GArray).eq(b.v as GArray, depth);
    case Tag.DICT:
      return (a.v as GDict).eq(b.v as GDict, depth);
    case Tag.OBJECT:
      if (a.v instanceof GBytes && b.v instanceof GBytes) return bytesEq(a.v as GBytes, b.v as GBytes);
      if (isCallable(a) && isCallable(b)) return callableEq(a.v as CallableBox, b.v as CallableBox);
      return a.v === b.v;
  }
  return false;
}

export function valueSame(a: Variant, b: Variant, depth = 0): boolean {
  if (depth >= COMPARE_DEPTH && (a.t === Tag.ARRAY || a.t === Tag.DICT) && a.t === b.t) return true;
  if (
    (a.t === Tag.STRING || a.t === Tag.STRING_NAME) &&
    (b.t === Tag.STRING || b.t === Tag.STRING_NAME)
  ) {
    return (a.v as string) === (b.v as string);
  }
  if (a.t !== b.t) return false;
  switch (a.t) {
    case Tag.NIL:
      return true;
    case Tag.ARRAY:
      return (a.v as GArray).same(b.v as GArray, depth);
    case Tag.DICT:
      return (a.v as GDict).same(b.v as GDict, depth);
    case Tag.OBJECT:
      if (a.v instanceof GVector2 && b.v instanceof GVector2) {
        return a.v.x === b.v.x && a.v.y === b.v.y;
      }
      if (a.v instanceof GVector3 && b.v instanceof GVector3) {
        return a.v.x === b.v.x && a.v.y === b.v.y && a.v.z === b.v.z;
      }
      if (a.v instanceof GVector4 && b.v instanceof GVector4) {
        return a.v.x === b.v.x && a.v.y === b.v.y && a.v.z === b.v.z && a.v.w === b.v.w;
      }
      if (a.v instanceof GVector2i && b.v instanceof GVector2i) {
        return a.v.x === b.v.x && a.v.y === b.v.y;
      }
      if (a.v instanceof GVector3i && b.v instanceof GVector3i) {
        return a.v.x === b.v.x && a.v.y === b.v.y && a.v.z === b.v.z;
      }
      if (a.v instanceof GVector4i && b.v instanceof GVector4i) {
        return a.v.x === b.v.x && a.v.y === b.v.y && a.v.z === b.v.z && a.v.w === b.v.w;
      }
      if (a.v instanceof GColor && b.v instanceof GColor) {
        return a.v.r === b.v.r && a.v.g === b.v.g && a.v.b === b.v.b && a.v.a === b.v.a;
      }
      if (isCallable(a) && isCallable(b)) return callableEq(a.v as CallableBox, b.v as CallableBox);
      {
        const npa = asNodePath(a);
        const npb = asNodePath(b);
        if (npa !== null && npb !== null) return sameNodePath(npa, npb);
      }
      return a.v === b.v;
    default:
      return a.v === b.v;
  }
}

export function truthyOf(v: Variant): boolean {
  switch (v.t) {
    case Tag.NIL:
      return false;
    case Tag.BOOL:
      return v.v as boolean;
    case Tag.INT:
    case Tag.FLOAT:
      return (v.v as number) !== 0;
    case Tag.STRING:
    case Tag.STRING_NAME:
      return (v.v as string) !== "";
    case Tag.ARRAY:
      return (v.v as GArray).size() !== 0;
    case Tag.DICT:
      return (v.v as GDict).size() !== 0;
    case Tag.OBJECT:
      return v.v instanceof GBytes ? (v.v as GBytes).length !== 0 : true;
  }
  return false;
}
