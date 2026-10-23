// 手臂缺冒号那一族（S689，#23 电池的第二格；尺 `tmp/probe710/{malformed,cst,ours}.mts` 十形两侧对读 + 语料 `434`/`435`/`436`）。
// 引擎六形同发一句 `Expected ":" or "when" after "match" patterns.`，行号指**手臂那一行**（`tmp/probe710` 的 m1/m2/m3/m4/m10 都在第 5 行，第二条手臂缺冒号的 m6 在第 7 行）。
// CST 有两处落点：整支函数塌成顶层 `ERROR` 时身体被**粘**到手臂后面（`call` 节点里「手臂表达式 + 一枚认得出是名字的 ERROR + arguments」），
// 以及 `match_body` 里直接挂一枚 `ERROR`（前面已有合式手臂）。两处都只在有 `match` 记号的那棵子里认，别的畸形形不套这条。
import { describe, expect, it } from "vitest";
import { lower } from "@gds2js/compiler/lower/lower";
import { parseSource } from "@gds2js/compiler/parse/parser";

const SENTENCE = 'Expected ":" or "when" after "match" patterns.';
const src = (arms: string): string => "extends SceneTree\n\nfunc _init():\n\tmatch 1:\n" + arms + "\tquit()\n";
const one = (arm: string): string => `\t\t${arm}\n\t\t\tprint("a")\n`;

const verdict = async (arms: string): Promise<[string, number]> => {
  try {
    await lower(await parseSource(src(arms)));
    return ["(照编译)", 0];
  } catch (e) {
    const err = e as { message?: string; line?: number };
    return [(err.message ?? "").split("\n")[0] ?? "", err.line ?? 0];
  }
};

describe("lower · 手臂缺冒号那一族", () => {
  it.each([
    ["int 手臂", one("1")],
    ["字符串手臂", one('"a"')],
    ["属性手臂", one("self.x")],
    ["通配手臂", one("_")],
    ["调用手臂", one("int(1)")],
  ])("%s 发引擎那句、指手臂那一行", async (_label, arms) => {
    expect(await verdict(arms)).toEqual([SENTENCE, 5]);
  });

  it("第二条手臂缺冒号（match_body 里那枚 ERROR）", async () => {
    expect(await verdict(one("2:") + "\t\t1\n\t\t\tprint(\"b\")\n")).toEqual([SENTENCE, 7]);
  });

  it("合式的手臂不受影响", async () => {
    expect(await verdict("\t\t1:\n\t\t\tprint(\"a\")\n")).toEqual(["(照编译)", 0]);
    expect(await verdict("\t\t2 when true:\n\t\t\tprint(\"a\")\n")).toEqual(["(照编译)", 0]);
  });
});
