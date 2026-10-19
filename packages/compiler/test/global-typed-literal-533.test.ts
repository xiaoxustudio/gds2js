/**
 * 无字面量表的「具体型全局函数」的**字面量**实参（S533，补 S526–S528 只接名字实参的缺口）：
 * `load`/`str_to_var`（期望 String）、`ord`（String）、`type_exists`（StringName）这四支在
 * `GLOBAL_ARG_TYPES`/`SENTENCE`/`AS` 里都没有行，所以字面量实参此前也放过；引擎照样解析期发
 * `argument 1 should be "<want>" but is "<K>"`（`tmp/d6/s533.py` 十五格）。
 * 实现：名字旁路对「没有任何字面量表」的函数也处理字面量；有表的函数字面量仍交回原表（不重复）。
 */
import { describe, it } from "vitest";
import { eq } from "@gds2js/testkit";
import { analyze } from "@gds2js/compiler/lower/analyze";
import { lower } from "@gds2js/compiler/lower/lower";
import { parseSource } from "@gds2js/compiler/parse/parser";

async function msgs(expr: string): Promise<string[]> {
  return analyze(lower(await parseSource(`extends SceneTree\n\nfunc c():\n\tvar r = ${expr}\n`))).map((d) => d.message).sort();
}

const CASES: Array<[string, string, string]> = [
  ["load(Color)", 'load(Color(1, 0, 0))', "Color"],
  ["load(Array)", "load([1])", "Array"],
  ["str_to_var(int)", "str_to_var(1)", "int"],
  ["ord(Array)", "ord([1])", "Array"],
  ["ord(int)", "ord(1)", "int"],
  ["type_exists(Dictionary)", "type_exists({})", "Dictionary"],
  ["type_exists(int)", "type_exists(1)", "int"],
];
const WANT: Record<string, string> = { load: "String", str_to_var: "String", ord: "String", type_exists: "StringName" };

describe("无字面量表的全局函数：字面量实参也按声明型拒（S533）", () => {
  for (const [label, expr, kind] of CASES) {
    const fn = expr.slice(0, expr.indexOf("("));
    it(`${label}：发句`, async () => {
      eq("533", label, await msgs(expr), [`Invalid argument for "${fn}()" function: argument 1 should be "${WANT[fn]}" but is "${kind}".`]);
    });
  }
  for (const [expr] of [["load(\"a\")"], ["str_to_var(\"1\")"], ["ord(\"a\")"], ['type_exists("Movable")'], ["type_exists(&\"Movable\")"]] as Array<[string]>) {
    it(`${expr}：收`, async () => {
      eq("533", expr, await msgs(expr), []);
    });
  }
});
