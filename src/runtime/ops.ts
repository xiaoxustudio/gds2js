import { GodotRuntimeError, UnsupportedError } from "./errors";
import { Tag, tagName, V, type Variant } from "./tags";
import { GVector2 } from "./vector2";
import {
  GArray,
  GDict,
  keyOf,
  show,
  strAt,
  strFloat,
  strFormat,
  strLength,
  strSubstr,
  truthyOf,
  valueEq,
} from "./values";

const isNum = (v: Variant): boolean => v.t === Tag.INT || v.t === Tag.FLOAT;

function num(v: Variant): number {
  if (!isNum(v)) {
    throw new UnsupportedError("not-number", `需要数值，收到 ${tagName(v.t)}`);
  }
  return v.v as number;
}

function bothInt(a: Variant, b: Variant): boolean {
  return a.t === Tag.INT && b.t === Tag.INT;
}

function intPair(a: Variant, b: Variant): [number, number] {
  if (!bothInt(a, b)) {
    throw new UnsupportedError("need-int", `需要两个 int，收到 ${tagName(a.t)} 和 ${tagName(b.t)}`);
  }
  return [a.v as number, b.v as number];
}

/**
 * 动态路径的运算符分派（R4）。
 * 每条语义都能在 docs/SEMANTICS.md 里找到依据编号。
 */
