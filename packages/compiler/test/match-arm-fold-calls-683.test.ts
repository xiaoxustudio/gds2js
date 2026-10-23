// 折叠名册的第三批三十四名（S683，尺 `tmp/probe704/roster.mts` + `roster2.mts` 两侧读数 + 语料 `426-pattern-fold-calls-math` 三十三格逐字节）：
// 上一笔记的「静默收下」一族是**读数陷阱** —— `pow(2,3)` 折出 8.0 而 subject 写的是 int 8（S681 自己记过 `sqrt` 这一坑，却在同一把尺上踩了第二次）。
// 两趟自动对值（第一趟 print 取运行期值当 subject，第二趟同值对_arm_）分出的三族：
// 折叠 41+ 名 / 解析期拒（`str` `hash` `range` `is_same` `typeof` `weakref` `var_to_str` `var_to_bytes` `rand*`）/ 真静默（`cubic_interpolate` `cubic_interpolate_angle`）。
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

describe("lower · 手臂折叠名册的第三批", () => {
  it.each([
    ["8.0", "pow(2, 3)"],
    ["1.0", "exp(0)"],
    ["0.0", "log(1)"],
    ["0.0", "sin(0)"],
    ["1.0", "cos(0)"],
    ["0.0", "tan(0)"],
    ["0.0", "sinh(0)"],
    ["1.0", "cosh(0)"],
    ["0.0", "tanh(0)"],
    ["0.0", "asin(0)"],
    ["0.0", "acos(1)"],
    ["0.0", "atan(0)"],
    ["0.0", "atan2(0, 1)"],
    ["0.0", "rad_to_deg(0)"],
    ["1.0", "floor(1.7)"],
    ["2.0", "ceil(1.2)"],
    ["2.0", "round(1.5)"],
    ["2.0", "roundf(1.5)"],
    ["2.5", "fposmod(5.5, 3.0)"],
    ["1.0", "lerp(0, 2, 0.5)"],
    ["1", "min(1, 2)"],
    ["2", "maxi(1, 2)"],
    ["0.5", "lerp_angle(0.0, 1.0, 0.5)"],
    ["0.5", "smoothstep(0.0, 1.0, 0.5)"],
    ["3.0", "snappedf(2.5, 1.0)"],
    ["3", "snappedi(2.5, 1)"],
    ["1", "wrap(5, 1, 3)"],
    ["1", "wrapi(5, 1, 3)"],
    ["1.5", "wrapf(5.5, 1.0, 3.0)"],
    ["true", "is_equal_approx(1.0, 1.0)"],
    ["true", "is_finite(1.0)"],
    ["false", "is_nan(1.0)"],
    ["0.5", "inverse_lerp(0.0, 2.0, 1.0)"],
    ["0.5011872336272722", "db_to_linear(-6.0)"],
  ])("%s -> %s 折成常量臂", async (subj, arm) => {
    expect(await verdict(subj, arm), arm).toBe("(折叠收)");
  });

  it("解析期拒那一族落在名册之外，发常量式那句", async () => {
    for (const arm of ["str(1)", "hash(1)", "range(3)", "is_same(1.0, 1.0)", "typeof(1)", "weakref(self)", "var_to_str(1)"]) {
      expect(await verdict("1", arm), arm).toBe(ARM_PATTERN);
    }
  });

  it("在册名字的越元数形仍先发元数句（扩名册没把它冲掉）", async () => {
    expect(await verdict("3", "wrap(1, 1)")).toBe(
      `Too few arguments for "wrap()" call. Expected at least 3 but received 2.\n${ARM_PATTERN}`,
    );
    expect(await verdict("1", "min(1)")).toBe(
      `Too few arguments for "min()" call. Expected at least 2 but received 1.\n${ARM_PATTERN}`,
    );
  });
});
