// RID 一族（语料 261 钉了 41 格引擎读数；本门钉语料看不见的那些：四句运算符报错、两支全局函数的实参拒、
// RID 上方法面的形状）。读数：`tmp/probe-rid/{a,b,c}.log`、`tmp/probe-rid2/h2.log`、`tmp/probe-rid3/dyn.log`、`tmp/probe-rid4/eq.log`。
import { describe, it } from "vitest";
import { eq } from "@gds2js/testkit";
import { V, type Variant } from "@gds2js/runtime/runtime/tags";
import { show, varToStr, valueEq } from "@gds2js/runtime/runtime/values";
import { ops } from "@gds2js/runtime/runtime/ops";
import { gRidFromInt64, gRidAllocateId, gIsInstanceValid, variantHashNumber } from "@gds2js/runtime/runtime/builtins";
import { method } from "@gds2js/runtime/runtime/methods";
import { vector2 } from "@gds2js/runtime/runtime/class/vector/vector2";
import { color } from "@gds2js/runtime/runtime/color";
import { I, S } from "./support/variants";

const rid = (n: number | bigint): Variant => gRidFromInt64(V.int(n));
const code = (f: () => unknown): string => {
  try {
    f();
    return "没抛";
  } catch (e) {
    return `[${(e as { code?: string }).code ?? "?"}] ${(e as Error).message}`;
  }
};

describe("runtime · RID 一族", () => {
  it("四种运算符的实参不合式按引擎那句", () => {
    const a = rid(5);
    eq("261", "== 与 int / String / Vector2 / Color / Array / null 的六种形状", [
      code(() => ops.eq(a, I(5))),
      code(() => ops.eq(a, S("RID(5)"))),
      code(() => ops.eq(a, vector2(1, 2))),
      code(() => ops.eq(a, color(1, 0, 0, 1))),
      code(() => ops.eq(a, V.array([] as Variant[]))),
      String(valueEq(a, V.nil())),
    ].join(" | "), "[eq-operands] Invalid operands 'RID' and 'int' in operator '=='. | [eq-operands] Invalid operands 'RID' and 'String' in operator '=='. | [eq-operands] Invalid operands 'RID' and 'Vector2' in operator '=='. | [eq-operands] Invalid operands 'RID' and 'Color' in operator '=='. | [eq-operands] Invalid operands 'RID' and 'Array' in operator '=='. | false");
    eq("261", "!= 那句里写的是 != 而不是 ==", code(() => ops.neq(a, I(5))), "[eq-operands] Invalid operands 'RID' and 'int' in operator '!='.");
    eq("261", "< / <= / > / >= 四句都按写的那个运算符", [
      code(() => ops.lt(a, I(5))),
      code(() => ops.lte(a, I(5))),
      code(() => ops.gt(a, I(5))),
      code(() => ops.gte(a, I(5))),
    ].join(" | "), "[compare-operands] Invalid operands 'RID' and 'int' in operator '<'. | [compare-operands] Invalid operands 'RID' and 'int' in operator '<='. | [compare-operands] Invalid operands 'RID' and 'int' in operator '>'. | [compare-operands] Invalid operands 'RID' and 'int' in operator '>='.");
  });

  it("号的比序是无符号的", () => {
    const m1 = rid(-1);
    const z = rid(0);
    eq("261", "-1 折成 2^64-1，是最大的那一个（实测 u01 / u02）", `${String(ops.lt(z, m1).v)}|${String(ops.lt(m1, z).v)}`, "true|false");
    eq("261", "-2 < -1 假、-1 与自身等式走号（实测 u03 / u04）", `${String(ops.lt(rid(-2), m1).v)}|${String(valueEq(m1, rid(-1)))}`, "true|true");
    eq("261", "等式认号不认盒子", String(valueEq(rid(5), rid(5))), "true");
  });

  it("两支全局函数的实参按引擎那句拒", () => {
    eq("261", "String 与 Nil 两格量过原文", [code(() => gRidFromInt64(S("5"))), code(() => gRidFromInt64(V.nil()))].join(" | "), '[rid-arg] Invalid type in utility function "rid_from_int64()". Cannot convert argument 1 from String to int. | [rid-arg] Invalid type in utility function "rid_from_int64()". Cannot convert argument 1 from Nil to int.');
    eq("261", "RID 自己塞给要 int 的那支也是同一句", code(() => gRidFromInt64(rid(5))), "[rid-arg] Invalid type in utility function \"rid_from_int64()\". Cannot convert argument 1 from RID to int.");
    eq("261", "float 向零截断、bool 折 0/1（实测 t01 / y02）", `${show(gRidFromInt64(V.float(1.7)))}|${show(gRidFromInt64(V.bool(true)))}`, "RID(1)|RID(1)");
    eq("261", "非有限浮点没量过，响亮拒", code(() => gRidFromInt64(V.float(Number.NaN))), "[rid-arg-float] rid_from_int64() 的非有限浮点实参没量过（收到 NaN）");
    eq("261", "发号器给的是 int、连读递增", `${String(ops.eq(gRidAllocateId(), gRidAllocateId()).v)}|${String(varToStr(rid(5)))}`, "false|RID(5)");
  });

  it("RID 上的方法面只有 get_id", () => {
    const a = rid(5);
    eq("261", "get_id() 回那个 int64", `${String(method(a, "get_id", []).v)}|${String(method(rid(9223372036854775807n), "get_id", []).v)}`, "5|9223372036854775807");
    eq("261", "别的名给运行期那句 Nonexistent function", code(() => method(a, "get_method_list", [])), "[rid-method] Invalid call. Nonexistent function 'get_method_list' in base 'RID'.");
    eq("261", "带实参的 get_id 按实测那句拒", code(() => method(a, "get_id", [I(1)])), '[arity] Too many arguments for "get_id()" call. Expected at most 0 but received 1.');
    eq("261", "RID 不是实例：is_instance_valid 假（实测 h10）", String(gIsInstanceValid(a).v), "false");
    eq("261", "哈希是 hash_one_uint64(号)，五格实测全中", [0, 1, 5, -1, 13241].map((n) => String(variantHashNumber(rid(n)))).join("|"), "720020139|357654460|1788267159|532412650|2801066096");
  });
});
