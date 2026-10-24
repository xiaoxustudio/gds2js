// `match:`（没有被试式）那一形（S688，#23 电池的第一格；尺 `tmp/probe710/{malformed,cst}.mts` 十形 + 语料 `433-pattern-match-no-subject`）：
// 语法给主题位造了一枚**空文本**的占位 `identifier`，`checkAfterToken` 那把尺只量「值落在下一行」，于是这一形一路照编译到运行期。
// 引擎在 `match` 那一行发 `Expected expression to test after "match".`，现在同句同行。
import { describe, expect, it } from "vitest";
import { lower } from "@gds2js/compiler/lower/lower";
import { parseSource } from "@gds2js/compiler/parse/parser";

const SENTENCE = 'Expected expression to test after "match".';

describe("lower · match 没有被试式", () => {
  it("空文本的占位主题发引擎那句", async () => {
    const src = 'extends SceneTree\n\nfunc _init():\n\tmatch:\n\t\t1:\n\t\t\tprint("a")\n\tquit()\n';
    let msg = "(照编译)";
    let line = 0;
    try {
      await lower(await parseSource(src));
    } catch (e) {
      msg = (e as Error).message;
      line = (e as { line?: number }).line ?? 0;
    }
    expect(msg).toBe(SENTENCE);
    expect(line).toBe(4);
  });

  it("合式的主题不受影响", async () => {
    const ok = await lower(await parseSource('extends SceneTree\n\nfunc _init():\n\tmatch 1:\n\t\t1:\n\t\t\tprint("a")\n\tquit()\n'));
    expect(ok.funcs.length).toBeGreaterThan(0);
  });
});
