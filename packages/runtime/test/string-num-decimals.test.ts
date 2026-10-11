/**
 * `String.num(number, decimals)`：读数抄自语料 336 的 golden（那 279 格逐字节钉着这一支）。
 * 负零那三格故意不在语料里 —— 引擎的常量池把 `-0.0` 与 `0.0` 当同一个常量（两者相等），
 * 同一份脚本里谁先出现谁定号，一格一脚本实测 `String.num(-0.0, 2)` 才给 `-0.0`（§6 第 47 条⑥）。
 */
import { describe, expect, it } from "vitest";
import { V } from "@gds2js/runtime/runtime/tags";
import { stringStatic } from "@gds2js/runtime/runtime/values";

const num = (x: number, d?: number): string =>
  stringStatic("num", d === undefined ? [V.float(x)] : [V.float(x), V.int(d)]).v as string;

const CELLS: Array<[string, number, number | undefined, string]> = [
  ["默认 14 位再削零", 3.14159, undefined, "3.14159"],
  ["decimals 2", 3.14159, 2, "3.14"],
  ["decimals 3 四舍五入", 3.14159, 3, "3.142"],
  ["decimals 0", 3.14159, 0, "3"],
  ["decimals 15", 1 / 3, 15, "0.333333333333333"],
  ["decimals 16 露出 double 真值", 3.14159, 16, "3.1415899999999999"],
  ["17 位有效数字的限", 1 / 3, 32, "0.33333333333333331"],
  ["同一限的另一格", 0.1 + 0.2, 32, "0.30000000000000004"],
  ["小数点后至少留一个零", 100, 2, "100.0"],
  ["1e-7 的默认支", 1e-7, undefined, "0.0000001"],
  ["1e-7 的 24 位", 1e-7, 32, "0.000000099999999999999995"],
  ["大数走 |x|>10 那一条", 1e20, undefined, "100000000000000000000.0"],
  ["大数 + decimals 0", 1e20, 0, "100000000000000000000"],
  ["int 实参", 42, 2, "42.0"],
];

describe("String.num(number, decimals)", () => {
  it.each(CELLS)("%s", (_who, x, d, engine) => {
    expect(num(x, d)).toBe(engine);
  });

  it("半程舍入是离零更远，不是 half-even", () => {
    expect(num(0.5, 0)).toBe("1");
    expect(num(1.5, 0)).toBe("2");
    expect(num(2.5, 0)).toBe("3");
    expect(num(3.5, 0)).toBe("4");
    expect(num(-0.5, 0)).toBe("-1");
    expect(num(0.005, 2)).toBe("0.01");
  });

  it("nan / inf 两支在前，decimals 不参与", () => {
    expect(num(Number.NaN, 3)).toBe("nan");
    expect(num(Number.POSITIVE_INFINITY, 3)).toBe("inf");
    expect(num(Number.NEGATIVE_INFINITY, 3)).toBe("-inf");
  });

  it("负零跟符号（一格一脚本实测）", () => {
    expect(num(-0, 2)).toBe("-0.0");
    expect(num(-0, 0)).toBe("-0");
    expect(num(-0)).toBe("-0.0");
    expect(num(0, 2)).toBe("0.0");
  });

  it("decimals 的越界与截断", () => {
    expect(num(3.14159, 33)).toBe("3.1415899999999999");
    expect(num(3.14159, 100)).toBe("3.1415899999999999");
    expect(num(3.14159, -100)).toBe("3.14159");
    expect(stringStatic("num", [V.float(1.5), V.float(2.9)]).v).toBe("1.5");
  });

  it("缺首参与实参类型响亮拒", () => {
    expect(() => stringStatic("num", [])).toThrowError(/String\.num/);
    expect(() => stringStatic("num", [V.str("a")])).toThrowError(/String\.num/);
  });
});
