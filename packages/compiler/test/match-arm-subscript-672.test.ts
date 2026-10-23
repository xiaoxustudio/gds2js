// 手臂里的**下标**形（S672，尺 `tmp/probe674/arms.mts` 十二格两侧对读）：引擎撞的是解析器那一句
// `Expected ":" or "when" after "match" patterns.`（`[1, 2][0]:` 那一格），我们此前发自述「模式 subscript 未支持」。
// 同一把尺上还量到但**这一笔不动**的两形：三元手臂（引擎收下且**永不匹配**，subject 取两个分支值都给 default，判据未明）、
// 非构造式的调用手臂（`str(1)` / `str(1)` 折出的值都不匹配）—— 引擎给「必须是常量式」那句，我们给自述，
// 要先把「哪些名字算全局工具函数」这张表量清楚再换文案（`armCalleeKnown` 现在只认构造式名册）。
import { describe, expect, it } from "vitest";
import { lower } from "@gds2js/compiler/lower/lower";
import { parseSource } from "@gds2js/compiler/parse/parser";

const src = (arm: string): string =>
  `extends SceneTree\n\nfunc _init():\n\tmatch 1:\n\t\t${arm}:\n\t\t\tprint("arm")\n\t\t_:\n\t\t\tprint("default")\n\tquit()\n`;

const refusal = async (arm: string): Promise<[string, string]> => {
  try {
    lower(await parseSource(src(arm)));
    return ["(收)", ""];
  } catch (e) {
    const err = e as { code?: string; message?: string };
    return [err.code ?? "", err.message ?? ""];
  }
};

describe("lower · 手臂里的下标形发解析器那句", () => {
  it("[1, 2][0] 给 Expected \":\" or \"when\" 那一句", async () => {
    const [code, message] = await refusal("[1, 2][0]");
    expect(code).toBe("pattern-arm-parse");
    expect(message).toBe('Expected ":" or "when" after "match" patterns.');
  });

  it("构造式属性读手臂照旧收下（m_attr_chain 那格两侧都走 default）", async () => {
    expect(await refusal("Vector2(1, 2).x")).toEqual(["(收)", ""]);
  });
});
