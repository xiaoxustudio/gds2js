// 手臂位置的 malformed 三形（S685，#23 的前半；尺 `tmp/probe706/shapes.mts` 四格的 CST + 语料 `428`/`429`/`430` 逐条正文对账）：
// vendored 语法把这三形塌成手臂里的 ERROR 节点或一个补位的空 `)`，我们此前发自述（`(1:` 那一形更是**恢复出能跑的树并匹中手臂**）。
// 引擎在解析期就开口，句子是解析器那三句、行号落在手臂那一行。缺冒号那一形（`match 1: 1` 后无 `:`）整个函数塌成顶层 ERROR，仍没接（#23 留任）。
import { describe, expect, it } from "vitest";
import { lower } from "@gds2js/compiler/lower/lower";
import { parseSource } from "@gds2js/compiler/parse/parser";

const src = (arm: string): string =>
  `extends SceneTree\n\nfunc _init():\n\tmatch 1:\n\t\t${arm}:\n\t\t\tprint("a")\n\t\t_:\n\t\t\tprint("d")\n\tquit()\n`;

const verdict = async (arm: string): Promise<string> => {
  try {
    await lower(await parseSource(src(arm)));
    return "(照编译)";
  } catch (e) {
    return (e as Error).message ?? "";
  }
};

describe("lower · 手臂位置的 malformed 一族", () => {
  it("逗号后面空着：引擎发「手臂要表达式」", async () => {
    expect(await verdict("1,")).toBe("Expected expression for match pattern.");
  });

  it("守卫后面多写一支：引擎发「守卫后要冒号」", async () => {
    expect(await verdict("1 when true else 2")).toBe('Expected ":" after "match" pattern guard.');
  });

  it("括号没闭合：这一形此前照编译还匹中手臂", async () => {
    expect(await verdict("(1")).toBe('Expected closing ")" after grouping expression.');
  });

  it("合式的括号手臂照旧放行（改的只是塌掉的那一支）", async () => {
    expect(await verdict("(1)")).toBe("(照编译)");
    expect(await verdict("(1 + 2)")).toBe("(照编译)");
  });
});
