import { GodotRuntimeError, UnsupportedError } from "./errors";
import { Tag, tagName, V, intToBig, intToNum, wrap64, type IntPayload, type Variant } from "./tags";
import { asVec2, GVector2, vecCmp } from "./vector2";
import { asVec3, GVector3, vec3Cmp } from "./vector3";
import { asColor, color, colorCmp, GColor } from "./color";
import { bytesConcat, GBytes } from "./packed";
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
  asVec3i,
  v3iAdd,
  v3iDiv,
  v3iDivK,
  v3iMod,
  v3iModK,
  v3iMul,
  v3iMulK,
  v3iNeg,
  v3iSub,
  vec3iCmp,
  vec3iToFloat,
} from "./vector3i";
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
    // pack 的 `+`（拼接）：不落地 `GBytes | null` 的局部（那一体格子要把类实例表示成 checked-dynamic 属性，
    // 而 `GBytes.items` 是含 bigint 与类实例的联合数组、没有静态表示，静态 exe 一跑就拒），
    // 所以 `instanceof` 直接写在条件里、进格后把收窄的 `a.v` / `b.v` 交出去。
    if (a.t === Tag.OBJECT && b.t === Tag.OBJECT && a.v instanceof GBytes && b.v instanceof GBytes) {
      return bytesConcat(a.v, b.v);
    }
    if (isNum(a) && isNum(b)) {
      return bothInt(a, b) ? i64(a.v as IntPayload, b.v as IntPayload, (x, y) => x + y) : V.float(num(a) + num(b));
    }
    if (isStringish(a) && isStringish(b)) {
      return V.str((a.v as string) + (b.v as string));
    }
    if (a.t === Tag.ARRAY && b.t === Tag.ARRAY) {
      return V.array((a.v as GArray).concat(b.v as GArray));
    }
    const va = a.t === Tag.OBJECT && a.v instanceof GVector2 ? a.v : null;
    const vb = b.t === Tag.OBJECT && b.v instanceof GVector2 ? b.v : null;
    if (va && vb) return V.object(new GVector2(va.x + vb.x, va.y + vb.y));
    const wa3 = asVec3(a);
    const wb3 = asVec3(b);
    if (wa3 && wb3) return V.object(new GVector3(wa3.x + wb3.x, wa3.y + wb3.y, wa3.z + wb3.z));
    const ziAdd = asVec2i(a);
    const zjAdd = asVec2i(b);
    if (ziAdd && zjAdd) return vector2i(add32(ziAdd.x, zjAdd.x), add32(ziAdd.y, zjAdd.y));
    const zi3Add = asVec3i(a);
    const zj3Add = asVec3i(b);
    if (zi3Add && zj3Add) return v3iAdd(zi3Add, zj3Add);
    const caAdd = asColor(a);
    const cbAdd = asColor(b);
    if (caAdd && cbAdd)
      return color(caAdd.r + cbAdd.r, caAdd.g + cbAdd.g, caAdd.b + cbAdd.b, caAdd.a + cbAdd.a);
    throw new UnsupportedError("add-operands", `+ 不支持 ${tagName(a.t)} + ${tagName(b.t)}`);
  },

  sub(a: Variant, b: Variant): Variant {
    const va = asVec2(a);
    const vb = asVec2(b);
    if (va && vb) return V.object(new GVector2(va.x - vb.x, va.y - vb.y));
    const wa3 = asVec3(a);
    const wb3 = asVec3(b);
    if (wa3 && wb3) return V.object(new GVector3(wa3.x - wb3.x, wa3.y - wb3.y, wa3.z - wb3.z));
    const ziSub = asVec2i(a);
    const zjSub = asVec2i(b);
    if (ziSub && zjSub) return vector2i(sub32(ziSub.x, zjSub.x), sub32(ziSub.y, zjSub.y));
    const zi3Sub = asVec3i(a);
    const zj3Sub = asVec3i(b);
    if (zi3Sub && zj3Sub) return v3iSub(zi3Sub, zj3Sub);
    const caSub = asColor(a);
    const cbSub = asColor(b);
    if (caSub && cbSub)
      return color(caSub.r - cbSub.r, caSub.g - cbSub.g, caSub.b - cbSub.b, caSub.a - cbSub.a);
    if (!isNum(a) || !isNum(b)) {
      throw new UnsupportedError("sub-operands", `- 不支持 ${tagName(a.t)} - ${tagName(b.t)}`);
    }
    return bothInt(a, b) ? i64(a.v as IntPayload, b.v as IntPayload, (x, y) => x - y) : V.float(num(a) - num(b));
  },

  mul(a: Variant, b: Variant): Variant {
    const va = asVec2(a);
    const vb = asVec2(b);
    if (va && vb) return V.object(new GVector2(va.x * vb.x, va.y * vb.y));
    if (va && isNum(b)) return V.object(new GVector2(va.x * num(b), va.y * num(b)));
    if (vb && isNum(a)) return V.object(new GVector2(vb.x * num(a), vb.y * num(a)));
    const wa3 = asVec3(a);
    const wb3 = asVec3(b);
    if (wa3 && wb3) return V.object(new GVector3(wa3.x * wb3.x, wa3.y * wb3.y, wa3.z * wb3.z));
    if (wa3 && isNum(b)) return V.object(new GVector3(wa3.x * num(b), wa3.y * num(b), wa3.z * num(b)));
    if (wb3 && isNum(a)) return V.object(new GVector3(wb3.x * num(a), wb3.y * num(a), wb3.z * num(a)));
    const ziMul = asVec2i(a);
    const zjMul = asVec2i(b);
    if (ziMul && zjMul) return vector2i(mul32(ziMul.x, zjMul.x), mul32(ziMul.y, zjMul.y));
    if (ziMul && b.t === Tag.FLOAT) return vec2iToFloat(ziMul, num(b), "mul");
    if (zjMul && a.t === Tag.FLOAT) return vec2iToFloat(zjMul, num(a), "mul");
    if (ziMul && isNum(b)) return vector2i(mul32(ziMul.x, intToNum(b.v as IntPayload)), mul32(ziMul.y, intToNum(b.v as IntPayload)));
    if (zjMul && isNum(a)) return vector2i(mul32(zjMul.x, intToNum(a.v as IntPayload)), mul32(zjMul.y, intToNum(a.v as IntPayload)));
    // Vector3i 与标量：`tmp/f67 t03` 量了 int 的两侧与向量的逐分量除/模，`tmp/f70 p21`/`p22` 量了
    // **右边放 float** —— 那时升级成 Vector3（与 Vector2i 同形）。左边的 `2.0 * Vector3i` 与
    // `4 / Vector3i` 都没量到（`p23` 只量到后者是解析期拒），所以左侧只接 int。
    const zi3Mul = asVec3i(a);
    const zj3Mul = asVec3i(b);
    if (zi3Mul && zj3Mul) return v3iMul(zi3Mul, zj3Mul);
    if (zi3Mul && b.t === Tag.FLOAT) return vec3iToFloat(zi3Mul, num(b), "mul");
    if (zi3Mul && b.t === Tag.INT) return v3iMulK(zi3Mul, intToNum(b.v as IntPayload));
    if (zj3Mul && a.t === Tag.INT) return v3iMulK(zj3Mul, intToNum(a.v as IntPayload));
    if (zj3Mul && a.t === Tag.INT) return v3iMulK(zj3Mul, intToNum(a.v as IntPayload));
    const caMul = asColor(a);
    const cbMul = asColor(b);
    if (caMul && cbMul)
      return color(caMul.r * cbMul.r, caMul.g * cbMul.g, caMul.b * cbMul.b, caMul.a * cbMul.a);
    if (caMul && isNum(b))
      return color(caMul.r * num(b), caMul.g * num(b), caMul.b * num(b), caMul.a * num(b));
    if (cbMul && isNum(a))
      return color(cbMul.r * num(a), cbMul.g * num(a), cbMul.b * num(a), cbMul.a * num(a));
    if (!isNum(a) || !isNum(b)) {
      throw new UnsupportedError("mul-operands", `* 不支持 ${tagName(a.t)} * ${tagName(b.t)}`);
    }
    return bothInt(a, b) ? i64(a.v as IntPayload, b.v as IntPayload, (x, y) => x * y) : V.float(num(a) * num(b));
  },

  div(a: Variant, b: Variant): Variant {
    const va = asVec2(a);
    const vb = asVec2(b);
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
    // Vector3i 的除/取模：向量对向量与**右边 int 标量**（`tmp/f67 t03` 的 a/b、a%b、a/2、a%-2），
    // 除零走 div32/mod32 那两句实测文本（`tmp/f67 t14`/`t15`）。
    // 掺 float 的 `/ 4.0` 没量到（`tmp/f69 t82` 只量到 `% 4.0` 是解析期拒），所以不升也不截，落到下面的报缺。
    const zi3Div = asVec3i(a);
    const zj3Div = asVec3i(b);
    if (zi3Div && zj3Div) return v3iDiv(zi3Div, zj3Div);
    if (zi3Div && b.t === Tag.FLOAT) return vec3iToFloat(zi3Div, num(b), "div");
    if (zi3Div && b.t === Tag.INT) return v3iDivK(zi3Div, intToNum(b.v as IntPayload));
    if (zj3Div) {
      throw new UnsupportedError("div-operands", `/ 不支持 ${tagName(a.t)} / Vector3i（左边放标量实测是解析期拒，p23）`);
    }
    const caDiv = asColor(a);
    const cbDiv = asColor(b);
    if (caDiv && cbDiv)
      return color(caDiv.r / cbDiv.r, caDiv.g / cbDiv.g, caDiv.b / cbDiv.b, caDiv.a / cbDiv.a);
    if (caDiv && isNum(b)) return color(caDiv.r / num(b), caDiv.g / num(b), caDiv.b / num(b), caDiv.a / num(b));
    if (cbDiv && isNum(a)) return color(cbDiv.r / num(a), cbDiv.g / num(a), cbDiv.b / num(a), cbDiv.a / num(a));
    if (!isNum(a) || !isNum(b)) {
      throw new UnsupportedError("div-operands", `/ 不支持 ${tagName(a.t)} / ${tagName(b.t)}`);
    }
    if (bothInt(a, b)) {
      const [x, y] = intPair(a, b);
      if (intToBig(y) === 0n) {
        throw new GodotRuntimeError("int-div-zero", "整数除零（Godot 会直接崩进程，S27）");
      }
      return i64(x, y, (p, q) => p / q);
    }
    return V.float(num(a) / num(b));
  },

  mod(a: Variant, b: Variant): Variant {
    const ziMod = asVec2i(a);
    const zjMod = asVec2i(b);
    if (ziMod && zjMod) return vector2i(mod32(ziMod.x, zjMod.x), mod32(ziMod.y, zjMod.y));
    if (ziMod && isNum(b)) {
      const k = intToNum(b.v as IntPayload);
      return vector2i(mod32(ziMod.x, k), mod32(ziMod.y, k));
    }
    const zi3Mod = asVec3i(a);
    const zj3Mod = asVec3i(b);
    if (zi3Mod && zj3Mod) return v3iMod(zi3Mod, zj3Mod);
    if (zi3Mod && b.t === Tag.INT) return v3iModK(zi3Mod, intToNum(b.v as IntPayload));
    const [x, y] = intPair(a, b);
    if (intToBig(y) === 0n) {
      throw new GodotRuntimeError("int-mod-zero", "整数取模零");
    }
    return i64(x, y, (p, q) => p % q);
  },

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
    const va = asVec2(a);
    if (va) return V.object(new GVector2(-va.x, -va.y));
    const wa3 = asVec3(a);
    if (wa3) return V.object(new GVector3(-wa3.x, -wa3.y, -wa3.z));
    const ziNeg = asVec2i(a);
    if (ziNeg) return vector2i(sub32(0, ziNeg.x), sub32(0, ziNeg.y));
    const zi3Neg = asVec3i(a);
    if (zi3Neg) return v3iNeg(zi3Neg);
    const caNeg = asColor(a);
    if (caNeg) return color(1 - caNeg.r, 1 - caNeg.g, 1 - caNeg.b, caNeg.a);
    if (!isNum(a)) {
      throw new UnsupportedError("neg-operands", `- 不支持 ${tagName(a.t)}`);
    }
    return a.t === Tag.INT ? V.int(-intToBig(a.v as IntPayload)) : V.float(-(a.v as number));
  },

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

  truthy(a: Variant): boolean {
    return truthyOf(a);
  },

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
    return strCmp(a.v as string, b.v as string);
  }
  if (isStringish(a) && isStringish(b)) {
    throw new UnsupportedError(
      "compare-string-name",
      `StringName 的 < / > 按 Godot 内部指针序，无可靠口径（实测 &"zzz" < &"abc" 为真），拒绝${tagName(a.t)} 与 ${tagName(b.t)} 比大小`,
    );
  }
  const va = asVec2(a);
  const vb = asVec2(b);
  if (va && vb) return vecCmp(va, vb);
  const wa3 = asVec3(a);
  const wb3 = asVec3(b);
  if (wa3 && wb3) return vec3Cmp(wa3, wb3);
  if (asColor(a) !== null || asColor(b) !== null) colorCmp();
  const ziCmp = asVec2i(a);
  const zjCmp = asVec2i(b);
  if (ziCmp && zjCmp) return vec2iCmp(ziCmp, zjCmp);
  const zi3Cmp = asVec3i(a);
  const zj3Cmp = asVec3i(b);
  if (zi3Cmp && zj3Cmp) return vec3iCmp(zi3Cmp, zj3Cmp);
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
// bigint 的一切比较与复合赋值在静态编译目标上都没有 lowering（实测 scriptc SC1043：
// 「comparing non-number, non-string values」，`e > 0n`、`if (e & 1n)`、`e >>= 1n` 三形一起拒），
// 而 `DataView` 的 bigint 读写都有 —— 拆成「带符号高 32 位 + 无符号低 32 位」按 number 判。
// 赋值式的 `e = e >> 1n` 是可编的，被拒的只有复合形式 `>>=`。
const BIG_SCRATCH = new DataView(new ArrayBuffer(8));

function bigWords(v: bigint): [number, number] {
  BIG_SCRATCH.setBigInt64(0, v);
  return [BIG_SCRATCH.getInt32(0), BIG_SCRATCH.getUint32(4)];
}

/** 严格大于 0：高字不带符号，且不是全零。 */
function bigPositive(v: bigint): boolean {
  const w = bigWords(v);
  const hi = w[0] as number;
  if (hi < 0) return false;
  return hi > 0 || (w[1] as number) > 0;
}

/** 最低位是不是 1（`v & 1n` 的等价判）。 */
function bigOdd(v: bigint): boolean {
  return ((bigWords(v)[1] as number) & 1) === 1;
}

function bigPow(base0: bigint, exp0: bigint): bigint {
  let r = 1n;
  let base = wrap64(base0);
  let e = exp0;
  while (bigPositive(e)) {
    if (bigOdd(e)) r = wrap64(r * base);
    base = wrap64(base * base);
    e = e >> 1n;
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
