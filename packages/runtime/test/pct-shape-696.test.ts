// `%` 格式化失败的**形状**分两岔（S696，尺 `tmp/probe719/{p,q,t,s}.gd` + `tmp/probe720/{x,y,z2}.gd` 两侧逐格对读）：
// 两侧都是静态已知的非 Variant 型 → 引擎推一块非致命 ERROR（`at:` 行号按实参那一格分三档：Nil 742、Array 770、其余 829），脚本照跑、回值是格式串原样；
// 任一侧是 Variant（无标注的声明与形参、`Variant` 标注、无标注或 `-> Variant` 的脚本函数调用、无内型的 Array/Dictionary 下标读）→ SCRIPT ERROR 那一句，作废当前那支函数。
// 旗标是发射期定的：同一个 runtime 值走哪条路看的是**静态型**，运行期分不出来（`fs % vs` 与 `fs % a` 两侧 runtime 值一模一样、形状却不同）。
import { describe, it } from "vitest";
import { eq } from "@gds2js/testkit";
import { ops } from "@gds2js/runtime/runtime/ops";
import { GArray, show } from "@gds2js/runtime/runtime/values";
import { V } from "@gds2js/runtime/runtime/tags";

function block(f: () => unknown): { text: string; lines: string[] } {
  const writes: string[] = [];
  const old = process.stderr.write;
  process.stderr.write = ((c: unknown) => {
    writes.push(String(c));
    return true;
  }) as typeof process.stderr.write;
  let text = "";
  try {
    text = show(f() as never);
  } catch (e) {
    text = `THROW:${String((e as Error).message)}`;
  } finally {
    process.stderr.write = old;
  }
  return { text, lines: writes.join("").replace(/\r/g, "").split("\n").filter(Boolean) };
}

describe("运行期 `%`：静态/动态两形与三档 at:（S696）", () => {
  it("静态两侧：非致命那块、回原格式串，at: 行号按实参那一格分三档", () => {
    const scalar = block(() => ops.mod(V.str("%q"), V.int(7), true));
    eq("696", "标量实参的回值", scalar.text, "%q");
    eq("696", "标量实参那一块", [scalar.lines[0] ?? "", scalar.lines[1] ?? ""], [
      "ERROR: String formatting error: unsupported format character.",
      "   at: validated_evaluate (core/variant/variant_op.h:829)",
    ]);
    const nil = block(() => ops.mod(V.str("%q"), V.nil(), true));
    eq("696", "Nil 实参的回值", nil.text, "%q");
    eq("696", "Nil 实参那一格的行号", (nil.lines[1] ?? "").includes(":742"), true);
    const arr = block(() => ops.mod(V.str("%d %d"), V.array(GArray.of([V.int(1)])), true));
    eq("696", "Array 实参的回值", arr.text, "%d %d");
    eq("696", "Array 实参那一格的行号", (arr.lines[1] ?? "").includes(":770"), true);
  });

  it("任一侧是 Variant：发的是 SCRIPT ERROR 那一句，不打那块", () => {
    const bad = block(() => ops.mod(V.str("%q"), V.int(7), false));
    eq("696", "坏转换符", bad.text, "THROW:unsupported format character in operator '%'.");
    eq("696", "动态那一形不打那块", bad.lines.length, 0);
    const notAll = block(() => ops.mod(V.str("s"), V.nil(), false));
    eq("696", "多出来的实参", notAll.text, "THROW:not all arguments converted during string formatting in operator '%'.");
    const notEnough = block(() => ops.mod(V.str("%d %d"), V.array(GArray.of([V.int(1)])), false));
    eq("696", "元素不够", notEnough.text, "THROW:not enough arguments for format string in operator '%'.");
  });
});
