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
  ARRAY: 5,
  DICT: 6,
  OBJECT: 7,
} as const;

export type TagValue = (typeof Tag)[keyof typeof Tag];

/** 动态路径的值（R3）。静态类型已知时用裸 JS 值，不装箱。 */
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
  [Tag.ARRAY]: "Array",
  [Tag.DICT]: "Dictionary",
  [Tag.OBJECT]: "Object",
};

export function tagName(t: TagValue): string {
  return TAG_NAME[t];
}

/** int 用 JS number 承载（D1）。超出 2^53 一律抛错，不做静默降级。 */
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
  int(v: number): Variant {
    return { t: Tag.INT, v: checkInt(v) };
  },
  float(v: number): Variant {
    return { t: Tag.FLOAT, v };
  },
  str(v: string): Variant {
    return { t: Tag.STRING, v };
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
