import { GodotRuntimeError, UnsupportedError } from "./errors";
import type { Variant } from "./tags";
import { GArray, GDict, arrIdx, strFloat, valueEq } from "./values";

/** 与 tags.ts 的 checkInt 抛完全相同的错（D1：超 2^53 响亮失败，绝不静默降级）。 */
function int64(v: number): UnsupportedError {
  return new UnsupportedError("int64-out-of-range", `整数 ${v} 超出 2^53，需要 BigInt 路径（未实现）`);
}

/** 单态快路径（D2 的第二轨）。输入输出都是裸 JS 值，不装箱。 */
export const fast = {
  // ---- 容器元素单态化（D2 第四轨）：裸数组下标读写 ----
  /** 与装箱轨同一个 `arrIdx` 口径：支持负索引（从尾部数），越界抛 array-index。 */
  rawArrGet(a: number[], i: number): number {
    return a[arrIdx(i, a.length)]!;
  },

  /**
   * 二维网格 `g[i][j]`（number[][]）的双下标读：两层各自都用 arrIdx 规范化（负索引在任一层都合法），
   * 任一层越界抛 array-index，绝不静默 undefined→NaN。外层先、内层后，同 Godot 逐层报错的顺序。
   */
  rawArrGet2(g: number[][], i: number, j: number): number {
    const row = g[arrIdx(i, g.length)]!;
    return row[arrIdx(j, row.length)]!;
  },

  /**
   * 裸数组下标写。必须走 arrIdx 检查：JS 原生 `a[i] = v` 对越界会把数组撑长、对负数会挂成
   * 非索引属性，两者都是 Godot 会用 SCRIPT ERROR 拦下的静默错（055/056 探针确证）。
   */
  rawArrSet(a: number[], i: number, v: number): void {
    a[arrIdx(i, a.length)] = v;
  },

  rawArrSet2(g: number[][], i: number, j: number, v: number): void {
    const row = g[arrIdx(i, g.length)]!;
    row[arrIdx(j, row.length)] = v;
  },

  // ---- 变更类方法的裸路径（step 56）。口径逐条照抄装箱轨的 GArray，别在这儿另立一套 ----
  /**
   * `insert(at, v)` 的裸版，返回 Godot 的**状态码**：插进去了 0，下标折算后越界 31（数组不动）。
   * 折算与越界判定和 `GArray.insertAt` 一模一样：负数从尾部数、`at === size` 恰好是尾接、
   * `at > size` 与折算后 `< 0` 都是静默不插（实测 S141）。
   */
  rawArrInsert<T>(a: T[], at: number, v: T): number {
    const n = a.length;
    const k = at < 0 ? n + at : at;
    if (k < 0 || k > n) return 31;
    a.splice(k, 0, v);
    return 0;
  },

  /**
   * `remove_at(i)`，也是**结果被丢弃**的 `pop_at(i)`（装箱轨里两者折算与越界行为完全一样，
   * 只差一个返回 null）。越界静默无操作，不抛 array-index —— 这点和下标读写不同。
   */
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

  /**
   * `d.get(k, def)` 的裸版：**只**用于两参形态（默认值的静态类型与值槽同型）。
   * 一参形态缺键给 null，裸轨表示不了 → 那种用法整个字典退回装箱，不走这里。
   */
  rawDictGetOr<K, V>(m: Map<K, V>, k: K, def: V): V {
    return m.has(k) ? (m.get(k) as V) : def;
  },

  /**
   * 裸字典下标读（值为 number，故 get 返回 undefined 只可能是缺键）。缺键抛与 GDict.getRequired
   * 同族的 GodotRuntimeError —— Godot 对 `d[missing]` 方括号读本就是 SCRIPT ERROR（已探针确证），
   * 绝不把缺键静默成 undefined（→ NaN）。键为 int / string 原始值（float 键会与之碰撞，编译期已禁）。
   */
  rawDictGet(d: Map<unknown, number>, k: number | string): number {
    const v = d.get(k);
    if (v === undefined) {
      throw new GodotRuntimeError("dict-key", `字典键不存在: ${String(k)}`);
    }
    return v;
  },
  // ---- 解箱 int 运算：结果仍要过 D1 的 2^53 检查，溢出抛与 V.int/checkInt 完全相同的错 ----
  // 语义必须与 ops.add/sub/mul 的 bothInt 分支逐位对齐，否则解箱会变成静默错误。
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
  // 语义与 ops.div 的 bothInt 分支逐位对齐：除零抛 int-div-zero，结果向零截断再过 D1 检查。
  iDivC(a: number, b: number): number {
    if (b === 0) throw new GodotRuntimeError("int-div-zero", "整数除零（Godot 会直接崩进程，S27）");
    const r = Math.trunc(a / b);
    if (!Number.isSafeInteger(r)) throw int64(r);
    return r;
  },
  // 与 ops.mod 对齐：除零抛 int-mod-zero；JS % 已「跟被除数符号」(S3)；结果过 D1 检查。
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

  /** float 赋给 int 变量要向零截断（S6） */
  intCast(n: number): number {
    return Math.trunc(n);
  },

  /** str(int) 不带 .0（S7） */
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
