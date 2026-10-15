/**
 * `String.num()` 那一格 324 的缓冲**把负号算进去**（S390，§6 第 47 条⑨结清）。
 * 尺 `tmp/probe-numsign/round1.mts`（一格两读：长度 + 前六字符），读数 `tmp/probe-numsign/compare{45,46}.txt`。
 * 判据是同一支 `1e300` 摆两侧：正值到 22 位还出、23 位空，负值 22 位就空 —— 差的正是号那一格。
 */
import { describe, it } from "vitest";
import { eq } from "@gds2js/testkit";
import { strNumDecimals } from "@gds2js/runtime/runtime/values";

type Cell = [number, number, number, string];
const POS: Cell[] = [18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28].map((d): Cell => [
  1e300,
  d,
  d <= 22 ? 303 : 0,
  d <= 22 ? "100000" : "",
]);
const NEG: Cell[] = [18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28].map((d) => [
  -1e300,
  d,
  d <= 21 ? 304 : 0,
  d <= 21 ? "-10000" : "",
]);

describe("缓冲那一格连着负号一起算", () => {
  it("正值十一档：到 22 位出、23 位起空", async () => {
    for (const [x, d, len, head] of POS) {
      const got = strNumDecimals(x, d);
      eq("390", `String.num(1e300, ${String(d)}) 的长度`, got.length, len);
      eq("390", `String.num(1e300, ${String(d)}) 的前六字`, got.slice(0, 6), head);
    }
  });

  it("负值同一批：早一档就空 —— 号占的那一格", async () => {
    for (const [x, d, len, head] of NEG) {
      const got = strNumDecimals(x, d);
      eq("390", `String.num(-1e300, ${String(d)}) 的长度`, got.length, len);
      eq("390", `String.num(-1e300, ${String(d)}) 的前六字`, got.slice(0, 6), head);
    }
  });

  it("DBL_MAX 那一头同样早一档：正到 14 位出、负到 13 位出", async () => {
    const M = 1.7976931348623157e308;
    const CELLS: Array<[number, number, number]> = [[12, 311, 312], [13, 311, 312], [14, 311, 0], [15, 0, 0]];
    for (const [d, pos, neg] of CELLS) {
      eq("390", `String.num(DBL_MAX, ${String(d)})`, strNumDecimals(M, d).length, pos);
      const got = strNumDecimals(-M, d);
      eq("390", `String.num(-DBL_MAX, ${String(d)})`, got.length, neg);
      eq("390", `String.num(-DBL_MAX, ${String(d)}) 的前四字`, got.slice(0, 4), neg === 0 ? "" : "-179");
    }
  });

  it("削零后的形状不许被这一改动到（一格一脚本量回的四支小数值）", async () => {
    eq("390", "1.5 两支", `${strNumDecimals(1.5, 2)}|${strNumDecimals(-1.5, 2)}`, "1.5|-1.5");
    eq("390", "取整与带零", `${strNumDecimals(1.5, 0)}|${strNumDecimals(2.0, 3)}`, "2|2.0");
    eq("390", "负零两支", `${strNumDecimals(-0, 2)}|${strNumDecimals(-0, 0)}`, "-0.0|-0");
  });
});
