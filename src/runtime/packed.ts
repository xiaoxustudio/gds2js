import { GodotRuntimeError, UnsupportedError } from "./errors";
import { Tag, V, intToNum, tagName, type Variant } from "./tags";
// 只要类型：values.ts 反过来 import 这个模块（打印与相等都要认它），运行时互相引用就成了环
import type { GArray } from "./values";

/**
 * `PackedByteArray`（S168）。这一族先只做**字节**这一种：其余八种 pack 的元素转换规则
 * （int32 / int64 回绕、float32 舍入、string / vector / color 的元素口径）还没逐条对拍，
 * 半套值类型正是这个项目一路在挡的事。
 *
 * 三条实测要点：
 * - **引用语义**：`var c = b` 之后 `c[0] = 72` 连 `b[0]` 一起变（f40 t3）—— 与 Array / Dictionary 同一条，
 *   但 `PackedByteArray(src)` 与 `duplicate()` / `slice()` 都是**独立拷贝**（f49 t3、f51 t11）。
 * - **元素一律折成 0..255**：300 → 44、-1 → 255、下标写 700 → 188（f43）；float 先按 `int()` 截断
 *   （2.7 → 2）、bool → 1（f49 t1/t2）。
 * - 老文档里的 `min` / `max` / `sum` / `pop_back` / `subarray` / `to_string` / `decode_utf8` / `hash`
 *   在 4.6.3 **都不存在**，而且是**运行期**错（绑给 var 之后不再做解析期检查），文本已钉住。
 */
export class GBytes {
  private items: number[];

  constructor(items: number[] = []) {
    this.items = items;
  }

  raw(): number[] {
    return this.items;
  }

  get length(): number {
    return this.items.length;
  }

  static of(values: number[]): GBytes {
    return new GBytes(values);
  }
}

export function asBytes(v: Variant): GBytes | null {
  return v.t === Tag.OBJECT && v.v instanceof GBytes ? (v.v as GBytes) : null;
}

/** 元素折成 0..255。只收实测过的三种来源：int / float（先截断）/ bool。 */
export function toByte(v: Variant): number {
  if (v.t === Tag.BOOL) return (v.v as boolean) ? 1 : 0;
  if (v.t !== Tag.INT && v.t !== Tag.FLOAT) {
    throw new UnsupportedError(
      "packed-byte-element",
      `往 PackedByteArray 塞 ${tagName(v.t)} 没实测过（Godot 对字面量是解析期拒，运行期那一格我们没量）`,
    );
  }
  // 实测：300 → 44、-1 → 255、下标写 700 → 188（回绕），2.7 → 2（先按 int() 截断）、true → 1
  const n = v.t === Tag.FLOAT ? Math.trunc(v.v as number) : intToNum(v.v as number | bigint);
  if (typeof n === "bigint") return Number(((n % 256n) + 256n) % 256n);
  return ((Math.trunc(n) % 256) + 256) % 256;
}

function byteValue(v: Variant): number {
  return toByte(v);
}

/** 越界读的文本是实测的（f50）；**负下标从尾部数**（f52：`b[-1]` → 2）。 */
function byteAt(b: GBytes, idx: Variant): number {
  const n = intToNum(idx.v as number | bigint);
  const len = b.length;
  const at = typeof n === "bigint" ? Number(n) : Math.trunc(n);
  const real = at < 0 ? len + at : at;
  if (real < 0 || real >= len) {
    throw new GodotRuntimeError("packed-index", `Invalid access of index '${String(at)}' on a base object of type: 'PackedByteArray'.`);
  }
  return b.raw()[real] as number;
}

export function bytesCtor(args: Variant[]): Variant {
  if (args.length > 1) {
    throw new GodotRuntimeError("arity", `PackedByteArray() 最多 1 个参数（收到 ${args.length} 个）`);
  }
  if (args.length === 0) return V.object(new GBytes());
  const src = args[0] as Variant;
  const b = new GBytes();
  if (src.t === Tag.ARRAY) {
    for (const item of (src.v as GArray).raw()) b.raw().push(toByte(item));
  } else {
    const sb = asBytes(src);
    if (sb === null) {
      throw new UnsupportedError("packed-ctor", `PackedByteArray(${tagName(src.t)}) 这个初值形状没实测过`);
    }
    for (const item of sb.raw()) b.raw().push(item);
  }
  return V.object(b);
}

