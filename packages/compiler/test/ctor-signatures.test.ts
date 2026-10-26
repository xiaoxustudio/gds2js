/**
 * 类型构造式越界走的是第三种句子（S386）：`No constructor of "X" matches the signature "X(类型, …)".`
 * 表里只有引擎当场回了这一句的那些签名 —— 20 名 × 五形 = 100 格，一格不猜；收下的形也逐格钉住。
 * 尺 `tmp/probe-ctor/round1.mts`（一格一脚本：这是解析期拒），读数 `tmp/probe-ctor/compare35.txt` + 逐格原文 `tmp/probe-ctor/g*.txt`。
 */
import { describe, it } from "vitest";
import { eq } from "@gds2js/testkit";
import { analyze } from "@gds2js/compiler/lower/analyze";
import { lower } from "@gds2js/compiler/lower/lower";
import { parseSource } from "@gds2js/compiler/parse/parser";

const H = "extends SceneTree\n\n";

async function diags(call: string): Promise<string[]> {
  const src = `${H}func _initialize():\n\tprint(${call})\n\tquit()\n`;
  return analyze(lower(await parseSource(src))).diagnostics.map((d) => d.message);
}

const LIT: Record<string, string> = { int: "1", String: '"a"' };
const call = (name: string, types: string[]): string => `${name}(${types.map((t) => LIT[t] ?? "1").join(", ")})`;

/** `[名, 实参类型表]` —— 每一对都是从 `compare35.txt` 里「引擎回了那一句」的格子直接抄下来的 */
const REFUSED: Array<[string, string[]]> = [
  ["int", ["int", "int"]], ["int", ["int", "int", "int"]],
  ["float", ["int", "int"]], ["float", ["int", "int", "int"]],
  ["bool", ["int", "int"]], ["bool", ["int", "int", "int"]], ["bool", ["String"]],
  ["String", ["int"]], ["String", ["int", "int"]], ["String", ["int", "int", "int"]],
  ["StringName", ["int"]], ["StringName", ["int", "int"]], ["StringName", ["int", "int", "int"]],
  ["NodePath", ["int"]], ["NodePath", ["int", "int"]], ["NodePath", ["int", "int", "int"]],
  ["Array", ["int"]], ["Array", ["int", "int"]], ["Array", ["int", "int", "int"]], ["Array", ["String"]],
  ["Dictionary", ["int"]], ["Dictionary", ["int", "int"]], ["Dictionary", ["int", "int", "int"]], ["Dictionary", ["String"]],
  ["Vector2", ["int"]], ["Vector2", ["int", "int", "int"]], ["Vector2", ["String"]],
  ["Vector2i", ["int"]], ["Vector2i", ["int", "int", "int"]], ["Vector2i", ["String"]],
  ["Vector3", ["int"]], ["Vector3", ["int", "int"]], ["Vector3", ["String"]],
  ["Vector3i", ["int"]], ["Vector3i", ["int", "int"]], ["Vector3i", ["String"]],
  ["Callable", ["int"]], ["Callable", ["int", "int"]], ["Callable", ["int", "int", "int"]], ["Callable", ["String"]],
  ["Signal", ["int"]], ["Signal", ["int", "int"]], ["Signal", ["int", "int", "int"]], ["Signal", ["String"]],
  ["RID", ["int"]], ["RID", ["int", "int"]], ["RID", ["int", "int", "int"]], ["RID", ["String"]],
  ["PackedByteArray", ["int"]], ["PackedByteArray", ["int", "int"]], ["PackedByteArray", ["int", "int", "int"]], ["PackedByteArray", ["String"]],
  ["PackedInt32Array", ["int"]], ["PackedInt32Array", ["int", "int"]], ["PackedInt32Array", ["int", "int", "int"]], ["PackedInt32Array", ["String"]],
  ["PackedFloat64Array", ["int"]], ["PackedFloat64Array", ["int", "int"]], ["PackedFloat64Array", ["int", "int", "int"]], ["PackedFloat64Array", ["String"]],
  ["PackedStringArray", ["int"]], ["PackedStringArray", ["int", "int"]], ["PackedStringArray", ["int", "int", "int"]], ["PackedStringArray", ["String"]],
];

/** 同批格子里引擎放行的那些形（`Color` 五形全收；`Vector2(1, 2)` 是它自己的合法签名） */
const ACCEPTED: string[] = [
  "int()", "int(1)", 'int("a")', "float()", "float(1)", "bool()", "bool(1)",
  'String()', 'String("a")', 'StringName()', 'StringName("a")', 'NodePath()', 'NodePath("a")',
  "Array()", "Dictionary()", "Color()", "Color(1)", "Color(1, 2)", "Color(1, 2, 3)", 'Color("a")',
  "Vector2()", "Vector2(1, 2)", "Vector2i()", "Vector2i(1, 2)", "Vector3()", "Vector3(1, 2, 3)",
  "Vector3i()", "Vector3i(1, 2, 3)", "Callable()", "Signal()", "RID()",
  "PackedByteArray()", "PackedInt32Array()", "PackedFloat64Array()", "PackedStringArray()",
];

describe("实测被拒的签名逐对钉住", () => {
  it("那一句一字不差（句号在引号外）", async () => {
    for (const [name, types] of REFUSED) {
      const sig = types.join(", ");
      eq("386", call(name, types), await diags(call(name, types)), [
        `No constructor of "${name}" matches the signature "${name}(${sig})".`,
      ]);
    }
  });
});

describe("引擎放行的形不许多拦", () => {
  it("三十五形一句都不发", async () => {
    for (const c of ACCEPTED) eq("386", c, await diags(c), []);
  });
});

describe("表外的类型组合不猜", () => {
  it(`float(1.5, 2) 与 Array([1]) 照旧放过`, async () => {
    eq("386", "float(1.5, 2)", await diags("float(1.5, 2)"), []);
    eq("386", "Array([1])", await diags("Array([1])"), []);
  });

  it("用户自己写的同名函数不抢", async () => {
    eq(
      "386",
      "自定义 int 两元",
      await diagsAt(`${H}func int(a, b) -> int:\n\treturn a\n\nfunc _initialize():\n\tprint(int(1, 2))\n\tquit()\n`),
      [],
    );
  });
});

async function diagsAt(src: string): Promise<string[]> {
  return analyze(lower(await parseSource(src))).diagnostics.map((d) => d.message);
}
