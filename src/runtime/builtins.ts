import { UnsupportedError } from "./errors";
import { Tag, V, type Variant } from "./tags";
import { GArray, show, strLength, truthyOf } from "./values";

/** 把 Variant 取成裸 number（内置函数收数值参数时用） */
export function num(v: Variant): number {
  if (v.t !== Tag.INT && v.t !== Tag.FLOAT) {
    throw new UnsupportedError("not-number", `需要数值，收到类型 ${v.t}`);
  }
  return v.v as number;
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
  const items = [];
  if (step > 0) {
    for (let i = start; i < end; i += step) items.push(V.int(i));
  } else {
    for (let i = start; i > end; i += step) items.push(V.int(i));
  }
  return GArray.of(items);
}
