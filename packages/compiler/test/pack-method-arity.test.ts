/**
 * pack 方法的元数属**解析期**那一族（S376）：出货此前一路放到运行期，发的是中文自述 `<名>() 需要 N 个参数（收到 M 个）`。
 * 尺 `tmp/probe-pack/{sweep,arity,arity2,arity3,arity4}.mts`，读数 `tmp/probe-pack/{sweep.json,compare16.txt,compare18.txt,compare19.txt}` 与 `arity2.log`。
 * 两侧都是九支逐支量过的：「至少」六支在 sweep、byte / int32 / string 在 compare18；「至多」三支在 compare16 / arity2、其余五支在 compare19。
 */
import { describe, it } from "vitest";
import { eq } from "@gds2js/testkit";
import { analyze } from "@gds2js/compiler/lower/analyze";
import { lower } from "@gds2js/compiler/lower/lower";
import { parseSource } from "@gds2js/compiler/parse/parser";

async function diags(src: string): Promise<string[]> {
  return analyze(lower(await parseSource(src))).map((d) => d.message);
}

const H = "extends SceneTree\n\n";
const MOD = (decl: string, call: string): string => `${H}func _initialize():\n${decl}\n\t${call}\n\tquit()\n`;
const INFERRED = "\tvar s = PackedInt64Array([1, 2, 3])";
const ANNOTATED = "\tvar s: PackedInt64Array = PackedInt64Array([1, 2, 3])";

describe("pack 的元数两句照引擎原文", () => {
  it("少给：推断出来的接收者", async () => {
    eq("376", "append 零参", (await diags(MOD(INFERRED, "s.append()")))[0] ?? "没拒", 'Too few arguments for "append()" call. Expected at least 1 but received 0.');
    eq("376", "insert 一参", (await diags(MOD(INFERRED, "s.insert(0)")))[0] ?? "没拒", 'Too few arguments for "insert()" call. Expected at least 2 but received 1.');
  });

  it("少给：带标注的接收者与构造式接收者同一句", async () => {
    eq("376", "标注接收者", (await diags(MOD(ANNOTATED, "s.append()")))[0] ?? "没拒", 'Too few arguments for "append()" call. Expected at least 1 but received 0.');
    eq("376", "构造式接收者", (await diags(MOD("", "print(PackedInt64Array([1, 2]).append())")))[0] ?? "没拒", 'Too few arguments for "append()" call. Expected at least 1 but received 0.');
  });

  it("多给：上限逐名钉住", async () => {
    eq("376", "append 两参", (await diags(MOD(INFERRED, "s.append(1, 2)")))[0] ?? "没拒", 'Too many arguments for "append()" call. Expected at most 1 but received 2.');
    eq("376", "size 一参", (await diags(MOD(INFERRED, "s.size(1)")))[0] ?? "没拒", 'Too many arguments for "size()" call. Expected at most 0 but received 1.');
    eq("376", "insert 三参", (await diags(MOD(INFERRED, "s.insert(0, 1, 2)")))[0] ?? "没拒", 'Too many arguments for "insert()" call. Expected at most 2 but received 3.');
  });

  it("slice 的上限是 2 不是 3：pack 那支没有 step", async () => {
    eq("376", "slice 四参", (await diags(MOD(INFERRED, "s.slice(0, 1, 1, 1)")))[0] ?? "没拒", 'Too many arguments for "slice()" call. Expected at most 2 but received 4.');
    eq("376", "slice 两参合法", await diags(MOD(INFERRED, "print(s.slice(0, 1))")), []);
  });

  it("带默认实参那三名的第二参合法", async () => {
    eq("376", "find 两参", await diags(MOD(INFERRED, "print(s.find(1, 0))")), []);
    eq("376", "rfind 两参", await diags(MOD(INFERRED, "print(s.rfind(1, 0))")), []);
    eq("376", "bsearch 两参", await diags(MOD(INFERRED, "print(s.bsearch(1, true))")), []);
    eq("376", "find 三参才拒", (await diags(MOD(INFERRED, "print(s.find(1, 0, 0))")))[0] ?? "没拒", 'Too many arguments for "find()" call. Expected at most 2 but received 3.');
  });

  it("to_byte_array 八支有、byte 那一支不进元数表（引擎说没这名字，由运行时发）", async () => {
    eq("376", "int64 支多给一参", (await diags(MOD(INFERRED, "print(s.to_byte_array(1))")))[0] ?? "没拒", 'Too many arguments for "to_byte_array()" call. Expected at most 0 but received 1.');
    const byte = MOD("\tvar b = PackedByteArray([1, 2])", "print(b.to_byte_array())");
    eq("376", "byte 支不发元数句", await diags(byte), []);
  });

  it("九支都用同一张表", async () => {
    for (const type of ["PackedByteArray", "PackedInt32Array", "PackedFloat32Array", "PackedFloat64Array", "PackedStringArray", "PackedVector2Array", "PackedVector3Array", "PackedColorArray"]) {
      const src = MOD(`\tvar s = ${type}([])`, "s.append()");
      eq("376", `${type} 少给`, (await diags(src))[0] ?? "没拒", 'Too few arguments for "append()" call. Expected at least 1 but received 0.');
    }
  });
});

// 类名直调 pack 的方法（`PackedInt64Array.size()`）引擎给的是与值类型五支同文的两句，读数在 `tmp/probe-pack/arity2.log` 第 07–09 格；
// 出货现在给的是 `Identifier "PackedInt64Array" not declared in the current scope.`。接它要动 `STATIC_VALUE_TYPES`，
// 而那张表还喂着 `staticType` 的构造调用折算（注释明写 pack 构造式一律 null），所以本轮不接，记在 §6 第 34 条①。
