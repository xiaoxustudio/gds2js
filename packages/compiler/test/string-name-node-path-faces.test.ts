/**
 * StringName / NodePath 那两面的成员名与元数表过裁判（S389，§6 第 64 条结清）。
 * 尺 `tmp/probe-snfaces/{round1,round2}.mts`：一面一名两格（五实参读上界、零实参读下界），
 * 读数 `tmp/probe-snfaces/compare{42,43}.txt`，折叠 `tmp/probe-snfaces/tables.txt`。
 * 两条硬结论钉在这儿：StringName 认的 102 名与 String 那张表元数一字一样（0 处漂移），另六名引擎回的是
 * 「找不到成员」那两句（第二句的类名不带引号）；NodePath 只认十名，`simplify` / `is_same` / `length` 三名没有。
 */
import { describe, it } from "vitest";
import { eq } from "@gds2js/testkit";
import { analyze } from "@gds2js/compiler/lower/analyze";
import { lower } from "@gds2js/compiler/lower/lower";
import { parseSource } from "@gds2js/compiler/parse/parser";

const H = "extends SceneTree\n\n";
const TAIL = "\nfunc _initialize():\n\tquit()\n";
const FACE = /^(string-name|node-path)-(arity|member)$/;

const snSrc = (call: string): string => `${H}var sn: StringName = &"ab"\n${TAIL}func f():\n\tprint(${call})\n`;
const npSrc = (call: string): string => `${H}var np: NodePath = ^"a/b/c"\n${TAIL}func f():\n\tprint(${call})\n`;

async function face(src: string): Promise<string[]> {
  const m = lower(await parseSource(src));
  return analyze(m).filter((d) => FACE.test(d.code)).map((d) => d.message);
}

describe("StringName 的元数与 String 同表", () => {
  it("上下界都照量来的两句", async () => {
    const CELLS: Array<[string, string | null]> = [
      ["sn.length(1)", 'Too many arguments for "length()" call. Expected at most 0 but received 1.'],
      ["sn.begins_with()", 'Too few arguments for "begins_with()" call. Expected at least 1 but received 0.'],
      ['sn.count("a", 1, 2, 3)', 'Too many arguments for "count()" call. Expected at most 3 but received 4.'],
      ['sn.split(",", true, 1)', null],
      ['sn.lpad(1, "x")', null],
      ["sn.xml_escape(1, 2)", 'Too many arguments for "xml_escape()" call. Expected at most 1 but received 2.'],
      ["sn.left()", 'Too few arguments for "left()" call. Expected at least 1 but received 0.'],
      ["sn.replace", null],
    ];
    for (const [call, want] of CELLS) {
      const got = await face(snSrc(call));
      eq("389", call, want === null ? got.length : got[0], want === null ? 0 : want);
    }
  });

  it("六名引擎回的是找不到成员那两句，第二句的类名不带引号", async () => {
    for (const name of ["chr", "humanize_size", "num", "num_int64", "num_scientific", "num_uint64"]) {
      const got = await face(snSrc(`sn.${name}(1)`));
      eq("389", `${name} 两句`, got, [`Cannot find member "${name}" in base "StringName".`, `Function "${name}()" not found in base StringName.`]);
    }
  });
});

describe("NodePath 只认十名", () => {
  it("两名一支下标、八名零支", async () => {
    const CELLS: Array<[string, string | null]> = [
      ["np.get_name()", 'Too few arguments for "get_name()" call. Expected at least 1 but received 0.'],
      ["np.get_subname(1, 2, 3)", 'Too many arguments for "get_subname()" call. Expected at most 1 but received 3.'],
      ["np.hash(1)", 'Too many arguments for "hash()" call. Expected at most 0 but received 1.'],
      ["np.get_name_count(1, 2)", 'Too many arguments for "get_name_count()" call. Expected at most 0 but received 2.'],
      ["np.get_name(0)", null],
      ["np.get_subname(1)", null],
      ["np.get_name_count()", null],
      ["np.is_absolute()", null],
      ["np.get_as_property_path()", null],
    ];
    for (const [call, want] of CELLS) {
      const got = await face(npSrc(call));
      eq("389", call, want === null ? got.length : got[0], want === null ? 0 : want);
    }
  });

  it("simplify / is_same / length 三名没有", async () => {
    for (const name of ["simplify", "is_same", "length"]) {
      const got = await face(npSrc(`np.${name}()`));
      eq("389", `${name} 两句`, got, [`Cannot find member "${name}" in base "NodePath".`, `Function "${name}()" not found in base NodePath.`]);
    }
  });
});

