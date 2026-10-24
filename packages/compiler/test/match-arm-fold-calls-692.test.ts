// 折叠名册的全宇宙扫（S692，尺 `tmp/probe711/{universe,recheck,oursrefuse}.mts`：五十六名分箱 + 十格末位精确重量 + 语料 `440-pattern-fold-calls-utility` 二十格逐字节）。
// 分箱：FOLD 二十名进册；REFUSE 二十一名引擎只发常量式那一句（`str` `hash` `typeof` `is_same` `range` `var_to_*` `bytes_to_var` `str_to_var` `weakref` `instance_from_id` `is_instance_*` `type_string` `error_string` `type_convert` `randi_range` `randf_range` `rand_from_seed` `rid_allocate_id`…），我们同句（已另尺 `tmp/probe711/oursrefuse.mts` 十九格对过）；
// VARIES 三名（`randi` `randf` `randfn`）两次跑数不一样 —— 非纯函数不进任何一侧；SKIP 十四名的实参型在 D6 之外或造不出字面量。
// `NEVER` 只剩打印陷阱一类：`asinh(1.0)` / `deg_to_rad(180)` 拿 15 位打印值当 subject 对不上，换成末位精确的 `asinh(0)` / `atanh(0)` / `acosh(1)` 当场命中。
import { describe, expect, it } from "vitest";
import { lower } from "@gds2js/compiler/lower/lower";
import { parseSource } from "@gds2js/compiler/parse/parser";

const src = (subj: string, arm: string): string =>
  `extends SceneTree\n\nfunc _init():\n\tmatch ${subj}:\n\t\t${arm}:\n\t\t\tprint("arm")\n\t\t_:\n\t\t\tprint("def")\n\tquit()\n`;

const folded = async (subj: string, arm: string): Promise<boolean> => {
  try {
    const m = await lower(await parseSource(src(subj, arm)));
    return JSON.stringify(m.funcs[0]?.body ?? []).includes('"kind":"const"');
  } catch {
    return false;
  }
};

describe("lower · 手臂折叠名册的第五批", () => {
  it.each([
    ["0.0", "acosh(1)"],
    ["0.0", "asinh(0)"],
    ["0.0", "atanh(0)"],
    ["15.0", "remap(1.0, 0.0, 2.0, 10.0, 20.0)"],
    ["1.0", "floorf(1.7)"],
    ["1", "roundi(1.0)"],
    ["3", "absi(-3)"],
    ["-1.0", "signf(-2.5)"],
    ["false", "is_inf(1.0)"],
    ["false", "is_zero_approx(1.0)"],
    ["0", "step_decimals(1.0)"],
    ["1.0", "cubic_interpolate_in_time(1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0)"],
    ["1.0", "cubic_interpolate_angle_in_time(1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0)"],
    ["0.0", "bezier_derivative(1.0, 1.0, 1.0, 1.0, 1.0)"],
    ["0.0", "angle_difference(1.0, 1.0)"],
    ["1.0", "rotate_toward(1.0, 1.0, 1.0)"],
    ["2", "clamp(5, 0, 2)"],
    ["2.0", "clampf(5.0, 0.0, 2.0)"],
    ["4", "nearest_po2(4)"],
    ["1.0", "pingpong(1.0, 2.0)"],
  ])("%s -> %s 折成常量臂", async (subj, arm) => {
    expect(await folded(subj, arm), arm).toBe(true);
  });

  it("拒族与随机族都还在名册外", async () => {
    for (const arm of ["str_to_var(\"1\")", "bytes_to_var([])", "weakref(null)", "randi_range(1, 1)", "randf_range(1.0, 2.0)"]) {
      expect(await folded("1", arm), arm).toBe(false);
    }
  });
});
