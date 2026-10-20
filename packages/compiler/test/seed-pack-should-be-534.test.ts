/**
 * ① `seed()` 的解析期句（S534）：int 形参收 {int,float,bool}；值型 / String / StringName / NodePath / null
 *    走 AS 双句（`Cannot pass …` + `should be "int"`）；Array / Dictionary / 九支 pack 只发第二句；名字实参只发第二句。
 * ② 既有 int/float 全局的 SHOULD_BE 行补上**九支 pack**（此前只列 Array/Dictionary）：`rand_from_seed(PackedByteArray([1]))`
 *    等引擎发 `should be "int"/"float" but is "<pack>"`，我们全放过。
 * 尺 `tmp/d6/s534b.py` + 逐 pack 对账；`seed` 是 void，测试用裸语句（`var r = seed()` 会先撞 void 返回那句）。
 */
import { describe, it } from "vitest";
import { eq } from "@gds2js/testkit";
import { analyze } from "@gds2js/compiler/lower/analyze";
import { lower } from "@gds2js/compiler/lower/lower";
import { parseSource } from "@gds2js/compiler/parse/parser";

async function msgs(stmt: string): Promise<string[]> {
  return analyze(lower(await parseSource(`extends SceneTree\n\nfunc c():\n\t${stmt}\n`))).map((d) => d.message).sort();
}
async function msgsModule(body: string): Promise<string[]> {
  return analyze(lower(await parseSource(`extends SceneTree\n\n${body}\n`))).map((d) => d.message).sort();
}

const SEED_CANNOT = (k: string): string => `Cannot pass a value of type "${k}" as "int".`;
const SEED_SHOULD = (k: string): string => `Invalid argument for "seed()" function: argument 1 should be "int" but is "${k}".`;
const SECOND = (fn: string, k: string, want = "int"): string =>
  `Invalid argument for "${fn}()" function: argument 1 should be "${want}" but is "${k}".`;

describe("seed() 的解析期句与 int/float 全局的 pack 字面量（S534）", () => {
  it("seed(Color)：AS 双句", async () => eq("534", "seed Color", await msgs("seed(Color(1, 0, 0))"), [SEED_CANNOT("Color"), SEED_SHOULD("Color")].sort()));
  it("seed(Vector2)：AS 双句", async () => eq("534", "seed Vector2", await msgs("seed(Vector2(1, 2))"), [SEED_CANNOT("Vector2"), SEED_SHOULD("Vector2")].sort()));
  it("seed(null)：AS 双句", async () => eq("534", "seed null", await msgs("seed(null)"), [SEED_CANNOT("null"), SEED_SHOULD("null")].sort()));
  it("seed(Array)：只第二句", async () => eq("534", "seed Array", await msgs("seed([1])"), [SEED_SHOULD("Array")]));
  it("seed(Dictionary)：只第二句", async () => eq("534", "seed Dict", await msgs("seed({1: 2})"), [SEED_SHOULD("Dictionary")]));
  it("seed(PackedByteArray)：只第二句", async () => eq("534", "seed pack", await msgs("seed(PackedByteArray([1]))"), [SEED_SHOULD("PackedByteArray")]));
  it("seed(int/float/bool)：收", async () => eq("534", "seed int", await msgs("seed(1)\n\tseed(1.5)\n\tseed(true)"), []));
  it("seed(名字 Color)：只第二句", async () => eq("534", "seed name", await msgsModule("var w: Color\n\nfunc d():\n\tseed(w)"), [SEED_SHOULD("Color")]));

  it("rand_from_seed(PackedByteArray)：第二句", async () => eq("534", "rfs pack", await msgs("var r = rand_from_seed(PackedByteArray([1]))"), [SECOND("rand_from_seed", "PackedByteArray")]));
  it("type_string(PackedInt32Array)：第二句", async () => eq("534", "ts pack", await msgs("var r = type_string(PackedInt32Array([1]))"), [SECOND("type_string", "PackedInt32Array")]));
  it("randi_range(PackedByteArray, 2)：第二句", async () => eq("534", "rir pack", await msgs("var r = randi_range(PackedByteArray([1]), 2)"), [SECOND("randi_range", "PackedByteArray")]));
  it("randf_range(PackedColorArray, 1.0)：第二句 float", async () => eq("534", "rfr pack", await msgs("var r = randf_range(PackedColorArray([Color(1, 0, 0)]), 1.0)"), [SECOND("randf_range", "PackedColorArray", "float")]));
  it("error_string(PackedByteArray)：第二句", async () => eq("534", "es pack", await msgs("var r = error_string(PackedByteArray([1]))"), [SECOND("error_string", "PackedByteArray")]));
});
