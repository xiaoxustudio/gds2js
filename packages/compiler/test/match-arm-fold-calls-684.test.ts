// 「静默收下」一族其实是读数假象（S684，尺 `tmp/probe704/roster3.mts` 二十二格：subject 全取十进制精确可表示的值）：
// 引擎 print 只给 15 位有效数字，`cubic_interpolate(0.0, 1.0, 2.0, 3.0, 0.5)` 的真值是 1.4999999999999998，打印成 "1.5" —— 拿打印值当 subject 自然对不上。
// 同一把尺上 `ease(1.0, 0.5)` / `linear_to_db(1.0)` / `bezier_interpolate(…, 0.0)` / `cubic_interpolate(…, 0.0)` 这些末位精确的形全部命中，
// 所以 `cubic_interpolate` 也进折叠名册；`move_toward(0, 2, 5)`（折出 2.0 却拿 int 2 当 subject）与 `step_decimals`（折出 int 0 却写 0.0）同理。
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

describe("lower · 手臂折叠名册的第四批（末位精确读数）", () => {
  it.each([
    ["0.0", "linear_to_db(1.0)"],
    ["1.0", "ease(1.0, 0.5)"],
    ["0.0", "bezier_interpolate(0.0, 1.0, 2.0, 3.0, 0.0)"],
    ["0.0", "cubic_interpolate(0.0, 1.0, 2.0, 3.0, 0.0)"],
    ["1.5", "cubic_interpolate(0.0, 1.0, 2.0, 3.0, 0.5)"],
    ["0.0", "cubic_interpolate_angle(0.0, 90.0, 180.0, 270.0, 0.0)"],
    ["1.0", "float(\"1\")"],
    ["2.5", "fmod(5.5, 3.0)"],
    ["2.0", "ceilf(1.2)"],
    ["1", "floori(1.7)"],
    ["2", "ceili(1.2)"],
  ])("%s -> %s 折成常量臂", async (subj, arm) => {
    expect(await verdict(subj, arm), arm).toBe("(折叠收)");
  });
});
