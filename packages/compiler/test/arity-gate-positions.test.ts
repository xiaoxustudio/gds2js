/**
 * 元数那两句从发射期搬到解析期之后，**每一个表达式位置**都得照样拦（S387）。
 * 发射期那道闸门天然覆盖所有位置，搬到 analyze 之后 coverage 就看走查走到哪 —— 所以逐位置钉一遍，
 * 少一个位置就等于把「响亮拒」换成「静默发出错的式子」。判据用 `abs(1, 1)`（多给一元）。
 */
import { describe, it } from "vitest";
import { eq } from "@gds2js/testkit";
import { analyze } from "@gds2js/compiler/lower/analyze";
import { lower } from "@gds2js/compiler/lower/lower";
import { parseSource } from "@gds2js/compiler/parse/parser";

const WANT = 'Too many arguments for "abs()" call. Expected at most 1 but received 2.';
const ARITY = /^Too (few|many) arguments for |^Invalid call to (GDScript )?utility function /;

async function first(src: string): Promise<string> {
  const hit = analyze(lower(await parseSource(src))).find((d) => ARITY.test(d.message));
  return hit?.message ?? "没拦";
}

const H = "extends SceneTree\n\n";
const BAD = "abs(1, 1)";

describe("每个表达式位置都拦", () => {
  it("函数体、嵌套块、循环、match 手臂、lambda 与它的默认实参", async () => {
    const cases: Array<[string, string]> = [
      ["函数体", `${H}func f():\n\tprint(${BAD})\n`],
      ["if 块里", `${H}func f(x):\n\tif x > 0:\n\t\tprint(${BAD})\n`],
      ["while 块里", `${H}func f():\n\twhile true:\n\t\tprint(${BAD})\n`],
      ["for 的迭代式", `${H}func f():\n\tfor i in [${BAD}]:\n\t\tprint(i)\n`],
      ["match 手臂", `${H}func f(x):\n\tmatch x:\n\t\t1:\n\t\t\tprint(${BAD})\n`],
      ["lambda 体", `${H}func f():\n\tvar g = func(): return ${BAD}\n\tprint(g.call())\n`],
      ["lambda 形参默认值", `${H}func f():\n\tvar g = func(a = ${BAD}): return a\n\tprint(g.call())\n`],
      ["形参默认值", `${H}func f(a = ${BAD}):\n\tprint(a)\n`],
      ["模块 var 初值", `${H}var v = ${BAD}\n`],
      ["const 初值", `${H}const C = ${BAD}\n`],
      ["static var 初值", `${H}static var S = ${BAD}\n`],
      ["内部类字段初值", `${H}class Inner:\n\tvar v = ${BAD}\n`],
      ["读写器体 get", `${H}var p:\n\tget:\n\t\treturn ${BAD}\n`],
      ["读写器体 set", `${H}var p:\n\tset(value):\n\t\tprint(${BAD})\n`],
      ["具名委托指向的方法体", `${H}func _g():\n\treturn ${BAD}\n\nvar p:\n\tget = _g\n`],
      ["数组字面量元素", `${H}func f():\n\tvar a = [1, ${BAD}]\n\tprint(a)\n`],
      ["字典字面量值", `${H}func f():\n\tvar d = {"k": ${BAD}}\n\tprint(d)\n`],
      ["二元表达式的右支", `${H}func f():\n\tprint(1 + ${BAD})\n`],
      ["await 的操作数", `${H}func f():\n\tprint(await (${BAD}))\n`],
    ];
    for (const [label, src] of cases) eq("387", label, await first(src), WANT);
  });
});

describe("合法的元数不许多拦", () => {
  it("一支 abs 与一支 abs 的调用栈那一族照旧编得过", async () => {
    eq("387", "abs(1)", await first(`${H}func f():\n\tprint(abs(1))\n`), "没拦");
    eq("387", "get_stack()", await first(`${H}func f():\n\tprint(get_stack())\n`), "没拦");
    eq("387", "str()", await first(`${H}func f():\n\tprint(str(1, 2, 3))\n`), "没拦");
  });
});

describe("utility 那通道（range / str）搬到解析期后同样逐位置拦", () => {
  it("语句位、for 的迭代式、表达式位", async () => {
    eq("387", "range 零元的语句", await first(`${H}func f():\n\trange()\n`), 'Invalid call to GDScript utility function "range()". Expected 1 argument(s).');
    eq("387", "range 四元的语句", await first(`${H}func f():\n\trange(1, 2, 3, 4)\n`), 'Invalid call to GDScript utility function "range()". Expected 3 argument(s).');
    eq("387", "range 在 for 的迭代式", await first(`${H}func f():\n\tfor i in range(1, 2, 3, 4):\n\t\tprint(i)\n`), 'Invalid call to GDScript utility function "range()". Expected 3 argument(s).');
    eq("387", "range 在表达式位", await first(`${H}func f():\n\tprint(range())\n`), 'Invalid call to GDScript utility function "range()". Expected 1 argument(s).');
    eq("387", "str 零元", await first(`${H}func f():\n\tprint(str())\n`), 'Invalid call to utility function "str()". Expected 1 argument(s).');
    for (const k of [1, 2, 3]) {
      eq("387", `range 的 ${String(k)} 元在 for 位`, await first(`${H}func f():\n\tfor i in range(${Array.from({ length: k }, (unused, j) => String(j + 1)).join(", ")}):\n\t\tprint(i)\n`), "没拦");
    }
  });
});
