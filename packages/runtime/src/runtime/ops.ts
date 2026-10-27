import { GodotRuntimeError, UnsupportedError } from "./errors";
import { registerRecvEqHook } from "./callable";
import { pctFormatError } from "./frames";
import { Tag, tagName, V, intToBig, intToNum, wrap64, type IntPayload, type Variant } from "./tags";
import { asRid } from "./rid";
import { asNodePath } from "./node-path";
import { asVec2, GVector2, vector2, vecCmp } from "./vector2";
import { asVec3, GVector3, vector3, vec3Cmp } from "./vector3";
import { asQuaternion, quaternion } from "./quaternion";
import { asTransform2D, transform2d } from "./transform2d";
import { asBasis, basisMul, basisScaled, basisXform } from "./basis";

const r3 = Math.fround;
import { asVec4, GVector4, vec4Cmp } from "./vector4";
import { asVec4i, GVector4i, v4iAdd, v4iDiv, v4iDivK, v4iMul, v4iMulK, v4iNeg, v4iSub, vec4iCmp, vec4iToFloat } from "./vector4i";
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
import { GArray, GDict, keyOf, show, strFormat, strFormatSoft, truthyOf, valueEq} from "./values";
import { strAt, strCmp, strLength, strSubstr, valueTypeName } from "./string-ops";
import { strFloat } from "./numfmt";

const isNum = (v: Variant): boolean => v.t === Tag.INT || v.t === Tag.FLOAT;
const isStringish = (v: Variant): boolean => v.t === Tag.STRING || v.t === Tag.STRING_NAME;

export function pctFormatOp(fmt: Variant, args: Variant, soft: boolean): Variant {
  const text = fmt.v as string;
  const list = args.t === Tag.ARRAY ? (args.v as GArray).raw() : [args];
  if (!soft) return V.str(strFormat(text, list));
  const r = strFormatSoft(text, list);
  if (r.fail !== null) pctFormatError(r.fail, args.t);
  return V.str(r.text);
}

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

const MEASURED_SIX = new Set<number>([Tag.BOOL, Tag.INT, Tag.FLOAT, Tag.STRING, Tag.ARRAY, Tag.DICT]);
const RUNTIME_REFUSED_PAIRS = new Set<string>(["StringName|int"]);

const NIL_SENTENCED = new Set<number>([...MEASURED_SIX, Tag.NIL]);

function pairKey(a: Variant, b: Variant): string {
  return `${valueTypeName(a)}|${valueTypeName(b)}`;
}

function operandsRefused(a: Variant, b: Variant, op: string, code: string): Variant {
  if ((NIL_SENTENCED.has(a.t) && NIL_SENTENCED.has(b.t)) || RUNTIME_REFUSED_PAIRS.has(pairKey(a, b))) {
    throw new GodotRuntimeError(code, `Invalid operands '${valueTypeName(a)}' and '${valueTypeName(b)}' in operator '${op}'.`);
  }
  throw new UnsupportedError(code, `${op} 不支持 ${tagName(a.t)} ${op} ${tagName(b.t)}`);
}

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

