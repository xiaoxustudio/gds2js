import { valueTypeName } from "../string-ops";
import { GodotRuntimeError } from "../errors";
import { Tag, V, type Variant } from "../tags";
import { color } from "../class/color/color";
import { sortGodot } from "../sort";
import { arrIdx, arrIdxWrite, COMPARE_DEPTH, elemConvert, elemDefault, type ElemKind, keyOf, registerContainerFactories, show, truthyOf, valueEq, valueSame } from "./core";
import { deepCopy } from "./core";
import { classFaceMatches, fromEnd } from "./core";

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

export const MINMAX_UNORDERABLE = new Set(["compare-operands", "color-cmp"]);

registerContainerFactories({ array: () => new GArray(), dict: () => new GDict() });
