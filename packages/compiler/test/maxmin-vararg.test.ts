/**
 * `max` / `min` 是变元的：解析期那一句每一位都发、但**第一位不对就停**，而 `Array` / `Dictionary` 根本不在解析期发句，
 * 走到运行期才打 `Invalid type in utility function …`（S388，尺 `tmp/probe-maxmin/{round1,round2,round3,round4}.mts`，
 * 读数 `tmp/probe-maxmin/compare{38,39,40,41}.txt`，出货对照 `tmp/probe-maxmin/ours.mts`）。
 * 上一轮 S387 逐名对表时抓到的正是这一面：`GLOBAL_CALLABLES` 把 `get_argument_count()` 那个 2 当成上界，
 * 于是三支以后的实参整条跳过类型判据 —— `max(1, 2, "a")` 编得过、透传成静默错值。
 */
import { describe, it } from "vitest";
import { eq } from "@gds2js/testkit";
import { analyze } from "@gds2js/compiler/lower/analyze";
import { lower } from "@gds2js/compiler/lower/lower";
import { parseSource } from "@gds2js/compiler/parse/parser";

const H = "extends SceneTree\n\nfunc _initialize():\n\tprint(";
const T = ")\n\tquit()\n";

async function hits(call: string): Promise<Array<{ code: string; message: string }>> {
  const diags = analyze(lower(await parseSource(`${H}${call}${T}`)));
  return diags.filter((d) => d.code === "global-arg-type" || /^Too (few|many) arguments for /.test(d.message));
}

const text = (fn: string, pos: number, got: string): string =>
  `Invalid argument for "${fn}()" function: argument ${String(pos)} should be "float" but is "${got}".`;

describe("变元每一位都判，第一位不对就停", () => {
  const CELLS: Array<[string, string]> = [
    ['max(1, 2, "a")', text("max", 3, "String")],
    ["max(1, 2, false)", text("max", 3, "bool")],
    ["max(1, 2, null)", text("max", 3, "null")],
    ['min(1, 2, 3, "a")', text("min", 4, "String")],
    ["max(1, 2, 3, null)", text("max", 4, "null")],
    ['max(&"a", 1)', text("max", 1, "StringName")],
    ['max(1, &"a")', text("max", 2, "StringName")],
    ['max(1, ^"a", 2)', text("max", 2, "NodePath")],
    ['min("a", 1)', text("min", 1, "String")],
  ];
  it("九格的句子与位号照引擎原文", async () => {
    for (const [call, want] of CELLS) {
      const got = await hits(call);
      eq("388", `${call} 只一句`, got.length, 1);
      eq("388", call, got[0]?.message, want);
    }
  });

  it("两位都坏也只推第一句", async () => {
    eq("388", "max 头尾都坏", (await hits('max("a", 1, "b")')).map((d) => d.message), [text("max", 1, "String")]);
    eq("388", "min 三坏", (await hits('min(1, 2, "x", true)')).map((d) => d.message), [text("min", 3, "String")]);
    eq("388", "max 二坏在头", (await hits('max("a", "b")')).map((d) => d.message), [text("max", 1, "String")]);
  });
});

describe("容器一出现，整支调用就交给运行期那一句", () => {
  const CELLS: string[] = [
    "max([1], 1)",
    "max(1, [1])",
    "max(1, 2, [1])",
    "min(1, 2, {1: 1})",
    "max(1, 2, [1], 3)",
    'max("a", 1, [1])',
    'min([1], "x", true)',
    'min(1, "x", [1])',
  ];
  it("解析期一句都不发（S393 把那条运行期通道接进了 rt.gMax / rt.gMin）", async () => {
    for (const call of CELLS) eq("393", call, (await hits(call)).length, 0);
  });

  it("没有容器时照旧发解析期那一句", async () => {
    eq("388", 'max(1, 2, "a")', (await hits('max(1, 2, "a")'))[0]?.message, text("max", 3, "String"));
    eq("388", 'min("a", 1)', (await hits('min("a", 1)'))[0]?.message, text("min", 1, "String"));
  });
});

describe("收的形一个都不许多拦", () => {
  it("两支到八支的整数与浮点、非字面量实参照旧编得过", async () => {
    const OK = [
      "max(1, 2)",
      "max(1, 2, 3)",
      "max(1, 2, 3, 4)",
      "max(1, 2, 3, 4, 5, 6, 7, 8)",
      "min(1.5, 2)",
      "max(1.5, 2.5, 3.5)",
      "max(1, randf())",
      "min(1, 2, 3, 4, 5)",
    ];
    for (const call of OK) eq("388", call, (await hits(call)).length, 0);
  });

  it("元数不对时先说元数那一句，类型句不许抢在前面", async () => {
    const got = await hits('min("a")');
    eq("388", "min 一支只一句", got.length, 1);
    eq("388", "min 一支", got[0]?.message, 'Too few arguments for "min()" call. Expected at least 2 but received 1.');
  });
});
