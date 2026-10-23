// 折叠名册扩到量过的十七名（S682，尺 `tmp/probe702/foldnames.mts` 二十九格 + 语料 `425-pattern-fold-calls-more` 八格逐字节）：
// 第二批八名 `absf` / `lerpf` / `posmod` / `move_toward` / `maxf` / `minf` / `clampi` / `signi` 引擎都折叠并参与匹配
// （`maxf(1.0, 2.0)` 折出 float，subject 写 `2.0` 才命中；`clampi(5, 0, 2)` 折出 int 2）；
// `wrap(1, 1)` 那格仍是元数句在先。静默收下那一族（`pow` / `wrapi` / `wrapf` / `ceil` / `floor` / `round`）判据仍未明，照旧响亮拒（#24）。
import { describe, expect, it } from "vitest";
import { lower } from "@gds2js/compiler/lower/lower";
import { parseSource } from "@gds2js/compiler/parse/parser";

const src = (subj: string, arm: string): string =>
  `extends SceneTree\n\nfunc _init():\n\tmatch ${subj}:\n\t\t${arm}:\n\t\t\tprint("arm")\n\t\t_:\n\t\t\tprint("default")\n\tquit()\n`;

const verdict = async (subj: string, arm: string): Promise<string> => {
  try {
    const m = lower(await parseSource(src(subj, arm)));
    return JSON.stringify(m.funcs[0]?.body ?? []).includes('"kind":"const"') ? "(折叠收)" : "(收)";
  } catch (e) {
    return (e as Error).message ?? "";
  }
};

describe("lower · 手臂折叠名册的第二批八名", () => {
  it.each([
    ["2.5", "absf(-2.5)"],
    ["1.0", "lerpf(0.0, 2.0, 0.5)"],
    ["2", "posmod(5, 3)"],
    ["2.0", "move_toward(0.0, 2.0, 5.0)"],
    ["2.0", "maxf(1.0, 2.0)"],
    ["1.0", "minf(1.0, 2.0)"],
    ["2", "clampi(5, 0, 2)"],
    ["-1", "signi(-9)"],
  ])("%s -> %s 折成常量臂", async (subj, arm) => {
    expect(await verdict(subj, arm), arm).toBe("(折叠收)");
  });

  it("S683 复核：这三名的读数陷阱是 subject 用了 int（折出的是 float）", async () => {
    expect(await verdict("2.0", "ceil(1.2)")).toBe("(折叠收)");
    expect(await verdict("1.0", "floor(1.2)")).toBe("(折叠收)");
    expect(await verdict("2.0", "round(1.5)")).toBe("(折叠收)");
  });
});
