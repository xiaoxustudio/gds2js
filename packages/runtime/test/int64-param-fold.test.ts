/**
 * int64 形参上的 float→int64 折法（一格一脚本四条 API 同一口径，读数 `tmp/probe-int64-arg/readings.txt`）
 * 与 `Color.from_rgba8`：读数抄自语料 336 的 golden。
 */
import { describe, expect, it } from "vitest";
import { V, type Variant } from "@gds2js/runtime/runtime/tags";
import { colorStatic } from "@gds2js/runtime/runtime/class/color/color";
import { show, stringStatic } from "@gds2js/runtime/runtime/values";

const rgba = (...args: Variant[]): string => show(colorStatic("from_rgba8", args));

describe("Color.from_rgba8", () => {
  it("分量是 int64 先升 float32 再 / 255，且不夹范围", () => {
    expect(rgba(V.int(255n), V.int(128n), V.int(0n))).toBe("(1.0, 0.502, 0.0, 1.0)");
    expect(rgba(V.int(300n), V.int(-5n), V.int(0n), V.int(300n))).toBe("(1.1765, -0.0196, 0.0, 1.1765)");
    expect(rgba(V.int(0n), V.int(0n), V.int(0n), V.int(0n))).toBe("(0.0, 0.0, 0.0, 0.0)");
    expect(rgba(V.int(255n), V.int(255n), V.int(255n), V.int(255n))).toBe("(1.0, 1.0, 1.0, 1.0)");
    expect(rgba(V.bool(true), V.bool(false), V.bool(true))).toBe("(0.0039, 0.0, 0.0039, 1.0)");
  });

  it("float 实参先折 int64：范围内截断，越界与非有限给 INT64_MIN", () => {
    expect(rgba(V.float(1.5), V.float(0), V.float(0))).toBe("(0.0039, 0.0, 0.0, 1.0)");
    expect(rgba(V.float(1.5), V.float(1.5), V.float(1.5), V.float(1.5))).toBe("(0.0039, 0.0039, 0.0039, 0.0039)");
    expect(rgba(V.float(1e20), V.int(0n), V.int(0n))).toBe("(-36170088558100480.0, 0.0, 0.0, 1.0)");
    expect(rgba(V.float(Number.NaN), V.int(0n), V.int(0n))).toBe("(-36170088558100480.0, 0.0, 0.0, 1.0)");
    expect(rgba(V.float(Number.POSITIVE_INFINITY), V.float(Number.NEGATIVE_INFINITY), V.int(0n))).toBe(
      "(-36170088558100480.0, -36170088558100480.0, 0.0, 1.0)",
    );
    expect(rgba(V.float(9007199254740992), V.int(0n), V.int(0n))).toBe("(35322352107520.0, 0.0, 0.0, 1.0)");
  });

  it("元数只收 3 或 4", () => {
    expect(() => colorStatic("from_rgba8", [V.int(1n), V.int(2n)])).toThrowError(/from_rgba8/);
    expect(() => colorStatic("from_rgba8", [V.int(1n), V.int(2n), V.int(3n), V.int(4n), V.int(5n)])).toThrowError(/from_rgba8/);
    expect(() => colorStatic("from_rgba8", [V.str("a"), V.int(0n), V.int(0n)])).toThrowError(/需要 int/);
  });
});

describe("int64 形参的折法也用在地标的那两支上", () => {
  it("num_int64 / num_uint64 的 float 实参同一口径", () => {
    const n = (name: string, v: Variant): string => stringStatic(name, [v]).v as string;
    expect(n("num_int64", V.float(1.5))).toBe("1");
    expect(n("num_int64", V.float(-1.5))).toBe("-1");
    expect(n("num_int64", V.float(9007199254740992))).toBe("9007199254740992");
    expect(n("num_int64", V.float(1e19))).toBe("-9223372036854775808");
    expect(n("num_int64", V.float(Number.NaN))).toBe("-9223372036854775808");
    expect(n("num_uint64", V.float(1e19))).toBe("9223372036854775808");
    expect(n("num_uint64", V.float(-1.5))).toBe("18446744073709551615");
    expect(n("num_uint64", V.float(Number.NEGATIVE_INFINITY))).toBe("9223372036854775808");
  });

  it("字符串实参仍响亮拒", () => {
    expect(() => stringStatic("num_int64", [V.str("1")])).toThrowError(Error);
    expect(() => colorStatic("from_rgba8", [V.str("1"), V.int(0n), V.int(0n)])).toThrowError(/需要 int/);
  });
});
