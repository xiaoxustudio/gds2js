/**
 * S316 / S318 · 换行族的落点：成对括号之外，`=`（裸的与十一种复合）、`:` 型注、运算符与
 * if / elif / while / for / match / when / in 之后换行，引擎在解析期就拒。十九格语料（304–313、316–324）
 * 把句子钉在 godot.txt 上，本文件**从 golden 里取句子**再比，不在测试里抄一遍引擎原文；
 * 括号内换行的二十形则要求我们一个都不许拦。
 */
import { readFileSync } from "node:fs";
import { afterAll, describe, expect, it } from "vitest";
import { analyze } from "@gds2js/compiler/analyze";
import { lower } from "@gds2js/compiler/lower/lower";
import { parseSource } from "@gds2js/compiler/parse/parser";
import { UnsupportedError } from "@gds2js/runtime/runtime/errors";
import { caseScript, cases, readGolden } from "./support/corpus";

const MOD = (body: string): string => `extends SceneTree\n\nfunc _initialize():\n\t${body}\n\tquit()\n`;
const HEAD_ = "extends SceneTree\n\nfunc _initialize():\n";
const TAIL_ = "\n\tquit()\n";

const refuse = async (src: string): Promise<string | null> => {
  try {
    analyze(lower(await parseSource(src))).diagnostics;
    return null;
  } catch (e) {
    return e instanceof UnsupportedError ? e.message : `非拒答：${e instanceof Error ? e.message : String(e)}`;
  }
};

const engineSentence = (golden: string): string => golden.match(/Parse Error: (.*)/)?.[1]?.trim() ?? "";

let goldenCells = 0;
let legalCells = 0;
let sameSentenceCells = 0;
let alsoRefusedCells = 0;

describe("换行落点 · 与语料 golden 同句", () => {
  const ids = cases.filter((id) => id.includes("-eol-after-") || id.includes("-eol-before-"));
  expect(ids.length, "语料里的换行格应当是二十二格").toBe(22);
  it.each(ids)("%s", async (id) => {
    const engine = engineSentence(readGolden(id) ?? "");
    expect(engine, `[${id}] golden 里没有 Parse Error 那句`).not.toBe("");
    const ours = await refuse(readFileSync(caseScript(id), "utf8"));
    expect(ours, `[${id}] 拒答句子与引擎不一致`).toBe(engine);
    goldenCells++;
  });
});

