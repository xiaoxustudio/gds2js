import { GodotRuntimeError, UnsupportedError } from "./errors";
import { hexUpper, strToInt } from "./numstr";
import { Tag, tagName, V, intToBig, intToNum, type IntPayload, type Variant } from "./tags";
import { CASE_LOWER_FIX, CASE_UPPER_FIX } from "./case-table";
import { gdIsDigit, gdIsLower, gdIsSep, gdIsUpper } from "./case-flags";
import { GVector2, asVec2, vecCmp, vector2 } from "./vector2";
import { GVector3, asVec3, vec3Cmp, vector3 } from "./vector3";
import { asVec2i, GVector2i, vec2iCmp, vector2i } from "./vector2i";
import { asVec3i, GVector3i, vector3i } from "./vector3i";
import { asColor, color, colorCmp, GColor, tryColorSlot } from "./color";
import { bytesEq, GBytes, packItems, packTypeName, registerPackStringifier, utf8Decode, toElem } from "./packed";
import type { PackElem, PackKind } from "./packed";
import { parseGdDouble } from "../shared/double";
import { sortGodot } from "./sort";
import { callableEq, callableSame, isCallable, isNullCallable, type CallableBox } from "./callable";
import { globalCallableLabel } from "./global-names";
import type { GdIdentified } from "./identity";

/** 把 INT/FLOAT 变体收成裸 number（bigint 载荷按 Godot 的 double 精度损失折算）。 */
function numVal(v: Variant): number {
  return v.t === Tag.INT ? intToNum(v.v as IntPayload) : (v.v as number);
}

/** Dictionary 键编码：键必须带类型前缀，否则 1（int）与 1.0（float）会撞成同一个键。 */
export function keyOf(v: Variant): string {
  return keyOfIn(v, 0);
}

