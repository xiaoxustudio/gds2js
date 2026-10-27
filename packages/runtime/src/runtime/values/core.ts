import { numVal, strFloat } from "../numfmt";
import { posOobSay, strCEscape, strColor, strVec2, valueTypeName } from "../string-ops";
import { GodotRuntimeError, UnsupportedError } from "../errors";
import { Tag, tagName, V, intToNum, type IntPayload, type Variant } from "../tags";
import { GVector2, asVec2 } from "../vector2";
import { GVector3, asVec3, vector3 } from "../vector3";
import { GVector4, asVec4, vector4 } from "../vector4";
import { asVec2i, GVector2i, vector2i } from "../vector2i";
import { asVec3i, GVector3i, vector3i } from "../vector3i";
import { asVec4i, GVector4i, vector4i } from "../vector4i";
import { asColor, color, GColor, tryColorSlot } from "../color";
import { bytesEq, GBytes, packItems, registerPackStringifier } from "../packed";
import { sortGodot } from "../sort";
import { callableEq, callableLabel, isCallable, isNullCallable, type CallableBox } from "../callable";
import { GdNativeClass } from "../native-class";
import { isEncodedObjectIdBox, isNullRefValue, isWeakRefBox } from "../identity";
import type { GdIdentified } from "../identity";
import { asRid, ridText } from "../rid";
import { asNodePath, nodePathText, sameNodePath } from "../node-path";

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

/** `contains(needle)`：**空 needle 不算包含** —— JS 的 `includes` 恰好给 true，不特判就是静默错。 */

/** 单码点的 Godot 简单降档，供不区分大小写的比较用（Godot 的大小写表永不撑开）。 */

/** `String.reverse()`（S574）：按码点反转（`"aé😀"`→`😀éa`）。 */

/** `String.json_escape()`（S575）：反斜杠、五个控制转义、`\v`、双引号；其余控制字符原样。 */

/** `String.validate_node_name()`（S575）：只换 `.` `:` `@` `/` `"` 五个，前后空白不动。 */

/** `String.is_valid_ip_address()`（S577）：长度门槛 16 / 40，带 `:` 走 IPv6（含嵌入 IPv4），否则走点分 IPv4。 */

/** `get_slice`：切段取第 n 段。找不到分隔符时整串就是那一段（实测任意 n ≥ 0 都回原串），负数与越界回空。 */

let objectLabelHook: ((inner: object) => string | null) | null = null;

export function registerObjectLabelHook(f: (inner: object) => string | null): void {
  objectLabelHook = f;
}

/** 只按「有没有非法字符 + 是不是空串」判，Windows 保留名不管（实测 `con` 与 `..` 都是合法文件名）。 */

/** 引擎那道判据：`is_digit(ord) || is_ascii_upper_case(ord)` —— 大写字母全过，但 `G`..`Z` 到 `strtol` 那里就不是 hex 位了。 */

/** 只转义实测到的这十个；其它控制字符与非 ASCII 一律原样出门。 */

/** `String.num(v)`：与 str()/print() 同一条浮点印法，唯一差别是 -0.0 给 `-0.0`（print 给 `0.0`）。 */

/** `num_uint64` 的实参按 **无符号** 解释（4.6.3 实测 `String.num_uint64(-1)` → `18446744073709551615`）：先折进 `[0, 2^64)`。 */

export const PRINT_DEPTH = 101;

export const COMPARE_DEPTH = 52;

registerPackStringifier((v) => show(v));

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
