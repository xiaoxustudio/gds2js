// 手臂里的**常量式**折叠（S666，读数 `tmp/probe668` 十七格 + 语料 411）：
// 引擎收 `1 + 1` / `not true` / `"a" + "b"` / `(1 + 1) * 2` / `-1` / `5 / 2` 这些式子当手臂，
// 折出值再参与匹配；此前这十一形全被「模式 binary_operator / unary_operator 未支持」拦死（编译不过）。
// 掺属性读那一形（`1 + self.x`）引擎发的是「必须是常量式」那句；三元「收但不匹配」的判据没量，照旧拒。
import { describe, expect, it } from "vitest";
import { lower } from "@gds2js/compiler/lower/lower";
import { parseSource } from "@gds2js/compiler/parse/parser";

const ARM_PATTERN = 'Expression in match pattern must be a constant expression, an identifier, or an attribute access ("A.B").';
const src = (arm: string): string =>
  `extends SceneTree\n\nvar z = 1\n\nfunc _init():\n\tmatch 1:\n\t\t${arm}:\n\t\t\tpass\n\t\t_:\n\t\t\tpass\n\tquit()\n`;

const FOLDED = ["1 + 1", "3 - 2", "4 / 2", "5 / 2", "7 % 3", "-7 % 3", "7 / -2", "2 ** 1", "1.5 + 1", "not true", "true and false", "true or false", '"a" + "b"', "-1", "(1 + 1) * 2", "1 + self.z"];

describe("lower · 手臂里的常量式折叠", () => {
  it.each(FOLDED.slice(0, 15))("%s 收得下来（发成 const 臂）", async (arm) => {
    const m = await lower(await parseSource(src(arm)));
    const body = m.funcs[0]?.body ?? [];
    const match = JSON.stringify(body);
    expect(match.includes('"kind":"const"'), arm).toBe(true);
    expect(match.includes('"kind":"binary"') || match.includes('"kind":"unary"'), arm).toBe(true);
  });

  it("掺属性读那一形发引擎「必须是常量式」那句，不是自述", async () => {
    const tree = await parseSource(src("1 + self.z"));
    let code = "";
    let message = "";
    try {
      lower(tree);
    } catch (e) {
      const err = e as { code?: string; message?: string };
      code = err.code ?? "";
      message = err.message ?? "";
    }
    expect([code, message]).toEqual(["pattern-arm-runtime", ARM_PATTERN]);
  });

  it("三元手臂的匹配判据没量过，照旧响亮拒", async () => {
    const tree = await parseSource(src("1 if true else 2"));
    expect(() => lower(tree)).toThrow(/模式 conditional_expression 未支持/);
  });

  it("下标手臂与调用叶子的二元式也没量过，照旧响亮拒", async () => {
    const idx = await parseSource(src("[1, 2][0]"));
    const call = await parseSource(src("str(1) + 1"));
    expect(() => lower(idx)).toThrow(/模式 subscript 未支持/);
    expect(() => lower(call)).toThrow(/模式 binary_operator 未支持/);
  });
});