export const ops = {
  add(a: Variant, b: Variant): Variant {
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
    const wa4 = asVec4(a);
    const wb4 = asVec4(b);
    if (wa4 && wb4) return V.object(new GVector4(wa4.x + wb4.x, wa4.y + wb4.y, wa4.z + wb4.z, wa4.w + wb4.w));
    const za4 = asVec4i(a);
    const zb4 = asVec4i(b);
    if (za4 && zb4) return v4iAdd(za4, zb4);
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
    const wa4 = asVec4(a);
    const wb4 = asVec4(b);
    if (wa4 && wb4) return V.object(new GVector4(wa4.x - wb4.x, wa4.y - wb4.y, wa4.z - wb4.z, wa4.w - wb4.w));
    const za4 = asVec4i(a);
    const zb4 = asVec4i(b);
    if (za4 && zb4) return v4iSub(za4, zb4);
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
    const wa4 = asVec4(a);
    const wb4 = asVec4(b);
    if (wa4 && wb4) return V.object(new GVector4(wa4.x * wb4.x, wa4.y * wb4.y, wa4.z * wb4.z, wa4.w * wb4.w));
    if (wa4 && isNum(b)) return V.object(new GVector4(wa4.x * num(b), wa4.y * num(b), wa4.z * num(b), wa4.w * num(b)));
    if (wb4 && isNum(a)) return V.object(new GVector4(wb4.x * num(a), wb4.y * num(a), wb4.z * num(a), wb4.w * num(a)));
    const zi4Mul = asVec4i(a);
    const zj4Mul = asVec4i(b);
    if (zi4Mul && zj4Mul) return v4iMul(zi4Mul, zj4Mul);
    if (zi4Mul && b.t === Tag.FLOAT) return vec4iToFloat(zi4Mul, num(b), "mul");
    if (zi4Mul && b.t === Tag.INT) return v4iMulK(zi4Mul, intToNum(b.v as IntPayload));
    if (zj4Mul && a.t === Tag.INT) return v4iMulK(zj4Mul, intToNum(a.v as IntPayload));
    const taMul = asTransform2D(a);
    if (taMul !== null) {
      const tbMul = asTransform2D(b);
      if (tbMul !== null) {
        const ax = taMul.xx;
        const ay = taMul.xy;
        const bx = taMul.yx;
        const by = taMul.yy;
        return transform2d(
          r3(ax * tbMul.xx) + r3(bx * tbMul.xy),
          r3(ay * tbMul.xx) + r3(by * tbMul.xy),
          r3(ax * tbMul.yx) + r3(bx * tbMul.yy),
          r3(ay * tbMul.yx) + r3(by * tbMul.yy),
          r3(r3(ax * tbMul.ox) + r3(bx * tbMul.oy)) + taMul.ox,
          r3(r3(ay * tbMul.ox) + r3(by * tbMul.oy)) + taMul.oy,
        );
      }
      if (b.t === Tag.OBJECT && (b.v as object) instanceof GVector2) {
        const p = b.v as GVector2;
        return vector2(r3(r3(taMul.xx * p.x) + r3(taMul.yx * p.y)) + taMul.ox, r3(r3(taMul.xy * p.x) + r3(taMul.yy * p.y)) + taMul.oy);
      }
      throw new UnsupportedError("transform2d-mul-right", `Transform2D 的 ${"\u002a"} 只量过乘 Transform2D 与乘 Vector2（收到另一形）`);
    }
    const baMul = asBasis(a);
    if (baMul !== null) {
      const bbMul = asBasis(b);
      if (bbMul !== null) return basisMul(baMul, bbMul);
      const bvMul = asVec3(b);
      if (bvMul !== null) {
        const p = basisXform(baMul, bvMul.x, bvMul.y, bvMul.z);
        return vector3(p[0] as number, p[1] as number, p[2] as number);
      }
      if (b.t === Tag.FLOAT || b.t === Tag.INT) return basisScaled(baMul, r3(num(b)));
      throw new UnsupportedError("basis-mul-right", `Basis 的 ${"\u002a"} 只量过乘 Basis、乘 Vector3、乘数（收到另一形）`);
    }
    const qaMul = asQuaternion(a);
    const qbMul = asQuaternion(b);
    if (qaMul && qbMul) {
      const x = r3(qaMul.w * qbMul.x) + r3(qaMul.x * qbMul.w) + r3(qaMul.y * qbMul.z) - r3(qaMul.z * qbMul.y);
      const y = r3(qaMul.w * qbMul.y) + r3(qaMul.y * qbMul.w) + r3(qaMul.z * qbMul.x) - r3(qaMul.x * qbMul.z);
      const z = r3(qaMul.w * qbMul.z) + r3(qaMul.z * qbMul.w) + r3(qaMul.x * qbMul.y) - r3(qaMul.y * qbMul.x);
      const w = r3(qaMul.w * qbMul.w) - r3(qaMul.x * qbMul.x) - r3(qaMul.y * qbMul.y) - r3(qaMul.z * qbMul.z);
      return quaternion(x, y, z, w);
    }
    if (qaMul && b.t === Tag.OBJECT && (b.v as object) instanceof GVector3) {
      throw new UnsupportedError("quaternion-xform", "Quaternion * Vector3 这一式还没对上：三种 float32 结合次序里，两种各自复现了一格、另一格差 6e-7，读不出引擎的那一条，响亮拒");
    }
    const ziMul = asVec2i(a);
    const zjMul = asVec2i(b);
    if (ziMul && zjMul) return vector2i(mul32(ziMul.x, zjMul.x), mul32(ziMul.y, zjMul.y));
    if (ziMul && b.t === Tag.FLOAT) return vec2iToFloat(ziMul, num(b), "mul");
    if (zjMul && a.t === Tag.FLOAT) return vec2iToFloat(zjMul, num(a), "mul");
    if (ziMul && isNum(b)) return vector2i(mul32(ziMul.x, intToNum(b.v as IntPayload)), mul32(ziMul.y, intToNum(b.v as IntPayload)));
    if (zjMul && isNum(a)) return vector2i(mul32(zjMul.x, intToNum(a.v as IntPayload)), mul32(zjMul.y, intToNum(a.v as IntPayload)));
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
    const wa4 = asVec4(a);
    const wb4 = asVec4(b);
    if (wa4 && wb4) return V.object(new GVector4(wa4.x / wb4.x, wa4.y / wb4.y, wa4.z / wb4.z, wa4.w / wb4.w));
    if (wa4 && isNum(b)) return V.object(new GVector4(wa4.x / num(b), wa4.y / num(b), wa4.z / num(b), wa4.w / num(b)));
    const zi4Div = asVec4i(a);
    const zj4Div = asVec4i(b);
    if (zi4Div && zj4Div) return v4iDiv(zi4Div, zj4Div);
    if (zi4Div && b.t === Tag.FLOAT) return vec4iToFloat(zi4Div, num(b), "div");
    if (zi4Div && b.t === Tag.INT) return v4iDivK(zi4Div, intToNum(b.v as IntPayload));
    if (zj4Div) {
      throw new UnsupportedError("div-operands", `/ 不支持 ${tagName(a.t)} / Vector4i（左边放标量实测是解析期拒）`);
    }
    const ziDiv = asVec2i(a);
    const zjDiv = asVec2i(b);
    if (ziDiv && zjDiv) return vector2i(div32(ziDiv.x, zjDiv.x), div32(ziDiv.y, zjDiv.y));
    if (ziDiv && b.t === Tag.FLOAT) return vec2iToFloat(ziDiv, num(b), "div");
    if (ziDiv && isNum(b)) {
      const k = intToNum(b.v as IntPayload);
      return vector2i(div32(ziDiv.x, k), div32(ziDiv.y, k));
    }
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
        throw new GodotRuntimeError("int-div-zero", "Division by zero error in operator '/'.");
      }
      return i64(x, y, (p, q) => p / q);
    }
    return V.float(num(a) / num(b));
  },

  mod(a: Variant, b: Variant, soft: boolean): Variant {
    if (isStringish(a)) return pctFormatOp(a, b, soft);
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
      throw new GodotRuntimeError("int-mod-zero", "Modulo by zero error in operator '%'.");
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
    const wa4 = asVec4(a);
    if (wa4) return V.object(new GVector4(-wa4.x, -wa4.y, -wa4.z, -wa4.w));
    const za4 = asVec4i(a);
    if (za4) return v4iNeg(za4);
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
  const ra = asRid(a);
  const rb = asRid(b);
  if (ra !== null && rb !== null) {
    const rx = BigInt.asUintN(64, intToBig(ra.id));
    const ry = BigInt.asUintN(64, intToBig(rb.id));
    return rx === ry ? 0 : rx < ry ? -1 : 1;
  }
  if (ra !== null || rb !== null) {
    throw new GodotRuntimeError("compare-operands", `Invalid operands '${valueTypeName(a)}' and '${valueTypeName(b)}' in operator '${op}'.`);
  }
  if (asNodePath(a) !== null || asNodePath(b) !== null) {
    throw new GodotRuntimeError("compare-operands", `Invalid operands '${valueTypeName(a)}' and '${valueTypeName(b)}' in operator '${op}'.`);
  }
  const va = asVec2(a);
  const vb = asVec2(b);
  if (va && vb) return vecCmp(va, vb);
  const wa3 = asVec3(a);
  const wb3 = asVec3(b);
  if (wa3 && wb3) return vec3Cmp(wa3, wb3);
  const wa4 = asVec4(a);
  const wb4 = asVec4(b);
  if (wa4 && wb4) return vec4Cmp(wa4, wb4);
  const za4 = asVec4i(a);
  const zb4 = asVec4i(b);
  if (za4 && zb4) return vec4iCmp(za4, zb4);
  if (asColor(a) !== null || asColor(b) !== null) {
    throw new GodotRuntimeError("color-cmp", `Invalid operands '${valueTypeName(a)}' and '${valueTypeName(b)}' in operator '${op}'.`);
  }
  const ziCmp = asVec2i(a);
  const zjCmp = asVec2i(b);
  if (ziCmp && zjCmp) return vec2iCmp(ziCmp, zjCmp);
  const zi3Cmp = asVec3i(a);
  const zj3Cmp = asVec3i(b);
  if (zi3Cmp && zj3Cmp) return vec3iCmp(zi3Cmp, zj3Cmp);
  if (a.t === Tag.ARRAY && b.t === Tag.ARRAY) {
    const x = arrayLess(a, b);
    const y = arrayLess(b, a);
    return x && !y ? -1 : y && !x ? 1 : 0;
  }
  throw new GodotRuntimeError("compare-operands", `Invalid operands '${valueTypeName(a)}' and '${valueTypeName(b)}' in operator '${op}'.`);
}

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

