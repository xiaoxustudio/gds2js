/**
 * 缩进游标的行为口径。这一层原先是拿 tree-sitter 的 CST 叶子序列当记号流 oracle 对账的，
 * 收口之后 oracle 随整支 tree-sitter 一起删了，剩下这十一条**自带读数**的单元格：
 * 每一格都对着 vendored `scanner.c` 的一处具体行为，其中三格（325 / 235 / 内联块体）
 * 是当初推翻「先扫一遍预发 INDENT / DEDENT」那个设计的实证。
 */
import { describe, expect, it } from "vitest";
import { Cursor } from "../src/parse/descent/indent";
import { lex } from "../src/parse/descent/lexer";

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