/** 容器桶的编码：按**内容**分格（元素走 {@link valueSame} 的身份口径），字典的编码跟着键序走；`c:` 前缀保证容器桶不与标量桶撞车。 */
/** Callable 的键位：空 Callable 一律同键；方法按「接收者身份 + 方法名 + 绑过没绑过」；lambda 按盒子身份。 */
function callableKey(box: CallableBox): string {
  if (isNullCallable(box)) return "y:";
  const boundTag = box.boundOnce ? "1" : "0";
  if (box.name !== null) {
    const recv = box.object;
    // 全局 Callable（`abs` 这类）实测等式只看「名字 + 绑过没绑过」：`{abs: 1}.has(abs)` 真、`.has(abs.bind())` 假
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
      const col = asColor(v);
      if (col)
        return `z:${String(col.r)},${String(col.g)},${String(col.b)},${String(col.a)}`;
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
  | "Color"
  | "Array"
  | "Dictionary";

/** Godot 认识、且我们能在运行时校验的容器标注类型名 */
export function isElemKind(name: string): name is ElemKind {
  return (
    name === "int" || name === "float" || name === "bool" || name === "String" ||
    name === "StringName" ||
    name === "Vector2" ||
    name === "Vector3" ||
    name === "Vector2i" ||
    name === "Vector3i" ||
    name === "Color" ||
    name === "Array" ||
    name === "Dictionary"
  );
}

/** `resize` 扩张时按元素类型填进新格子的默认值。 */
export function elemDefault(kind: ElemKind): Variant {
  switch (kind) {
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
    case "Color":
      return color(0, 0, 0, 1);
    case "Array":
      return V.array(new GArray());
    case "Dictionary":
      return V.dict(new GDict());
  }
}

/** 元素折算矩阵：能转就转，转不了交 null —— 调用方把整次容器操作静默作废，不报错。 */
export function elemConvert(kind: ElemKind, v: Variant): Variant | null {
  switch (kind) {
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
    case "Color":
      return tryColorSlot(v);
    case "Array":
      return v.t === Tag.ARRAY ? v : null;
    case "Dictionary":
      return v.t === Tag.DICT ? v : null;
  }
}

/** 数组下标的唯一口径：支持负数（从尾部数，读写同规则），越界响亮报 `array-index`。 */
export function arrIdx(i: number, len: number): number {
  const k = i < 0 ? i + len : i;
  if (k < 0 || k >= len) {
    throw new GodotRuntimeError("array-index", `数组索引越界: ${i}`);
  }
  return k;
}

/** 方法参数里的下标（`pop_at` / `remove_at` / `insert` …）：与 arrIdx 同样负数从尾部数，但越界交 null 表示静默无操作。 */
function fromEnd(i: number, len: number): number | null {
  const k = i < 0 ? i + len : i;
  return k < 0 || k >= len ? null : k;
}

export class GArray {
  private items: Variant[];
  elem: ElemKind | null = null;

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

  private asElement(v: Variant): Variant | null {
    return this.elem === null ? v : elemConvert(this.elem, v);
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

  get(i: number): Variant {
    return this.items[arrIdx(i, this.items.length)]!;
  }

  set(i: number, v: Variant): void {
    const c = this.asElement(v);
    if (c === null) return;
    this.items[arrIdx(i, this.items.length)] = c;
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

  sort(): void {
    if (this.items.length === 0) return;
    const allNum = this.items.every((x) => x.t === Tag.INT || x.t === Tag.FLOAT);
    const allStr = this.items.every((x) => x.t === Tag.STRING || x.t === Tag.STRING_NAME);
    const allBool = this.items.every((x) => x.t === Tag.BOOL);
    const allVec = this.items.every((x) => asVec2(x) !== null);
    const allVec3 = this.items.every((x) => asVec3(x) !== null);
    const allVec2i = this.items.every((x) => asVec2i(x) !== null);
    if (!allNum && !allStr && !allBool && !allVec && !allVec3 && !allVec2i) {
      throw new UnsupportedError("array-sort-mixed", "混合类型数组排序（未实现）");
    }
    const cmp = allNum
      ? (a: Variant, b: Variant) =>
          a.t === Tag.INT && b.t === Tag.INT
            ? intToBig(a.v as IntPayload) < intToBig(b.v as IntPayload)
              ? -1
              : intToBig(a.v as IntPayload) > intToBig(b.v as IntPayload)
                ? 1
                : 0
            : numVal(a) - numVal(b)
      : allStr
        ? (a: Variant, b: Variant) => strCmp(a.v as string, b.v as string)
        : allBool
          ? (a: Variant, b: Variant) => Number(a.v) - Number(b.v)
          : allVec
            ? (a: Variant, b: Variant) => vecCmp(asVec2(a) as GVector2, asVec2(b) as GVector2)
            : allVec3
              ? (a: Variant, b: Variant) => vec3Cmp(asVec3(a) as GVector3, asVec3(b) as GVector3)
              : (a: Variant, b: Variant) => {
                  if (asColor(a) !== null && asColor(b) !== null) colorCmp();
                  return vec2iCmp(asVec2i(a) as GVector2i, asVec2i(b) as GVector2i);
                };
    this.items = [...this.items].sort(cmp);
  }

  /** 带比较器的排序：同键顺序走引擎那份置换（`packages/runtime/src/runtime/sort.ts`），不是 JS 的稳定 sort。 */
  sortCustom(before: (a: Variant, b: Variant) => boolean): void {
    this.items = sortGodot(this.items, before);
  }

  bsearch(value: Variant, less: (a: Variant, b: Variant) => boolean): number {
    let lo = 0;
    let hi = this.items.length;
    while (lo < hi) {
      const m = (hi + lo) >> 1;
      const e = this.items[m] as Variant;
      if (less(e, value)) lo = m + 1;
      else if (!less(value, e)) return m;
      else hi = m;
    }
    return lo;
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

  extreme(    wantMin: boolean,
    less: (a: Variant, b: Variant) => boolean,
  ): Variant | null {
    let best: Variant | null = null;
    for (const x of this.items) {
      if (best === null) {
        best = x;
        continue;
      }
      if (wantMin ? less(x, best) : less(best, x)) best = x;
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

  getRequired(k: Variant): Variant {
    const q = this.asQuery(k);
    const i = q === null ? -1 : this.slot(keyOf(q), q);
    if (i < 0) {
      throw new GodotRuntimeError("dict-key", `字典键不存在: ${show(k)}`);
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

/** 声明处给容器值盖上元素类型：类型记在**值**上、章只盖一次；非字面量赋给本来未定型的容器是运行时报错。 */
export function stampArray(v: Variant, kind: ElemKind, fromLiteral: boolean): Variant {
  const g = v.t === Tag.ARRAY ? (v.v as GArray) : null;
  if (g === null) throw new UnsupportedError("typed-assign", `Array[${kind}] 的初值不是数组`);
  if (!fromLiteral && g.elemKind() === null) {
    throw new GodotRuntimeError(
      "typed-assign",
      `Trying to assign an array of type "Array" to a variable of type "Array[${kind}]"`,
    );
  }
  g.stampElem(kind);
  return v;
}

export function stampDict(v: Variant, k: ElemKind, val: ElemKind, fromLiteral: boolean): Variant {
  const d = v.t === Tag.DICT ? (v.v as GDict) : null;
  if (d === null) throw new UnsupportedError("typed-assign", `Dictionary[${k}, ${val}] 的初值不是字典`);
  if (!fromLiteral && d.keyKind === null) {
    throw new GodotRuntimeError(
      "typed-assign",
      `Trying to assign a dictionary of type "Dictionary" to a variable of type "Dictionary[${k}, ${val}]"`,
    );
  }
  d.stampElem(k, val);
  return v;
}

/** GDScript String 是 UTF-32、length 数码点，JS 是 UTF-16。 */
/** 码点数组：`for…of` 走的是码点序，而 `[...s]` 与 `Array.from(s)` 在 scriptc 都没有 lowering。 */
function codepoints(s: string): string[] {
  const out: string[] = [];
  for (const ch of s) out.push(ch);
  return out;
}

export function strLength(s: string): number {
  return codepoints(s).length;
}

export function strAt(s: string, i: number): string {
  const chars = codepoints(s);
  const c = chars[i];
  if (c === undefined) {
    throw new GodotRuntimeError("string-index", `字符串索引越界: ${i}`);
  }
  return c;
}

/** `substr(from, len = -1)`：`from` 为负或越过串尾都给空串，`len` 省略或为负表示截到串尾 —— JS 原生 slice 两条都不对。 */
export function strSubstr(s: string, from: number, len = -1): string {
  const chars = codepoints(s);
  if (from < 0 || from >= chars.length) return "";
  return (len < 0 ? chars.slice(from) : chars.slice(from, from + len)).join("");
}

/** `left(n)` / `right(n)`：n 是**码点**个数；负数先折成 `length + n`，再夹进 [0, length]。 */
export function strEdge(s: string, n: number, side: "left" | "right"): string {
  const len = strLength(s);
  const k = n < 0 ? len + n : n;
  if (k <= 0) return "";
  if (k >= len) return s;
  const chars = codepoints(s);
  return (side === "left" ? chars.slice(0, k) : chars.slice(len - k)).join("");
}

/** `contains(needle)`：**空 needle 不算包含** —— JS 的 `includes` 恰好给 true，不特判就是静默错。 */
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

/** 字符串比较按**码点**逐位（Godot 的 String 是 UTF-32）；JS 原生按 UTF-16 码元，代理区会排到 U+FFFF 之下。两边都无代理对时码元序即码点序，走原生快路。 */
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

/** 单码点的 Godot 简单降档，供不区分大小写的比较用（Godot 的大小写表永不撑开）。 */
function lowerOne(ch: string): string {
  return strCase(ch, "lower");
}

function matchAt(chars: string[], at: number, needle: string[], insensitive: boolean): boolean {
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

/** `replace(what, by)` / `replacen`：左起、不重叠地换掉每一处命中；`what` 为空串时整串原样返回。 */
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

/**
 * `find`/`findn`/`rfind`/`rfindn` 的落点口径（码点下标，没命中 -1）。
 * 空 needle 一律 -1；`from` 为负时按「可落点数」折回 —— `B = len - m + 1 + from`，
 * 折完仍为负就没命中。正向取第一个 `>= B`，反向取最后一个 `<= B`，且反向还要求 `from <= len - m`。
 */
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

/** Godot 的 `strip_edges()`：`capitalize` 用得上，此刻串里的空白已全被折成空格。 */
function stripSpaces(s: string): string {
  let lo = 0;
  let hi = s.length;
  while (lo < hi && s[lo] === " ") lo++;
  while (hi > lo && s[hi - 1] === " ") hi--;
  return s.slice(lo, hi);
}

/**
 * Godot `_separate_compound_words` 的拆词：大小写边界、数字与字母边界都插一个空格。
 * condA `aA` / condB `AAa`、`2Aa` / condC `2aa` / condD `A2`、`a2`（逐条件实测于 4.6.3）。
 */
function separateCompoundWords(s: string): string {
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

/**
 * `capitalize()`：拆词 → 去首尾空白 → 整串降档 → 每个非空词只把首码元换成简单大写。
 * 词与词之间恒定一个空格，所以 `hELLo` 会变成 `H El Lo` —— 这是 Godot 自己的行为，不是偏差。
 */
export function strCapitalize(s: string): string {
  const words = stripSpaces(separateCompoundWords(s)).split(" ");
  const out: string[] = [];
  for (const w of words) {
    if (w === "") continue;
    out.push(strCase(strAt(w, 0), "upper") + strSubstr(w, 1));
  }
  return out.join(" ");
}

/** 两端裁掉码点 ≤ 0x20 的空白（高位空白如 NBSP 不裁，实测 `" a "` 才裁）。 */
export function strStripEdges(s: string): string {
  const cs = codepoints(s);
  let a = 0;
  let b = cs.length;
  while (a < b && (cs[a] as string).codePointAt(0)! <= 0x20) a++;
  while (b > a && (cs[b - 1] as string).codePointAt(0)! <= 0x20) b--;
  return cs.slice(a, b).join("");
}

/** `get_slice`：切段取第 n 段。找不到分隔符时整串就是那一段（实测任意 n ≥ 0 都回原串），负数与越界回空。 */
export function strGetSlice(s: string, delim: string, n: number): string {
  if (n < 0 || delim === "") return "";
  const parts = strSplit(s, delim, true);
  if (parts.length === 1) return s;
  return parts[n] ?? "";
}

/** `pad_zeros()`：引擎的式子是「以第一个小数点为界（没有就整串），界落在最前就不动；跳过界内的前导非数字，把 `0` 插到数字段开头补到 `digits` 位」。于是 `".5"` 原样、`"abc"` 是往尾巴上贴 `abc00000`、`"--5"` 给 `--05`。 */
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

/** `get_slicec()`：引擎签名是 `get_slicec(char32_t p_splitter, int p_slice)` —— 分隔符是**码点数字**，不是字符串（文档写的那个形状在 4.6.3 过不了解析）。空串、负段号、段号越界都给空串。 */
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

/** `insert`：负位置原样返回，超出末尾就接在尾巴上。 */
export function strInsertAt(s: string, pos: number, what: string): string {
  const cs = codepoints(s);
  if (pos < 0) return s;
  const at = pos > cs.length ? cs.length : pos;
  return cs.slice(0, at).join("") + what + cs.slice(at).join("");
}

/** `erase`：负起点给空串（Godot 那边另有一句引擎 ERROR），长度 0 或起点越界都不动。 */
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

/** `similarity()`：引擎是**交叠 bigram 的 Dice 系数** —— 先判全等给 1，任一边不足两个码点给 0，其余 `2 × 交集 / (两边 bigram 数之和)`；交集是「源的每个 bigram 只要在目标里出现就计一次」，目标不被消耗，所以 `aaaa` 对 `aa` 能给到 1.5（大于 1 不是 bug）。返回值在 C++ 那边是 `float`，所以要过一遍 float32。 */
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

/** 重叠二字组，`length() - 1` 个：循环上界保证两个下标都在界内。 */
function strBigrams(chars: string[]): string[] {
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

/** 码点下标取字符；越界与负数给 0（引擎那侧同时往 stderr 打一行 out of bounds）。 */
export function strUnicodeAt(s: string, i: number): number {
  const c = codepoints(s)[i];
  if (c === undefined) return 0;
  return c.codePointAt(0) as number;
}

/** `count` 是非重叠计数；空针子给 0，不是「长度 + 1」。`from` / `to` 是码点下标的窗口：`to` 给 0 表示到末尾，任一为负或 `from >= to` 直接 0。 */
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

/**
 * `String.format()`：值表按 print 那套转成文本；占位符含 `_` 时把 `_` 换成键名再做全串替换，不含时对每个值做一次 replace_first（S232）。
 * 引擎的缺省占位符实测是 `"{_}"` —— 所以「只给一个实参」与「显式给 `"{}"`」走的是两条道，前者换 `{0}` / `{键}`，后者把 `{}` 当字面量。
 */
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
    throw new UnsupportedError("format-object", "String.format() 的 Object 实参按属性表替换（实测属性 k 换掉了 {k}），属性的顺序与集合没量过");
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

const BAD_FILENAME = new Set(["\"", "%", "*", "/", ":", "<", ">", "?", "\\", "|"]);

/** 只按「有没有非法字符 + 是不是空串」判，Windows 保留名不管（实测 `con` 与 `..` 都是合法文件名）。 */
export function strIsValidFilename(s: string): boolean {
  if (s === "") return false;
  for (const ch of codepoints(s)) if (BAD_FILENAME.has(ch)) return false;
  return true;
}

const URI_UNRESERVED = /^(?:[A-Za-z0-9]|[-._~])$/;

function hex2(b: number): string {
  const d = "0123456789ABCDEF";
  return d.charAt(Math.floor(b / 16)) + d.charAt(b % 16);
}

/** 保留集只有 `[A-Za-z0-9-._~]`（实测 `*` `'` `!` Tab 与 DEL 都要转），其余按 UTF-8 字节出 `%XX`（大写）。 */
export function strUriEncode(s: string): string {
  const enc = new TextEncoder();
  let out = "";
  for (const ch of codepoints(s)) {
    if (URI_UNRESERVED.test(ch)) out += ch;
    else for (const b of enc.encode(ch)) out += "%" + hex2(b);
  }
  return out;
}

/**
 * `uri_decode()`：引擎的式子在 `core/string/ustring.cpp:4542`，走的是 **UTF-8 字节**。三处最容易踩的地方都量过：
 * ① 合法 hex 位只认 `0-9` 与 `A-Z` —— **小写 a-f 不算**，所以 `"%2f"` 把 `%` 吃掉、后两位照常输出成 `2f`；
 * ② 「后面还有两位」的判据是 `i + 2 < 字节数`（严格小于），于是 `"x%4"` 与 `"%%4"` 都留下了 `%`；
 * ③ `strtol` 是**部分**解析：`"%G1"` 折成 `0x00`、`"%4Z"` 折成 `0x04`，而重组按 strlen 取长度 —— **撞到 0 就截断**，故 `"%G1"` 是空串。
 * `+` 一律换空格；非法字节序列由 UTF-8 状态机给一个 U+FFFD（引擎那边还会往 stderr 打一句 ERROR，那行不属于产物）。
 */
export function strUriDecode(s: string): string {
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
    } else if (b === 0x2b) {
      res.push(0x20);
    } else {
      res.push(b);
    }
  }
  const nul = res.indexOf(0);
  return utf8Decode(nul === -1 ? res : res.slice(0, nul));
}

/** `strtol(…, 16)` 认的位（含小写 a-f，虽然外层那道 `A-Z` 判据先把小写挡在外面了）。 */
function uriHexDigit(c: number): number {
  if (c >= 0x30 && c <= 0x39) return c - 0x30;
  if (c >= 0x41 && c <= 0x46) return c - 0x41 + 10;
  if (c >= 0x61 && c <= 0x66) return c - 0x61 + 10;
  return -1;
}

/** 引擎那道判据：`is_digit(ord) || is_ascii_upper_case(ord)` —— 大写字母全过，但 `G`..`Z` 到 `strtol` 那里就不是 hex 位了。 */
function uriHexOk(c: number): boolean {
  return (c >= 0x30 && c <= 0x39) || (c >= 0x41 && c <= 0x5a);
}

/** 字面量式的字符串：加引号，只转义 `"` 与 `\` —— 制表符与换行**按原字符写进去**（实测不是 `\t` / `\n`）。 */
function vsQuote(s: string): string {
  let out = '"';
  for (const ch of s) {
    if (ch === '"' || ch === "\\") out += "\\" + ch;
    else out += ch;
  }
  return out + '"';
}

/** 字典键的排序：先按类型等级 `null < bool < int < float < String < StringName`，同级再按值（实测：`{1, 2.5, 0.5}` → `1、0.5、2.5`，`{"B","a","A"}` 按码点）。 */
const VS_KEY_RANK: Partial<Record<number, number>> = {
  [Tag.NIL]: 0,
  [Tag.BOOL]: 1,
  [Tag.INT]: 2,
  [Tag.FLOAT]: 3,
  [Tag.STRING]: 4,
  [Tag.STRING_NAME]: 5,
};

function vsKeyCompare(a: Variant, b: Variant): number {
  const ra = VS_KEY_RANK[a.t];
  const rb = VS_KEY_RANK[b.t];
  if (ra === undefined || rb === undefined) {
    throw new UnsupportedError("var-to-str-key", `var_to_str() 的字典键只实测过 null / bool / int / float / String / StringName（收到 ${tagName(a.t)}）`);
  }
  if (ra !== rb) return ra - rb;
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

/**
 * `var_to_str()`：字面量通道，与 print 分岔的每一条都量过（S214 / S221 / S227 / S229）——
 * nil 是 `null`（不是 `<null>`）、字符串带引号且只转义两个字符、数组自己不加换行（元素里有字典就跟着字典多行，S230）、
 * **字典在任意深度多行且不缩进、键按 {@link vsKeyCompare} 排序**、空的 `{}` 与 `[]` 才是紧凑式、int 走 int64。
 * **浮点与一切装浮点的形状都响亮拒**：4.6.3 的尾数是引擎自己的十进制生成器（S229 用算术造值排掉了「固定 `%.*g`」与「最短往返」两条路），
 * 照 print 那套发就是静默错；值类型与 float/打包数组同理，只有元素全为整数或字符串的打包数组敢发。
 */
export function varToStr(v: Variant): string {
  switch (v.t) {
    case Tag.NIL:
      return "null";
    case Tag.BOOL:
      return v.v ? "true" : "false";
    case Tag.INT:
      return String(v.v);
    case Tag.FLOAT:
      throw new UnsupportedError("var-to-str-float", `var_to_str() 的浮点尾数还没量出引擎的取数式子（S229），宁可不发也不照 print 抄`);
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
          if (item.t === Tag.FLOAT || item.t === Tag.OBJECT) {
            throw new UnsupportedError("var-to-str-float", `var_to_str() 的 ${packTypeName(inner.kind)} 里有浮点或对象元素，取数式子还没量出（S229）`);
          }
          flat.push(varToStr(item));
        }
        return `${packTypeName(inner.kind)}(${flat.join(", ")})`;
      }
      // Callable 实测都印成 `Callable()`（lambda、空 Callable、绑过实参的、全局的那四支都一样）；方法 Callable 这一形没量到，仍走下面那句拒。
      if (isCallable(v)) {
        if ((inner as CallableBox).object === null) return "Callable()";
      }
      throw new UnsupportedError("var-to-str-type", `var_to_str() 遇到没实测过的对象类型 ${valueTypeName(v)}`);
    }
    default:
      throw new UnsupportedError("var-to-str-type", `var_to_str() 遇到没实测过的类型 ${tagName(v.t)}`);
  }
}

const SV_VALUE_CTORS = new Set(["Vector2", "Vector2i", "Vector3", "Vector3i", "Color"]);
/** `PackedXArray(...)` 那七支：名字 → pack 形状，实测的 arity 与元素形状一支一张。 */
const SV_PACK_CTORS: Record<string, PackKind> = {
  PackedByteArray: "byte",
  PackedInt32Array: "int32",
  PackedInt64Array: "int64",
  PackedFloat32Array: "float32",
  PackedFloat64Array: "float64",
  PackedStringArray: "string",
  PackedVector2Array: "vector2",
};
/** 引擎给得出值、我们这边没有对应形状的（实测 `Rect2(1, 2, 3, 4)` 是 typeof 7、`Quaternion(1, 2, 3, 4)` 是 15）：宁可响亮拒，也不发一个 null 出去。 */
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

/**
 * `str_to_var()`：读侧的语法一支一支量过（S231），与 {@link varToStr} 是两条通道，别互相抄。
 * 顶部只认一个值，后面跟着什么都不看（`1 2` → 1、`Vector2(1, 2) 3` → Vector2）；认不出的写法给 null
 * —— 裸词、大写 `INF`、`'单引号'`、`(1, 2)`、`{: 1}`、容器里缺逗号、`Vector2()` 的 arity 不对，实测全是 null。
 * 不落 null 只有一类：名字是 Godot 认识而我们没有的形状（`Rect2` 那支），或者量到六位数却没量越界的 `\U` —— 响亮拒，不猜。
 */
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

  /** 数字一段：`.` 与 `e` 只在实测到的形状里出现，`1e` / `1e+` / `1.` 都算 float 1.0，`1.5.2` 停在第二个点。 */
  const number = (): Variant | null => {
    const start = i;
    let neg = false;
    if (at("-")) {
      neg = true;
      i++;
      if (i >= cs.length || !svIsDigit(cs[i] as string)) {
        // `-` 后面跟的不是数字也不是 `inf` 就整段作废：`-`、`- 7`、`-nan` 三格实测都是 null
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

  /** 字符串体：`"` 与 `\` 之外只有量过的那十个转义；`\a` `\v` `\q` `\x` `\0` 都是「去掉反斜杠留原字符」。 */
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
          out += String.fromCodePoint(val);
          break;
        }
        case "U":
          throw new UnsupportedError("str-to-var-shape", `str_to_var() 的 \\U 实测吃掉六个十六进制位（"\\U0001F600" 给 U+01F6 再留 "00"），越界与代理区的处理没量过，先不猜`);
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
      g.raw().push(item);
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

  /** `Name(args)`：arity、元素类型、逗号规则全按实测的那几支；`Vector2 (1, 2)` 的空格是量过能吃的。 */
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
        // 参数形状一支一张：`PackedStringArray("a")` 只吃过串，`PackedStringArray(1)`、`Vector2("1", 2)`、`Vector2(Vector2(1, 2), 3)` 实测全是 null
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

  /** null 是「这条写法引擎也解析不出来」，与量过的那批 null 同一形。 */
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

const C_ESCAPES = new Map<number, string>([
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

/** 只转义实测到的这十个；其它控制字符与非 ASCII 一律原样出门。 */
export function strCEscape(s: string): string {
  let out = "";
  for (const ch of codepoints(s)) {
    const e = C_ESCAPES.get(ch.codePointAt(0) as number);
    out += e === undefined ? ch : e;
  }
  return out;
}

const INT64_MAX_B = 9223372036854775807n;

/** 只认前置的 `-`（`+101` 实测整串判 0）与可选的 `0b` 前缀；其余任何非 01 字符都把整串判成 0，超出 int64 饱和到 MAX（符号后加）。 */
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

/** 拆词后按目标风格拼：`to_snake_case` / `to_kebab_case` / `to_camel_case` 共用同一条拆词（与 `capitalize` 同源）。 */
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

/** Godot 的 `%` 只认这几个转换符；`%i %u %e %g` 与 `#` 标志在 Godot 是 Parse Error。 */const FMT_TYPES = new Set(["d", "o", "x", "X", "c", "s", "f"]);

interface FmtSpec {
  flags: string;
  width: number;
  prec: number | null;
  type: string;
  text: string;
}

type FmtTok = { lit: string } | { spec: FmtSpec };

/** 格式化填充：符号在前，再补零或补空格到目标宽度。 */
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
  throw new UnsupportedError(
    "format-number",
    `${sp.text} 需要数值，收到 ${tagName(a.t)}（Godot 此处是 Parse Error: a number is required in operator %）`,
  );
}

/** x / X / o / c 的实参只收 int，收到别的响亮拒。 */
function fmtIntOnly(a: Variant, sp: FmtSpec): bigint {
  if (a.t === Tag.INT) return intToBig(a.v as IntPayload);
  throw new UnsupportedError(
    "format-int",
    `${sp.text} 只对 int 实测过（收到 ${tagName(a.t)}）；Godot 对 float 的行为未探针确认，拒绝猜测`,
  );
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
    if (fmt[i + 1] === "%") {
      lit += "%";
      i++;
      continue;
    }
    let k = i + 1;
    let flags = "";
    while (k < fmt.length && (fmt[k] === "-" || fmt[k] === "+" || fmt[k] === "0")) {
      flags += fmt[k];
      k++;
    }
    let width = 0;
    while (k < fmt.length && fmt[k]! >= "0" && fmt[k]! <= "9") {
      width = width * 10 + (fmt[k]!.charCodeAt(0) - 48);
      k++;
    }
    let prec: number | null = null;
    if (fmt[k] === ".") {
      k++;
      prec = 0;
      while (k < fmt.length && fmt[k]! >= "0" && fmt[k]! <= "9") {
        prec = prec * 10 + (fmt[k]!.charCodeAt(0) - 48);
        k++;
      }
    }
    const t = fmt[k];
    if (t === undefined || !FMT_TYPES.has(t)) {
      throw new UnsupportedError(
        "format-spec",
        `不支持的格式符 "${fmt.slice(i, k + 1)}"：Godot 只认 d o x X c s f` +
          `（%i/%u/%e/%g 与 # 标志实测是 Parse Error: unsupported format character）`,
      );
    }
    toks.push({ lit });
    lit = "";
    toks.push({ spec: { flags, width, prec, type: t, text: fmt.slice(i, k + 1) } });
    specs++;
    i = k;
  }
  toks.push({ lit });

  if (args.length > specs) return fmt;
  if (args.length < specs) {
    throw new GodotRuntimeError(
      "format-arity",
      `格式化参数不足: ${fmt}（需 ${specs} 个，给了 ${args.length} 个；Godot 是 Parse Error: not enough arguments）`,
    );
  }

  let ai = 0;
  let out = "";
  for (const tk of toks) {
    if ("lit" in tk) {
      out += tk.lit;
      continue;
    }
    const sp = tk.spec;
    const a = args[ai++]!;
    switch (sp.type) {
      case "s":
        out += padFmt(show(a), "", sp);
        break;
      case "d": {
        let neg: boolean;
        let body: string;
        if (a.t === Tag.INT) {
          const p = a.v as IntPayload;
          if (typeof p === "bigint") {
            neg = p < 0n;
            body = (neg ? -p : p).toString();
          } else {
            neg = p < 0;
            body = Math.abs(p).toString();
          }
        } else {
          const v = Math.trunc(fmtNum(a, sp));
          neg = v < 0;
          body = Math.abs(v).toString();
        }
        const sign = neg ? "-" : sp.flags.includes("+") ? "+" : "";
        out += padFmt(body, sign, sp);
        break;
      }
      case "f": {
        const v = fmtNum(a, sp);
        const body = Math.abs(v).toFixed(sp.prec ?? 6);
        out += padFmt(body, v < 0 ? "-" : sp.flags.includes("+") ? "+" : "", sp);
        break;
      }
      case "x":
      case "X":
      case "o": {
        const p = fmtIntOnly(a, sp);
        const neg = p < 0n;
        const mag = neg ? -p : p;
        const base = sp.type === "o" ? 8 : 16;
        const body = sp.type === "X" ? mag.toString(base).toUpperCase() : mag.toString(base);
        out += padFmt(body, neg ? "-" : sp.flags.includes("+") ? "+" : "", sp);
        break;
      }
      case "c": {
        const p = fmtIntOnly(a, sp);
        out += padFmt(String.fromCodePoint(Number(p)), "", sp);
        break;
      }
    }
  }
  return out;
}

/** `n.toPrecision(17)` 的等价实现（bigint 手算）：口径是**约 17 位有效数字**，不是 double 的精确展开。 */
function digits17(n: number): string {
  let b = BigInt(n);
  const neg = b < 0n;
  if (neg) b = -b;
  const s = String(b);
  if (s.length <= 17) return neg ? `-${s}` : s;
  const tail = s.length - 17;
  const pow = 10n ** BigInt(tail);
  let q = b / pow;
  const r = b - q * pow;
  if (r * 2n >= pow) q = q + 1n;
  return `${neg ? "-" : ""}${String(q)}${"0".repeat(tail)}`;
}

/** 浮点转字符串（Godot 的 print 口径）：`nan` / `inf` / `-inf` 原样，0 与 -0.0 都印 `0.0`；整数值给约 17 位有效数字 + `.0`，非整数按整数位数定小数位再去尾随零。 */
export function strFloat(n: number): string {
  if (Number.isNaN(n)) return "nan";
  if (n === Infinity) return "inf";
  if (n === -Infinity) return "-inf";
  if (n === 0) return "0.0";
  if (Number.isInteger(n)) return `${digits17(n)}.0`;
  const intDigits = Math.max(0, Math.floor(Math.log10(Math.abs(n))) + 1);
  const decimals = Math.max(0, Math.min(14, 15 - intDigits));
  if (decimals === 0) {
    const r = Math.sign(n) * Math.round(Math.abs(n));
    return BigInt(r).toString();
  }
  const trimmed = n.toFixed(decimals).replace(/0+$/, "");
  return trimmed.endsWith(".") ? `${trimmed}0` : trimmed;
}

/** Color 分量的打印格式：与 strVec2 同一套规则但只有 **4 位小数**；差别是 -0.0 与舍到零的非零值都**保留负号**（Vector2 同位置给 `0.0`）。 */
export function strColor(n: number): string {
  if (Number.isNaN(n)) return "nan";
  if (!Number.isFinite(n)) return n > 0 ? "inf" : "-inf";
  if (n === 0) return Object.is(n, -0) ? "-0.0" : "0.0";
  if (Number.isInteger(n)) return strFloat(n);
  const t = n.toFixed(4).replace(/0+$/, "");
  return t.endsWith(".") ? `${t}0` : t;
}

/** Vector2 分量的打印格式：**小数值**走固定 6 位小数再去尾随零（至少留一位小数），**整数值**走 strFloat 的 17 位有效数字展开；分量是 float32，两条路不会在同一分量上打架。 */
export function strVec2(n: number): string {
  if (Number.isNaN(n)) return "nan";
  if (!Number.isFinite(n)) return n > 0 ? "inf" : "-inf";
  if (Number.isInteger(n)) return strFloat(n);
  const t = n.toFixed(6).replace(/0+$/, "");
  return t.endsWith(".") ? `${t}0` : t;
}

/** 工具函数「int 形参」的统一归一：**float 向零截断**、**bool 当 0/1**、int 原样，其余类型运行时报错。用 bigint 作中介，大整数才不会被折成 double。 */
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

/** `String.num(v)`：与 str()/print() 同一条浮点印法，唯一差别是 -0.0 给 `-0.0`（print 给 `0.0`）。 */
export function strNum(n: number): string {
  return Object.is(n, -0) ? "-0.0" : strFloat(n);
}

/** `String.num_scientific(v)`：`|x| >= 1e15` 或 `|x| < 1e-4` 才走科学计数法，数字部分取最短可回读表示，指数带符号补到两位；与 print 是两套印法（`42` / `0` 都不带 `.0`）。 */
export function strSci(n: number): string {
  if (Number.isNaN(n)) return "nan";
  if (n === Infinity) return "inf";
  if (n === -Infinity) return "-inf";
  if (n === 0) return "0";
  const a = Math.abs(n);
  if (a < 1e15 && a >= 1e-4) return String(n);
  const m = /^(-?[\d.]+)e([+-])(\d+)$/.exec(n.toExponential());
  return m ? `${m[1]}e${m[2]}${m[3]!.padStart(2, "0")}` : n.toExponential();
}

/** `humanize_size` 的单位档位。 */
const SIZE_UNITS = ["B", "KiB", "MiB", "GiB", "TiB", "PiB", "EiB"];

/** `String.humanize_size(n)`：参数按 **uint64** 解释（所以负数变成一个巨大值）再转 double；`while (value > 1024)` 严格大于定档，小数位 <100 两位、<1024 一位、再大不留，尾数**截断不四舍五入**；B 档直接印整数本身。 */
export function strHumanizeSize(v: Variant): Variant {
  const signed = intArgBig(v, "String.humanize_size() 的参数");
  const u = signed & ((1n << 64n) - 1n);
  if (u === 0n) return V.str("0 B");
  let value = Number(u);
  let cat = 0;
  while (value > 1024) {
    value /= 1024;
    cat++;
  }
  const unit = SIZE_UNITS[cat] ?? SIZE_UNITS[SIZE_UNITS.length - 1]!;
  if (cat === 0) return V.str(`${u.toString()} B`);
  const digits = value < 100 ? 2 : value < 1024 ? 1 : 0;
  const scale = 10 ** digits;
  const trunc = Math.trunc(value * scale) / scale;
  return V.str(digits === 0 ? `${Math.trunc(value)} ${unit}` : `${trunc.toFixed(digits)} ${unit}`);
}

/** `String` 上的静态成员派发：`chr`（0、负数、代理区、> U+10FFFF 一律换成 U+FFFD）/ `num` / `num_int64` / `num_scientific` / `humanize_size`，其余响亮拒。 */
export function stringStatic(name: string, args: Variant[] = []): Variant {
  switch (name) {
    case "chr": {
      const v = args[0];
      if (v === undefined) throw new GodotRuntimeError("arity", "String.chr() 缺少参数");
      const cp = intArgBig(v, "String.chr() 的参数");
      const bad = cp <= 0n || cp > 0x10ffffn || (cp >= 0xd800n && cp <= 0xdfff);
      return V.str(String.fromCodePoint(bad ? 0xfffd : Number(cp)));
    }
    case "num": {
      const v = args[0];
      if (v === undefined) throw new GodotRuntimeError("arity", "String.num() 缺少参数");
      if (v.t === Tag.FLOAT) return V.str(strNum(v.v as number));
      if (v.t === Tag.INT) return V.str(strNum(intToNum(v.v as IntPayload)));
      if (v.t === Tag.BOOL) return V.str(strNum(v.v ? 1 : 0));
      throw new GodotRuntimeError("string-arg", `String.num() 不接受 ${tagName(v.t)}`);
    }
    case "num_int64": {
      const v = args[0];
      if (v === undefined) throw new GodotRuntimeError("arity", "String.num_int64() 缺少参数");
      return V.str(intArgBig(v, "String.num_int64() 的参数").toString());
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

/** `String(x)` 构造器：只接受 String，其余来源是 Godot 的 Parse Error。 */
export function stringCtor(args: Variant[]): Variant {
  if (args.length !== 1) {
    throw new GodotRuntimeError("string-ctor-arity", `String() 只接受 1 个参数（收到 ${args.length} 个）`);
  }
  const v = args[0] as Variant;
  if (v.t !== Tag.STRING && v.t !== Tag.STRING_NAME) {
    throw new GodotRuntimeError("string-ctor", `没有 String(${tagName(v.t)}) 这个构造器（Godot 是 Parse Error）`);
  }
  return V.str(v.v as string);
}

/** `StringName("x")`：只接受字符串族（int 是 Parse Error），结果与 `&"x"` 同类。 */
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

/** **StringName 槽**（变量 / 字段 / 容器元素与键 / 形参默认值）：只收 StringName / String，装不下就响亮报，不原样塞进去。 */
export function toStringNameSlot(v: Variant): Variant {
  if (v.t === Tag.STRING_NAME) return v;
  if (v.t === Tag.STRING) return V.stringName(v.v as string);
  throw new UnsupportedError("string-name-slot", `StringName 槽只收 StringName / String，收到 ${tagName(v.t)}`);
}

/** 容器打印的深度上限：一条**固定的层数闸门**，不是「看见重复就断」，越界那一层给 `[...]` / `{ ... }`。 */
export const PRINT_DEPTH = 101;

/** 比较（`==` / `has` / `count` 的身份比较）的深度上限：另一道**更浅**的固定闸门，超出后两个明显不同的容器会被判成相等；与打印那道不是一条。 */
export const COMPARE_DEPTH = 52;

registerPackStringifier((v) => show(v));

/** `print(a, b, c)` 的口径：**先把所有实参求值完，才开始逐个转字符串**，所以整串实参交到这里按顺序 show、用空串拼。 */
export function showArgs(args: Variant[]): string {
  let out = "";
  for (const a of args) out += show(a);
  return out;
}

/** 顶层 print：字符串不加引号 */
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
      if (inner instanceof GVector2i) {
        return `(${String(inner.x)}, ${String(inner.y)})`;
      }
      if (inner instanceof GVector3i) {
        return `(${String(inner.x)}, ${String(inner.y)}, ${String(inner.z)})`;
      }
      if (inner instanceof GColor) {
        return `(${strColor(inner.r)}, ${strColor(inner.g)}, ${strColor(inner.b)}, ${strColor(inner.a)})`;
      }
      if (inner instanceof GBytes) {
        return `[${packItems(inner as GBytes).map((e) => repr(e, depth + 1)).join(", ")}]`;
      }
      // 全局 Callable 实测打印 `@GlobalScope::abs` 这一串（绑过实参照旧），方法 Callable 的打印形状没量过，仍走下面那句拒。
      if (isCallable(v)) {
        const box = inner as CallableBox;
        const label = box.object === null && box.name !== null ? globalCallableLabel(box.name) : null;
        if (label !== null) return label;
      }
      throw new UnsupportedError("show-type", "print 不支持该对象类型");
    }
    default:
      throw new UnsupportedError("show-type", `print 不支持 ${tagName(v.t)}`);
  }
}

/** 容器内嵌：字符串要加引号 */
export function repr(v: Variant, depth = 0): string {
  if (v.t === Tag.STRING) return `"${v.v as string}"`;
  if (v.t === Tag.STRING_NAME) return `&"${v.v as string}"`;
  return show(v, depth);
}

/** `分隔符.join(数组)`：每个元素走 **print 那一条 stringify**，不是容器里那套带引号的 repr；空数组给空串。 */
export function strJoin(sep: string, g: GArray): string {
  const items = g.raw();
  let out = "";
  for (let i = 0; i < items.length; i++) {
    if (i > 0) out += sep;
    out += show(items[i] as Variant);
  }
  return out;
}

/** Variant 的 **Godot 类型名**：`tagName` 只到 Tag 粒度，值类型都在 OBJECT 里，而报错文本要说得出 `Vector2` / `Color` 这种名字。 */
export function valueTypeName(x: Variant): string {
  if (asVec2(x) !== null) return "Vector2";
  if (asVec3(x) !== null) return "Vector3";
  if (asVec2i(x) !== null) return "Vector2i";
  if (asVec3i(x) !== null) return "Vector3i";
  if (asColor(x) !== null) return "Color";
  if (isCallable(x)) return "Callable";
  return tagName(x.t);
}

export function valueEq(a: Variant, b: Variant, depth = 0): boolean {
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
  const ac = asColor(a);
  const bc = asColor(b);
  if (
    a2 !== null ||
    b2 !== null ||
    a3 !== null ||
    b3 !== null ||
    ai !== null ||
    bi !== null ||
    ai3 !== null ||
    bi3 !== null ||
    ac !== null ||
    bc !== null
  ) {
    if (a2 !== null && b2 !== null) return a2.x === b2.x && a2.y === b2.y;
    if (a3 !== null && b3 !== null) return a3.x === b3.x && a3.y === b3.y && a3.z === b3.z;
    if (ai !== null && bi !== null) return ai.x === bi.x && ai.y === bi.y;
    if (ai3 !== null && bi3 !== null) return ai3.x === bi3.x && ai3.y === bi3.y && ai3.z === bi3.z;
    if (ac !== null && bc !== null)
      return ac.r === bc.r && ac.g === bc.g && ac.b === bc.b && ac.a === bc.a;
    const other: Variant =
      a2 !== null || a3 !== null || ai !== null || ai3 !== null || ac !== null ? b : a;
    if (other.t === Tag.NIL) return false;
    throw new GodotRuntimeError("eq-operands", `Invalid operands '${valueTypeName(a)}' and '${valueTypeName(b)}' in operator '=='.`);
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
    // Callable 跟 int 比在 Godot **不是** false，而是运行期那一句 `Invalid operands 'Callable' and 'int' in operator '=='.`
    const other = isCallable(a) ? b : a;
    if (other.t === Tag.INT) {
      throw new GodotRuntimeError("eq-operands", `Invalid operands '${valueTypeName(a)}' and '${valueTypeName(b)}' in operator '=='.`);
    }
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
      // Callable 之间是**内容**等式（接收者 + 方法名，绑定实参不算，但绑过没绑过算）：读一次属性就新建一个盒子，按 JS 引用比会把真判成假
      if (isCallable(a) && isCallable(b)) return callableEq(a.v as CallableBox, b.v as CallableBox);
      return a.v === b.v;
  }
  return false;
}

/** Godot 的**身份**相等（`Variant::identity`）：`has` / `find` / `rfind` / `count` / `erase` 用它。数字不做 int/float 跨型合一（`[1].has(1.0)` 假），String 与 StringName 却合一，容器递归比身份、字典不看键序。 */
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
      if (a.v instanceof GVector2i && b.v instanceof GVector2i) {
        return a.v.x === b.v.x && a.v.y === b.v.y;
      }
      if (a.v instanceof GVector3i && b.v instanceof GVector3i) {
        return a.v.x === b.v.x && a.v.y === b.v.y && a.v.z === b.v.z;
      }
      if (a.v instanceof GColor && b.v instanceof GColor) {
        return a.v.r === b.v.r && a.v.g === b.v.g && a.v.b === b.v.b && a.v.a === b.v.a;
      }
      // Callable 走与 `==` 同一条等式：盒子每次读都是新建的，按 JS 引用比会把真判成假
      if (isCallable(a) && isCallable(b)) return callableEq(a.v as CallableBox, b.v as CallableBox);
      return a.v === b.v;
    default:
      return a.v === b.v;
  }
}

/** 空数组 / 空字典 / 0 / 0.0 / "" 全为 false —— 与 JS 相反。 */
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
      // 空的 Packed\*Array 是假：实测 `type_convert(PackedByteArray(), TYPE_BOOL)` 给 false，值类型不受这条影响
      return v.v instanceof GBytes ? (v.v as GBytes).length !== 0 : true;
  }
  return false;
}
