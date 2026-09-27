import { GodotRuntimeError, UnsupportedError } from "./errors";
import { Tag, tagName, V, intToBig, intToNum, wrap64, type IntPayload, type Variant } from "./tags";
import { asVec2, GVector2, vecCmp } from "./vector2";
import { asVec3, GVector3, vec3Cmp } from "./vector3";
import {
  add32,
  asVec2i,
  div32,
  GVector2i,
  mod32,
  mul32,
  sub32,
  vec2iCmp,
  vec2iToFloat,
  vector2i,
} from "./vector2i";
import {
  GArray,
  GDict,
  keyOf,
  show,
  strAt,
  strCmp,
  strFloat,
  strFormat,
  strLength,
  strSubstr,
  truthyOf,
  valueEq,
} from "./values";

const isNum = (v: Variant): boolean => v.t === Tag.INT || v.t === Tag.FLOAT;
const isStringish = (v: Variant): boolean => v.t === Tag.STRING || v.t === Tag.STRING_NAME;

function num(v: Variant): number {
  if (!isNum(v)) {
    throw new UnsupportedError("not-number", `需要数值，收到 ${tagName(v.t)}`);
  }
  // int 载荷可能是 bigint（超出 2^53）：这里按 Godot 的 float 精度收成 number。
  return v.t === Tag.INT ? intToNum(v.v as IntPayload) : (v.v as number);
}

function bothInt(a: Variant, b: Variant): boolean {
  return a.t === Tag.INT && b.t === Tag.INT;
}

function intPair(a: Variant, b: Variant): [IntPayload, IntPayload] {
  if (!bothInt(a, b)) {
    throw new UnsupportedError("need-int", `需要两个 int，收到 ${tagName(a.t)} 和 ${tagName(b.t)}`);
  }
  return [a.v as IntPayload, b.v as IntPayload];
}

/** 装箱轨的 int 二元算术：一律升到 bigint、按 int64 回绕，再由 V.int 归一化载荷。 */
function i64(x: IntPayload, y: IntPayload, f: (a: bigint, b: bigint) => bigint): Variant {
  return V.int(f(intToBig(x), intToBig(y)));
}

/**
 * 动态路径的运算符分派（R4）。
 * 每条语义都能在 docs/SEMANTICS.md 里找到依据编号。
 */
