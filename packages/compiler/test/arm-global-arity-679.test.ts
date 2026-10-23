// 手臂里的**全局调用越元数**（S679，尺 `tmp/probe689/armarity.mts` 十格两侧对读）：
// 引擎在「必须是常量式」那句**之前**先发元数那句，七名越界两向一字一样（`wrap` / `len` / `abs` / `clamp` / `snapped` / `deg_to_rad`），
// 合式的仍只发常量式那句（`str(1)`）；折叠名册（`int` / `len`）现在先看元数再折 —— `len("a", "b")` 越界时不能折。
import { describe, expect, it } from "vitest";
import { lower } from "@gds2js/compiler/lower/lower";
import { parseSource } from "@gds2js/compiler/parse/parser";

const ARM_PATTERN = 'Expression in match pattern must be a constant expression, an identifier, or an attribute access ("A.B").';
const src = (arm: string): string =>
  `extends SceneTree\n\nfunc _init():\n\tmatch 1:\n\t\t${arm}:\n\t\t\tprint("arm")\n\t\t_:\n\t\t\tprint("default")\n\tquit()\n`;

const thrown = async (arm: string): Promise<string> => {
  try {
    lower(await parseSource(src(arm)));
    return "(收)";
  } catch (e) {
    return (e as Error).message ?? "";
  }
};

const few = (n: string, min: number, got: number): string => `Too few arguments for "${n}()" call. Expected at least ${String(min)} but received ${String(got)}.`;
const many = (n: string, max: number, got: number): string => `Too many arguments for "${n}()" call. Expected at most ${String(max)} but received ${String(got)}.`;

describe("lower · 手臂里的全局调用先发元数那句", () => {
  it.each([
    ["wrap(3, 2)", [few("wrap", 3, 2)].join("\n") + "\n" + ARM_PATTERN],
    ["wrap(1, 2, 3, 4)", [many("wrap", 3, 4)].join("\n") + "\n" + ARM_PATTERN],
    ["abs()", few("abs", 1, 0) + "\n" + ARM_PATTERN],
    ["abs(1, 2)", many("abs", 1, 2) + "\n" + ARM_PATTERN],
    ["clamp(1, 2)", few("clamp", 3, 2) + "\n" + ARM_PATTERN],
    ["snapped(1)", few("snapped", 2, 1) + "\n" + ARM_PATTERN],
    ["deg_to_rad()", few("deg_to_rad", 1, 0) + "\n" + ARM_PATTERN],
    ['len("a", "b")', many("len", 1, 2) + "\n" + ARM_PATTERN],
  ])("%s 两句同序", async (arm, want) => {
    expect(await thrown(arm)).toBe(want);
  });

  it("合式的在册名字仍只发常量式那句", async () => {
    expect(await thrown("str(1)")).toBe(ARM_PATTERN);
  });

  it("元数合式的折叠名仍折成常量臂", async () => {
    const out = await thrown('len("ab")');
    expect(out).toBe("(收)");
  });
});