/** 4.6.3 里**不存在**的那批（运行期 `Nonexistent function`，f41 / f42 / f49 / 用例 135 实测）。 */
const NO_SUCH_METHOD = new Set([
  "min",
  "max",
  "sum",
  "pop_back",
  "pop_front",
  "subarray",
  "to_string",
  "to_byte_array",
  "decode_utf8",
  "decode_ascii",
  "hash",
  "push_back",
  "push_front",
  // 旧文档里的写时复制入口在 4.6.3 对这个类型**不存在**（e3 实测：运行期 `Nonexistent function`，
  // 而且它把脚本打断、quit() 跑不到 —— 进不了语料，只钉在这里与 ops-check）
  "copy_on_write",
]);
/** 存在但这一轮没做 / 没实测的形状 —— 响亮拒，不拿别的 pack 的结论凑。 */
const NOT_YET = new Set(["bsearch", "to_hex_string", "to_raw_string", "compress", "decompress", "search_sorted", "set", "get_bytes", "remove_at_copy"]);

function arity(name: string, args: Variant[], n: number): void {
  if (args.length !== n) throw new GodotRuntimeError("arity", `${name}() 需要 ${n} 个参数（收到 ${args.length} 个）`);
}

export function bytesMethod(b: GBytes, name: string, args: Variant[]): Variant {
  const items = b.raw();
  if (NO_SUCH_METHOD.has(name)) {
    throw new GodotRuntimeError("packed-no-method", `Invalid call. Nonexistent function '${name}' in base 'PackedByteArray'.`);
  }
  if (NOT_YET.has(name)) {
    throw new UnsupportedError("packed-method", `PackedByteArray.${name}() 还没实测过，不发出去`);
  }
  switch (name) {
    case "size":
      return V.int(items.length);
    case "is_empty":
      return V.bool(items.length === 0);
    case "append": {
      arity("append", args, 1);
      items.push(toByte(args[0] as Variant));
      // 实测 `print(b.append(9))` 给 **false**（且元素照样追加）—— 文档写的是 void，
      // 但 GDScript 这条路给的是一个 bool，取值合法，所以不能发 null（tmp/void-probe g1/g6）
      return V.bool(false);
    }
    case "append_array": {
      arity("append_array", args, 1);
      const src = asBytes(args[0] as Variant);
      if (src === null) {
        throw new UnsupportedError("append-array-element", `append_array() 只实测过 PackedByteArray 实参（收到 ${tagName((args[0] as Variant).t)}）`);
      }
      for (const v of src.raw()) items.push(v);
      return V.nil();
    }
    case "insert": {
      arity("insert", args, 2);
      const at = intToNum((args[0] as Variant).v as number | bigint);
      const pos = typeof at === "bigint" ? Number(at) : at;
      // 实测：负下标与越界都是**原样不动 + 返回 31**（不是尾部插入！JS 的 splice(-1) 会插到末尾，
      // 那是静默错），合法区间 0..len 给 0（tmp/void-probe e5/d7/g7）
      if (!(pos >= 0 && pos <= items.length)) {
        return V.int(31);
      }
      items.splice(pos, 0, toByte(args[1] as Variant));
      return V.int(0);
    }
    case "remove_at": {
      arity("remove_at", args, 1);
      const at = intToNum((args[0] as Variant).v as number | bigint);
      const pos = typeof at === "bigint" ? Number(at) : at;
      // 实测：负下标与越界都是**原样不动**（stderr 只多一句 `Index p_index = -1 is out of bounds`），
      // 而 splice(-1,1) 在 JS 是删最后一个 —— 这一格不挡就是静默错（e7 / e8）
      if (pos >= 0 && pos < items.length) items.splice(pos, 1);
      return V.nil();
    }
    case "resize": {
      arity("resize", args, 1);
      const n = intToNum((args[0] as Variant).v as number | bigint);
      const want = typeof n === "bigint" ? Number(n) : n;
      // 实测：负数给 **31** 且长度不变；缩回去是截断（3→2 得 `[1, 2]` 返回 0）；
      // 长出来的格子填 0（f51 t10），成功一律 0（g2 / g3 / e4）
      if (want < 0) return V.int(31);
      while (items.length < want) items.push(0);
      if (want < items.length) items.length = want;
      return V.int(0);
    }
    case "fill": {
      arity("fill", args, 1);
      const v = toByte(args[0] as Variant);
      items.fill(v);
      return V.nil();
    }
    case "has":
      arity("has", args, 1);
      return V.bool(items.includes(byteValue(args[0] as Variant)));
    case "count":
      arity("count", args, 1);
      return V.int(items.filter((x) => x === byteValue(args[0] as Variant)).length);
    case "find":
      arity("find", args, 1);
      return V.int(items.indexOf(byteValue(args[0] as Variant)));
    case "sort":
      items.sort((x, y) => x - y);
      return V.nil();
    case "reverse":
      items.reverse();
      return V.nil();
    case "duplicate":
      return V.object(new GBytes([...items]));
    case "slice": {
      if (args.length < 1 || args.length > 2) {
        throw new GodotRuntimeError("arity", `slice() 需要 1 或 2 个参数（收到 ${args.length} 个）`);
      }
      const from = intToNum((args[0] as Variant).v as number | bigint);
      const begin = typeof from === "bigint" ? Number(from) : from;
      const to = args[1];
      const end = to === undefined ? items.length : intToNum(to.v as number | bigint);
      return V.object(new GBytes(items.slice(begin, typeof end === "bigint" ? Number(end) : end)));
    }
    case "get": {
      arity("get", args, 1);
      const gv = intToNum((args[0] as Variant).v as number | bigint);
      const n = typeof gv === "bigint" ? Number(gv) : Math.trunc(gv);
      // 实测：`get` 越界**不报错**、给 0（g4），与 `b[5]` 那句 `Invalid access of index` 是两套口径。
      // 负下标的 `get` 没量过（下标读实测是从尾部数，`get(-1)` 未知）→ 响着拒，不按下标读那条套过去
      if (n < 0) {
        throw new UnsupportedError("packed-get-neg", "get() 的负下标没实测过（下标读实测是从尾部数）");
      }
      return V.int(n < items.length ? (items[n] as number) : 0);
    }
    case "hex_encode":
      return V.str(items.map((x) => x.toString(16).padStart(2, "0")).join(""));
    case "get_string_from_utf8": {
      // f40 t4：字节 → UTF-8 文本，`[104,105]` → "hi"、`héllo` 的六字节回原样
      return V.str(new TextDecoder("utf-8", { fatal: false }).decode(new Uint8Array(items)));
    }
    case "get_string_from_ascii": {
      // f40 t12 只测过纯 ASCII（[104,105] → "hi"）；带高位字节的那一格没量，不猜
      if (items.some((x) => x > 127)) {
        throw new UnsupportedError("packed-ascii", "get_string_from_ascii() 只实测过纯 ASCII 的字节");
      }
      return V.str(String.fromCharCode(...items));
    }
    default:
      throw new UnsupportedError("packed-method", `PackedByteArray.${name}() 未实现`);
  }
}

