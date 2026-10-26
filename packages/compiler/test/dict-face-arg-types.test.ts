/**
 * 字典侧的实参类型两句逐名过裁判（S381）：`merged` 与 `recursive_equal` 补进表，`duplicate` / `has_all` / `merge` 的 Callable 一格补齐。
 * 尺 `tmp/probe-dictface/{round1,round2}.mts`（一格一行、一次 spawn 量一批，句子按行号归格），读数 `tmp/probe-dictface/{compare27,compare28}.txt`。
 */
import { describe, it } from "vitest";
import { eq } from "@gds2js/testkit";
import { analyze } from "@gds2js/compiler/lower/analyze";
import { lower } from "@gds2js/compiler/lower/lower";
import { parseSource } from "@gds2js/compiler/parse/parser";

async function diags(call: string): Promise<string[]> {
  return analyze(lower(await parseSource(MOD(call)))).diagnostics.map((d) => d.message);
}

const H = "extends SceneTree\n\n";
// 语句形：`merge` 是 void，套进 print 会多一句取值的（那一格由 `VOID_DICT_METHODS` 管，不在本门）
const MOD = (call: string): string => `${H}func _initialize():\n\tvar d = {"k": 1}\n\t${call}\n\tquit()\n`;

const KINDS: Array<[string, string]> = [
  ["Color", "Color(1, 2, 3, 4)"], ["NodePath", '^"ab"'], ["String", '"s"'], ["StringName", '&"sn"'],
  ["Vector2", "Vector2(1, 2)"], ["Vector2i", "Vector2i(1, 2)"], ["Vector3", "Vector3(1, 2, 3)"],
  ["Vector3i", "Vector3i(1, 2, 3)"], ["bool", "true"], ["float", "1.5"], ["int", "1"], ["null", "null"],
  ["Array", "[1]"], ["Dictionary", '{"k": 1}'], ["Callable", "func(): return true"],
];
const expr = (k: string): string => (KINDS.find(([n]) => n === k)?.[1] ?? k) as string;

/** 引擎**两句都发**的那批 kind（A 式 `Cannot pass …` + B 式 `Invalid argument …`）。 */
const BOTH1 = ["Color", "NodePath", "String", "StringName", "Vector2", "Vector2i", "Vector3", "Vector3i", "bool", "float", "int", "null"];
const BOTH2 = ["Color", "NodePath", "String", "StringName", "Vector2", "Vector2i", "Vector3", "Vector3i", "null"];
/** 只发 B 式那一句的那批。 */
const ONLY_B1 = ["Array", "Callable"];
const ONLY_B2 = ["Array", "Dictionary", "Callable"];

const want = (name: string, pos: number, kind: string, slot: string): string[] => {
  const b = `Invalid argument for "${name}()" function: argument ${String(pos)} should be "${slot}" but is "${kind}".`;
  const a = `Cannot pass a value of type "${kind}" as "${slot}".`;
  return (pos === 1 ? BOTH1 : BOTH2).includes(kind) ? [a, b] : [b];
};

describe("merged 两位（上界两参与下界一参都量过）", () => {
  it("第一位：12 名两句都发、Array 与 Callable 只发 B 式、Dictionary 放行", async () => {
    for (const k of [...BOTH1, ...ONLY_B1]) {
      eq("381", `两参 ${k}`, await diags(`d.merged(${expr(k)}, true)`), want("merged", 1, k, "Dictionary"));
      eq("381", `一参 ${k}`, await diags(`d.merged(${expr(k)})`), want("merged", 1, k, "Dictionary"));
    }
    eq("381", "两参 Dictionary 合法", await diags("d.merged({}, true)"), []);
    eq("381", "一参 Dictionary 合法", await diags("d.merged({})"), []);
  });

  it("第二位：9 名两句都发、三种容器名只发 B 式、bool / float / int 放行", async () => {
    for (const k of [...BOTH2, ...ONLY_B2]) {
      eq("381", `p2 ${k}`, await diags(`d.merged({}, ${expr(k)})`), want("merged", 2, k, "bool"));
    }
    for (const k of ["bool", "float", "int"]) {
      eq("381", `p2 ${k} 放行`, await diags(`d.merged({}, ${expr(k)})`), []);
    }
  });
});

describe("recursive_equal 两位（元数只有 [2,2] 那一形可给）", () => {
  it("第一位同 merged", async () => {
    for (const k of [...BOTH1, ...ONLY_B1]) {
      eq("381", `p1 ${k}`, await diags(`d.recursive_equal(${expr(k)}, 0)`), want("recursive_equal", 1, k, "Dictionary"));
    }
    eq("381", "p1 Dictionary 放行", await diags("d.recursive_equal({}, 0)"), []);
  });

  it("第二位要的是 int：bool / float / int 放行，三种容器名只发 B 式", async () => {
    for (const k of [...BOTH2, ...ONLY_B2]) {
      eq("381", `p2 ${k}`, await diags(`d.recursive_equal({}, ${expr(k)})`), want("recursive_equal", 2, k, "int"));
    }
    for (const k of ["bool", "float", "int"]) {
      eq("381", `p2 ${k} 放行`, await diags(`d.recursive_equal({}, ${expr(k)})`), []);
    }
  });
});

describe("Callable 那一格补齐的三名", () => {
  it("duplicate / has_all / merge 的 Callable 只发 B 式", async () => {
    eq("381", "duplicate", await diags("d.duplicate(func(): return true)"), want("duplicate", 1, "Callable", "bool"));
    eq("381", "has_all", await diags("d.has_all(func(): return true)"), want("has_all", 1, "Callable", "Array"));
    eq("381", "merge p2", await diags("d.merge({}, func(): return true)"), [
      'Invalid argument for "merge()" function: argument 2 should be "bool" but is "Callable".',
    ]);
  });
});

describe("引擎放行的五位（整表一句都不该发）", () => {
  it("find_key / get_or_add / get / erase / has 的实参是 Variant", async () => {
    for (const call of [
      "d.find_key(1)", "d.find_key([])", "d.find_key({\"a\": 1})", "d.find_key(\"s\")",
      "d.get_or_add([], [])", "d.get([], [])", "d.erase([])", "d.has([])",
    ]) {
      eq("381", call, await diags(call), []);
    }
  });
});
