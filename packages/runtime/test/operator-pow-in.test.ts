/**
 * 运算符在**运行期**那一句：`**` 与 `in` 两支的六型矩阵（S401）：引擎解析期不拦，拒格与值格都在运行期那一句与那一个值上。
 * 72 格矩阵（六型 × 六型 × 两符：`**` 与 `in`）逐格对引擎 —— 尺 `tmp/probe-powin/round1.mts`，读数 `compare69.txt`，
 * 本文件由 `tmp/probe-powin/gen5.mts` 从读数生成：`值:` 那格比 `show()`，拒的那格比抛出的原文。
 * 两支都在运行期那一句上：`**` 只收 int 与 float，`in` 只收右支的 Array / Dictionary / String。
 */
import { describe, it } from "vitest";
import { eq } from "@gds2js/testkit";
import { and, or } from "@gds2js/runtime/runtime/builtins";
import { dictOf } from "@gds2js/runtime/runtime/methods";
import { ops } from "@gds2js/runtime/runtime/ops";
import { V, type Variant } from "@gds2js/runtime/runtime/tags";
import { GArray, show } from "@gds2js/runtime/runtime/values";

type Cell = [string, () => Variant, string];

const CELLS: Cell[] = [
  ["bool ** bool", () => ops.pow(V.bool(true), V.bool(true)), "E:Invalid operands 'bool' and 'bool' in operator '**'."],
  ["bool ** int", () => ops.pow(V.bool(true), V.int(2)), "E:Invalid operands 'bool' and 'int' in operator '**'."],
  ["bool ** float", () => ops.pow(V.bool(true), V.float(1.5)), "E:Invalid operands 'bool' and 'float' in operator '**'."],
  ["bool ** String", () => ops.pow(V.bool(true), V.str("a")), "E:Invalid operands 'bool' and 'String' in operator '**'."],
  ["bool ** Array", () => ops.pow(V.bool(true), V.array(GArray.of([V.int(1)]))), "E:Invalid operands 'bool' and 'Array' in operator '**'."],
  ["bool ** Dictionary", () => ops.pow(V.bool(true), dictOf([[V.int(1), V.int(1)]])), "E:Invalid operands 'bool' and 'Dictionary' in operator '**'."],
  ["int ** bool", () => ops.pow(V.int(2), V.bool(true)), "E:Invalid operands 'int' and 'bool' in operator '**'."],
  ["int ** int", () => ops.pow(V.int(2), V.int(2)), "V:4"],
  ["int ** float", () => ops.pow(V.int(2), V.float(1.5)), "V:2.82842712474619"],
  ["int ** String", () => ops.pow(V.int(2), V.str("a")), "E:Invalid operands 'int' and 'String' in operator '**'."],
  ["int ** Array", () => ops.pow(V.int(2), V.array(GArray.of([V.int(1)]))), "E:Invalid operands 'int' and 'Array' in operator '**'."],
  ["int ** Dictionary", () => ops.pow(V.int(2), dictOf([[V.int(1), V.int(1)]])), "E:Invalid operands 'int' and 'Dictionary' in operator '**'."],
  ["float ** bool", () => ops.pow(V.float(1.5), V.bool(true)), "E:Invalid operands 'float' and 'bool' in operator '**'."],
  ["float ** int", () => ops.pow(V.float(1.5), V.int(2)), "V:2.25"],
  ["float ** float", () => ops.pow(V.float(1.5), V.float(1.5)), "V:1.83711730708738"],
  ["float ** String", () => ops.pow(V.float(1.5), V.str("a")), "E:Invalid operands 'float' and 'String' in operator '**'."],
  ["float ** Array", () => ops.pow(V.float(1.5), V.array(GArray.of([V.int(1)]))), "E:Invalid operands 'float' and 'Array' in operator '**'."],
  ["float ** Dictionary", () => ops.pow(V.float(1.5), dictOf([[V.int(1), V.int(1)]])), "E:Invalid operands 'float' and 'Dictionary' in operator '**'."],
  ["String ** bool", () => ops.pow(V.str("a"), V.bool(true)), "E:Invalid operands 'String' and 'bool' in operator '**'."],
  ["String ** int", () => ops.pow(V.str("a"), V.int(2)), "E:Invalid operands 'String' and 'int' in operator '**'."],
  ["String ** float", () => ops.pow(V.str("a"), V.float(1.5)), "E:Invalid operands 'String' and 'float' in operator '**'."],
  ["String ** String", () => ops.pow(V.str("a"), V.str("a")), "E:Invalid operands 'String' and 'String' in operator '**'."],
  ["String ** Array", () => ops.pow(V.str("a"), V.array(GArray.of([V.int(1)]))), "E:Invalid operands 'String' and 'Array' in operator '**'."],
  ["String ** Dictionary", () => ops.pow(V.str("a"), dictOf([[V.int(1), V.int(1)]])), "E:Invalid operands 'String' and 'Dictionary' in operator '**'."],
  ["Array ** bool", () => ops.pow(V.array(GArray.of([V.int(1)])), V.bool(true)), "E:Invalid operands 'Array' and 'bool' in operator '**'."],
  ["Array ** int", () => ops.pow(V.array(GArray.of([V.int(1)])), V.int(2)), "E:Invalid operands 'Array' and 'int' in operator '**'."],
  ["Array ** float", () => ops.pow(V.array(GArray.of([V.int(1)])), V.float(1.5)), "E:Invalid operands 'Array' and 'float' in operator '**'."],
  ["Array ** String", () => ops.pow(V.array(GArray.of([V.int(1)])), V.str("a")), "E:Invalid operands 'Array' and 'String' in operator '**'."],
  ["Array ** Array", () => ops.pow(V.array(GArray.of([V.int(1)])), V.array(GArray.of([V.int(1)]))), "E:Invalid operands 'Array' and 'Array' in operator '**'."],
  ["Array ** Dictionary", () => ops.pow(V.array(GArray.of([V.int(1)])), dictOf([[V.int(1), V.int(1)]])), "E:Invalid operands 'Array' and 'Dictionary' in operator '**'."],
  ["Dictionary ** bool", () => ops.pow(dictOf([[V.int(1), V.int(1)]]), V.bool(true)), "E:Invalid operands 'Dictionary' and 'bool' in operator '**'."],
  ["Dictionary ** int", () => ops.pow(dictOf([[V.int(1), V.int(1)]]), V.int(2)), "E:Invalid operands 'Dictionary' and 'int' in operator '**'."],
  ["Dictionary ** float", () => ops.pow(dictOf([[V.int(1), V.int(1)]]), V.float(1.5)), "E:Invalid operands 'Dictionary' and 'float' in operator '**'."],
  ["Dictionary ** String", () => ops.pow(dictOf([[V.int(1), V.int(1)]]), V.str("a")), "E:Invalid operands 'Dictionary' and 'String' in operator '**'."],
  ["Dictionary ** Array", () => ops.pow(dictOf([[V.int(1), V.int(1)]]), V.array(GArray.of([V.int(1)]))), "E:Invalid operands 'Dictionary' and 'Array' in operator '**'."],
  ["Dictionary ** Dictionary", () => ops.pow(dictOf([[V.int(1), V.int(1)]]), dictOf([[V.int(1), V.int(1)]])), "E:Invalid operands 'Dictionary' and 'Dictionary' in operator '**'."],
  ["bool in bool", () => ops.inOp(V.bool(true), V.bool(true)), "E:Invalid operands 'bool' and 'bool' in operator 'in'."],
  ["bool in int", () => ops.inOp(V.bool(true), V.int(2)), "E:Invalid operands 'bool' and 'int' in operator 'in'."],
  ["bool in float", () => ops.inOp(V.bool(true), V.float(1.5)), "E:Invalid operands 'bool' and 'float' in operator 'in'."],
  ["bool in String", () => ops.inOp(V.bool(true), V.str("a")), "E:Invalid operands 'bool' and 'String' in operator 'in'."],
  ["bool in Array", () => ops.inOp(V.bool(true), V.array(GArray.of([V.int(1)]))), "V:false"],
  ["bool in Dictionary", () => ops.inOp(V.bool(true), dictOf([[V.int(1), V.int(1)]])), "V:false"],
  ["int in bool", () => ops.inOp(V.int(2), V.bool(true)), "E:Invalid operands 'int' and 'bool' in operator 'in'."],
  ["int in int", () => ops.inOp(V.int(2), V.int(2)), "E:Invalid operands 'int' and 'int' in operator 'in'."],
  ["int in float", () => ops.inOp(V.int(2), V.float(1.5)), "E:Invalid operands 'int' and 'float' in operator 'in'."],
  ["int in String", () => ops.inOp(V.int(2), V.str("a")), "E:Invalid operands 'int' and 'String' in operator 'in'."],
  ["int in Array", () => ops.inOp(V.int(2), V.array(GArray.of([V.int(1)]))), "V:false"],
  ["int in Dictionary", () => ops.inOp(V.int(2), dictOf([[V.int(1), V.int(1)]])), "V:false"],
  ["float in bool", () => ops.inOp(V.float(1.5), V.bool(true)), "E:Invalid operands 'float' and 'bool' in operator 'in'."],
  ["float in int", () => ops.inOp(V.float(1.5), V.int(2)), "E:Invalid operands 'float' and 'int' in operator 'in'."],
  ["float in float", () => ops.inOp(V.float(1.5), V.float(1.5)), "E:Invalid operands 'float' and 'float' in operator 'in'."],
  ["float in String", () => ops.inOp(V.float(1.5), V.str("a")), "E:Invalid operands 'float' and 'String' in operator 'in'."],
  ["float in Array", () => ops.inOp(V.float(1.5), V.array(GArray.of([V.int(1)]))), "V:false"],
  ["float in Dictionary", () => ops.inOp(V.float(1.5), dictOf([[V.int(1), V.int(1)]])), "V:false"],
  ["String in bool", () => ops.inOp(V.str("a"), V.bool(true)), "E:Invalid operands 'String' and 'bool' in operator 'in'."],
  ["String in int", () => ops.inOp(V.str("a"), V.int(2)), "E:Invalid operands 'String' and 'int' in operator 'in'."],
  ["String in float", () => ops.inOp(V.str("a"), V.float(1.5)), "E:Invalid operands 'String' and 'float' in operator 'in'."],
  ["String in String", () => ops.inOp(V.str("a"), V.str("a")), "V:true"],
  ["String in Array", () => ops.inOp(V.str("a"), V.array(GArray.of([V.int(1)]))), "V:false"],
  ["String in Dictionary", () => ops.inOp(V.str("a"), dictOf([[V.int(1), V.int(1)]])), "V:false"],
  ["Array in bool", () => ops.inOp(V.array(GArray.of([V.int(1)])), V.bool(true)), "E:Invalid operands 'Array' and 'bool' in operator 'in'."],
  ["Array in int", () => ops.inOp(V.array(GArray.of([V.int(1)])), V.int(2)), "E:Invalid operands 'Array' and 'int' in operator 'in'."],
  ["Array in float", () => ops.inOp(V.array(GArray.of([V.int(1)])), V.float(1.5)), "E:Invalid operands 'Array' and 'float' in operator 'in'."],
  ["Array in String", () => ops.inOp(V.array(GArray.of([V.int(1)])), V.str("a")), "E:Invalid operands 'Array' and 'String' in operator 'in'."],
  ["Array in Array", () => ops.inOp(V.array(GArray.of([V.int(1)])), V.array(GArray.of([V.int(1)]))), "V:false"],
  ["Array in Dictionary", () => ops.inOp(V.array(GArray.of([V.int(1)])), dictOf([[V.int(1), V.int(1)]])), "V:false"],
  ["Dictionary in bool", () => ops.inOp(dictOf([[V.int(1), V.int(1)]]), V.bool(true)), "E:Invalid operands 'Dictionary' and 'bool' in operator 'in'."],
  ["Dictionary in int", () => ops.inOp(dictOf([[V.int(1), V.int(1)]]), V.int(2)), "E:Invalid operands 'Dictionary' and 'int' in operator 'in'."],
  ["Dictionary in float", () => ops.inOp(dictOf([[V.int(1), V.int(1)]]), V.float(1.5)), "E:Invalid operands 'Dictionary' and 'float' in operator 'in'."],
  ["Dictionary in String", () => ops.inOp(dictOf([[V.int(1), V.int(1)]]), V.str("a")), "E:Invalid operands 'Dictionary' and 'String' in operator 'in'."],
  ["Dictionary in Array", () => ops.inOp(dictOf([[V.int(1), V.int(1)]]), V.array(GArray.of([V.int(1)]))), "V:false"],
  ["Dictionary in Dictionary", () => ops.inOp(dictOf([[V.int(1), V.int(1)]]), dictOf([[V.int(1), V.int(1)]])), "V:false"],
];

describe("运行期那一句与那一个值", () => {
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
    eq("401", "不合数", bad + (bad > 0 ? ` 首格[${firstBad}]` : ""), 0);
  });
});
