/**
 * bool 比较一族的**运行期**那一层（S361，读数 `tmp/probe-argtype/boolfamily.txt`，尺 `fold35.mts`：21 格全部「一格一份脚本一次 spawn」——
 * 这一族既有解析期拒（一句废整份脚本）也有运行期拒，混在一份脚本里分不出是谁）。
 * 钉三件事：① 装箱 bool 的 `<` / `>` 是**合式**的、false 在前（`bsearch` / `min` / `max` / `sort_custom` 全按这条走）；
 * ② `<=` / `>=` 才是运行期拒，句子是标准的 `Invalid operands 'bool' and 'bool' in operator '<='.`（`>=` 同形各说自己的名）；
 * ③ null 对 bool 也是拒（`Invalid operands 'Nil' and 'bool' in operator '<'.`），不是「null 最小」。
 * 解析期那一层（静态已知 bool 的 `<=` / `>=`，两句不同的话）钉在 `packages/compiler/test/bool-ordering.test.ts`。
 */
import { describe, it } from "vitest";
import { eq } from "@gds2js/testkit";
import { V, type Variant } from "@gds2js/runtime/runtime/tags";
import { GArray, show } from "@gds2js/runtime/runtime/values";
import { method } from "@gds2js/runtime/runtime/methods";
import { callableOf } from "@gds2js/runtime/runtime/class/object/script-object";
import { isLess, ops, sortLess } from "@gds2js/runtime/runtime/ops";

const B = (v: boolean): Variant => V.bool(v);
const bools = (...vs: Variant[]): Variant => V.array(GArray.of(vs));

function errOf(f: () => unknown): string {
  try {
    f();
    return "没抛";
  } catch (e) {
    return (e as Error).message;
  }
}

describe("runtime/ops · 装箱 bool 的比较一族", () => {
  it("false < true 与 true > false 都是合式比较（引擎给值）", () => {
    eq("364", "false < true", String(ops.lt(B(false), B(true)).v), "true");
    eq("364", "true > false", String(ops.gt(B(true), B(false)).v), "true");
    eq("364", "false > true", String(ops.gt(B(false), B(true)).v), "false");
    eq("364", "isLess(false, true)", isLess(B(false), B(true)), true);
    eq("364", "同值不相上下", String(ops.lt(B(true), B(true)).v), "false");
  });

  it("<= 与 >= 是运行期那一句（各自命名自己的运算符）", () => {
    eq("364", "false <= true", errOf(() => ops.lte(B(false), B(true))), "Invalid operands 'bool' and 'bool' in operator '<='.");
    eq("364", "true >= false", errOf(() => ops.gte(B(true), B(false))), "Invalid operands 'bool' and 'bool' in operator '>='.");
  });

  it("null 对 bool 仍是拒，不是「null 最小」", () => {
    eq("364", "null < true", errOf(() => ops.lt(V.nil(), B(true))), "Invalid operands 'Nil' and 'bool' in operator '<'.");
  });

  it("bsearch 按 false 在前走（五格引擎读数）", () => {
    eq("364", "[false, true].bsearch(true)", method(bools(B(false), B(true)), "bsearch", [B(true)]).v, 1);
    eq("364", "[false, true].bsearch(false)", method(bools(B(false), B(true)), "bsearch", [B(false)]).v, 0);
    eq("364", "[false, true].bsearch(true, false)", method(bools(B(false), B(true)), "bsearch", [B(true), B(false)]).v, 2);
    eq("364", "[true, false].bsearch(true)", method(bools(B(true), B(false)), "bsearch", [B(true)]).v, 2);
    eq("364", "[1, 2].bsearch(true)", method(V.array(GArray.of([V.int(1n), V.int(2n)])), "bsearch", [B(true)]).v, 0);
  });

  it("min() / max() / find() / count() 四支消费方", () => {
    eq("364", "[false, true].min()", show(method(bools(B(false), B(true)), "min", [])), "false");
    eq("364", "[true, true, false].max()", show(method(bools(B(true), B(true), B(false)), "max", [])), "true");
    eq("364", "[false, true].find(true)", method(bools(B(false), B(true)), "find", [B(true)]).v, 1);
    eq("364", "[false, true].count(true)", method(bools(B(false), B(true)), "count", [B(true)]).v, 1);
  });

  it("sort_custom 里 a < b 对 bool 比得出来", () => {
    const g = GArray.of([B(true), B(false)]);
    // 走的是产品那条 dispatch：脚本写 `func(a, b): return a < b` 时运行时拿到的是 Variant，比较位按 truthyOf 折成布尔
    method(V.array(g), "sort_custom", [callableOf((as: Variant[]): Variant => ops.lt(as[0] as Variant, as[1] as Variant), 2)]);
    eq("364", "sort_custom(func(a, b): return a < b)", show(V.array(g)), "[false, true]");
    const h = GArray.of([B(true), B(false)]);
    h.sort(sortLess);
    eq("364", "sort() 的 bool 支（S357 钉过，一字没动）", show(V.array(h)), "[false, true]");
  });
});
