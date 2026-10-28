import { existsSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";
import { parseWithTreeSitter } from "@gds2js/compiler/parse/parser";
import { ROOT } from "../../../tools/lib.mjs";
import { allScripts } from "./support/corpus";
import { Cursor } from "../src/parse/descent/indent";
import { lex } from "../src/parse/descent/lexer";
import type { Tok } from "../src/parse/descent/tokens";

type Leaf = { text: string; start: number; row: number; col: number };

type CsLike = {
  type: string;
  text: string;
  isNamed: boolean;
  hasError: boolean;
  startIndex: number;
  startPosition: { row: number; column: number };
  children: CsLike[];
};

type Tally = { bad: string[]; compared: number; skipped: number; skippedTexts: Map<string, number>; hidden: number };

const CAP = 12;

function tokenize(src: string): Tok[] {
  const { tokens, issues } = lex(src);
  expect(issues, `词法层不该报问题：${JSON.stringify(issues.slice(0, 5))}`).toEqual([]);
  return tokens.filter((t) => t.kind !== "eof");
}

function leaves(n: CsLike, out: Leaf[]): void {
  if (n.children.length === 0) {
    out.push({ text: n.text, start: n.startIndex, row: n.startPosition.row, col: n.startPosition.column });
    return;
  }
  for (const c of n.children) leaves(c, out);
}

function corpus(): Array<{ id: string; src: string }> {
  return allScripts().map((p) => ({
    id: relative(join(ROOT, "corpus", "cases"), p).split("\\").join("/"),
    src: readFileSync(p, "utf8"),
  }));
}

function fixtures(file: string): Array<{ id: string; src: string }> {
  const p = join(ROOT, "packages", "compiler", "test", "fixtures", file);
  const j = JSON.parse(readFileSync(p, "utf8")) as { snippets: Array<{ id: string; src: string }> };
  return j.snippets;
}

/** oracle 的叶子序列不等于记号流：grammar.js 里 `get_node` 用的是隐藏的 `$._identifier`（:177-178,186），
 *  那些记号在树上根本不落节点；错误恢复还会插入零宽的 MISSING 叶子。所以按**子序列**对账，
 *  并把我这侧被跳过的记号逐个记账 —— 跳过的只应该是上面这两类，多一个就说明词法层漏了或多了东西。 */
async function check(inputs: Array<{ id: string; src: string }>): Promise<Tally> {
  const t: Tally = { bad: [], compared: 0, skipped: 0, skippedTexts: new Map(), hidden: 0 };
  for (const inp of inputs) {
    const tree = (await parseWithTreeSitter(inp.src)).rootNode as CsLike;
    if (tree.hasError) {
      t.hidden++;
      continue;
    }
    t.compared++;
    const want: Leaf[] = [];
    leaves(tree, want);
    const got = tokenize(inp.src).map((k) => ({ text: k.text, start: k.start, row: k.row, col: k.col }));
    let at = 0;
    let failed = false;
    for (const w of want) {
      if (w.text === "") {
        t.hidden++;
        continue;
      }
      let hit = -1;
      for (let k = at; k < got.length; k++) {
        const g = got[k]!;
        if (g.text === w.text && g.row === w.row && g.col === w.col) {
          hit = k;
          break;
        }
      }
      if (hit < 0) {
        const g = got[at];
        t.bad.push(
          `${inp.id}: oracle 叶子 ${JSON.stringify(w.text)}@${String(w.row)}:${String(w.col)} 在记号流里找不到` +
            (g === undefined ? "（流已尽）" : `，流上这个位置是 ${JSON.stringify(g.text)}@${String(g.row)}:${String(g.col)}`),
        );
        failed = true;
        break;
      }
      for (let k = at; k < hit; k++) {
        const text = got[k]!.text;
        t.skipped++;
        t.skippedTexts.set(text, (t.skippedTexts.get(text) ?? 0) + 1);
      }
      at = hit + 1;
    }
    if (failed) continue;
    for (let k = at; k < got.length; k++) {
      const text = got[k]!.text;
      t.skipped++;
      t.skippedTexts.set(text, (t.skippedTexts.get(text) ?? 0) + 1);
    }
  }
  return t;
}

function assertTally(label: string, t: Tally, expectSkipped: number): void {
  const tail = `（对账 ${String(t.compared)} 份，oracle 带 ERROR / MISSING 的 ${String(t.hidden)} 处另计）`;
  expect(t.bad.slice(0, CAP).join("\n"), `${label} 记号流零分歧${tail}`).toBe("");
  const texts = [...t.skippedTexts.entries()].sort((a, b) => b[1] - a[1]).map(([k, v]) => `${JSON.stringify(k)}×${String(v)}`).join(" ");
  expect(t.skipped, `${label} 被跳过的记号数应恒为隐藏 $._identifier 那一批，实得明细：${texts}`).toBe(expectSkipped);
}

const cur = (src: string): Cursor => new Cursor(lex(src).tokens);

const indents = (src: string): number[] => {
  const c = cur(src);
  return c.lines.map((_, li) => c.lineIndent(li));
};

/** 吃到某个记号文本为止（含它自己）。 */
function seekTo(c: Cursor, text: string): void {
  for (let guard = 0; guard < 500; guard++) {
    const t = c.take();
    if (t.text === text || t.kind === "eof") return;
  }
  throw new Error(`找不到记号 ${text}`);
}

const FULL = process.env.GDS2JS_PARSE_DIFF === "1";
const HARVEST = join(ROOT, "tmp", "parse-snippets.json");

/** 边缘形状里那 4 个是 `get_node` 的隐藏 `$._identifier`：`$Child`、`$Child/Grand` 的 Child 与 Grand、`@onready var n = $Node` 的 Node。
 *  grammar.js:177-178,186 用的是带下划线的隐藏规则，树上不落节点，所以词法层有、oracle 叶子没有。 */
const SKIP_EDGES = 4;
const SKIP_MALFORMED = 0;
const SKIP_CORPUS = 0;
const SKIP_HARVEST = 0;

describe("词法层（对账 oracle CST 的叶子序列）", () => {
  it("手写边缘形状：记号流逐字逐位相同", async () => {
    assertTally("边缘形状", await check(fixtures("parse-edges.json")), SKIP_EDGES);
  });

  it("畸形样本：干净侧记号流相同", async () => {
    assertTally("畸形样本", await check(fixtures("malformed-snippets.json")), SKIP_MALFORMED);
  });

  it.skipIf(!FULL)("语料全量 .gd：记号流逐字逐位相同", async () => {
    assertTally("语料全量", await check(corpus()), SKIP_CORPUS);
  }, 600_000);

  it.skipIf(!FULL || !existsSync(HARVEST))("单测内联片段：记号流逐字逐位相同", async () => {
    const j = JSON.parse(readFileSync(HARVEST, "utf8")) as { snippets: Array<{ id: string; src: string }> };
    assertTally("内联片段", await check(j.snippets), SKIP_HARVEST);
  }, 900_000);
});

describe("缩进游标（scanner.c 的行为口径）", () => {
  it("缩进算数值：空格 +1、tab +8，所以 8 个空格与 1 个 tab 同级", () => {
    expect(indents("a\n\tb\n        c\n  d\n")).toEqual([0, 8, 8, 2]);
  });

  it("空行与纯空白行不产逻辑行，所以连续空行不会多出边界", () => {
    const c = cur("a\n\n   \n\tb\n");
    expect(c.lines.length).toBe(2);
    expect(indents("a\n\n   \n\tb\n")).toEqual([0, 8]);
  });

  it("`\\` 续行把两行接成一行：接上来的记号不是行头，也不结语句", () => {
    const c = cur("var x = 1 + \\\n\t2\nprint(x)\n");
    expect(c.lines.length).toBe(2);
    seekTo(c, "+");
    expect(c.peek().kind, "续行本身是一个记号（CST 里的 line_continuation 具名叶子）").toBe("cont");
    expect(c.nextIsNewLine(), "续行之后不该算换行").toBe(false);
    c.take();
    expect(c.peek().text).toBe("2");
    expect(c.peek().lineStart, "接上来的记号不是行头").toBe(false);
    expect(c.atStatementEnd(), "`2` 就是这条语句的最后一个记号").toBe(true);
    c.take();
    expect(c.peek().text).toBe("print");
    expect(c.atLineHead(), "下一行的头一个记号").toBe(true);
  });

  it("括号内的换行不结语句（scanner.c 靠 valid_symbols 做到的那件事）", () => {
    const c = cur("f(1\n+ 2)\n");
    seekTo(c, "(");
    expect(c.depth).toBe(1);
    seekTo(c, "1");
    expect(c.nextIsNewLine(), "括号里跨行不算换行").toBe(false);
    expect(c.atStatementEnd()).toBe(false);
    seekTo(c, ")");
    expect(c.depth).toBe(0);
  });

  it("块内的顶格注释按 stack[1] 算，不把块提前 DEDENT 掉", () => {
    const c = cur("func f():\n\tpass\n# tail\n\tmore\n");
    seekTo(c, ":");
    expect(c.openBlock(), "冒号后该开块体").toBe(true);
    expect(c.indentDepth).toBe(1);
    expect(c.lineIndent(2), "顶格注释被抬到函数体那一级").toBe(8);
    seekTo(c, "pass");
    expect(c.dedented(), "注释行不该让块体结束").toBe(false);
    c.stepLine();
    expect(c.lineIndent(c.lineIndex())).toBe(8);
    expect(c.dedented()).toBe(false);
  });

  it("`#region` / `#endregion` 顶格不参与那个抬升", () => {
    expect(indents("func f():\n\tpass\n#region x\n\tmore\n")[2]).toBe(0);
    expect(indents("func f():\n\tpass\n#endregion\n\tmore\n")[2]).toBe(0);
    expect(indents("func f():\n\tpass\n# tail\n")[2]).toBe(0);
  });

  it("顶格注释后面就是顶格内容时不抬升，块体照常结束", () => {
    const c = cur("func f():\n\tpass\n# tail\nvar y = 1\n");
    seekTo(c, ":");
    expect(c.openBlock()).toBe(true);
    expect(c.lineIndent(2), "后面是顶格内容，不抬升").toBe(0);
    seekTo(c, "pass");
    c.stepLine();
    expect(c.dedented()).toBe(true);
  });

  it("EOF 处 dedented 为真，块体能一路收回", () => {
    const c = cur("func f():\n\tif x:\n\t\tpass\n");
    seekTo(c, ":");
    expect(c.openBlock()).toBe(true);
    seekTo(c, ":");
    expect(c.openBlock()).toBe(true);
    expect(c.indentDepth).toBe(2);
    seekTo(c, "pass");
    c.stepLine();
    expect(c.atEof()).toBe(true);
    expect(c.dedented()).toBe(true);
    c.closeBlock();
    c.closeBlock();
    expect(c.indentDepth).toBe(0);
  });

  it("325 那形：`elif b` 换行接顶格冒号，块体只在缩进更深那行开一次", () => {
    const c = cur("if b\n\t:\n\t\tprint(2)\n");
    expect(c.lines.length).toBe(3);
    expect(indents("if b\n\t:\n\t\tprint(2)\n")).toEqual([0, 8, 16]);
    seekTo(c, ":");
    expect(c.openBlock(), "冒号在缩进 8 那行，但栈顶是 0，块体从缩进 16 那行开").toBe(true);
    expect(c.indentDepth, "只压了一层：缩进 8 那行没被当成块体").toBe(1);
    expect(c.peek().text).toBe("print");
  });

  it("235 那形：括号里套 lambda 体，照样能开块", () => {
    const c = cur("print(l == (func(y):\n\treturn y))\n");
    seekTo(c, ":");
    expect(c.depth, "此时在两层括号里").toBe(2);
    expect(c.openBlock(), "scanner.c 的 within_brackets 是死变量，块体照开").toBe(true);
    expect(c.peek().text).toBe("return");
  });

  it("内联块体：冒号后同一行就有内容时 openBlock 返回假", () => {
    const c = cur("if x: pass\nvar y = 1\n");
    seekTo(c, ":");
    expect(c.openBlock()).toBe(false);
    expect(c.peek().text).toBe("pass");
  });
});
