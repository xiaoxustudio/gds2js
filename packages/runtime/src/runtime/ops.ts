import { GodotRuntimeError, UnsupportedError } from "./errors";
import { registerRecvEqHook } from "./callable";
import { Tag, tagName, V, intToBig, intToNum, wrap64, type IntPayload, type Variant } from "./tags";
import { asRid } from "./rid";
import { asNodePath } from "./node-path";
import { asVec2, GVector2, vecCmp } from "./vector2";
import { asVec3, GVector3, vec3Cmp } from "./vector3";
import { asColor, color, GColor } from "./color";
import { bytesConcat, GBytes } from "./packed";
import { INT64_MIN, TWO_63 } from "./numstr";
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
  valueTypeName,
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

/** 只有 int 才吃的运算符；不合式时给的是 Godot 运行期那一句（与 `==` 那一格同一模板）。 */
function intPair(a: Variant, b: Variant, op: string): [IntPayload, IntPayload] {
  if (!bothInt(a, b)) {
    throw new GodotRuntimeError("int-operands", `Invalid operands '${valueTypeName(a)}' and '${valueTypeName(b)}' in operator '${op}'.`);
  }
  return [a.v as IntPayload, b.v as IntPayload];
}

/** 量过的六型（S399 那张 468 格矩阵就摆这六型）：拒的那 329 对引擎讲的是运行期那一句，没量过的型仍走响亮拒。 */
const MEASURED_SIX = new Set<number>([Tag.BOOL, Tag.INT, Tag.FLOAT, Tag.STRING, Tag.ARRAY, Tag.DICT]);

function operandsRefused(a: Variant, b: Variant, op: string, code: string): Variant {  if (MEASURED_SIX.has(a.t) && MEASURED_SIX.has(b.t)) {
    throw new GodotRuntimeError(code, `Invalid operands '${valueTypeName(a)}' and '${valueTypeName(b)}' in operator '${op}'.`);
  }
  throw new UnsupportedError(code, `${op} 不支持 ${tagName(a.t)} ${op} ${tagName(b.t)}`);
}

/** `==` / `!=` 的两支型不同时引擎讲的是运行期那一句（S399 那 36 格里只有 int 与 float 互相能比，其余 28 对全拒）；六型之外照旧走原路。 */
function eqSixRefused(a: Variant, b: Variant, op: "==" | "!="): void {
  if (a.t === b.t) return;
  if (!MEASURED_SIX.has(a.t) || !MEASURED_SIX.has(b.t)) return;
  const num = (t: number): boolean => t === Tag.INT || t === Tag.FLOAT;
  if (num(a.t) && num(b.t)) return;
  throw new GodotRuntimeError("eq-operands", `Invalid operands '${valueTypeName(a)}' and '${valueTypeName(b)}' in operator '${op}'.`);
}

/** 装箱轨的 int 二元算术：一律升到 bigint、按 int64 回绕，再由 V.int 归一化载荷。 */function i64(x: IntPayload, y: IntPayload, f: (a: bigint, b: bigint) => bigint): Variant {
  return V.int(f(intToBig(x), intToBig(y)));
}

