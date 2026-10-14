/**
 * `String` 那三支静态成员在 int 形参上的折法（S392，§6 第 47 条⑧的尾巴结清）。
 * 尺 `tmp/probe-int64params/{round1,round2,round3}.mts`，读数 `compare{49,50,51}.txt`，
 * 出货逐行对照 `tmp/probe-int64params/ours-{a,b,c}.txt`（49 格逐行一致）。
 * 三条式子各有凭据：
 * - `chr` 与 `num` 的 `decimals` 形参声明是 **int32** —— 先按 S326 那条折成 int64（范围内向零截断、
 *   越界与非有限给 `INT64_MIN`），再**截成有符号 int32**：`String.num(0.3333333333, 2^32+5)` 给 `0.33333`
 *   （五位），而 `2^31+5` 折成负数走默认那支；`String.chr(2^32+65)` 给 `A`。
 * - `humanize_size` 的形参是 **int64**，不做 int32 截：`INF` 折成 `INT64_MIN`、按 uint64 解释就是 8 EiB，
 *   `-1` 与 `-1024` 都是 16 EiB。
 */
import { describe, it } from "vitest";
import { eq } from "@gds2js/testkit";
import { V, type Variant } from "@gds2js/runtime/runtime/tags";
import { stringStatic } from "@gds2js/runtime/runtime/values";

const iv = (n: number | bigint): Variant =>
  typeof n === "bigint" ? V.int(n) : Number.isInteger(n) && Number.isSafeInteger(n) ? V.int(n) : V.float(n);
const num = (x: number, d: number | bigint): string =>
  stringStatic("num", [V.float(x), iv(d)]).v as string;
const chr = (cp: number | bigint): number => (stringStatic("chr", [iv(cp)]).v as string).codePointAt(0) as number;
const chrI = (cp: bigint): number => chr(cp);
const hum = (n: number | bigint): string => stringStatic("humanize_size", [iv(n)]).v as string;
const humI = (n: bigint): string => hum(n);

describe("decimals 那一支折成有符号 int32", () => {
  it("非有限与越界先折成 INT64_MIN，再截成 int32", async () => {
    eq("392", "num(1.5, INF)", num(1.5, Number.POSITIVE_INFINITY), "2");
    eq("392", "num(1.5, -INF)", num(1.5, Number.NEGATIVE_INFINITY), "2");
    eq("392", "num(1.5, NAN)", num(1.5, Number.NaN), "2");
    eq("392", "num(1.5, 1e20)", num(1.5, 1e20), "2");
    eq("392", "num(1.5, -1e20)", num(1.5, -1e20), "2");
  });

  it("2^32 的整圈折回原值，跨过 2^31 的那一支变负", async () => {
    eq("392", "2^32+5 → 5 位", num(0.3333333333, 4294967301), "0.33333");
    eq("392", "2^32+1 → 1 位", num(0.3333333333, 4294967297), "0.3");
    eq("392", "2^32-1 → 默认那支", num(0.3333333333, 4294967295), "0.3333333333");
    eq("392", "2^31+5 → 负", num(0.3333333333, 2147483653), "0.3333333333");
    eq("392", "2^31 → 负", num(0.3333333333, 2147483648), "0.3333333333");
    eq("392", "2^32+32 → 32 位", num(0.3333333333, 4294967328), "0.33333333329999998");
    eq("392", "2^32+40 仍夹到 32", num(0.3333333333, 4294967336), "0.33333333329999998");
    eq("392", "40 位夹到 32", num(0.3333333333, 40), "0.33333333329999998");
    eq("392", "33 位夹到 32", num(0.3333333333, 33), "0.33333333329999998");
    eq("392", "0 位", num(0.3333333333, 0), "0");
    eq("392", "-5 走默认那支", num(1.5, -5), "1.5");
  });

  it("被折的是形参，第一支的非有限不受这一改影响", async () => {
    eq("392", "num(INF, 3)", num(Number.POSITIVE_INFINITY, 3), "inf");
    eq("392", "num(NAN, 3)", num(Number.NaN, 3), "nan");
  });
});

describe("chr 同样折成有符号 int32，再走 U+FFFD 那一条", () => {
  it("非有限与越界一律 U+FFFD", async () => {
    for (const x of [Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY, Number.NaN, 1e20, -1e20]) {
      eq("392", `chr(${String(x)})`, chr(x), 65533);
    }
    eq("392", "chr(INT64_MIN)", chrI(-9223372036854775808n), 65533);
    eq("392", "chr(-1)", chrI(-1n), 65533);
    eq("392", "chr(1114112)", chrI(1114112n), 65533);
  });

  it("2^32 那一圈回到本来那个码点", async () => {
    eq("392", "chr(2^32+65)", chrI(4294967361n), 65);
    eq("392", "chr(65)", chrI(65n), 65);
    eq("392", "chr(2^31) 变负", chrI(2147483648n), 65533);
  });
});

describe("humanize_size 的形参是 int64，不做 int32 截", () => {
  it("INT64_MIN 与负数按 uint64 解释", async () => {
    eq("392", "humanize_size(INF)", hum(Number.POSITIVE_INFINITY), "8.00 EiB");
    eq("392", "humanize_size(-INF)", hum(Number.NEGATIVE_INFINITY), "8.00 EiB");
    eq("392", "humanize_size(NAN)", hum(Number.NaN), "8.00 EiB");
    eq("392", "humanize_size(1e20)", hum(1e20), "8.00 EiB");
    eq("392", "humanize_size(-1)", humI(-1n), "16.00 EiB");
    eq("392", "humanize_size(-1024)", humI(-1024n), "16.00 EiB");
    eq("392", "humanize_size(INT64_MAX)", humI(9223372036854775807n), "8.00 EiB");
    eq("392", "humanize_size(2^32) 仍是 4 GiB", humI(4294967296n), "4.00 GiB");
    eq("392", "humanize_size(1e18)", hum(1e18), "888.1 PiB");
    eq("392", "humanize_size(1023)", humI(1023n), "1023 B");
    eq("392", "humanize_size(0)", humI(0n), "0 B");
  });
});
