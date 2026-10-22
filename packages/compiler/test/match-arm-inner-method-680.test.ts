// 手臂里在**类名上**调非静态方法（S680，尺 `tmp/probe694/i_inner_method.gd` 与 `i_top_method` / `i_shadow` / `i_inner_name` / `i_inner_new`）：
// 引擎两句 —— `Cannot call non-static function "m()" on the class "Inner" directly. Make an instance instead.` 在前、
// 「必须是常量式」那句在后；顶层同名方法（`m(1)`）与被子名遮住的（`var m = 3` 之后 `m(1)`）都只发后一句，类名当手臂与 `Inner.new` 都放行。
import { describe, expect, it } from "vitest";
import { lower } from "@gds2js/compiler/lower/lower";
import { parseSource } from "@gds2js/compiler/parse/parser";

const ARM_PATTERN = 'Expression in match pattern must be a constant expression, an identifier, or an attribute access ("A.B").';
const HEAD = "extends SceneTree\n\nclass Inner:\n\tfunc m(x):\n\t\treturn x\n\n\tstatic func s(x):\n\t\treturn x\n\nvar top = 1\n\nfunc m(x):\n\treturn x\n\nfunc _init():\n";
const src = (pre: string, arm: string): string => `${HEAD}${pre}\tmatch 1:\n\t\t${arm}:\n\t\t\tprint("arm")\n\t\t_:\n\t\t\tprint("default")\n\tquit()\n`;

const verdict = async (pre: string, arm: string): Promise<string> => {
  try {
    lower(await parseSource(src(pre, arm)));
    return "(收)";
  } catch (e) {
    return (e as Error).message ?? "";
  }
};

describe("lower · 手臂里在类名上调非静态方法", () => {
  it("Inner.m(1) 两句同序", async () => {
    expect(await verdict("", "Inner.m(1)")).toBe(
      `Cannot call non-static function "m()" on the class "Inner" directly. Make an instance instead.\n${ARM_PATTERN}`,
    );
  });

  it("顶层同名方法与被局部名遮住的仍只发常量式那句", async () => {
    expect(await verdict("", "m(1)")).toBe(ARM_PATTERN);
    expect(await verdict("\tvar m = 3\n", "m(1)")).toBe(ARM_PATTERN);
  });

  it("类名当手臂与 Inner.new 照旧放行", async () => {
    expect(await verdict("", "Inner")).toBe("(收)");
    expect(await verdict("", "Inner.new")).toBe("(收)");
  });
});