const SORT_ORDERED = new Set(["int", "float", "bool", "String", "Vector2", "Vector2i", "Vector3", "Vector3i", "Vector4", "Vector4i", "RID", "Array"]);
const SORT_UNORDERED = new Set(["Nil", "Dictionary", "Color", "NodePath", "PackedByteArray", "PackedInt32Array", "PackedStringArray", "Callable"]);

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

const BIG_SCRATCH = new DataView(new ArrayBuffer(8));

function bigWords(v: bigint): [number, number] {
  BIG_SCRATCH.setBigInt64(0, v);
  return [BIG_SCRATCH.getInt32(0), BIG_SCRATCH.getUint32(4)];
}

function bigPositive(v: bigint): boolean {
  const w = bigWords(v);
  const hi = w[0] as number;
  if (hi < 0) return false;
  return hi > 0 || (w[1] as number) > 0;
}

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

function checkShift(a: Variant, b: Variant, op: string): [IntPayload, IntPayload] {
  const [x, y] = intPair(a, b, op);
  if (intToBig(x) < 0n || intToBig(y) < 0n) {
    throw new GodotRuntimeError("bit-shift-negative", "移位操作数不能为负");
  }
  return [x, y];
}

export const strOps = {
  length: strLength,
  at: (s: string, i: number): string => strAt(s, i),
  substr: (s: string, from: number, len: number): string => strSubstr(s, from, len),
  format: strFormat,
  float: strFloat,
};

registerRecvEqHook((a: Variant, b: Variant): boolean => {
  try {
    return ops.eq(a, b).v === true;
  } catch {
    return false;
  }
});