export const ops = {
  add(a: Variant, b: Variant): Variant {
    if (isNum(a) && isNum(b)) {
      return bothInt(a, b) ? V.int((a.v as number) + (b.v as number)) : V.float(num(a) + num(b));
    }
    if (a.t === Tag.STRING && b.t === Tag.STRING) {
      return V.str((a.v as string) + (b.v as string));
    }
    if (a.t === Tag.ARRAY && b.t === Tag.ARRAY) {
      return V.array((a.v as GArray).concat(b.v as GArray));
    }
    // Vector2 分量加（S13）
    const va = a.t === Tag.OBJECT && a.v instanceof GVector2 ? a.v : null;
    const vb = b.t === Tag.OBJECT && b.v instanceof GVector2 ? b.v : null;
    if (va && vb) return V.object(new GVector2(va.x + vb.x, va.y + vb.y));
    throw new UnsupportedError("add-operands", `+ 不支持 ${tagName(a.t)} + ${tagName(b.t)}`);
  },

  sub(a: Variant, b: Variant): Variant {
    if (!isNum(a) || !isNum(b)) {
      throw new UnsupportedError("sub-operands", `- 不支持 ${tagName(a.t)} - ${tagName(b.t)}`);
    }
    return bothInt(a, b) ? V.int((a.v as number) - (b.v as number)) : V.float(num(a) - num(b));
  },

  mul(a: Variant, b: Variant): Variant {
    if (!isNum(a) || !isNum(b)) {
      throw new UnsupportedError("mul-operands", `* 不支持 ${tagName(a.t)} * ${tagName(b.t)}`);
    }
    return bothInt(a, b) ? V.int((a.v as number) * (b.v as number)) : V.float(num(a) * num(b));
  },

  /** 两个 int 才走整数除法（向零截断），否则浮点（S1 / S2） */
  div(a: Variant, b: Variant): Variant {
    if (!isNum(a) || !isNum(b)) {
      throw new UnsupportedError("div-operands", `/ 不支持 ${tagName(a.t)} / ${tagName(b.t)}`);
    }
    if (bothInt(a, b)) {
      const [x, y] = intPair(a, b);
      if (y === 0) {
        throw new GodotRuntimeError("int-div-zero", "整数除零（Godot 会直接崩进程，S27）");
      }
      return V.int(Math.trunc(x / y));
    }
    return V.float(num(a) / num(b));
  },

  /** 取模只对 int 合法，符号跟被除数（S3） */
  mod(a: Variant, b: Variant): Variant {
    const [x, y] = intPair(a, b);
    if (y === 0) {
      throw new GodotRuntimeError("int-mod-zero", "整数取模零");
    }
    return V.int(x % y);
  },

  /** 结合性由 emitter 加括号保证（S4） */
  pow(a: Variant, b: Variant): Variant {
    if (!isNum(a) || !isNum(b)) {
      throw new UnsupportedError("pow-operands", `** 不支持 ${tagName(a.t)} ** ${tagName(b.t)}`);
    }
    const [x, y] = [num(a), num(b)];
    if (bothInt(a, b)) {
      if (y < 0) {
        throw new UnsupportedError("int-pow-negative", "负整数次幂（未补测）");
      }
      return V.int(Math.pow(x, y));
    }
    return V.float(Math.pow(x, y));
  },

  neg(a: Variant): Variant {
    if (!isNum(a)) {
      throw new UnsupportedError("neg-operands", `- 不支持 ${tagName(a.t)}`);
    }
    return a.t === Tag.INT ? V.int(-(a.v as number)) : V.float(-(a.v as number));
  },

  // ---- 比较 ----

  eq(a: Variant, b: Variant): Variant {
    return V.bool(valueEq(a, b));
  },
  neq(a: Variant, b: Variant): Variant {
    return V.bool(!valueEq(a, b));
  },
  lt(a: Variant, b: Variant): Variant {
    return V.bool(compare(a, b) < 0);
  },
  lte(a: Variant, b: Variant): Variant {
    return V.bool(compare(a, b) <= 0);
  },
  gt(a: Variant, b: Variant): Variant {
    return V.bool(compare(a, b) > 0);
  },
  gte(a: Variant, b: Variant): Variant {
    return V.bool(compare(a, b) >= 0);
  },

  /** 空容器 / 0 / "" 全为 false（S12） */
  truthy(a: Variant): boolean {
    return truthyOf(a);
  },

  // ---- 位运算（用 BigInt 保证 64 位语义，超出 2^53 由 V.int 抛错）----

  band(a: Variant, b: Variant): Variant {
    const [x, y] = intPair(a, b);
    return V.int(Number(BigInt(x) & BigInt(y)));
  },
  bor(a: Variant, b: Variant): Variant {
    const [x, y] = intPair(a, b);
    return V.int(Number(BigInt(x) | BigInt(y)));
  },
  bxor(a: Variant, b: Variant): Variant {
    const [x, y] = intPair(a, b);
    return V.int(Number(BigInt(x) ^ BigInt(y)));
  },
  bnot(a: Variant): Variant {
    if (a.t !== Tag.INT) {
      throw new UnsupportedError("need-int", `~ 需要 int，收到 ${tagName(a.t)}`);
    }
    return V.int(Number(~BigInt(a.v as number)));
  },
  shl(a: Variant, b: Variant): Variant {
    const [x, y] = checkShift(a, b);
    return V.int(Number(BigInt(x) << BigInt(y)));
  },
  shr(a: Variant, b: Variant): Variant {
    const [x, y] = checkShift(a, b);
    return V.int(Number(BigInt(x) >> BigInt(y)));
  },

  // ---- 其他 ----

  inOp(a: Variant, b: Variant): Variant {
    if (b.t === Tag.ARRAY) return V.bool((b.v as GArray).has(a));
    if (b.t === Tag.DICT) return V.bool((b.v as GDict).has(a));
    if (b.t === Tag.STRING && a.t === Tag.STRING) {
      return V.bool((b.v as string).includes(a.v as string));
    }
    throw new UnsupportedError("in-operands", `in 不支持 ${tagName(a.t)} in ${tagName(b.t)}`);
  },

  str(a: Variant): Variant {
    return V.str(show(a));
  },

  key(a: Variant): string {
    return keyOf(a);
  },
};

function compare(a: Variant, b: Variant): number {
  if (isNum(a) && isNum(b)) {
    const x = num(a);
    const y = num(b);
    return x === y ? 0 : x < y ? -1 : 1;
  }
  if (a.t === Tag.STRING && b.t === Tag.STRING) {
    const x = a.v as string;
    const y = b.v as string;
    return x === y ? 0 : x < y ? -1 : 1;
  }
  throw new UnsupportedError("compare-operands", `比较不支持 ${tagName(a.t)} 与 ${tagName(b.t)}`);
}

/** Godot 编译期就拒绝移位负操作数，运行时这条也得拦住 */
function checkShift(a: Variant, b: Variant): [number, number] {
  const [x, y] = intPair(a, b);
  if (x < 0 || y < 0) {
    throw new GodotRuntimeError("bit-shift-negative", "移位操作数不能为负");
  }
  return [x, y];
}

// String 相关（Tier 1 需要的部分）
export const strOps = {
  length: strLength,
  at: strAt,
  substr: strSubstr,
  format: strFormat,
  float: strFloat,
};