/** 引擎同句的其余落点（`tmp/probe-eol/readings.txt`）：换行前后的值形态不同，句子一个字不变。 */
describe("换行落点 · 同句的其余形态", () => {
  const VAR = 'Expected expression for variable initial value after "=".';
  const CELLS: Array<[string, string, string]> = [
    ["var 换行接字典", MOD("var a =\n\t{\"x\": 1}"), VAR],
    ["var 换行接数组", MOD("var a =\n\t[1, 2]"), VAR],
    ["var 换行接调用", MOD("var a =\n\tstr(1)"), VAR],
    ["var 换行接括号", MOD("var a =\n\t(1 + 2)"), VAR],
    ["var 换行接负数", MOD("var a =\n\t-1"), VAR],
    ["var 换行接字符串", MOD('var a =\n"x"'), VAR],
    ["var 换行接定形值", MOD("var v: Vector2 =\nVector2(1, 2)"), VAR],
    ["var 换行后深缩进", MOD("var a =\n\t\t\t1"), VAR],
    ["定形 var 换行接值", MOD("var a: int =\n1"), VAR],
    ["换行后夹注释", MOD("var a =\n\t# 注释\n\t1"), VAR],
    ["乘号后换行", MOD("var a = 1 *\n2"), 'Expected expression after "*" operator.'],
    ["and 后换行", MOD("var a = true and\nfalse"), 'Expected expression after "and" operator.'],
    ["减号后换行", MOD("var a = -\n2"), 'Expected expression after "-" operator.'],
    ["match 主题前换行", HEAD_ + "\tmatch\n\t1:\n\t\t1:\n\t\t\tprint(1)" + TAIL_, 'Expected expression to test after "match".'],
    ["when 条件前换行", HEAD_ + "\tmatch 1:\n\t\t1 when\n\t\ttrue:\n\t\t\tprint(1)" + TAIL_, 'Expected expression for pattern guard after "when".'],
    ["for…in 之后换行", HEAD_ + "\tfor i in\n\t\trange(1):\n\t\tprint(1)" + TAIL_, 'Expected iterable after "in".'],
  ];
  const AUG = 'Expected an expression after "=".';
  for (const op of ["+=", "-=", "*=", "/=", "%=", "**=", "<<=", ">>=", "&=", "|=", "^="]) {
    CELLS.push([`复合赋值 ${op} 后换行`, HEAD_ + `\tvar a = 8\n\ta ${op}\n\t2\n\tprint(a)` + TAIL_, AUG]);
  }
  CELLS.push(["下标左值的复合赋值", HEAD_ + "\tvar a = [0]\n\ta[0] +=\n\t1\n\tprint(a)" + TAIL_, AUG]);
  CELLS.push(["字典左值的裸赋值", HEAD_ + '\tvar d = {"x": 0}\n\td["x"] =\n\t1\n\tprint(d)' + TAIL_, AUG]);
  CELLS.push(["if 括号收尾后冒号另起", HEAD_ + "\tif (\ntrue\n)\n\t:\n\t\tprint(1)" + TAIL_, 'Expected ":" after "if" condition.']);
  CELLS.push(["while 括号收尾后冒号另起", HEAD_ + "\twhile (\nn < 2\n)\n\t:\n\t\tprint(1)" + TAIL_, 'Expected ":" after "while" condition.']);
  CELLS.push(["for 数组收尾后冒号另起", HEAD_ + "\tfor i in [\n1\n]\n\t:\n\t\tprint(1)" + TAIL_, 'Expected ":" after "for" condition.']);
  CELLS.push(["多行数组主题后冒号另起", HEAD_ + "\tmatch [1,\n2]\n\t:\n\t\t[1, 2]:\n\t\t\tprint(1)" + TAIL_, 'Expected ":" after "match" expression.']);
  CELLS.push(["守卫括号收尾后冒号另起", HEAD_ + "\tmatch 1:\n\t\t1 when (\ntrue\n)\n\t\t:\n\t\t\tprint(1)" + TAIL_, 'Expected ":" after "match" pattern guard.']);
  CELLS.push(["嵌套内部类冒号另起", "extends SceneTree\n\nfunc _initialize():\n\tquit()\n\nclass Outer extends RefCounted:\n\tclass Inner extends RefCounted\n\t:\n\t\tvar a = 1\n", 'Expected ":" after class declaration.']);
  CELLS.push(["func 头后冒号另起走别的句子", "extends SceneTree\n\nfunc f()\n:\n\tprint(2)\n\nfunc _initialize():\n\tf()\n\tquit()\n", "顶层节点 ERROR 未支持"]);
  CELLS.push(["static func 头后冒号另起同句", "extends SceneTree\n\nstatic func f()\n:\n\tprint(2)\n\nfunc _initialize():\n\tprint(3)\n\tquit()\n", "顶层节点 ERROR 未支持"]);
  it.each(CELLS)("%s", async (_label, src, engine) => {
    expect(await refuse(src), `${_label} 的句子与引擎不一致`).toBe(engine);
    sameSentenceCells++;
  });
});

/** 引擎在解析期也拒、但句子归别的落点管：三形都要求我们响亮拒（句子可以不同，放过就是漏报）。 */
describe("换行落点 · 别处的句子同样响亮拒", () => {
  const CELLS: Array<[string, string]> = [
    ["声明后接逗号换行", MOD("var a = 1,\n2")],
    ["名字与调用括号之间换行", MOD("var s = str\n(1)")],
    ["型注之后换行再接赋值", MOD("var a: int\n= 1")],
  ];
  it.each(CELLS)("%s", async (_label, src) => {
    expect(await refuse(src), `${_label} 不该放过`).not.toBeNull();
    alsoRefusedCells++;
  });
});

