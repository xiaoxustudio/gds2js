/**
 * 全局函数「固定形参型」这一拒的两侧：102 位的期望句逐字取自普查读数（`tmp/probe-argtype/sweep.txt` / `fixed.txt`，
 * 每一位都是往那一个位上塞 String 字面量、其余位给 1 量出来的）；合法那一侧钉的是引擎收过的形（int / float / bool 与 Variant 那几支）。
 */
import { describe, expect, it } from "vitest";
import { analyze } from "@gds2js/compiler/lower/analyze";
import { lower } from "@gds2js/compiler/lower/lower";
import { parseSource } from "@gds2js/compiler/parse/parser";

const diags = async (src: string): Promise<string[]> => {
  const tree = await parseSource(`extends SceneTree\n\nfunc _initialize():\n\tvar v = ${src}\n\tprint("X||", v)\n\tquit()\n`);
  return analyze(lower(tree)).map((d) => d.message);
};

const REFUSE: Array<[string, string]> = [
  ["absf(\"a\")", "Invalid argument for \"absf()\" function: argument 1 should be \"float\" but is \"String\"."],
  ["absi(\"a\")", "Invalid argument for \"absi()\" function: argument 1 should be \"int\" but is \"String\"."],
  ["acos(\"a\")", "Invalid argument for \"acos()\" function: argument 1 should be \"float\" but is \"String\"."],
  ["acosh(\"a\")", "Invalid argument for \"acosh()\" function: argument 1 should be \"float\" but is \"String\"."],
  ["angle_difference(\"a\", 1)", "Invalid argument for \"angle_difference()\" function: argument 1 should be \"float\" but is \"String\"."],
  ["angle_difference(1, \"a\")", "Invalid argument for \"angle_difference()\" function: argument 2 should be \"float\" but is \"String\"."],
  ["asin(\"a\")", "Invalid argument for \"asin()\" function: argument 1 should be \"float\" but is \"String\"."],
  ["asinh(\"a\")", "Invalid argument for \"asinh()\" function: argument 1 should be \"float\" but is \"String\"."],
  ["atan(\"a\")", "Invalid argument for \"atan()\" function: argument 1 should be \"float\" but is \"String\"."],
  ["atan2(\"a\", 1)", "Invalid argument for \"atan2()\" function: argument 1 should be \"float\" but is \"String\"."],
  ["atan2(1, \"a\")", "Invalid argument for \"atan2()\" function: argument 2 should be \"float\" but is \"String\"."],
  ["atanh(\"a\")", "Invalid argument for \"atanh()\" function: argument 1 should be \"float\" but is \"String\"."],
  ["ceilf(\"a\")", "Invalid argument for \"ceilf()\" function: argument 1 should be \"float\" but is \"String\"."],
  ["ceili(\"a\")", "Invalid argument for \"ceili()\" function: argument 1 should be \"float\" but is \"String\"."],
  ["char(\"a\")", "Invalid argument for \"char()\" function: argument 1 should be \"int\" but is \"String\"."],
  ["clampf(\"a\", 1, 1)", "Invalid argument for \"clampf()\" function: argument 1 should be \"float\" but is \"String\"."],
  ["clampf(1, \"a\", 1)", "Invalid argument for \"clampf()\" function: argument 2 should be \"float\" but is \"String\"."],
  ["clampf(1, 1, \"a\")", "Invalid argument for \"clampf()\" function: argument 3 should be \"float\" but is \"String\"."],
  ["clampi(\"a\", 1, 1)", "Invalid argument for \"clampi()\" function: argument 1 should be \"int\" but is \"String\"."],
  ["clampi(1, \"a\", 1)", "Invalid argument for \"clampi()\" function: argument 2 should be \"int\" but is \"String\"."],
  ["clampi(1, 1, \"a\")", "Invalid argument for \"clampi()\" function: argument 3 should be \"int\" but is \"String\"."],
  ["convert(1, \"a\")", "Invalid argument for \"convert()\" function: argument 2 should be \"int\" but is \"String\"."],
  ["cos(\"a\")", "Invalid argument for \"cos()\" function: argument 1 should be \"float\" but is \"String\"."],
  ["cosh(\"a\")", "Invalid argument for \"cosh()\" function: argument 1 should be \"float\" but is \"String\"."],
  ["db_to_linear(\"a\")", "Invalid argument for \"db_to_linear()\" function: argument 1 should be \"float\" but is \"String\"."],
  ["deg_to_rad(\"a\")", "Invalid argument for \"deg_to_rad()\" function: argument 1 should be \"float\" but is \"String\"."],
  ["ease(\"a\", 1)", "Invalid argument for \"ease()\" function: argument 1 should be \"float\" but is \"String\"."],
  ["ease(1, \"a\")", "Invalid argument for \"ease()\" function: argument 2 should be \"float\" but is \"String\"."],
  ["exp(\"a\")", "Invalid argument for \"exp()\" function: argument 1 should be \"float\" but is \"String\"."],
  ["floorf(\"a\")", "Invalid argument for \"floorf()\" function: argument 1 should be \"float\" but is \"String\"."],
  ["floori(\"a\")", "Invalid argument for \"floori()\" function: argument 1 should be \"float\" but is \"String\"."],
  ["fmod(\"a\", 1)", "Invalid argument for \"fmod()\" function: argument 1 should be \"float\" but is \"String\"."],
  ["fmod(1, \"a\")", "Invalid argument for \"fmod()\" function: argument 2 should be \"float\" but is \"String\"."],
  ["fposmod(\"a\", 1)", "Invalid argument for \"fposmod()\" function: argument 1 should be \"float\" but is \"String\"."],
  ["fposmod(1, \"a\")", "Invalid argument for \"fposmod()\" function: argument 2 should be \"float\" but is \"String\"."],
  ["inverse_lerp(\"a\", 1, 1)", "Invalid argument for \"inverse_lerp()\" function: argument 1 should be \"float\" but is \"String\"."],
  ["inverse_lerp(1, \"a\", 1)", "Invalid argument for \"inverse_lerp()\" function: argument 2 should be \"float\" but is \"String\"."],
  ["inverse_lerp(1, 1, \"a\")", "Invalid argument for \"inverse_lerp()\" function: argument 3 should be \"float\" but is \"String\"."],
  ["is_equal_approx(\"a\", 1)", "Invalid argument for \"is_equal_approx()\" function: argument 1 should be \"float\" but is \"String\"."],
  ["is_equal_approx(1, \"a\")", "Invalid argument for \"is_equal_approx()\" function: argument 2 should be \"float\" but is \"String\"."],
  ["is_finite(\"a\")", "Invalid argument for \"is_finite()\" function: argument 1 should be \"float\" but is \"String\"."],
  ["is_inf(\"a\")", "Invalid argument for \"is_inf()\" function: argument 1 should be \"float\" but is \"String\"."],
  ["is_nan(\"a\")", "Invalid argument for \"is_nan()\" function: argument 1 should be \"float\" but is \"String\"."],
  ["is_zero_approx(\"a\")", "Invalid argument for \"is_zero_approx()\" function: argument 1 should be \"float\" but is \"String\"."],
  ["lerp_angle(\"a\", 1, 1)", "Invalid argument for \"lerp_angle()\" function: argument 1 should be \"float\" but is \"String\"."],
  ["lerp_angle(1, \"a\", 1)", "Invalid argument for \"lerp_angle()\" function: argument 2 should be \"float\" but is \"String\"."],
  ["lerp_angle(1, 1, \"a\")", "Invalid argument for \"lerp_angle()\" function: argument 3 should be \"float\" but is \"String\"."],
  ["lerpf(\"a\", 1, 1)", "Invalid argument for \"lerpf()\" function: argument 1 should be \"float\" but is \"String\"."],
  ["lerpf(1, \"a\", 1)", "Invalid argument for \"lerpf()\" function: argument 2 should be \"float\" but is \"String\"."],
  ["lerpf(1, 1, \"a\")", "Invalid argument for \"lerpf()\" function: argument 3 should be \"float\" but is \"String\"."],
  ["linear_to_db(\"a\")", "Invalid argument for \"linear_to_db()\" function: argument 1 should be \"float\" but is \"String\"."],
  ["log(\"a\")", "Invalid argument for \"log()\" function: argument 1 should be \"float\" but is \"String\"."],
  ["max(\"a\", 1)", "Invalid argument for \"max()\" function: argument 1 should be \"float\" but is \"String\"."],
  ["max(1, \"a\")", "Invalid argument for \"max()\" function: argument 2 should be \"float\" but is \"String\"."],
  ["maxf(\"a\", 1)", "Invalid argument for \"maxf()\" function: argument 1 should be \"float\" but is \"String\"."],
  ["maxf(1, \"a\")", "Invalid argument for \"maxf()\" function: argument 2 should be \"float\" but is \"String\"."],
  ["maxi(\"a\", 1)", "Invalid argument for \"maxi()\" function: argument 1 should be \"int\" but is \"String\"."],
  ["maxi(1, \"a\")", "Invalid argument for \"maxi()\" function: argument 2 should be \"int\" but is \"String\"."],
  ["min(\"a\", 1)", "Invalid argument for \"min()\" function: argument 1 should be \"float\" but is \"String\"."],
  ["min(1, \"a\")", "Invalid argument for \"min()\" function: argument 2 should be \"float\" but is \"String\"."],
  ["minf(\"a\", 1)", "Invalid argument for \"minf()\" function: argument 1 should be \"float\" but is \"String\"."],
  ["minf(1, \"a\")", "Invalid argument for \"minf()\" function: argument 2 should be \"float\" but is \"String\"."],
  ["mini(\"a\", 1)", "Invalid argument for \"mini()\" function: argument 1 should be \"int\" but is \"String\"."],
  ["mini(1, \"a\")", "Invalid argument for \"mini()\" function: argument 2 should be \"int\" but is \"String\"."],
  ["move_toward(\"a\", 1, 1)", "Invalid argument for \"move_toward()\" function: argument 1 should be \"float\" but is \"String\"."],
  ["move_toward(1, \"a\", 1)", "Invalid argument for \"move_toward()\" function: argument 2 should be \"float\" but is \"String\"."],
  ["move_toward(1, 1, \"a\")", "Invalid argument for \"move_toward()\" function: argument 3 should be \"float\" but is \"String\"."],
  ["nearest_po2(\"a\")", "Invalid argument for \"nearest_po2()\" function: argument 1 should be \"int\" but is \"String\"."],
  ["pingpong(\"a\", 1)", "Invalid argument for \"pingpong()\" function: argument 1 should be \"float\" but is \"String\"."],
  ["pingpong(1, \"a\")", "Invalid argument for \"pingpong()\" function: argument 2 should be \"float\" but is \"String\"."],
  ["posmod(\"a\", 1)", "Invalid argument for \"posmod()\" function: argument 1 should be \"int\" but is \"String\"."],
  ["posmod(1, \"a\")", "Invalid argument for \"posmod()\" function: argument 2 should be \"int\" but is \"String\"."],
  ["pow(\"a\", 1)", "Invalid argument for \"pow()\" function: argument 1 should be \"float\" but is \"String\"."],
  ["pow(1, \"a\")", "Invalid argument for \"pow()\" function: argument 2 should be \"float\" but is \"String\"."],
  ["rad_to_deg(\"a\")", "Invalid argument for \"rad_to_deg()\" function: argument 1 should be \"float\" but is \"String\"."],
  ["rotate_toward(\"a\", 1, 1)", "Invalid argument for \"rotate_toward()\" function: argument 1 should be \"float\" but is \"String\"."],
  ["rotate_toward(1, \"a\", 1)", "Invalid argument for \"rotate_toward()\" function: argument 2 should be \"float\" but is \"String\"."],
  ["rotate_toward(1, 1, \"a\")", "Invalid argument for \"rotate_toward()\" function: argument 3 should be \"float\" but is \"String\"."],
  ["roundf(\"a\")", "Invalid argument for \"roundf()\" function: argument 1 should be \"float\" but is \"String\"."],
  ["roundi(\"a\")", "Invalid argument for \"roundi()\" function: argument 1 should be \"float\" but is \"String\"."],
  ["signf(\"a\")", "Invalid argument for \"signf()\" function: argument 1 should be \"float\" but is \"String\"."],
  ["signi(\"a\")", "Invalid argument for \"signi()\" function: argument 1 should be \"int\" but is \"String\"."],
  ["sin(\"a\")", "Invalid argument for \"sin()\" function: argument 1 should be \"float\" but is \"String\"."],
  ["sinh(\"a\")", "Invalid argument for \"sinh()\" function: argument 1 should be \"float\" but is \"String\"."],
  ["smoothstep(\"a\", 1, 1)", "Invalid argument for \"smoothstep()\" function: argument 1 should be \"float\" but is \"String\"."],
  ["smoothstep(1, \"a\", 1)", "Invalid argument for \"smoothstep()\" function: argument 2 should be \"float\" but is \"String\"."],
  ["smoothstep(1, 1, \"a\")", "Invalid argument for \"smoothstep()\" function: argument 3 should be \"float\" but is \"String\"."],
  ["snappedf(\"a\", 1)", "Invalid argument for \"snappedf()\" function: argument 1 should be \"float\" but is \"String\"."],
  ["snappedf(1, \"a\")", "Invalid argument for \"snappedf()\" function: argument 2 should be \"float\" but is \"String\"."],
  ["snappedi(\"a\", 1)", "Invalid argument for \"snappedi()\" function: argument 1 should be \"float\" but is \"String\"."],
  ["snappedi(1, \"a\")", "Invalid argument for \"snappedi()\" function: argument 2 should be \"int\" but is \"String\"."],
  ["sqrt(\"a\")", "Invalid argument for \"sqrt()\" function: argument 1 should be \"float\" but is \"String\"."],
  ["step_decimals(\"a\")", "Invalid argument for \"step_decimals()\" function: argument 1 should be \"float\" but is \"String\"."],
  ["tan(\"a\")", "Invalid argument for \"tan()\" function: argument 1 should be \"float\" but is \"String\"."],
  ["tanh(\"a\")", "Invalid argument for \"tanh()\" function: argument 1 should be \"float\" but is \"String\"."],
  ["wrap(\"a\", 1, 1)", "Invalid argument for \"wrap()\" function: argument 1 should be \"float\" but is \"String\"."],
  ["wrapf(\"a\", 1, 1)", "Invalid argument for \"wrapf()\" function: argument 1 should be \"float\" but is \"String\"."],
  ["wrapf(1, \"a\", 1)", "Invalid argument for \"wrapf()\" function: argument 2 should be \"float\" but is \"String\"."],
  ["wrapf(1, 1, \"a\")", "Invalid argument for \"wrapf()\" function: argument 3 should be \"float\" but is \"String\"."],
  ["wrapi(\"a\", 1, 1)", "Invalid argument for \"wrapi()\" function: argument 1 should be \"int\" but is \"String\"."],
  ["wrapi(1, \"a\", 1)", "Invalid argument for \"wrapi()\" function: argument 2 should be \"int\" but is \"String\"."],
  ["wrapi(1, 1, \"a\")", "Invalid argument for \"wrapi()\" function: argument 3 should be \"int\" but is \"String\"."],
];

