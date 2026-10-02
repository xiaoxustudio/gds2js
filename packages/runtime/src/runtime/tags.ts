import { UnsupportedError } from "./errors";

/**
 * 值标签。用普通对象而不是 `const enum`：const enum 是 TS 专属语法，
 * node 的类型剥离跑不了。
 */
export const Tag = {
  NIL: 0,
  BOOL: 1,
  INT: 2,
  FLOAT: 3,
  STRING: 4,
  STRING_NAME: 8,
  ARRAY: 5,
  DICT: 6,
  OBJECT: 7,
} as const;

export type TagValue = (typeof Tag)[keyof typeof Tag];

export interface Variant {
  t: TagValue;
  v: unknown;
}

const TAG_NAME: Record<TagValue, string> = {
  [Tag.NIL]: "nil",
  [Tag.BOOL]: "bool",
  [Tag.INT]: "int",
  [Tag.FLOAT]: "float",
  [Tag.STRING]: "String",
  [Tag.STRING_NAME]: "StringName",
  [Tag.ARRAY]: "Array",
  [Tag.DICT]: "Dictionary",
  [Tag.OBJECT]: "Object",
};

export function tagName(t: TagValue): string {
  return TAG_NAME[t];
}

export type IntPayload = number | bigint;

const TWO_63 = 1n << 63n;
const TWO_64 = 1n << 64n;
const MAX_SAFE_B = BigInt(Number.MAX_SAFE_INTEGER);
const MIN_SAFE_B = -MAX_SAFE_B;

/** Godot 的 int 是 64 位有符号、溢出**回绕**（006 实测 int64max+1 → int64min），这里实现同一件事。 */
export function wrap64(x: bigint): bigint {
  let v = x % TWO_64;
  if (v < 0n) v = v + TWO_64;
  return v >= TWO_63 ? v - TWO_64 : v;
}

/** 先回绕到 [-2^63, 2^63)，再把能安全用 number 表达的值收回 number。 */
export function normInt(x: bigint): number | bigint {
  const v = wrap64(x);
  return v >= MIN_SAFE_B && v <= MAX_SAFE_B ? Number(v) : v;
}

export const intToBig = (v: IntPayload): bigint => (typeof v === "bigint" ? v : BigInt(v));
/** 交给只能吃 number 的场合（浮点混合、数组下标、strAt 等）。精度损失与 Godot 的 float 一致。 */
export const intToNum = (v: IntPayload): number => (typeof v === "bigint" ? Number(v) : v);

/** 裸 number 越界仍响亮抛错（解箱快路径的边界，D1 有意保留）；bigint 则按 int64 回绕归一化。 */
function checkInt(v: number): number {
  if (!Number.isSafeInteger(v)) {
    throw new UnsupportedError(
      "int64-out-of-range",
      `整数 ${v} 超出 2^53，需要 BigInt 路径（未实现）`,
    );
  }
  return v;
}

export const V = {
  nil(): Variant {
    return { t: Tag.NIL, v: null };
  },
  bool(v: boolean): Variant {
    return { t: Tag.BOOL, v };
  },
  int(v: number | bigint): Variant {
    return { t: Tag.INT, v: typeof v === "bigint" ? normInt(v) : checkInt(v) };
  },
  float(v: number): Variant {
    return { t: Tag.FLOAT, v };
  },
  str(v: string): Variant {
    return { t: Tag.STRING, v };
  },
  stringName(v: string): Variant {
    return { t: Tag.STRING_NAME, v };
  },
  array(v: unknown): Variant {
    return { t: Tag.ARRAY, v };
  },
  dict(v: unknown): Variant {
    return { t: Tag.DICT, v };
  },
  object(v: unknown): Variant {
    return { t: Tag.OBJECT, v };
  },
};

/** 把裸 JS 值按静态类型装成 Variant（emitter 在需要跨入动态路径时用）。 */
export function box(v: unknown, staticType: "int" | "float" | "bool" | "string"): Variant {
  switch (staticType) {
    case "int":
      return V.int(v as number);
    case "float":
      return V.float(v as number);
    case "bool":
      return V.bool(v as boolean);
    case "string":
      return V.str(v as string);
  }
}
