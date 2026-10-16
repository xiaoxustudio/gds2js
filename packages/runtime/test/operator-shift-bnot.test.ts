/**
 * 移位两支 `<<` / `>>` 与 `~` 的运行期那一面（S402）：左支是初值推断的模块 var 时引擎解析期不拦，
 * 78 格逐格对引擎 —— 尺 `tmp/probe-shift/round1.mts`，读数 `compare70.txt`，本文件由 `tmp/probe-shift/gen6.mts` 生成。
 * `值:` 那格比 `show()`，拒的那格比抛出的原文。
 */
import { describe, it } from "vitest";
import { eq } from "@gds2js/testkit";
import { dictOf } from "@gds2js/runtime/runtime/methods";
import { ops } from "@gds2js/runtime/runtime/ops";
import { V, type Variant } from "@gds2js/runtime/runtime/tags";
import { GArray, show } from "@gds2js/runtime/runtime/values";

type Cell = [string, () => Variant, string];

const CELLS: Cell[] = [
  ["bool << bool", () => ops.shl(V.bool(true), V.bool(true)), "E:Invalid operands 'bool' and 'bool' in operator '<<'."],
  ["bool << int", () => ops.shl(V.bool(true), V.int(2)), "E:Invalid operands 'bool' and 'int' in operator '<<'."],
  ["bool << float", () => ops.shl(V.bool(true), V.float(1.5)), "E:Invalid operands 'bool' and 'float' in operator '<<'."],
  ["bool << String", () => ops.shl(V.bool(true), V.str("a")), "E:Invalid operands 'bool' and 'String' in operator '<<'."],
  ["bool << Array", () => ops.shl(V.bool(true), V.array(GArray.of([V.int(1)]))), "E:Invalid operands 'bool' and 'Array' in operator '<<'."],
  ["bool << Dictionary", () => ops.shl(V.bool(true), dictOf([[V.int(1), V.int(1)]])), "E:Invalid operands 'bool' and 'Dictionary' in operator '<<'."],
  ["int << bool", () => ops.shl(V.int(2), V.bool(true)), "E:Invalid operands 'int' and 'bool' in operator '<<'."],
  ["int << int", () => ops.shl(V.int(2), V.int(2)), "V:8"],
  ["int << float", () => ops.shl(V.int(2), V.float(1.5)), "E:Invalid operands 'int' and 'float' in operator '<<'."],
  ["int << String", () => ops.shl(V.int(2), V.str("a")), "E:Invalid operands 'int' and 'String' in operator '<<'."],
  ["int << Array", () => ops.shl(V.int(2), V.array(GArray.of([V.int(1)]))), "E:Invalid operands 'int' and 'Array' in operator '<<'."],
  ["int << Dictionary", () => ops.shl(V.int(2), dictOf([[V.int(1), V.int(1)]])), "E:Invalid operands 'int' and 'Dictionary' in operator '<<'."],
  ["float << bool", () => ops.shl(V.float(1.5), V.bool(true)), "E:Invalid operands 'float' and 'bool' in operator '<<'."],
  ["float << int", () => ops.shl(V.float(1.5), V.int(2)), "E:Invalid operands 'float' and 'int' in operator '<<'."],
  ["float << float", () => ops.shl(V.float(1.5), V.float(1.5)), "E:Invalid operands 'float' and 'float' in operator '<<'."],
  ["float << String", () => ops.shl(V.float(1.5), V.str("a")), "E:Invalid operands 'float' and 'String' in operator '<<'."],
  ["float << Array", () => ops.shl(V.float(1.5), V.array(GArray.of([V.int(1)]))), "E:Invalid operands 'float' and 'Array' in operator '<<'."],
  ["float << Dictionary", () => ops.shl(V.float(1.5), dictOf([[V.int(1), V.int(1)]])), "E:Invalid operands 'float' and 'Dictionary' in operator '<<'."],
  ["String << bool", () => ops.shl(V.str("a"), V.bool(true)), "E:Invalid operands 'String' and 'bool' in operator '<<'."],
  ["String << int", () => ops.shl(V.str("a"), V.int(2)), "E:Invalid operands 'String' and 'int' in operator '<<'."],
  ["String << float", () => ops.shl(V.str("a"), V.float(1.5)), "E:Invalid operands 'String' and 'float' in operator '<<'."],
  ["String << String", () => ops.shl(V.str("a"), V.str("a")), "E:Invalid operands 'String' and 'String' in operator '<<'."],
  ["String << Array", () => ops.shl(V.str("a"), V.array(GArray.of([V.int(1)]))), "E:Invalid operands 'String' and 'Array' in operator '<<'."],
  ["String << Dictionary", () => ops.shl(V.str("a"), dictOf([[V.int(1), V.int(1)]])), "E:Invalid operands 'String' and 'Dictionary' in operator '<<'."],
  ["Array << bool", () => ops.shl(V.array(GArray.of([V.int(1)])), V.bool(true)), "E:Invalid operands 'Array' and 'bool' in operator '<<'."],
  ["Array << int", () => ops.shl(V.array(GArray.of([V.int(1)])), V.int(2)), "E:Invalid operands 'Array' and 'int' in operator '<<'."],
  ["Array << float", () => ops.shl(V.array(GArray.of([V.int(1)])), V.float(1.5)), "E:Invalid operands 'Array' and 'float' in operator '<<'."],
  ["Array << String", () => ops.shl(V.array(GArray.of([V.int(1)])), V.str("a")), "E:Invalid operands 'Array' and 'String' in operator '<<'."],
  ["Array << Array", () => ops.shl(V.array(GArray.of([V.int(1)])), V.array(GArray.of([V.int(1)]))), "E:Invalid operands 'Array' and 'Array' in operator '<<'."],
  ["Array << Dictionary", () => ops.shl(V.array(GArray.of([V.int(1)])), dictOf([[V.int(1), V.int(1)]])), "E:Invalid operands 'Array' and 'Dictionary' in operator '<<'."],
  ["Dictionary << bool", () => ops.shl(dictOf([[V.int(1), V.int(1)]]), V.bool(true)), "E:Invalid operands 'Dictionary' and 'bool' in operator '<<'."],
  ["Dictionary << int", () => ops.shl(dictOf([[V.int(1), V.int(1)]]), V.int(2)), "E:Invalid operands 'Dictionary' and 'int' in operator '<<'."],
  ["Dictionary << float", () => ops.shl(dictOf([[V.int(1), V.int(1)]]), V.float(1.5)), "E:Invalid operands 'Dictionary' and 'float' in operator '<<'."],
  ["Dictionary << String", () => ops.shl(dictOf([[V.int(1), V.int(1)]]), V.str("a")), "E:Invalid operands 'Dictionary' and 'String' in operator '<<'."],
  ["Dictionary << Array", () => ops.shl(dictOf([[V.int(1), V.int(1)]]), V.array(GArray.of([V.int(1)]))), "E:Invalid operands 'Dictionary' and 'Array' in operator '<<'."],
  ["Dictionary << Dictionary", () => ops.shl(dictOf([[V.int(1), V.int(1)]]), dictOf([[V.int(1), V.int(1)]])), "E:Invalid operands 'Dictionary' and 'Dictionary' in operator '<<'."],
  ["bool >> bool", () => ops.shr(V.bool(true), V.bool(true)), "E:Invalid operands 'bool' and 'bool' in operator '>>'."],
  ["bool >> int", () => ops.shr(V.bool(true), V.int(2)), "E:Invalid operands 'bool' and 'int' in operator '>>'."],
  ["bool >> float", () => ops.shr(V.bool(true), V.float(1.5)), "E:Invalid operands 'bool' and 'float' in operator '>>'."],
  ["bool >> String", () => ops.shr(V.bool(true), V.str("a")), "E:Invalid operands 'bool' and 'String' in operator '>>'."],
  ["bool >> Array", () => ops.shr(V.bool(true), V.array(GArray.of([V.int(1)]))), "E:Invalid operands 'bool' and 'Array' in operator '>>'."],
  ["bool >> Dictionary", () => ops.shr(V.bool(true), dictOf([[V.int(1), V.int(1)]])), "E:Invalid operands 'bool' and 'Dictionary' in operator '>>'."],
  ["int >> bool", () => ops.shr(V.int(2), V.bool(true)), "E:Invalid operands 'int' and 'bool' in operator '>>'."],
  ["int >> int", () => ops.shr(V.int(2), V.int(2)), "V:0"],
  ["int >> float", () => ops.shr(V.int(2), V.float(1.5)), "E:Invalid operands 'int' and 'float' in operator '>>'."],
  ["int >> String", () => ops.shr(V.int(2), V.str("a")), "E:Invalid operands 'int' and 'String' in operator '>>'."],
  ["int >> Array", () => ops.shr(V.int(2), V.array(GArray.of([V.int(1)]))), "E:Invalid operands 'int' and 'Array' in operator '>>'."],
  ["int >> Dictionary", () => ops.shr(V.int(2), dictOf([[V.int(1), V.int(1)]])), "E:Invalid operands 'int' and 'Dictionary' in operator '>>'."],
  ["float >> bool", () => ops.shr(V.float(1.5), V.bool(true)), "E:Invalid operands 'float' and 'bool' in operator '>>'."],
  ["float >> int", () => ops.shr(V.float(1.5), V.int(2)), "E:Invalid operands 'float' and 'int' in operator '>>'."],
  ["float >> float", () => ops.shr(V.float(1.5), V.float(1.5)), "E:Invalid operands 'float' and 'float' in operator '>>'."],
  ["float >> String", () => ops.shr(V.float(1.5), V.str("a")), "E:Invalid operands 'float' and 'String' in operator '>>'."],
  ["float >> Array", () => ops.shr(V.float(1.5), V.array(GArray.of([V.int(1)]))), "E:Invalid operands 'float' and 'Array' in operator '>>'."],
  ["float >> Dictionary", () => ops.shr(V.float(1.5), dictOf([[V.int(1), V.int(1)]])), "E:Invalid operands 'float' and 'Dictionary' in operator '>>'."],
  ["String >> bool", () => ops.shr(V.str("a"), V.bool(true)), "E:Invalid operands 'String' and 'bool' in operator '>>'."],
  ["String >> int", () => ops.shr(V.str("a"), V.int(2)), "E:Invalid operands 'String' and 'int' in operator '>>'."],
  ["String >> float", () => ops.shr(V.str("a"), V.float(1.5)), "E:Invalid operands 'String' and 'float' in operator '>>'."],
  ["String >> String", () => ops.shr(V.str("a"), V.str("a")), "E:Invalid operands 'String' and 'String' in operator '>>'."],
  ["String >> Array", () => ops.shr(V.str("a"), V.array(GArray.of([V.int(1)]))), "E:Invalid operands 'String' and 'Array' in operator '>>'."],
  ["String >> Dictionary", () => ops.shr(V.str("a"), dictOf([[V.int(1), V.int(1)]])), "E:Invalid operands 'String' and 'Dictionary' in operator '>>'."],
  ["Array >> bool", () => ops.shr(V.array(GArray.of([V.int(1)])), V.bool(true)), "E:Invalid operands 'Array' and 'bool' in operator '>>'."],
  ["Array >> int", () => ops.shr(V.array(GArray.of([V.int(1)])), V.int(2)), "E:Invalid operands 'Array' and 'int' in operator '>>'."],
  ["Array >> float", () => ops.shr(V.array(GArray.of([V.int(1)])), V.float(1.5)), "E:Invalid operands 'Array' and 'float' in operator '>>'."],
  ["Array >> String", () => ops.shr(V.array(GArray.of([V.int(1)])), V.str("a")), "E:Invalid operands 'Array' and 'String' in operator '>>'."],
  ["Array >> Array", () => ops.shr(V.array(GArray.of([V.int(1)])), V.array(GArray.of([V.int(1)]))), "E:Invalid operands 'Array' and 'Array' in operator '>>'."],
  ["Array >> Dictionary", () => ops.shr(V.array(GArray.of([V.int(1)])), dictOf([[V.int(1), V.int(1)]])), "E:Invalid operands 'Array' and 'Dictionary' in operator '>>'."],
  ["Dictionary >> bool", () => ops.shr(dictOf([[V.int(1), V.int(1)]]), V.bool(true)), "E:Invalid operands 'Dictionary' and 'bool' in operator '>>'."],
  ["Dictionary >> int", () => ops.shr(dictOf([[V.int(1), V.int(1)]]), V.int(2)), "E:Invalid operands 'Dictionary' and 'int' in operator '>>'."],
  ["Dictionary >> float", () => ops.shr(dictOf([[V.int(1), V.int(1)]]), V.float(1.5)), "E:Invalid operands 'Dictionary' and 'float' in operator '>>'."],
  ["Dictionary >> String", () => ops.shr(dictOf([[V.int(1), V.int(1)]]), V.str("a")), "E:Invalid operands 'Dictionary' and 'String' in operator '>>'."],
  ["Dictionary >> Array", () => ops.shr(dictOf([[V.int(1), V.int(1)]]), V.array(GArray.of([V.int(1)]))), "E:Invalid operands 'Dictionary' and 'Array' in operator '>>'."],
  ["Dictionary >> Dictionary", () => ops.shr(dictOf([[V.int(1), V.int(1)]]), dictOf([[V.int(1), V.int(1)]])), "E:Invalid operands 'Dictionary' and 'Dictionary' in operator '>>'."],
  ["~ bool", () => ops.bnot(V.bool(true)), "E:Invalid operands 'bool' and 'Nil' in operator '~'."],
  ["~ int", () => ops.bnot(V.int(2)), "V:-3"],
  ["~ float", () => ops.bnot(V.float(1.5)), "E:Invalid operands 'float' and 'Nil' in operator '~'."],
  ["~ String", () => ops.bnot(V.str("a")), "E:Invalid operands 'String' and 'Nil' in operator '~'."],
  ["~ Array", () => ops.bnot(V.array(GArray.of([V.int(1)]))), "E:Invalid operands 'Array' and 'Nil' in operator '~'."],
  ["~ Dictionary", () => ops.bnot(dictOf([[V.int(1), V.int(1)]])), "E:Invalid operands 'Dictionary' and 'Nil' in operator '~'."],
];

describe("移位与 ~ 的运行期", () => {
  it("逐格对引擎", async () => {
    let bad = 0;
    let firstBad = "";
    for (const [label, call, want] of CELLS) {
      let got = "";
      try {
        got = "V:" + show(call());
      } catch (e) {
        got = "E:" + (e instanceof Error ? e.message : String(e));
      }
      if (got !== want) {
        bad++;
        if (firstBad === "") firstBad = `${label}：期望 ${want}，实得 ${got}`;
      }
    }
    eq("402", "不合数", bad + (bad > 0 ? ` 首格[${firstBad}]` : ""), 0);
  });
});