export function bytesReadIndex(b: GBytes, idx: Variant): Variant {
  return V.int(byteAt(b, idx));
}

export function bytesWriteIndex(b: GBytes, idx: Variant, value: Variant, who: string): Variant | null {
  const atRaw = intToNum(idx.v as number | bigint);
  const at = typeof atRaw === "bigint" ? Number(atRaw) : Math.trunc(atRaw);
  // 实测：**写**的负下标与读一样从尾部数（`b[-1] = 9` → `[1, 2, 9]`，d6）。早先按「没量过」拒掉，
  // 那是「Godot 跑、我们拒」，这一格现在补齐；越界那侧给实测的那句话（f50）
  const real = at < 0 ? b.length + at : at;
  if (real < 0 || real >= b.length) {
    throw new GodotRuntimeError(
      "packed-index-write",
      `Invalid assignment of index '${String(at)}' (on base: 'PackedByteArray') with value of type '${tagName(value.t)}'.`,
    );
  }
  b.raw()[real] = toByte(value);
  return null;
}

export function bytesConcat(a: GBytes, b: GBytes): Variant {
  // f51 t1：`+` 是拼接且返回新的 pack（元素折成字节的规则同样适用）
  return V.object(new GBytes([...a.raw(), ...b.raw()]));
}

export function bytesEq(a: GBytes, b: GBytes): boolean {
  // f51 t2：逐元素比内容（`b == c` 假、与同内容的新 pack 相等真）
  const x = a.raw();
  const y = b.raw();
  if (x.length !== y.length) return false;
  return x.every((v, i) => v === y[i]);
}
