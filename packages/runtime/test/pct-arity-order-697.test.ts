// 格式化实参不够时的**判序**（S697，尺 `tmp/probe722/{a,b}.gd` 十七格静态 + 四格动态，两侧 stdout/stderr 分道逐字节）：
// 引擎按槽序走，某一槽真要取实参而取不到才发 `not enough arguments for format string`；所以占位符多于实参时，
// 先撞上的是**第一槽要的值型**那一句 —— `"%d %d" % "ab"` 给 `a number is required`，而 `"%s %s" % "ab"`（`%s` 什么都收）才给元数那句。
// 此前 `strFormat` 有一道「先数完值槽再报元数」的前置闸，把那三格（`%d`/`%c`/`%v` 配 String、bool、Dictionary）的句子报错了。
// 形状旗标与这一族无关：静态那副是 ERROR 块 + 回原格式串，动态那副是同文的 SCRIPT ERROR 并作废旧那支（S696）。
// 末尾那组顺手把**映射槽** `%(k)s` 量穿：4.6.3 的 `%` 根本不认这种写法，三格都给 `unsupported format character` + 回原格式串（尺 `tmp/probe722/m.gd`）。
import { describe, it } from "vitest";
import { eq } from "@gds2js/testkit";
import { ops } from "@gds2js/runtime/runtime/ops";
import { dictOf } from "@gds2js/runtime/runtime/methods";
import { GArray, show } from "@gds2js/runtime/runtime/values";
import { V, type Variant } from "@gds2js/runtime/runtime/tags";

const arr = (xs: Variant[]): Variant => V.array(GArray.of(xs));

function run(fmt: string, arg: Variant, soft: boolean): { text: string; fail: string } {
  const writes: string[] = [];
  const old = process.stderr.write;
  process.stderr.write = ((c: unknown) => {
    writes.push(String(c));
    return true;
  }) as typeof process.stderr.write;
  let text = "";
  let fail = "";
  try {
    text = show(ops.mod(V.str(fmt), arg, soft));
  } catch (e) {
    fail = String((e as Error).message);
  } finally {
    process.stderr.write = old;
  }
  const lines = writes.join("").replace(/\r/g, "").split("\n").filter(Boolean);
  return { text: fail !== "" ? `THROW:${fail}` : text, fail: lines[0] ?? "" };
}

describe("strFormat · 元数那句要让位给第一槽的值型那句（S697）", () => {
  const ROWS: Array<[string, string, Variant, string]> = [
    ["`%d %d` 配 int", "%d %d", V.int(7), "not enough arguments for format string"],
    ["`%s %s` 配 int", "%s %s", V.int(7), "not enough arguments for format string"],
    ["`%d %d` 配 String", "%d %d", V.str("ab"), "a number is required"],
    ["`%s %s` 配 String", "%s %s", V.str("ab"), "not enough arguments for format string"],
    ["`%d %d` 配 bool", "%d %d", V.bool(true), "a number is required"],
    ["`%d %d` 配 Dictionary", "%d %d", dictOf([[V.int(1), V.int(2)]]), "a number is required"],
    ["`%c %c` 配 int", "%c %c", V.int(7), "not enough arguments for format string"],
    ["`%c %c` 配 String", "%c %c", V.str("ab"), "%c requires number or single-character string"],
    ["`%v %v` 配 int", "%v %v", V.int(7), "%v requires a vector type (Vector2/3/4/2i/3i/4i)"],
    ["`%*d %d` 配 int", "%*d %d", V.int(7), "not enough arguments for format string"],
  ];

  it("静态那一副：块里那句按槽序，回值仍是格式串原样", () => {
    for (const [label, fmt, arg, want] of ROWS) {
      const got = run(fmt, arg, true);
      eq("697", `${label} 的那句`, got.fail, `ERROR: String formatting error: ${want}.`);
      eq("697", `${label} 的回值`, got.text, fmt);
    }
  });

  it("动态那一副同文，只多一个 ` in operator '%'.` 的尾巴并作废那支函数", () => {
    for (const [label, fmt, arg, want] of ROWS) {
      const got = run(fmt, arg, false);
      eq("697", `${label} 的那句`, got.text, `THROW:${want} in operator '%'.`);
      eq("697", `${label} 不打那块`, got.fail, "");
    }
  });

  it("够用的那一头照旧：两支数组填满两槽给值，多出来的实参与空数组各归那句", () => {
    eq("697", "`%d %d` 配两支数组", run("%d %d", arr([V.int(1), V.int(2)]), true).text, "1 2");
    eq("697", "`%d` 配空数组", run("%d", arr([]), true).fail, "ERROR: String formatting error: not enough arguments for format string.");
    eq("697", "`%s` 配两支数组", run("%s", arr([V.int(1), V.int(2)]), true).fail, "ERROR: String formatting error: not all arguments converted during string formatting.");
    eq("697", "无槽的串配一个数", run("%%", V.int(7), true).fail, "ERROR: String formatting error: not all arguments converted during string formatting.");
  });

  it("映射槽 `%(k)s` 这一族裁判压根不认（三格：字典、双槽、配 int）", () => {
    const dict = dictOf([[V.str("x"), V.int(1)], [V.str("y"), V.int(2)]]);
    const rows: Array<[string, string, Variant]> = [
      ["`%(x)s` 配字典", "%(x)s", dict],
      ["`%(x)d %(y)d` 配字典", "%(x)d %(y)d", dict],
      ["`%(x)s` 配 int", "%(x)s", V.int(7)],
    ];
    for (const [label, fmt, arg] of rows) {
      const got = run(fmt, arg, true);
      eq("697", `${label} 的那句`, got.fail, "ERROR: String formatting error: unsupported format character.");
      eq("697", `${label} 的回值`, got.text, fmt);
    }
  });
});
