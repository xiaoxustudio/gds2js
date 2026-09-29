import { GodotRuntimeError, UnsupportedError } from "./errors";
import type { Variant } from "./tags";
import { GArray, GDict, arrIdx, strFloat, valueEq } from "./values";

/** 与 tags.ts 的 checkInt 抛完全相同的错（D1：超 2^53 响亮失败，绝不静默降级）。 */
function int64(v: number): UnsupportedError {
  return new UnsupportedError("int64-out-of-range", `整数 ${v} 超出 2^53，需要 BigInt 路径（未实现）`);
}

/** 单态快路径（D2 的第二轨）。输入输出都是裸 JS 值，不装箱。 */
export const fast = {
  rawArrGet(a: number[], i: number): number {
    return a[arrIdx(i, a.length)]!;
  },

  rawArrGet2(g: number[][], i: number, j: number): number {
    const row = g[arrIdx(i, g.length)]!;
    return row[arrIdx(j, row.length)]!;
  },

  rawArrSet(a: number[], i: number, v: number): void {
    a[arrIdx(i, a.length)] = v;
  },

  rawArrSet2(g: number[][], i: number, j: number, v: number): void {
    const row = g[arrIdx(i, g.length)]!;
    row[arrIdx(j, row.length)] = v;
  },

  rawArrInsert<T>(a: T[], at: number, v: T): number {
    const n = a.length;
    const k = at < 0 ? n + at : at;
    if (k < 0 || k > n) return 31;
    a.splice(k, 0, v);
    return 0;
  },

  rawArrRemoveAt(a: unknown[], i: number): void {
    const k = i < 0 ? i + a.length : i;
    if (k >= 0 && k < a.length) a.splice(k, 1);
  },

  rawArrClear(a: unknown[]): void {
    a.length = 0;
  },

  rawArrPushFront<T>(a: T[], v: T): void {
    a.unshift(v);
  },

  rawDictGetOr<K, V>(m: Map<K, V>, k: K, def: V): V {
    return m.has(k) ? (m.get(k) as V) : def;
  },

  rawDictGet(d: Map<unknown, number>, k: number | string): number {
    const v = d.get(k);
    if (v === undefined) {
      throw new GodotRuntimeError("dict-key", `字典键不存在: ${String(k)}`);
    }
    return v;
  },
  iAddC(a: number, b: number): number {
    const r = a + b;
    if (!Number.isSafeInteger(r)) throw int64(r);
    return r;
  },
  iSubC(a: number, b: number): number {
    const r = a - b;
    if (!Number.isSafeInteger(r)) throw int64(r);
    return r;
  },
  iMulC(a: number, b: number): number {
    const r = a * b;
    if (!Number.isSafeInteger(r)) throw int64(r);
    return r;
  },
  iDivC(a: number, b: number): number {
    if (b === 0) throw new GodotRuntimeError("int-div-zero", "整数除零（Godot 会直接崩进程，S27）");
    const r = Math.trunc(a / b);
    if (!Number.isSafeInteger(r)) throw int64(r);
    return r;
  },
  iModC(a: number, b: number): number {
    if (b === 0) throw new GodotRuntimeError("int-mod-zero", "整数取模零");
    const r = a % b;
    if (!Number.isSafeInteger(r)) throw int64(r);
    return r;
  },

  iDiv(a: number, b: number): number {
    if (b === 0) throw new GodotRuntimeError("int-div-zero", "整数除零（Godot 会直接崩进程，S27）");
    return Math.trunc(a / b);
  },
  fDiv(a: number, b: number): number {
    return a / b;
  },
  iMod(a: number, b: number): number {
    if (b === 0) throw new GodotRuntimeError("int-mod-zero", "整数取模零");
    return a % b;
  },
  iPow(a: number, b: number): number {
    if (b < 0) throw new UnsupportedError("int-pow-negative", "负整数次幂（未补测）");
    return Math.pow(a, b);
  },
  fPow(a: number, b: number): number {
    return Math.pow(a, b);
  },

  iAdd(a: number, b: number): number {
    return a + b;
  },
  iSub(a: number, b: number): number {
    return a - b;
  },
  iMul(a: number, b: number): number {
    return a * b;
  },
  fAdd(a: number, b: number): number {
    return a + b;
  },
  fSub(a: number, b: number): number {
    return a - b;
  },
  fMul(a: number, b: number): number {
    return a * b;
  },
  sConcat(a: string, b: string): string {
    return a + b;
  },

  intCast(n: number): number {
    return Math.trunc(n);
  },

  strInt(n: number): string {
    return String(n);
  },
  strFloat,

  truthyInt(n: number): boolean {
    return n !== 0;
  },
  truthyStr(s: string): boolean {
    return s !== "";
  },
  truthyArr(a: GArray): boolean {
    return a.size() !== 0;
  },
  truthyDict(d: GDict): boolean {
    return d.size() !== 0;
  },

  eqDeep(a: Variant, b: Variant): boolean {
    return valueEq(a, b);
  },
  eqNum(a: number, b: number): boolean {
    return a === b;
  },
};