/** 动态路径的运算符分派。 */
export const ops = {
  add(a: Variant, b: Variant): Variant {
    // pack 的 `+`（拼接）：`instanceof` 直接写在条件里，不落地 `GBytes | null` 的可空局部。
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
    // 实测 NodePath 的 `+` 两个来源都是运行期那一句（与 NodePath 与与 String 各一格）
    if (asNodePath(a) !== null || asNodePath(b) !== null) {
      throw new GodotRuntimeError("add-operands", `Invalid operands '${valueTypeName(a)}' and '${valueTypeName(b)}' in operator '+'.`);
    }
    return operandsRefused(a, b, "+", "add-operands");
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
    if (asNodePath(a) !== null || asNodePath(b) !== null) {
      throw new GodotRuntimeError("sub-operands", `Invalid operands '${valueTypeName(a)}' and '${valueTypeName(b)}' in operator '-'.`);
    }
    if (!isNum(a) || !isNum(b)) {
      return operandsRefused(a, b, "-", "sub-operands");
    }
    return bothInt(a, b) ? i64(a.v as IntPayload, b.v as IntPayload, (x, y) => x - y) : V.float(num(a) - num(b));
  },

  mul(a: Variant, b: Variant): Variant {
    // 数值先短路：下面那串向量/颜色探针都要求 Tag.OBJECT，两个数值跑完它们必然全落空（node 侧量不出差别，AOT 侧是热路径）。
    if (isNum(a) && isNum(b)) {
      return bothInt(a, b) ? i64(a.v as IntPayload, b.v as IntPayload, (x, y) => x * y) : V.float(num(a) * num(b));
    }
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
    // Vector3i 与标量：右边放 float 时升级成 Vector3（与 Vector2i 同形），左边只接 int 标量。
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
    return operandsRefused(a, b, "*", "mul-operands");
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
    // Vector3i 的除 / 取模：向量对向量与右边 int 标量，除零走 div32 / mod32 那两句报错文本。
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
      return operandsRefused(a, b, "/", "div-operands");
    }
    if (bothInt(a, b)) {
      const [x, y] = intPair(a, b, "/");
      if (intToBig(y) === 0n) {
        throw new GodotRuntimeError("int-div-zero", "整数除零（Godot 会直接崩进程）");
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
    const [x, y] = intPair(a, b, "%");
    if (intToBig(y) === 0n) {
      throw new GodotRuntimeError("int-mod-zero", "整数取模零");
    }
    return i64(x, y, (p, q) => p % q);
  },

  pow(a: Variant, b: Variant): Variant {
    if (!isNum(a) || !isNum(b)) {
      return operandsRefused(a, b, "**", "pow-operands");
    }
    if (bothInt(a, b)) {
      const [x, y] = intPair(a, b, "**");
      const e = intToBig(y);
      if (e < 0n) {
        const p = Math.pow(intToNum(x), Number(e));
        if (!Number.isFinite(p) || Math.abs(p) >= TWO_63) return V.int(INT64_MIN);
        return V.int(Math.trunc(p));
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
      if (MEASURED_SIX.has(a.t)) {
        throw new GodotRuntimeError("neg-operands", `Invalid operands '${valueTypeName(a)}' and 'Nil' in operator 'unary-'.`);
      }
      throw new UnsupportedError("neg-operands", `- 不支持 ${tagName(a.t)}`);
    }
    return a.t === Tag.INT ? V.int(-intToBig(a.v as IntPayload)) : V.float(-(a.v as number));
  },

  /** 一元 `+`：实测只有 int 与 float 走得通，其余六型给运行期那一句（第二格引擎写的是 `Nil`，S400）。 */
  pos(a: Variant): Variant {
    if (isNum(a)) return a;
    if (MEASURED_SIX.has(a.t)) {
      throw new GodotRuntimeError("pos-operands", `Invalid operands '${valueTypeName(a)}' and 'Nil' in operator 'unary+'.`);
    }
    throw new UnsupportedError("pos-operands", `+ 不支持 ${tagName(a.t)}`);
  },

  eq(a: Variant, b: Variant): Variant {
    eqSixRefused(a, b, "==");
    return V.bool(valueEq(a, b));
  },
  neq(a: Variant, b: Variant): Variant {
    eqSixRefused(a, b, "!=");
    return V.bool(!valueEq(a, b, 0, "!="));
  },
  lt(a: Variant, b: Variant): Variant {
    return V.bool(compare(a, b, "<") < 0);
  },
  lte(a: Variant, b: Variant): Variant {
    return V.bool(compare(a, b, "<=") <= 0);
  },
  gt(a: Variant, b: Variant): Variant {
    return V.bool(compare(a, b, ">") > 0);
  },
  gte(a: Variant, b: Variant): Variant {
    return V.bool(compare(a, b, ">=") >= 0);
  },

  truthy(a: Variant): boolean {
    return truthyOf(a);
  },

  band(a: Variant, b: Variant): Variant {
    const [x, y] = intPair(a, b, "&");
    return i64(x, y, (p, q) => p & q);
  },
  bor(a: Variant, b: Variant): Variant {
    const [x, y] = intPair(a, b, "|");
    return i64(x, y, (p, q) => p | q);
  },
  bxor(a: Variant, b: Variant): Variant {
    const [x, y] = intPair(a, b, "^");
    return i64(x, y, (p, q) => p ^ q);
  },
  bnot(a: Variant): Variant {
    if (a.t !== Tag.INT) {
      if (MEASURED_SIX.has(a.t)) {
        throw new GodotRuntimeError("need-int", `Invalid operands '${valueTypeName(a)}' and 'Nil' in operator '~'.`);
      }
      throw new UnsupportedError("need-int", `~ 需要 int，收到 ${tagName(a.t)}`);
    }
    return V.int(~intToBig(a.v as IntPayload));
  },
  shl(a: Variant, b: Variant): Variant {
    const [x, y] = checkShift(a, b, "<<");
    return V.int(intToBig(x) << intToBig(y));
  },
  shr(a: Variant, b: Variant): Variant {
    const [x, y] = checkShift(a, b, ">>");
    return V.int(intToBig(x) >> intToBig(y));
  },

  inOp(a: Variant, b: Variant): Variant {
    if (b.t === Tag.ARRAY) return V.bool((b.v as GArray).has(a));
    if (b.t === Tag.DICT) return V.bool((b.v as GDict).has(a));
    if (b.t === Tag.STRING && a.t === Tag.STRING) {
      return V.bool((b.v as string).includes(a.v as string));
    }
    return operandsRefused(a, b, "in", "in-operands");
  },

  str(a: Variant): Variant {
    return V.str(show(a));
  },

  key(a: Variant): string {
    return keyOf(a);
  },
};

function compare(a: Variant, b: Variant, op = "<"): number {
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
  if (a.t === Tag.BOOL && b.t === Tag.BOOL) {
    // 装箱 bool 对 bool：`<` / `>` 在运行时**合式**（false 在前 —— `[false, true].bsearch(true)` 给 1、`min()` 给 false，读数
    // `tmp/probe-argtype/boolfamily.txt`），但 `<=` / `>=` 引擎当场拒，句子是标准那条 —— 源里写成静态已知的 bool 时更早，
    // 是解析期两句（§6 第 56 条），那一层在 analyze 那边。
    if (op === "<=" || op === ">=") {
      throw new GodotRuntimeError("compare-operands", `Invalid operands 'bool' and 'bool' in operator '${op}'.`);
    }
    return a.v === b.v ? 0 : (a.v as boolean) ? 1 : -1;
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
  // RID 按号比大小，比的是**无符号**号：实测 rid_from_int64(-1) < rid_from_int64(0) 假、反向真（-1 折成 2^64-1 是最大的那个）
  const ra = asRid(a);
  const rb = asRid(b);
  if (ra !== null && rb !== null) {
    const rx = BigInt.asUintN(64, intToBig(ra.id));
    const ry = BigInt.asUintN(64, intToBig(rb.id));
    return rx === ry ? 0 : rx < ry ? -1 : 1;
  }
  // 只有一边是 RID 就是运行期那一句：四个运算符各量过一格（与 int 的 < / <= / > / >=，外加与 String 的 <）
  if (ra !== null || rb !== null) {
    throw new GodotRuntimeError("compare-operands", `Invalid operands '${valueTypeName(a)}' and '${valueTypeName(b)}' in operator '${op}'.`);
  }
  // NodePath 不排序：实测两侧都是它时 `<` `<=` `>` `>=` 四句照旧是运行期那一句（RID 按号比序那条在这儿不成立），与 String 比的 `<` 也量过一格
  if (asNodePath(a) !== null || asNodePath(b) !== null) {
    throw new GodotRuntimeError("compare-operands", `Invalid operands '${valueTypeName(a)}' and '${valueTypeName(b)}' in operator '${op}'.`);
  }
  const va = asVec2(a);
  const vb = asVec2(b);
  if (va && vb) return vecCmp(va, vb);
  const wa3 = asVec3(a);
  const wb3 = asVec3(b);
  if (wa3 && wb3) return vec3Cmp(wa3, wb3);
  // Color 两侧都是它、或与别的东西比，引擎都是同一句运行期拒（实测 `Color < Color`、`Color < int`、`Color < [1]` 三形同文）
  if (asColor(a) !== null || asColor(b) !== null) {
    throw new GodotRuntimeError("color-cmp", `Invalid operands '${valueTypeName(a)}' and '${valueTypeName(b)}' in operator '${op}'.`);
  }
  const ziCmp = asVec2i(a);
  const zjCmp = asVec2i(b);
  if (ziCmp && zjCmp) return vec2iCmp(ziCmp, zjCmp);
  const zi3Cmp = asVec3i(a);
  const zj3Cmp = asVec3i(b);
  if (zi3Cmp && zj3Cmp) return vec3iCmp(zi3Cmp, zj3Cmp);
  // 数组对数组：引擎逐元素比、异型按「形的秩」定方向、长度做平手（读数 `tmp/probe-argtype/{ordcmp4,ordcmp5,ordcmp8}.txt`）。
  // 这一条与 `Array.sort()` 用的那条**不是同一条**（105 对逐对核过只有 106/210 相同），所以 sort 不在这儿走。
  if (a.t === Tag.ARRAY && b.t === Tag.ARRAY) {
    const x = arrayLess(a, b);
    const y = arrayLess(b, a);
    return x && !y ? -1 : y && !x ? 1 : 0;
  }
  throw new GodotRuntimeError("compare-operands", `Invalid operands '${valueTypeName(a)}' and '${valueTypeName(b)}' in operator '${op}'.`);
}

/** 容器元素的形秩：① 那条量成的全序，`null < bool < int < float < String < Vector2 < Vector2i < Vector3 < Vector3i < Color < StringName < NodePath < RID < Dictionary < Array`。
 *  数值三个形**也按秩而不按值**（`[2.5] < [3]` 假、`[3] < [2.5]` 真；`[true] < [1]` 真）—— 引擎就是这样。 */
function elemRank(v: Variant): number {
  if (v.t === Tag.NIL) return 0;
  if (v.t === Tag.BOOL) return 1;
  if (v.t === Tag.INT) return 2;
  if (v.t === Tag.FLOAT) return 3;
  if (v.t === Tag.STRING) return 4;
  if (asVec2(v) !== null) return 5;
  if (asVec2i(v) !== null) return 6;
  if (asVec3(v) !== null) return 7;
  if (asVec3i(v) !== null) return 8;
  if (asColor(v) !== null) return 9;
  if (v.t === Tag.STRING_NAME) return 10;
  if (asNodePath(v) !== null) return 11;
  if (asRid(v) !== null) return 12;
  if (v.t === Tag.DICT) return 13;
  if (v.t === Tag.ARRAY) return 14;
  throw new UnsupportedError("compare-elem", `容器元素的序只量到这 15 形，收到 ${tagName(v.t)}`);
}

/** 同型元素谁在前：数值 / 串 / 向量 / RID 按值，Color、NodePath、Dictionary **两头都假**（比不出但不报错），
 *  StringName 引擎走的是 intern 指针序（`[&"aaa"] < [&"abc"]` 假而 `[&"a"] < [&"zzz"]` 真，文字序与反序都对不上）—— 复现不了，响亮拒。 */
function elemLess(x: Variant, y: Variant): boolean {
  const rx = elemRank(x);
  const ry = elemRank(y);
  if (rx !== ry) return rx < ry;
  switch (rx) {
    case 0:
      return false;
    case 1:
      return !(x.v as boolean) && (y.v as boolean);
    case 2:
      return intToBig(x.v as IntPayload) < intToBig(y.v as IntPayload);
    case 3:
      return (x.v as number) < (y.v as number);
    case 4:
      return strCmp(x.v as string, y.v as string) < 0;
    case 5:
      return vecCmp(asVec2(x)!, asVec2(y)!) < 0;
    case 6:
      return vec2iCmp(asVec2i(x)!, asVec2i(y)!) < 0;
    case 7:
      return vec3Cmp(asVec3(x)!, asVec3(y)!) < 0;
    case 8:
      return vec3iCmp(asVec3i(x)!, asVec3i(y)!) < 0;
    case 9:
    case 11:
    case 13:
      return false;
    case 10:
      throw new UnsupportedError("compare-string-name", "StringName 的 < / > 按 Godot 内部指针序，无可靠口径（实测 &\"zzz\" < &\"abc\" 为真），拒绝 StringName 与 StringName 比大小");
    case 12: {
      const m = BigInt.asUintN(64, intToBig(asRid(x)!.id));
      const n = BigInt.asUintN(64, intToBig(asRid(y)!.id));
      return m < n;
    }
    default:
      return arrayLess(x, y);
  }
}

function arrayLess(x: Variant, y: Variant): boolean {
  const xs = (x.v as GArray).raw();
  const ys = (y.v as GArray).raw();
  const n = Math.min(xs.length, ys.length);
  for (let i = 0; i < n; i++) {
    if (elemLess(xs[i] as Variant, ys[i] as Variant)) return true;
    if (elemLess(ys[i] as Variant, xs[i] as Variant)) return false;
  }
  return ys.length > xs.length;
}

/** `a` 严格小于 `b`：与 `<`、`bsearch`、`min` / `max` 共用 compare 这一个口径（`Array.sort()` 用的是另一条，见 `sortLess`）。 */
export function isLess(a: Variant, b: Variant): boolean {
  return compare(a, b) < 0;
}

/** `Array.sort()` 的比较器只认这两张表里的形（S357）：有方向的那一族同形才比值，比不出的一族两向都假。 */
const SORT_ORDERED = new Set(["int", "float", "bool", "String", "Vector2", "Vector2i", "Vector3", "Vector3i", "RID", "Array"]);
const SORT_UNORDERED = new Set(["Nil", "Dictionary", "Color", "NodePath", "PackedByteArray", "PackedInt32Array", "PackedStringArray", "Callable"]);

/** `Array.sort()` 自己那条比较器 —— 与源里的装箱 `<`（`compare`）、也与 `sort_custom` 那位 Callable 都**不是同一条**（S357，
 *  读数 `tmp/probe-argtype/{sortcmp,sortcmp2,sortcmp3}.txt`，尺 `{fold25,fold26,fold27}.mts`）：
 *  **形不同只有 int 对 float 有方向**（按值，`[2.5, 1]` 换成 `[1, 2.5]`），bool 掺进数值里也不比（`[true, 0.5]` 与 `[0.5, true]` 两向都不动）；
 *  **形相同才比值**：串按码点（`é` 排在 `z` 之后）、四个向量按分量字典序、RID 按**无符号**号（`RID(-1)` 最大）、数组走 ① 那条装箱序、bool 是 false 在前；
 *  null / Dictionary / Color / NodePath / pack / Callable 同形也**一律比不出**（两向都不换位，引擎也不报错）；
 *  StringName 走 intern 之后的指针序（`[&"b"] `排在 `[&"ab"]` 之前，文字序与反序都对不上）复现不了，没量过的形（用户对象、其余 pack）也响亮拒。 */
export function sortLess(a: Variant, b: Variant): boolean {
  const ka = valueTypeName(a);
  const kb = valueTypeName(b);
  if (ka !== kb) return (ka === "int" || ka === "float") && (kb === "int" || kb === "float") ? compare(a, b) < 0 : false;
  if (SORT_UNORDERED.has(ka)) return false;
  if (ka === "bool") return !(a.v as boolean) && (b.v as boolean);
  if (ka === "StringName") {
    throw new UnsupportedError("compare-string-name", `StringName 的 sort 序走 Godot 内部指针，实测 [&"ab"] 与 [&"b"] 的文字序、反序都对不上 —— 复现不了，响亮拒`);
  }
  if (!SORT_ORDERED.has(ka)) throw new UnsupportedError("array-sort-mixed", `Array.sort() 的比较器只量到 ${[...SORT_ORDERED, ...SORT_UNORDERED].join(" / ")} 这些形，${ka} 还没量`);
  return compare(a, b) < 0;
}

/** bigint 的比较与复合赋值在静态编译目标上没有 lowering，而 `DataView` 的 bigint 读写都有：拆成带符号高 32 位 + 无符号低 32 位，按 number 判。 */
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

/** 二进制快速幂，每步都回绕到 int64（等价于 Godot 的 64 位溢出行为）。 */
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
function checkShift(a: Variant, b: Variant, op: string): [IntPayload, IntPayload] {
  const [x, y] = intPair(a, b, op);
  if (intToBig(x) < 0n || intToBig(y) < 0n) {
    throw new GodotRuntimeError("bit-shift-negative", "移位操作数不能为负");
  }
  return [x, y];
}

/** String 相关运算的转发。 */
export const strOps = {
  length: strLength,
  at: (s: string, i: number): string => strAt(s, i),
  substr: (s: string, from: number, len: number): string => strSubstr(s, from, len),
  format: strFormat,
  float: strFloat,
};

// 内建类型面的绑定 Callable 的等式按接收者的值比（读数 `tmp/probe-bincall/e1.gd` 的 E1–E6 六格）
registerRecvEqHook((a: Variant, b: Variant): boolean => {
  // 两台接收者型对不上时引擎的 `==` 自己就不给比（`Invalid operands 'Vector2' and 'Vector2i'`），而跨面的 Callable 等式实测就是 false
  try {
    return ops.eq(a, b).v === true;
  } catch {
    return false;
  }
});
