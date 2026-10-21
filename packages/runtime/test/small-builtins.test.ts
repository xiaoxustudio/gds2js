// 4.6.3 实测的 `absf` / `absi` / `wrap` / `is_same`（语料 251 收走读数一致的那些格，本门补上语料进不了的
// 两条：实参类型不合式时引擎报 Invalid type，以及整数值浮点跨过 int64 那一刻的打印口径）。
// 读数在 `tmp/probe-small-builtins/{b,c,d,e,f,g}.log`；4.3 源码对应的一眼在 `String::num_real()`。

import { describe, it } from "vitest";
import { eq } from "@gds2js/testkit";
import { V, type Variant } from "@gds2js/runtime/runtime/tags";
import { GArray, show, strFloat } from "@gds2js/runtime/runtime/values";
import { globalCallable, method } from "@gds2js/runtime/runtime/methods";
import { typeOf } from "@gds2js/runtime/runtime/patterns";
import { gAbsF, gAbsI } from "@gds2js/runtime/runtime/builtins";
import { F, I, S } from "./support/variants";

const call = (name: string, ...args: Variant[]): string => {
  try {
    const v = method(globalCallable(name), "call", args);
    return `${String((typeOf(v) as { v: number }).v)}|${show(v)}`;
  } catch (e) {
    return `[${(e as { code: string }).code}]`;
  }
};
const arrOf = (...xs: Variant[]): Variant => V.array(GArray.of(xs));
const MIN64 = I(BigInt("-9223372036854775808"));
const NAN = F(NaN);
const INF = F(Infinity);