const DERIVED: Array<[string, string]> = [
  ['clamp(1, "a", 3)', 'Invalid argument for "clamp()" function: argument 2 should be "int" but is "String".'],
  ['clamp(1.0, "a", 3.0)', 'Invalid argument for "clamp()" function: argument 2 should be "float" but is "String".'],
  ['lerp(1, "a", 0.5)', 'Invalid argument for "lerp()" function: argument 2 should be "int" but is "String".'],
  ['lerp(1.0, "a", 0.5)', 'Invalid argument for "lerp()" function: argument 2 should be "float" but is "String".'],
  ['wrap(1, 2, "a")', 'Invalid argument for "wrap()" function: argument 3 should be "int" but is "String".'],
  ['wrap(1.0, 2.0, "a")', 'Invalid argument for "wrap()" function: argument 3 should be "float" but is "String".'],
];

const ACCEPT: string[] = [
  "sqrt(1)",
  "sqrt(1.5)",
  "sqrt(false)",
  "sqrt(1e309)",
  "char(1.5)",
  "char(true)",
  "hash(&\"a\")",
  "len(\"abc\")",
  "str(Vector2(1, 2))",
  "lerp(Vector2(1, 2), Vector2(3, 4), 0.5)",
  "clamp(1.0, 2.0, 3.0)",
  "abs(Vector2(1, 2))",
];

describe("全局函数固定形参型那一拒", () => {
  it.each(REFUSE)("%s", async (src, want) => {
    expect(await diags(src), src).toContain(want);
  });

  it.each(DERIVED)("跟随第一参：%s", async (src, want) => {
    expect(await diags(src), src).toContain(want);
  });

  it.each(ACCEPT)("不许误拦 %s", async (src) => {
    expect(await diags(src), src).toEqual([]);
  });
});
