// `"%f" % X` 那一族在 0 与无穷上的形状（语料 262 逐字节钉了 33 格；这一门补语料里放不下的两格：
// `0` 旗标对 inf 那一组不起作用、`%d` 的越界折法跨到 int64 边界两侧）。
// 读数：`tmp/probe-sign0/{sign,fmt2,fmt3,two,mixed}.gd` 与 `tmp/probe-atan2/atan2.log`。
import { describe, it } from "vitest";
import { eq } from "@gds2js/testkit";
import { V } from "@gds2js/runtime/runtime/tags";
import { strFormat } from "@gds2js/runtime/runtime/values";

const F = (n: number): string => strFormat("%f", [V.float(n)]);
const cell = (fmt: string, n: number): string => strFormat(fmt, [V.float(n)]);
const NEG0 = -0;
const INF = Number.POSITIVE_INFINITY;
const NINF = Number.NEGATIVE_INFINITY;
const NAN = Number.NaN;

describe("runtime · format 在负零与无穷上的形状", () => {
  it("负零的号在 %f 一族留着，在 %d 与 %s 那一族没有", () => {
    eq("262", "%f / %.1f / %.3f 都留着号", `${F(NEG0)}|${cell("%.1f", NEG0)}|${cell("%.3f", NEG0)}`, "-0.000000|-0.0|-0.000");
    eq("262", "%d 那一支截断后没号（g01），%+.1f 仍是 -0.0", `${cell("%d", NEG0)}|${cell("%+.1f", NEG0)}`, "0|-0.0");
    eq("262", "0 旗标照常垫（%05.1f → -00.0）", cell("%05.1f", NEG0), "-00.0");
    eq("262", "乘 1.0 不改变形状", cell("%.1f", NEG0 * 1), "-0.0");
  });

  it("非有限值给 inf / -inf / nan 三个词", () => {
    eq("262", "%.1f 与 %f 两支都给三个词", `${cell("%.1f", INF)}|${F(NINF)}|${cell("%.1f", NAN)}`, "inf|-inf|nan");
    eq("262", "宽度按空格补，`0` 那旗标对这三个词不起作用", `${cell("%5.1f", NINF)}|${cell("%09.1f", INF)}|${cell("%09.1f", 1.5)}`, " -inf|      inf|0000001.5");
    eq("262", "+ 旗标只给 +inf 加号，nan 不加", `${cell("%+f", INF)}|${cell("%+f", NAN)}`, "+inf|nan");
    eq("262", "%s 那一支走 print 同一条式子", cell("%s", NAN), "nan");
  });

  it("%d 收 float 按 int64 那次转换折", () => {
    eq("262", "范围内向零截断", `${cell("%d", 1.5)}|${cell("%d", -1.5)}|${cell("%d", 4611686018427387904)}`, "1|-1|4611686018427387904");
    eq("262", "越界与非有限一律 -9223372036854775808", [INF, NINF, NAN, 1e30, -1e30, 9223372036854775808].map((n) => cell("%d", n)).join("|"), Array(6).fill("-9223372036854775808").join("|"));
  });
});