describe("runtime/small-builtins · absf / absi / wrap / is_same", () => {
  it("251 · absf 恒给 float，absi 恒给 int", async () => {
    eq("251", "absf(-3) 给 3.0 而不是 3", call("absf", I(-3)), "3|3.0");
    eq("251", "absf 的 -0.0 折成正零（a04）", call("absf", F(-0)), "3|0.0");
    eq("251", "absf(true) 收 bool（a05）", call("absf", V.bool(true)), "3|1.0");
    eq("251", "absf 把大整数折成 double（a06）", call("absf", I(-4611686018427387903n)), "3|4611686018427387904.0");
    eq("251", "absf(-INF) 给 inf（a07）", call("absf", F(-Infinity)), "3|inf");
    eq("251", "absi(3.7) 与 absi(-3.7) 都向零截断（b01/b02）", `${call("absi", F(3.7))}|${call("absi", F(-3.7))}`, "2|3|2|3");
    eq("251", "absi(false) 给 0（b03）", call("absi", V.bool(false)), "2|0");
    eq("251", "absi 的大整数用 bigint 走，不折 double（b05）", call("absi", I(-4611686018427387903n)), "2|4611686018427387903");
    eq("251", "absi(-0.0) 给 0（w10）", call("absi", F(-0)), "2|0");
    eq("251", "absi(INT64_MIN) 回绕回 INT64_MIN，不给 +2^63（z16）", call("absi", MIN64), "2|-9223372036854775808");
    eq("251", "abs(INT64_MIN) 同一口径（z17）", call("abs", MIN64), "2|-9223372036854775808");
    eq("251", "absf(INT64_MIN) 落进 double（z18）", call("absf", MIN64), "3|9223372036854775800.0");
  });

  it("251 · 实参类型不合式：引擎报 Invalid type 并掐掉这次调用，我们同样响亮", async () => {
    eq("251", "absf(String)（f01/f11）", call("absf", S("3")), "[utility-convert]");
    eq("251", "absf(Nil)（f03）", call("absf", V.nil()), "[utility-convert]");
    eq("251", "absf(Array)（f05）", call("absf", arrOf(I(1))), "[utility-convert]");
    eq("251", "absf(StringName)（f09）", call("absf", V.stringName("-3")), "[utility-convert]");
    eq("251", "absi(String)（f02/f12）", call("absi", S("3")), "[utility-convert]");
    eq("251", "absi(Nil)（f04）", call("absi", V.nil()), "[utility-convert]");
    eq("251", "absi(Array)（f06；f08 的 Vector2 同一句口径）", call("absi", arrOf(I(1))), "[utility-convert]");
  });

  it("251 · wrap 的类型按实参那一眼", async () => {
    eq("251", "三支全 int 才给 int（c02/c04）", `${call("wrap", I(3), I(0), I(2))}|${call("wrap", I(-1), I(0), I(3))}`, "2|1|2|2");
    eq("251", "混进浮点就一律浮点（c01/c03/c05）", `${call("wrap", F(3.5), F(0), F(2))}|${call("wrap", F(3.5), I(0), I(2))}|${call("wrap", F(1.5), F(0), F(1))}`, "3|1.5|3|1.5|3|0.5");
    eq("251", "止小于起照实测读数走（z24/z25）", `${call("wrap", I(7), I(0), I(-5))}|${call("wrap", I(-1), I(-3), I(0))}`, "2|-3|2|-1");
    eq("251", "wrapf 与 wrap 的浮点那一支同式（z26）", call("wrapf", F(1.5), F(-3), F(0)), "3|-1.5");
  });

  it("251 · is_same 认类型，容器看身份，Callable 看等式", async () => {
    eq("251", "1 与 1.0、1 与 true 都不同型（d01）", `${call("is_same", I(1), I(1))}|${call("is_same", I(1), F(1))}|${call("is_same", I(1), V.bool(true))}`, "1|true|1|false|1|false");
    eq("251", "同一个数组同型、两个等值数组不同型（d02）", (() => {
      const a = arrOf(I(1));
      return `${call("is_same", a, a)}|${call("is_same", a, arrOf(I(1)))}`;
    })(), "1|true|1|false");
    eq("251", "字符串与 StringName 各认各的，nil 自己算同型（d03）", `${call("is_same", S("a"), S("a"))}|${call("is_same", V.stringName("a"), V.stringName("a"))}|${call("is_same", V.nil(), V.nil())}`, "1|true|1|true|1|true");
    eq("251", "0.0 与 -0.0 同型、NAN 自己同型（d06）", `${call("is_same", F(0), F(-0))}|${call("is_same", NAN, NAN)}|${call("is_same", INF, INF)}`, "1|true|1|true|1|true");
    eq("251", "3.0 与 3 不同型（z31）", call("is_same", F(3), I(3)), "1|false");
    eq("251", "全局 Callable 同名即同型（d05/z32）", `${call("is_same", globalCallable("abs"), globalCallable("abs"))}|${call("is_same", globalCallable("str_to_var"), globalCallable("str_to_var"))}`, "1|true|1|true");
    eq("251", "绑过实参的 Callable 不算同一个", call("is_same", method(globalCallable("abs"), "bind", [I(1)]), globalCallable("abs")), "1|false");
    eq("251", "gAbsF / gAbsI 直接调也走同一条道", `${show(gAbsF(I(-2)))}|${show(gAbsI(F(-2.9)))}`, "2.0|2");
  });

  it("251 · 整数值浮点的打印在 int64 那一刻分岔", async () => {
    eq("251", "装得进 int64 的按精确展开印（x01/x07）", strFloat(2 ** 62), "4611686018427387904.0");
    eq("251", "int64 上沿前一格（x14）", strFloat(2 ** 63 - 1024), "9223372036854774784.0");
    eq("251", "INT64_MIN 本身装得进（x03/x12）", strFloat(-(2 ** 63)), "-9223372036854775808.0");
    eq("251", "装不进就换成 17 位有效数字（x02/x06）", strFloat(2 ** 63), "9223372036854775800.0");
    eq("251", "1e19 也走 17 位那一支（x08）", strFloat(1e19), "10000000000000000000.0");
    eq("251", "字面量落到最近的可表示值再精确印（x15）", strFloat(123456789012345678), "123456789012345680.0");
  });
});
