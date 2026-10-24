import { GodotRuntimeError, UnsupportedError } from "./errors";
import type { Variant } from "./tags";
import { GArray, GDict, arrIdx, arrIdxWrite, strFloat, valueEq } from "./values";

/** 整数超出 2^53 时抛的错，与 tags.ts 的 checkInt 同一句。 */
function int64(v: number): UnsupportedError {
  return new UnsupportedError("int64-out-of-range", `整数 ${v} 超出 2^53，需要 BigInt 路径（未实现）`);
}

/** 单态快路径：输入输出都是裸 JS 值，不装箱。 */
export const fast = {
  /** 装箱值 → 裸值：按名派发表调裸 ABI 方法时用。 */
  unboxNum(v: Variant): number {
    return v.v as number;
  },

  unboxStr(v: Variant): string {
    return v.v as string;
  },

  // 裸数组 / 裸字典的快路径按元素种类各发一个具体入口，不发泛型方法：泛型方法在静态编译目标上按接收者解析不过去。
  rawArrGetNum(a: number[], i: number): number {
    return a[arrIdx(i, a.length)] as number;
  },

  rawArrGetNumBase(a: number[], i: number, base: string): number {
    return a[arrIdx(i, a.length, base)] as number;
  },

  rawArrGetStr(a: string[], i: number): string {
    return a[arrIdx(i, a.length)] as string;
  },

  rawArrGetStrBase(a: string[], i: number, base: string): string {
    return a[arrIdx(i, a.length, base)] as string;
  },

  rawArrGetNum2(g: number[][], i: number, j: number): number {
    const row = g[arrIdx(i, g.length)] as number[];
    return row[arrIdx(j, row.length)] as number;
  },

  rawArrGetStr2(g: string[][], i: number, j: number): string {
    const row = g[arrIdx(i, g.length)] as string[];
    return row[arrIdx(j, row.length)] as string;
  },

  rawArrSetNum(a: number[], i: number, v: number): void {
    a[arrIdxWrite(i, a.length, Number.isInteger(v) ? "int" : "float")] = v;
  },

  rawArrSetStr(a: string[], i: number, v: string): void {
    a[arrIdxWrite(i, a.length, "String")] = v;
  },

  rawArrSetNum2(g: number[][], i: number, j: number, v: number): void {
    const row = g[arrIdx(i, g.length)] as number[];
    row[arrIdxWrite(j, row.length, Number.isInteger(v) ? "int" : "float")] = v;
  },

  rawArrSetStr2(g: string[][], i: number, j: number, v: string): void {
    const row = g[arrIdx(i, g.length)] as string[];
    row[arrIdxWrite(j, row.length, "String")] = v;
  },

  // 插入按种类各发一份：不能先 push 一个外来值占位再移位，静态目标上数组带元素类型、长度撑不起来。先 push 本族值，再把 k 之后的格子整体后移，最后写 k。
  rawArrInsertNum(a: number[], at: number, v: number): number {
    const n = a.length;
    const k = at < 0 ? n + at : at;
    if (k < 0 || k > n) return 31;
    a.push(v);
    for (let i = n - 1; i >= k; i--) a[i + 1] = a[i] as number;
    a[k] = v;
    return 0;
  },

  rawArrInsertStr(a: string[], at: number, v: string): number {
    const n = a.length;
    const k = at < 0 ? n + at : at;
    if (k < 0 || k > n) return 31;
    a.push(v);
    for (let i = n - 1; i >= k; i--) a[i + 1] = a[i] as string;
    a[k] = v;
    return 0;
  },

  // removeAt / clear 也按种类各发一份：`unknown[]` 形参在静态目标上收到的是拷贝，原地改动会静默丢掉；`splice` 没有 lowering，所以手写后移 + pop。
  rawArrRemoveAtNum(a: number[], i: number): void {
    const k = i < 0 ? i + a.length : i;
    if (k < 0 || k >= a.length) return;
    for (let j = k; j + 1 < a.length; j++) a[j] = a[j + 1] as number;
    a.pop();
  },

  rawArrRemoveAtStr(a: string[], i: number): void {
    const k = i < 0 ? i + a.length : i;
    if (k < 0 || k >= a.length) return;
    for (let j = k; j + 1 < a.length; j++) a[j] = a[j + 1] as string;
    a.pop();
  },

  rawArrClearNum(a: number[]): void {
    a.length = 0;
  },

  rawArrClearStr(a: string[]): void {
    a.length = 0;
  },

  rawArrPushFrontNum(a: number[], v: number): void {
    a.unshift(v);
  },

  rawArrPushFrontStr(a: string[], v: string): void {
    a.unshift(v);
  },

  rawDictGetOrNum(m: Map<unknown, number>, k: unknown, def: number): number {
    return m.has(k) ? (m.get(k) as number) : def;
  },

  rawDictGetOrStr(m: Map<unknown, string>, k: unknown, def: string): string {
    return m.has(k) ? (m.get(k) as string) : def;
  },

  rawDictGet(d: Map<unknown, number>, k: number | string): number {
    const v = d.get(k);
    if (v === undefined) {
      throw new GodotRuntimeError("dict-key", `Invalid access to property or key '${String(k)}' on a base object of type 'Dictionary'.`);
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
    if (b === 0) throw new GodotRuntimeError("int-div-zero", "Division by zero error in operator '/'.");
    const r = Math.trunc(a / b);
    if (!Number.isSafeInteger(r)) throw int64(r);
    return r;
  },
  iModC(a: number, b: number): number {
    if (b === 0) throw new GodotRuntimeError("int-mod-zero", "Modulo by zero error in operator '%'.");
    const r = a % b;
    if (!Number.isSafeInteger(r)) throw int64(r);
    return r;
  },

  iDiv(a: number, b: number): number {
    if (b === 0) throw new GodotRuntimeError("int-div-zero", "Division by zero error in operator '/'.");
    return Math.trunc(a / b);
  },
  fDiv(a: number, b: number): number {
    return a / b;
  },
  iMod(a: number, b: number): number {
    if (b === 0) throw new GodotRuntimeError("int-mod-zero", "Modulo by zero error in operator '%'.");
    return a % b;
  },
  iPow(a: number, b: number): number {
    if (b < 0) {
      const r = Math.trunc(Math.pow(a, b));
      if (!Number.isSafeInteger(r)) throw int64(r);
      return r;
    }
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
