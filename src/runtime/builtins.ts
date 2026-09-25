import { UnsupportedError } from "./errors";
import { Tag, V, intToNum, type IntPayload, type Variant } from "./tags";
import { GArray, show, strLength, truthyOf } from "./values";

/** 把 Variant 取成裸 number（内置函数收数值参数时用） */
export function num(v: Variant): number {
  if (v.t !== Tag.INT && v.t !== Tag.FLOAT) {
    throw new UnsupportedError("not-number", `需要数值，收到类型 ${v.t}`);
  }
  // int 载荷可能是 bigint：这里收成 number，float(大整数) 的精度损失与 Godot 一致。
  return v.t === Tag.INT ? intToNum(v.v as IntPayload) : (v.v as number);
}

/** str() 返回的是 String 变体，不是裸 JS 字符串 —— 否则 print(str(x)) 会炸 */
export function strOf(v: Variant): Variant {
  return V.str(show(v));
}

export function toFloat(v: Variant): Variant {
  return V.float(num(v));
}

export function toInt(v: Variant): Variant {
  return V.int(Math.trunc(num(v)));
}

export function toBool(v: Variant): Variant {
  return V.bool(truthyOf(v));
}

export function sqrt(v: Variant): Variant {
  return V.float(Math.sqrt(num(v)));
}

export function abs(v: Variant): Variant {
  return num(v) < 0 ? V.float(Math.abs(num(v))) : V.float(Math.abs(num(v)));
}

export function lengthOf(v: Variant): Variant {
  if (v.t === Tag.STRING) return V.int(strLength(v.v as string));
  if (v.t === Tag.ARRAY) return V.int((v.v as GArray).size());
  throw new UnsupportedError("len", `len() 不支持类型 ${v.t}`);
}

/** and / or 是短路的，所以右值延迟求值 */
export function and(l: Variant, right: () => Variant): Variant {
  return truthyOf(l) ? right() : l;
}

export function or(l: Variant, right: () => Variant): Variant {
  return truthyOf(l) ? l : right();
}

/** range(end) / range(start, end) / range(start, end, step) */
export function range(a: number, b?: number, step = 1): GArray {
  let start = 0;
  let end = a;
  if (b !== undefined) {
    start = a;
    end = b;
  }
  if (step === 0) throw new Error("range 的步长不能为 0");
  // 非整数的界/步长：Godot 走 int 重载会退化（实测 `range(0, 3, 0.5)` 什么都不输出），我们不去
  // 复刻这种未文档化的退化，改为响亮拒绝 —— 否则会一路走到 `V.int(0.5)`，报出「0.5 超出 2^53」
  // 这种指错地方的误导错误。整数值的 float（如 range(0.0, 3.0)）不受影响，实测与 Godot 同为 0/1/2。
  for (const [what, v] of [
    ["起点", start],
    ["终点", end],
    ["步长", step],
  ] as const) {
    if (!Number.isInteger(v)) {
      throw new UnsupportedError(
        "range-non-integer",
        `range 的${what}不是整数（${v}）：Godot 此处退化为空数组，语义未定，拒绝生成可能静默错位的代码`,
      );
    }
  }
  const items = [];
  if (step > 0) {
    for (let i = start; i < end; i += step) items.push(V.int(i));
  } else {
    for (let i = start; i > end; i += step) items.push(V.int(i));
  }
  return GArray.of(items);
}