/** 括号里的换行二十形（`tmp/probe-eol/readings2.txt` / `run6.mts` + 语料 314）：引擎全放行，我们一个都不许多拦。 */
describe("括号内换行 · 全部放行", () => {
  const CELLS: Array<[string, string]> = [
    ["数组元素之间换行", MOD("var a = [1,\n2]")],
    ["数组元素竖排", MOD("var a = [\n1,\n2\n]")],
    ["数组里运算符后换行", MOD("var a = [1 +\n2]")],
    ["字典花括号后换行", MOD('var a = {\n"x": 1\n}')],
    ["字典键值之间换行", MOD('var a = {\n"x":\n1\n}')],
    ["实参竖排", MOD("print(\n1,\n2\n)")],
    ["调用左括号后换行", MOD("var a = str(\n1)")],
    ["实参里 and 后换行", MOD("var b = true\n\tprint(\nb and\ntrue\n)")],
    ["括号里运算符后换行", MOD("var a = (1 +\n2)")],
    ["下标里换行", MOD("var a = [7, 8]\n\tprint(a[\n2 - 1\n])")],
    ["if 的左括号后换行", MOD("var b = true\n\tif (\nb):\n\t\tprint(1)")],
    ["while 的左括号后换行", MOD("var n = 0\n\twhile (\nn < 1):\n\t\tprint(n)\n\t\tbreak")],
    ["for 的数组竖排", MOD("for i in [\n10,\n20\n]:\n\t\tprint(i)")],
    ["for 的括号迭代子跨行", HEAD_ + "\tfor i in (\n\t\t5\n\t):\n\t\tprint(i)" + TAIL_],
    ["match 的括号主题跨行", HEAD_ + "\tmatch (\n\t\t1):\n\t\t1:\n\t\t\tprint(1)" + TAIL_],
    ["when 的括号条件跨行", HEAD_ + "\tmatch 1:\n\t\t1 when (\n\t\t\ttrue\n\t\t):\n\t\t\tprint(1)" + TAIL_],
    ["复合赋值的括号右值跨行", HEAD_ + "\tvar a = 8\n\ta += (\n\t\t2)\n\tprint(a)" + TAIL_],
    ["match 的数组手臂跨行", HEAD_ + "\tmatch [1, 2]:\n\t\t[1,\n2]:\n\t\t\tprint(1)" + TAIL_],
    ["数组手臂后冒号另起（引擎自己宽容）", HEAD_ + "\tmatch [1]:\n\t\t[1]\n\t\t:\n\t\t\tprint(1)" + TAIL_],
    ["守卫与冒号同排但条件跨行", HEAD_ + "\tmatch 1:\n\t\t1 when (\n\t\t\ttrue\n\t\t):\n\t\t\tprint(1)" + TAIL_],
    ["elif 条件跨行且冒号同排", HEAD_ + "\tvar b = false\n\tif b:\n\t\tprint(1)\n\telif (\n\tb):\n\t\tprint(2)" + TAIL_],
    ["else 与冒号同排", HEAD_ + "\tvar b = false\n\tif b:\n\t\tprint(1)\n\telse:\n\t\tprint(2)" + TAIL_],
    ["内部类冒号同排", "extends SceneTree\n\nclass Inner extends RefCounted:\n\tvar a = 1\n\nfunc _initialize():\n\tprint(Inner.new().a)\n\tquit()\n"],
  ];
  it.each(CELLS)("%s", async (_label, src) => {
    expect(await refuse(src), `${_label} 被我们误拦`).toBeNull();
    legalCells++;
  });
});

afterAll(() => {
  console.log(
    `换行族读数：golden 同句 ${goldenCells}/22 · 同句其余 ${sameSentenceCells} 格 · 别处同拒 ${alsoRefusedCells} 格 · 括号放行 ${legalCells} 形`,
  );
});
