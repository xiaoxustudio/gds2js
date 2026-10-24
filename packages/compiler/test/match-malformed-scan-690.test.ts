// `match` 畸形形的整树扫（S690，#23 电池的第三、四格；尺 `tmp/probe710/{rest,ours}.mts` 十二形两侧对读 + 语料 `437`/`438`）：
// 同一句判据在 CST 里有三种塌法（顶层 ERROR / `body` 里的 ERROR / `match_body` 的直接 ERROR），所以带 ERROR 的树整棵扫一遍，取最靠前那一处。
// 守卫把身体粘走那一形引擎发 `Expected expression for pattern guard after "when".` @手臂那一行，主题后没冒号那一形发 `Expected ":" after "match" expression.` @`match` 那一行。
import { describe, expect, it } from "vitest";
import { lower } from "@gds2js/compiler/lower/lower";
import { parseSource } from "@gds2js/compiler/parse/parser";

const src = (body: string): string => "extends SceneTree\n\nfunc _init():\n" + body + "\tquit()\n";

const verdict = async (body: string): Promise<[string, number]> => {
  try {
    await lower(await parseSource(src(body)));
    return ["(照编译)", 0];
  } catch (e) {
    const err = e as { message?: string; line?: number };
    return [((err.message ?? "").split("\n").filter((l) => !l.startsWith("Expression in match"))[0] ?? ""), err.line ?? 0];
  }
};

describe("lower · match 畸形形的整树扫", () => {
  it("守卫后面空着：引擎那句、指手臂那一行", async () => {
    expect(await verdict('\tmatch 1:\n\t\t1 when\n\t\t\tprint("a")\n')).toEqual(['Expected expression for pattern guard after "when".', 5]);
  });

  it("主题后面没冒号：引擎那句、指 match 那一行", async () => {
    expect(await verdict('\tmatch 1\n\t\t1:\n\t\t\tprint("a")\n')).toEqual(['Expected ":" after "match" expression.', 4]);
  });

  it("合式的 match 与合式的守卫都不受这条影响", async () => {
    expect(await verdict('\tmatch 1:\n\t\t1:\n\t\t\tprint("a")\n')).toEqual(["(照编译)", 0]);
    expect(await verdict('\tmatch 1:\n\t\t2 when true:\n\t\t\tprint("a")\n')).toEqual(["(照编译)", 0]);
    expect(await verdict('\tmatch 1:\n\t\t_:\n\t\t\tprint("a")\n')).toEqual(["(照编译)", 0]);
  });

  it("手臂缺冒号那一族仍走同一把扫（六形同句）", async () => {
    expect(await verdict('\tmatch 1:\n\t\tself.x\n\t\t\tprint("a")\n')).toEqual(['Expected ":" or "when" after "match" patterns.', 5]);
    expect(await verdict('\tmatch 1:\n\t\t2:\n\t\t\tprint("a")\n\t\t1\n\t\t\tprint("b")\n')).toEqual(['Expected ":" or "when" after "match" patterns.', 7]);
  });
});
