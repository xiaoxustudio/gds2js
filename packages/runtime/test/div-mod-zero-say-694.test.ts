// 除零族运行期那两句的正文（S694，尺 `tmp/probe715/{rd,rm}.gd` 两侧对读）：引擎带引号 —— `Division by zero error in operator '/'.` /
// `Modulo by zero error in operator '%'.`（解析期那两句**不带**引号，见 `div-mod-zero-parse-694`），此前我们发的是自述「整数除零（Godot 会直接崩进程）」/「整数取模零」。
import { describe, it } from "vitest";
import { eq } from "@gds2js/testkit";
import { fast } from "@gds2js/runtime/runtime/fast";

const say = (f: (a: number, b: number) => number): string => {
  try {
    f(100, 0);
    return "没抛";
  } catch (e) {
    return String((e as Error).message);
  }
};

describe("fast · 整数除零与取模零的引擎正文（S694）", () => {
  it("四支解箱入口都发引擎那句", () => {
    eq("694", "iDiv", say(fast.iDiv), "Division by zero error in operator '/'.");
    eq("694", "iMod", say(fast.iMod), "Modulo by zero error in operator '%'.");
    eq("694", "iDivC", say(fast.iDivC), "Division by zero error in operator '/'.");
    eq("694", "iModC", say(fast.iModC), "Modulo by zero error in operator '%'.");
  });
});