export const ops = {
  add(a: Variant, b: Variant): Variant {
    if (isNum(a) && isNum(b)) {
      return bothInt(a, b) ? i64(a.v as IntPayload, b.v as IntPayload, (x, y) => x + y) : V.float(num(a) + num(b));
    }
    // String 与 StringName 混着加都走连接、结果一律是 String（实测 "x" + &"y" → xy、&"a" + &"b" → ab 且 typeof 为 4）
    if (isStringish(a) && isStringish(b)) {
      return V.str((a.v as string) + (b.v as string));
    }
    if (a.t === Tag.ARRAY && b.t === Tag.ARRAY) {
      return V.array((a.v as GArray).concat(b.v as GArray));
    }
    // Vector2 分量加（S13）
    const va = a.t === Tag.OBJECT && a.v instanceof GVector2 ? a.v : null;
    const vb = b.t === Tag.OBJECT && b.v instanceof GVector2 ? b.v : null;
    if (va && vb) return V.object(new GVector2(va.x + vb.x, va.y + vb.y));
    const wa3 = asVec3(a);
    const wb3 = asVec3(b);
    // Vector3 分量加（实测 (1,2,3)+(0.5,0,0) → (1.5, 2.0, 3.0)）；跟标量混加 Godot 是解析期报错，这里同样不接
    if (wa3 && wb3) return V.object(new GVector3(wa3.x + wb3.x, wa3.y + wb3.y, wa3.z + wb3.z));
    // Vector2i 只跟 Vector2i 加（实测 `Vector2i + Vector2`、`Vector2i + 1` 都是解析期报错），结果回绕 int32
    const ziAdd = asVec2i(a);
    const zjAdd = asVec2i(b);
    if (ziAdd && zjAdd) return vector2i(add32(ziAdd.x, zjAdd.x), add32(ziAdd.y, zjAdd.y));
    throw new UnsupportedError("add-operands", `+ 不支持 ${tagName(a.t)} + ${tagName(b.t)}`);
  },

  sub(a: Variant, b: Variant): Variant {
    // Vector2 相减（实测 Vector2(1,2)-Vector2(3,4) → (-2.0, -2.0)）
    const va = asVec2(a);
    const vb = asVec2(b);
    if (va && vb) return V.object(new GVector2(va.x - vb.x, va.y - vb.y));
    const wa3 = asVec3(a);
    const wb3 = asVec3(b);
    if (wa3 && wb3) return V.object(new GVector3(wa3.x - wb3.x, wa3.y - wb3.y, wa3.z - wb3.z));
    const ziSub = asVec2i(a);
    const zjSub = asVec2i(b);
    if (ziSub && zjSub) return vector2i(sub32(ziSub.x, zjSub.x), sub32(ziSub.y, zjSub.y));
    if (!isNum(a) || !isNum(b)) {
      throw new UnsupportedError("sub-operands", `- 不支持 ${tagName(a.t)} - ${tagName(b.t)}`);
    }
    return bothInt(a, b) ? i64(a.v as IntPayload, b.v as IntPayload, (x, y) => x - y) : V.float(num(a) - num(b));
  },

  mul(a: Variant, b: Variant): Variant {
    // Vector2 * 标量 / 标量 * Vector2（实测 Vector2(1e15,1)*2 → (1999999973982208.0, 2.0)）
    const va = asVec2(a);
    const vb = asVec2(b);
    // Vector2 * Vector2 是**逐分量**（实测 (3,4)*(-1,2) → (-3.0, 8.0)，不是点积）
    if (va && vb) return V.object(new GVector2(va.x * vb.x, va.y * vb.y));
    if (va && isNum(b)) return V.object(new GVector2(va.x * num(b), va.y * num(b)));
    if (vb && isNum(a)) return V.object(new GVector2(vb.x * num(a), vb.y * num(a)));
    const wa3 = asVec3(a);
    const wb3 = asVec3(b);
    // 实测逐分量：(2,3,4)*(0.5,1,2) → (1.0, 3.0, 8.0)；标量：(1,2,3)*2.5 → (2.5, 5.0, 7.5)
    if (wa3 && wb3) return V.object(new GVector3(wa3.x * wb3.x, wa3.y * wb3.y, wa3.z * wb3.z));
    if (wa3 && isNum(b)) return V.object(new GVector3(wa3.x * num(b), wa3.y * num(b), wa3.z * num(b)));
    if (wb3 && isNum(a)) return V.object(new GVector3(wb3.x * num(a), wb3.y * num(a), wb3.z * num(a)));
    // 逐分量；标量是 float 时实测**升级成 Vector2**（(6,6)*0.5 → (3.0, 3.0)、(6,6)/4.0 → (1.5, 1.5)）
    const ziMul = asVec2i(a);
    const zjMul = asVec2i(b);
    if (ziMul && zjMul) return vector2i(mul32(ziMul.x, zjMul.x), mul32(ziMul.y, zjMul.y));
    if (ziMul && b.t === Tag.FLOAT) return vec2iToFloat(ziMul, num(b), "mul");
    if (zjMul && a.t === Tag.FLOAT) return vec2iToFloat(zjMul, num(a), "mul");
    if (ziMul && isNum(b)) return vector2i(mul32(ziMul.x, intToNum(b.v as IntPayload)), mul32(ziMul.y, intToNum(b.v as IntPayload)));
    if (zjMul && isNum(a)) return vector2i(mul32(zjMul.x, intToNum(a.v as IntPayload)), mul32(zjMul.y, intToNum(a.v as IntPayload)));
    if (!isNum(a) || !isNum(b)) {
      throw new UnsupportedError("mul-operands", `* 不支持 ${tagName(a.t)} * ${tagName(b.t)}`);
    }
    return bothInt(a, b) ? i64(a.v as IntPayload, b.v as IntPayload, (x, y) => x * y) : V.float(num(a) * num(b));
  },

  /** 两个 int 才走整数除法（向零截断），否则浮点（S1 / S2） */
  div(a: Variant, b: Variant): Variant {
    // Vector2 / 标量（实测 Vector2(1e15,4)/2 → (499999993495552.0, 2.0)）
    const va = asVec2(a);
    const vb = asVec2(b);
    // Vector2 / Vector2 也是逐分量，且**不拦除零**（实测 Vector2(1,1)/Vector2(0,0) → (inf, inf)）
    if (va && vb) return V.object(new GVector2(va.x / vb.x, va.y / vb.y));
    if (va && isNum(b)) return V.object(new GVector2(va.x / num(b), va.y / num(b)));
    const wa3 = asVec3(a);
    const wb3 = asVec3(b);
    if (wa3 && wb3) return V.object(new GVector3(wa3.x / wb3.x, wa3.y / wb3.y, wa3.z / wb3.z));
    if (wa3 && isNum(b)) return V.object(new GVector3(wa3.x / num(b), wa3.y / num(b), wa3.z / num(b)));
    const ziDiv = asVec2i(a);
    const zjDiv = asVec2i(b);
    if (ziDiv && zjDiv) return vector2i(div32(ziDiv.x, zjDiv.x), div32(ziDiv.y, zjDiv.y));
    if (ziDiv && b.t === Tag.FLOAT) return vec2iToFloat(ziDiv, num(b), "div");
    if (ziDiv && isNum(b)) {
      const k = intToNum(b.v as IntPayload);
      return vector2i(div32(ziDiv.x, k), div32(ziDiv.y, k));
    }
    if (!isNum(a) || !isNum(b)) {
      throw new UnsupportedError("div-operands", `/ 不支持 ${tagName(a.t)} / ${tagName(b.t)}`);
    }
    if (bothInt(a, b)) {
      const [x, y] = intPair(a, b);
      // 注意：零判定必须转 bigint 再比 —— `0n === 0` 是 false，漏转会把除零放过去。
      if (intToBig(y) === 0n) {
        throw new GodotRuntimeError("int-div-zero", "整数除零（Godot 会直接崩进程，S27）");
      }
      // BigInt 的 / 本就向零截断（S1/S2）。
      return i64(x, y, (p, q) => p / q);
    }
    return V.float(num(a) / num(b));
  },

  /** 取模只对 int 合法，符号跟被除数（S3） */
  mod(a: Variant, b: Variant): Variant {
    // Vector2i 的 % 逐分量、符号跟被除数（实测 (-7,7) % (2,-2) → (-1, 1)、(7,7) % 2 → (1, 1)），除零文本另有一套
    const ziMod = asVec2i(a);
    const zjMod = asVec2i(b);
    if (ziMod && zjMod) return vector2i(mod32(ziMod.x, zjMod.x), mod32(ziMod.y, zjMod.y));
    if (ziMod && isNum(b)) {
      const k = intToNum(b.v as IntPayload);
      return vector2i(mod32(ziMod.x, k), mod32(ziMod.y, k));
    }
    const [x, y] = intPair(a, b);
    if (intToBig(y) === 0n) {
      throw new GodotRuntimeError("int-mod-zero", "整数取模零");
    }
    // BigInt 的 % 符号跟被除数，与 S3 一致。
    return i64(x, y, (p, q) => p % q);
  },

  /** 结合性由 emitter 加括号保证（S4） */
  pow(a: Variant, b: Variant): Variant {
    if (!isNum(a) || !isNum(b)) {
      throw new UnsupportedError("pow-operands", `** 不支持 ${tagName(a.t)} ** ${tagName(b.t)}`);
    }
    if (bothInt(a, b)) {
      const [x, y] = intPair(a, b);
      const e = intToBig(y);
      if (e < 0n) {
        throw new UnsupportedError("int-pow-negative", "负整数次幂（未补测）");
      }
      return V.int(bigPow(intToBig(x), e));
    }
    const [x, yy] = [num(a), num(b)];
    return V.float(Math.pow(x, yy));
  },

  neg(a: Variant): Variant {
    // 实测 -Vector2(1.5, 2) → (-1.5, -2.0)
    const va = asVec2(a);
    if (va) return V.object(new GVector2(-va.x, -va.y));
    const wa3 = asVec3(a);
    if (wa3) return V.object(new GVector3(-wa3.x, -wa3.y, -wa3.z));
    const ziNeg = asVec2i(a);
    // 实测 -Vector2i.MIN 还是 -2147483648（回绕），不是正数
    if (ziNeg) return vector2i(sub32(0, ziNeg.x), sub32(0, ziNeg.y));
    if (!isNum(a)) {
      throw new UnsupportedError("neg-operands", `- 不支持 ${tagName(a.t)}`);
    }
    return a.t === Tag.INT ? V.int(-intToBig(a.v as IntPayload)) : V.float(-(a.v as number));
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

  // ---- 位运算：全程 bigint，int64 语义由 wrap64 保证（不再 Number() 来回，那正是 1<<62 失精的地方）----

  band(a: Variant, b: Variant): Variant {
    const [x, y] = intPair(a, b);
    return i64(x, y, (p, q) => p & q);
  },
  bor(a: Variant, b: Variant): Variant {
    const [x, y] = intPair(a, b);
    return i64(x, y, (p, q) => p | q);
  },
  bxor(a: Variant, b: Variant): Variant {
    const [x, y] = intPair(a, b);
    return i64(x, y, (p, q) => p ^ q);
  },
  bnot(a: Variant): Variant {
    if (a.t !== Tag.INT) {
      throw new UnsupportedError("need-int", `~ 需要 int，收到 ${tagName(a.t)}`);
    }
    return V.int(~intToBig(a.v as IntPayload));
  },
  shl(a: Variant, b: Variant): Variant {
    const [x, y] = checkShift(a, b);
    return V.int(intToBig(x) << intToBig(y));
  },
  shr(a: Variant, b: Variant): Variant {
    const [x, y] = checkShift(a, b);
    return V.int(intToBig(x) >> intToBig(y));
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
    // 两个 int 必须按 bigint 比：收成 number 会把 2^62 与 2^62+1 折成同一个 double，
    // 于是 `<` 静默判成 false（055 实测抓到）。掺 float 时才按 Godot 的 double 语义收成 number。
    if (a.t === Tag.INT && b.t === Tag.INT) {
      const x = intToBig(a.v as IntPayload);
      const y = intToBig(b.v as IntPayload);
      return x === y ? 0 : x < y ? -1 : 1;
    }
    const x = num(a);
    const y = num(b);
    return x === y ? 0 : x < y ? -1 : 1;
  }
  if (a.t === Tag.STRING && b.t === Tag.STRING) {
    // 按码点比（JS 原生的 < 按 UTF-16 码元，含 emoji 时会与 Godot 判出相反方向）
    return strCmp(a.v as string, b.v as string);
  }
  // 掺进 StringName 就没有可复刻的排序口径（实测，见 SEMANTICS「StringName」）：
  // 混族比较 Godot 当场炸（Invalid operands 'StringName' and 'String' in operator '<'），
  // 同族比较又不按内容排（&"zzz" < &"abc" 为真）、不按 .hash()、不按字面量出现顺序 ——
  // 是引擎内部的指针/桶位序，随版本和内部表大小变。宁缺不猜。
  if (isStringish(a) && isStringish(b)) {
    throw new UnsupportedError(
      "compare-string-name",
      `StringName 的 < / > 按 Godot 内部指针序，无可靠口径（实测 &"zzz" < &"abc" 为真），拒绝${tagName(a.t)} 与 ${tagName(b.t)} 比大小`,
    );
  }
  // Vector2 比较是**字典序**（先 x 再 y），不是"每个分量都更大"。判别点实测：
  // (3,4) > (2,5) → true（x 已胜出，y 更小也不影响）、(3,4) < (4,3) → true。
  const va = asVec2(a);
  const vb = asVec2(b);
  if (va && vb) return vecCmp(va, vb);
  // Vector3 也是字典序，只是多一个 z（实测 (1,3,0)<(2,0,0) 真、(0,1,9)<(0,2,0) 真）
  const wa3 = asVec3(a);
  const wb3 = asVec3(b);
  if (wa3 && wb3) return vec3Cmp(wa3, wb3);
  const ziCmp = asVec2i(a);
  const zjCmp = asVec2i(b);
  if (ziCmp && zjCmp) return vec2iCmp(ziCmp, zjCmp);
  throw new UnsupportedError("compare-operands", `比较不支持 ${tagName(a.t)} 与 ${tagName(b.t)}`);
}

/**
 * `a` 严格小于 `b`？与 `<`、`Array.sort()`、`bsearch`、`min`/`max` 同一个口径，
 * 免得两套实现分叉（比较不支持的类型照样响亮抛）。
 */
export function isLess(a: Variant, b: Variant): boolean {
  return compare(a, b) < 0;
}

/** 二进制快速幂，每步都回绕到 int64（等价于 Godot 的 64 位溢出行为）。 */
function bigPow(base0: bigint, exp0: bigint): bigint {
  let r = 1n;
  let base = wrap64(base0);
  let e = exp0;
  while (e > 0n) {
    if (e & 1n) r = wrap64(r * base);
    base = wrap64(base * base);
    e >>= 1n;
  }
  return wrap64(r);
}

/** Godot 编译期就拒绝移位负操作数，运行时这条也得拦住 */
function checkShift(a: Variant, b: Variant): [IntPayload, IntPayload] {
  const [x, y] = intPair(a, b);
  if (intToBig(x) < 0n || intToBig(y) < 0n) {
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