describe("接收者的静态证明与两面互不串", () => {
  it("^ 字面量直接当接收者同样拦；& 那一形仍撞 tree-sitter（§6 第 64 条⑤，本轮不接）", async () => {
    eq("389", '^"a/b".get_name(1, 2)', (await face(`${H}func f():\n\tprint(^"a/b".get_name(1, 2))\n${TAIL}`))[0], 'Too many arguments for "get_name()" call. Expected at most 1 but received 2.');
    eq("389", '^"a/b".length(1)', await face(`${H}func f():\n\tprint(^"a/b".length(1))\n${TAIL}`), [
      'Cannot find member "length" in base "NodePath".',
      'Function "length()" not found in base NodePath.',
    ]);
    const bad = async (expr: string): Promise<string> => {
      try {
        lower(await parseSource(`${H}func f():\n\tprint(${expr})\n${TAIL}`));
        return "编得过";
      } catch (e) {
        return e instanceof Error ? e.message : "非 Error";
      }
    };
    eq("389", '&"ab".to_upper(1)', await bad('&"ab".to_upper(1)'), "表达式 ERROR 未支持");
  });

  it("初值是字面量、没写标注的名字也认", async () => {
    eq("389", "推断出的 StringName", (await face(`${H}func f():\n\tvar v = &"ab"\n\tprint(v.length(1))\n${TAIL}`))[0], 'Too many arguments for "length()" call. Expected at most 0 but received 1.');
    eq("389", "推断出的 NodePath", (await face(`${H}func f():\n\tvar v = ^"a/b"\n\tprint(v.is_empty(1))\n${TAIL}`))[0], 'Too many arguments for "is_empty()" call. Expected at most 0 but received 1.');
  });

  it("形参标注与内部类字段也是解析期那一形（S391，读数 compare47/48）", async () => {
    eq("391", "形参 StringName", (await face(`${H}func f(sn: StringName):\n\tprint(sn.length(1))\n${TAIL}`))[0], 'Too many arguments for "length()" call. Expected at most 0 but received 1.');
    eq("391", "形参 NodePath", (await face(`${H}func f(np: NodePath):\n\tprint(np.get_name(1, 2))\n${TAIL}`))[0], 'Too many arguments for "get_name()" call. Expected at most 1 but received 2.');
    eq("391", "形参标注的幽灵名", await face(`${H}func f(sn: StringName):\n\tprint(sn.num(3))\n${TAIL}`), [
      'Cannot find member "num" in base "StringName".',
      'Function "num()" not found in base StringName.',
    ]);
    eq("391", "内部类字段 StringName", (await face(`${H}class Inner:\n\tvar sn: StringName = &"ab"\n\tfunc g():\n\t\tprint(sn.length(1))\n`))[0], 'Too many arguments for "length()" call. Expected at most 0 but received 1.');
    eq("391", "内部类字段 NodePath", (await face(`${H}class Inner:\n\tvar np: NodePath = ^"a/b"\n\tfunc g():\n\t\tprint(np.get_name(1, 2))\n`))[0], 'Too many arguments for "get_name()" call. Expected at most 1 but received 2.');
    eq("391", "内部类字段初值推断", (await face(`${H}class Inner:\n\tvar sn = &"ab"\n\tfunc g():\n\t\tprint(sn.length(1))\n`))[0], 'Too many arguments for "length()" call. Expected at most 0 but received 1.');
  });

  it("被重新赋值过的名字证不出，那一道都不许拦", async () => {
    eq("389", "改名以后再调", await face(`${H}func f(v: Variant):\n\tvar sn: StringName = &"ab"\n\tsn = v\n\tprint(sn.length(1))\n${TAIL}`), []);
    eq("391", "未标注的形参不证", await face(`${H}func f(sn2):\n\tprint(sn2.length(1))\n${TAIL}`), []);
  });

  it("String 那一面照旧收那六名（幽灵表不许串面）", async () => {
    eq("389", "标注 String", await face(`${H}func f():\n\tvar s: String = "ab"\n\tprint(s.num(3))\n${TAIL}`), []);
    eq("389", "字符串字面量", await face(`${H}func f():\n\tprint("ab".humanize_size(1, 2))\n${TAIL}`), []);
  });
});
