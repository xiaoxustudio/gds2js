// 发射期给 `%` 那一族定的形状旗标（S696，判据与读数见归档到 git 历史的语义台账 S696 行 + 尺 `tmp/probe720/{x,y,z2}.gd`）：
// 两侧都是静态已知的非 Variant 型 → 第三参 `true`（引擎那块非致命 ERROR）；任一侧是 Variant → `false`（SCRIPT ERROR 并作废旧那支函数）。
// 认不出来的形态一律 `true`（就是这一族改道前的行为），所以判据只登记**量过的那几形**：无标注的声明与形参、`Variant` 标注、
// 无标注或 `-> Variant` 的脚本函数调用、以及读 `Array` / `Dictionary`（不带内型）的那一格。`:=` 那一形是静态（X4b 两侧同文）。
import { describe, it } from "vitest";
import { eq } from "@gds2js/testkit";
import { emitModule } from "@gds2js/compiler/emit";
import { analyze } from "@gds2js/compiler/analyze";
import { lower } from "@gds2js/compiler/lower/lower";
import { parseSource } from "@gds2js/compiler/parse/parser";

const OPTS = { runtimeImport: "rt", hostImport: "host" };

async function emitted(src: string): Promise<string> {
  const ir = lower(await parseSource(src));
  const analysis = analyze(ir);
  const diags = analysis.diagnostics;
  if (diags.length > 0) throw new Error(`语义拦下：${diags[0]!.message}`);
  return emitModule(ir, OPTS, analysis);
}

const flagOf = (code: string): string => {
  const m = /rt\.(?:ops\.mod|formatOf)\([^]*?, (true|false)\)/.exec(code);
  return m === null ? "没找着那一格" : m[1] ?? "";
};

const MODS = "var fs: String = \"%q\"\nvar fu := \"%q\"\nvar lu = \"%q\"\nvar la: Array = [1]\nvar las: Array[String] = [\"a\"]\nvar dsc: Dictionary = {1: 2}\n\nfunc g():\n\treturn 7\n\nfunc gi() -> int:\n\treturn 7\n\n";
const wrap = (body: string): string => `extends SceneTree\n\n${MODS}\nfunc probe${body}\n\nfunc _initialize():\n\tquit()\n`;

describe("发射 · `%` 的形状旗标（S696）", () => {
  const ROWS: Array<[string, string, string]> = [
    ["标注 String 模块 var 左 + 无标注形参右", "(a):\n\treturn fs % a\n", "false"],
    ["标注 String 模块 var 左 + 标注 int 形参右", "(b: int):\n\treturn fs % b\n", "true"],
    ["标注 String 模块 var 左 + Variant 形参右", "(c: Variant):\n\treturn fs % c\n", "false"],
    ["`:=` 推出来的模块 var 左 + 标注 int 形参右", "(b: int):\n\treturn fu % b\n", "true"],
    ["无标注模块 var 左 + 标注 int 形参右", "(b: int):\n\treturn lu % b\n", "false"],
    ["无标注脚本函数的调用结果当右支", "():\n\treturn fs % g()\n", "false"],
    ["`-> int` 脚本函数的调用结果当右支", "():\n\treturn fs % gi()\n", "true"],
    ["读无内型 Array 的那一格", "():\n\treturn fs % la[0]\n", "false"],
    ["读定形 Array[String] 的那一格", "():\n\treturn fs % las[0]\n", "true"],
    ["读无内型 Dictionary 的那一格", "():\n\treturn fs % dsc[1]\n", "false"],
    ["字面量格式串左 + 无标注形参右", "(a):\n\treturn \"%q\" % a\n", "false"],
    ["字面量格式串左 + 标注 int 形参右", "(b: int):\n\treturn \"%q\" % b\n", "true"],
    ["右支是数组字面量", "():\n\treturn fs % [1]\n", "true"],
  ];

  for (const [label, body, want] of ROWS) {
    it(label, async () => {
      eq("696", `${label} 的旗标`, flagOf(await emitted(wrap(body))), want);
    });
  }

  it("StringName 字面量左也带旗标（走 ops.mod 那一支）", async () => {
    eq("696", "字面量 StringName 左 + 无标注右", flagOf(await emitted(wrap("(a):\n\treturn &\"%q\" % a\n"))), "false");
  });
});
