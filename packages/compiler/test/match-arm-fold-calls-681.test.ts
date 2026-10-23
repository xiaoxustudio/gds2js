// 手臂里的全局调用**折叠名册**（S681，尺 `tmp/probe702/foldnames.mts` 十七格 + 语料 `424-pattern-fold-calls` 九格逐字节）：
// `abs(-3)` / `mini(1, 2)` / `max(1, 2)` / `sign(0)` / `sqrt(4)` / `deg_to_rad(0)` / `snapped(2.5, 1)` / `int("1")` 都折叠并参与匹配
// （`sqrt` 与 `deg_to_rad` 折出 float，所以 subject 要写 `2.0` / `0.0` 才命中；`snapped(2.5, 1)` 折出的 3 能匹中 int 3）；
// `len("ab")` 也折叠但值不等（走默认支）。在册而**不折叠**的两类各有读数：`str(1)` / `hash(1)` 发常量式那句；
// 本笔记为「静默收下」的 `pow` / `wrapi` / `wrapf` 到 S683/S684 复核全是**读数陷阱**（折出 float 却拿 int 当 subject、
// 或拿引擎 print 的 15 位打印值当 subject）；S684 之后「静默收下」那一族为空。
import { describe, expect, it } from "vitest";
import { lower } from "@gds2js/compiler/lower/lower";
import { parseSource } from "@gds2js/compiler/parse/parser";

const ARM_PATTERN = 'Expression in match pattern must be a constant expression, an identifier, or an attribute access ("A.B").';
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

describe("lower · 手臂里的全局调用折叠名册", () => {
  it.each([
    ["3", "abs(-3)"],
    ["1", "mini(1, 2)"],
    ["2", "max(1, 2)"],
    ["0", "sign(0)"],
    ["2.0", "sqrt(4)"],
    ["0.0", "deg_to_rad(0)"],
    ["3", "snapped(2.5, 1)"],
    ["1", "int(\"1\")"],
    ["1", "len(\"ab\")"],
  ])("%s -> %s 折成常量臂", async (subj, arm) => {
    expect(await verdict(subj, arm), arm).toBe("(折叠收)");
  });

  it("在册不折叠的名字仍发常量式那句", async () => {
    expect(await verdict('"1"', "str(1)")).toBe(ARM_PATTERN);
    expect(await verdict("1", "hash(1)")).toBe(ARM_PATTERN);
  });

});
