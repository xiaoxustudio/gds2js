// 随机族（语料 259 钉了 274 格引擎读数，本门补语料进不了的：void 的返回形状、实参类型那一族、`rand_from_seed` 不动全局，
// 以及 `randf()` 落在 float32 那一格 —— 差在第 9 位，只有拿 show 的串比才看得见）。
// 期望值全部抄自 `tmp/probe-rand/rand-map.tsv`（引擎那一列）与 `tmp/probe-rand/edge.gd` 的极值读数。
import { describe, it } from "vitest";
import { eq } from "@gds2js/testkit";
import { V, type Variant } from "@gds2js/runtime/runtime/tags";
import { show } from "@gds2js/runtime/runtime/values";
import { typeOf } from "@gds2js/runtime/runtime/patterns";
import {
  gRandFromSeed,
  gRandf,
  gRandfRange,
  gRandfn,
  gRandi,
  gRandiRange,
  gRandomize,
  gSeed,
} from "@gds2js/runtime/runtime/builtins";

const I = (n: number | bigint): Variant => V.int(BigInt(n));
const F = (n: number): Variant => V.float(n);

describe("runtime · 随机族", () => {
  it("读数按引擎那一列", () => {
    eq("259", "seed(0)：四发 randi 再接一发 randf 落在 float32 上（纯除法会给 0.47646454931237）", (() => {
      gSeed(I(0));
      const a = show(gRandi());
      const b = show(gRandi());
      const c = show(gRandi());
      const d = show(gRandi());
      return `${a}|${b}|${c}|${d}|${show(gRandf())}`;
    })(), "881477183|1327520283|692503688|2153658078|0.47646453976631");
    eq("259", "seed(1234) 的四发 randi", (() => {
      gSeed(I(1234));
      return `${show(gRandi())}|${show(gRandi())}|${show(gRandi())}|${show(gRandi())}`;
    })(), "435017838|3680626977|1396107827|1732080859");
    eq("259", "randf_range 之后紧跟的 randi 落在第 4 发（跨度 3 发的 randd）", (() => {
      gSeed(I(4294967296));
      return `${show(gRandfRange(F(0.5), F(1.5)))}|${show(gRandi())}`;
    })(), "1.04500185150936|3615637086");
    eq("259", "零标准差那格给 0.0，紧接着的两格还是引擎那一列", (() => {
      gSeed(I(1));
      return `${show(gRandfn(F(0), F(0)))}|${show(gRandfn(F(-5), F(2)))}|${show(gRandi())}`;
    })(), "0.0|-3.46347889283412|2451211778");
  });

  it("randi_range 的折法与不消耗", () => {
    eq("259", "from == to 直接回，一发都不吃", (() => {
      gSeed(I(1));
      return `${show(gRandiRange(I(-2147483648), I(-2147483648)))}|${show(gRandi())}`;
    })(), "-2147483648|1811587497");
    eq("259", "跨度按宽类型算：INT32_MIN..INT32_MAX = 2^32，那一格给首发减 2^31", (() => {
      gSeed(I(1));
      return `${show(gRandiRange(I(-2147483648), I(2147483647)))}|${show(gRandi())}`;
    })(), "-335896151|683407368");
    eq("259", "实参先折 int32（4294967295 → -1、2^31 → -2^31）再算跨度", (() => {
      gSeed(I(1));
      return show(gRandiRange(I(0), I(4294967295)));
    })(), "0");
    eq("259", "反着给也一样，MIN 决定平移", (() => {
      gSeed(I(1234));
      return `${show(gRandiRange(I(6), I(1)))}|${show(gRandiRange(I(1), I(6)))}`;
    })(), "1|4");
  });

  it("rand_from_seed 是局部的一台", () => {
    eq("259", "返回 PackedInt64Array（typeof 31），打印就是 [下一发, 原 seed]", (() => {
      const a = gRandFromSeed(I(0));
      return `${String((typeOf(a) as { v: number }).v)}|${show(a)}`;
    })(), "31|[881477183, 0]");
    eq("259", "负 seed 与超 int32 的 seed 都原样回到第二格", `${show(gRandFromSeed(I(-1)))}|${show(gRandFromSeed(I(4294967296)))}`, "[3188254867, -1]|[3856993283, 4294967296]");
    eq("259", "调用它不推进全局那一台（引擎每个 seed 组后面那发 randi 都对得上）", (() => {
      gSeed(I(1234));
      const a = show(gRandi());
      gSeed(I(1234));
      gRandFromSeed(I(99));
      gRandFromSeed(I(-7));
      const b = show(gRandi());
      return `${a}|${b}|${a === b ? "same" : "?"}`;
    })(), "435017838|435017838|same");
  });

  it("void 那两支给 null，randomize 之后照旧在区间内", () => {
    eq("259", "seed() 与 randomize() 的返回值都是 null", `${show(gSeed(I(7)))}|${show(gRandomize())}`, "<null>|<null>");
    eq("259", "randomize 之后 randi 仍是 typeof 2 且落在 [0, 2^32)", (() => {
      gRandomize();
      const v = gRandi();
      const n = v.v as bigint;
      return `${String((typeOf(v) as { v: number }).v)}|${String(n >= 0n && n < 4294967296n)}`;
    })(), "2|true");
  });

  it("实参类型不对就响亮拒（引擎那几句是转换期的，这一族没量过，不冒充）", () => {
    const code = (f: () => Variant): string => {
      try {
        f();
        return "没拒";
      } catch (e) {
        return `[${(e as { code?: string }).code ?? "?"}]`;
      }
    };
    eq("259", "seed / rand_from_seed / randi_range 的整数实参位（float 按 int 槽那条老规矩截断，不拒）", `${code(() => gSeed(V.str("x")))}|${code(() => gRandFromSeed(V.str("x")))}|${code(() => gRandiRange(V.str("a"), I(6)))}|${code(() => gRandiRange(I(1), V.nil()))}`, "[arg-int]|[arg-int]|[arg-int]|[arg-int]");
    eq("259", "randf_range / randfn 的浮点实参位", `${code(() => gRandfRange(V.str("a"), F(1)))}|${code(() => gRandfn(F(0), V.str("b")))}`, "[arg-float]|[arg-float]");
  });
});
