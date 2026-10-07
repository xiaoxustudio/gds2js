// 4.6.3 实测的三角与双曲那一族（语料 252 钉了发到出去的那些格，本门补语料进不了的三条：
// sin/cos 的幅度上限、实参类型不合式的运行期拒、以及 `is_instance_of` / `print_debug` 这两支新行只发形状）。
// 读数在 `tmp/probe-small-builtins/{h,l,m}.log` 与 `i.gd`；夹段那四行式子在 4.3 树 `core/math/math_funcs.h`。
// 没量清的一格记在这儿：`atan2(-0.0, 0.0)` 引擎给 `-3.14159265358979`，本机的式子给负零（打印成 `0.0`）——
// 负零在打印层看不出来，所以那一格既不发也不钉，等能分开 ±0 的量法再说（§6 第 23 条）。

import { describe, it } from "vitest";
import { eq } from "@gds2js/testkit";
import { V, type Variant } from "@gds2js/runtime/runtime/tags";
import { show } from "@gds2js/runtime/runtime/values";
import { typeOf } from "@gds2js/runtime/runtime/patterns";
import { globalCallable, method } from "@gds2js/runtime/runtime/methods";
import { gAcosh, gAcos, gAsin, gAtanh, gAtan2, gCos, gSin, gTan } from "@gds2js/runtime/runtime/builtins";
import { I, S } from "./support/variants";

const tn = (v: Variant): string => String((typeOf(v) as { v: number }).v);
const one = (f: (v: Variant) => Variant, v: Variant): string => {
  try {
    const r = f(v);
    return `${tn(r)}|${show(r)}`;
  } catch (e) {
    return `[${(e as { code: string }).code}]`;
  }
};
const call = (name: string, ...args: Variant[]): string => {
  try {
    const r = method(globalCallable(name), "call", args);
    return `${tn(r)}|${show(r)}`;
  } catch (e) {
    return `[${(e as { code: string }).code}]`;
  }
};
const shape = (name: string): string => {
  const f = globalCallable(name);
  const m = method(f, "get_method", []);
  return `${tn(f)}|${show(f)}|${show(m)}|${show(method(f, "get_argument_count", []))}`;
};
const F = (n: number): Variant => V.float(n);

describe("runtime/trig-family · 三角与双曲", () => {
  it("252 · sin / cos 只发到量过的那一格", async () => {
    eq("252", "sin(1e6) 是本机与引擎最后一格对得上的（z11）", one(gSin, F(1e6)), "3|-0.34999350217129");
    eq("252", "sin(1e7) 起引擎的归约开始丢位，拒（l.log）", one(gSin, F(1e7)), "[trig-large-arg]");
    eq("252", "负的也一样拒", one(gSin, F(-1e7)), "[trig-large-arg]");
    eq("252", "cos 的上限低一格：1e5 发、1e6 拒（z16 / l.log）", `${one(gCos, F(1e5))}|${one(gCos, F(1e6))}`, "3|-0.99936080743821|[trig-large-arg]");
    eq("252", "inf / nan 不算「超过上限」，照引擎给 nan", `${one(gSin, F(Infinity))}|${one(gSin, F(NaN))}`, "3|nan|3|nan");
    eq("252", "tan 一路到 1e300 都对得上，不设限（z19）", one(gTan, F(1e300)), "3|1.42144882387472");
  });

  it("252 · 夹段那四支给的是常量", async () => {
    eq("252", "asin 夹到 ±1（z22 / z23 / z24）", `${one(gAsin, F(2))}|${one(gAsin, F(-2))}|${one(gAsin, F(1.0000000001))}`, "3|1.5707963267949|3|-1.5707963267949|3|1.5707963267949");
    eq("252", "acos 夹到 [-1,1]：正向 0.0、负向 π（z25 / z26 / z27）", `${one(gAcos, F(2))}|${one(gAcos, F(-2))}|${one(gAcos, F(-1.0000000001))}`, "3|0.0|3|3.14159265358979|3|3.14159265358979");
    eq("252", "acosh 小于 1 一律 0.0（z44 / z45）", `${one(gAcosh, F(0.5))}|${one(gAcosh, F(-2))}|${one(gAcosh, F(2))}`, "3|0.0|3|0.0|3|1.31695789692482");
    eq("252", "atanh 出界给 ±inf，NaN 原样（z49 / z50）", `${one(gAtanh, F(2))}|${one(gAtanh, F(-2))}|${one(gAtanh, F(NaN))}`, "3|inf|3|-inf|3|nan");
    eq("252", "atan2 的符号象限（z31 / z32）", `${show(gAtan2(I(1), F(-1)))}|${show(gAtan2(I(-1), F(-1)))}|${show(gAtan2(I(1), I(2)))}`, "2.35619449019234|-2.35619449019234|0.46364760900081");
  });

  it("252 · 实参类型那一眼与 absf 同一条道", async () => {
    eq("252", "sin(true) 收 bool（k01）", one(gSin, V.bool(true)), "3|0.8414709848079");
    eq("252", "sin(String) 与 sin(Nil) 拒（k02 / k03）", `${one(gSin, S("3"))}|${one(gSin, V.nil())}`, "[arg-float]|[arg-float]");
    eq("252", ".call() 那侧同一条闸门（少的是一支实参先撞 arity）", `${call("cos", S("3"))}|${call("atan2", I(1))}|${call("atan2", I(1), S("x"))}`, "[arg-float]|[callable-arity]|[arg-float]");
  });

  it("252 · 三支新行的形状", async () => {
    eq("252", "acosh 有式子，发的是实测读数", shape("acosh"), "25|@GlobalScope::acosh|acosh|1");
    eq("252", "is_instance_of 那一眼形状照旧（式子在 S274 才补上）", shape("is_instance_of"), "25|@GDScript::is_instance_of|is_instance_of|2");
    eq("252", "print_debug 同上，argc 是 0", shape("print_debug"), "25|@GDScript::print_debug|print_debug|0");
    eq("252", "没式子的两支 .call 响亮拒", `${call("var_to_bytes", I(1))}|${call("print_debug", S("x"))}`, "[global-callable-call]|[global-callable-call]");
    eq("252", "acosh 走 .call 给数（m02 / m03）", `${call("acosh", I(2))}|${call("acosh", F(0.5))}`, "3|1.31695789692482|3|0.0");
  });
});
