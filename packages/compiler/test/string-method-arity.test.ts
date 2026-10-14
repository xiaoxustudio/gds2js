/**
 * String 方法的元数在解析期就拦（S380）：109 名过裁判，存在的 108 名两侧都量到，一名乱造名走运行期那句。
 * 尺 `tmp/probe-str/round1.mts`（一格一份脚本一次 spawn，语句形、零实参与五实参各一格），
 * 读数 `tmp/probe-str/compare25.txt` + 逐格原文 `tmp/probe-str/arity-*.txt`。表体由读数直接生成，别手抄。
 */
import { describe, it } from "vitest";
import { eq } from "@gds2js/testkit";
import { analyze } from "@gds2js/compiler/lower/analyze";
import { lower } from "@gds2js/compiler/lower/lower";
import { parseSource } from "@gds2js/compiler/parse/parser";

async function diags(src: string): Promise<string[]> {
  return analyze(lower(await parseSource(src))).map((d) => d.message);
}

const H = "extends SceneTree\n\n";
const MOD = (body: string): string => `${H}func _initialize():\n\tvar s = "ab"\n${body}\n\tquit()\n`;
const FEW = (n: string, min: number, got: number): string => `Too few arguments for "${n}()" call. Expected at least ${min} but received ${got}.`;
const MANY = (n: string, max: number, got: number): string => `Too many arguments for "${n}()" call. Expected at most ${max} but received ${got}.`;

/** 三名与直觉不同，全靠量：`split` / `rsplit` 下界 0、`count` 上界 3、`is_valid_int` / `is_valid_float` 不收默认布尔。 */
const T: Array<[string, number, number]> = [
["begins_with", 1, 1],
  ["bigrams", 0, 0],
  ["bin_to_int", 0, 0],
  ["c_escape", 0, 0],
  ["c_unescape", 0, 0],
  ["capitalize", 0, 0],
  ["casecmp_to", 1, 1],
  ["chr", 1, 1],
  ["contains", 1, 1],
  ["containsn", 1, 1],
  ["count", 1, 3],
  ["countn", 1, 3],
  ["dedent", 0, 0],
  ["ends_with", 1, 1],
  ["erase", 1, 2],
  ["filecasecmp_to", 1, 1],
  ["filenocasecmp_to", 1, 1],
  ["find", 1, 2],
  ["findn", 1, 2],
  ["format", 1, 2],
  ["get_base_dir", 0, 0],
  ["get_basename", 0, 0],
  ["get_extension", 0, 0],
  ["get_file", 0, 0],
  ["get_slice", 2, 2],
  ["get_slice_count", 1, 1],
  ["get_slicec", 2, 2],
  ["hash", 0, 0],
  ["hex_decode", 0, 0],
  ["hex_to_int", 0, 0],
  ["humanize_size", 1, 1],
  ["indent", 1, 1],
  ["insert", 2, 2],
  ["is_absolute_path", 0, 0],
  ["is_empty", 0, 0],
  ["is_relative_path", 0, 0],
  ["is_subsequence_of", 1, 1],
  ["is_subsequence_ofn", 1, 1],
  ["is_valid_filename", 0, 0],
  ["is_valid_float", 0, 0],
  ["is_valid_hex_number", 0, 1],
  ["is_valid_html_color", 0, 0],
  ["is_valid_identifier", 0, 0],
  ["is_valid_int", 0, 0],
  ["is_valid_ip_address", 0, 0],
  ["join", 1, 1],
  ["json_escape", 0, 0],
  ["left", 1, 1],
  ["length", 0, 0],
  ["lpad", 1, 2],
  ["lstrip", 1, 1],
  ["match", 1, 1],
  ["matchn", 1, 1],
  ["md5_buffer", 0, 0],
  ["md5_text", 0, 0],
  ["naturalcasecmp_to", 1, 1],
  ["naturalnocasecmp_to", 1, 1],
  ["nocasecmp_to", 1, 1],
  ["num", 1, 2],
  ["num_int64", 1, 3],
  ["num_scientific", 1, 1],
  ["num_uint64", 1, 3],
  ["pad_decimals", 1, 1],
  ["pad_zeros", 1, 1],
  ["path_join", 1, 1],
  ["repeat", 1, 1],
  ["replace", 2, 2],
  ["replacen", 2, 2],
  ["reverse", 0, 0],
  ["rfind", 1, 2],
  ["rfindn", 1, 2],
  ["right", 1, 1],
  ["rpad", 1, 2],
  ["rsplit", 0, 3],
  ["rstrip", 1, 1],
  ["sha1_buffer", 0, 0],
  ["sha1_text", 0, 0],
  ["sha256_buffer", 0, 0],
  ["sha256_text", 0, 0],
  ["similarity", 1, 1],
  ["simplify_path", 0, 0],
  ["split", 0, 3],
  ["split_floats", 1, 2],
  ["strip_edges", 0, 2],
  ["strip_escapes", 0, 0],
  ["substr", 1, 2],
  ["to_ascii_buffer", 0, 0],
  ["to_camel_case", 0, 0],
  ["to_float", 0, 0],
  ["to_int", 0, 0],
  ["to_kebab_case", 0, 0],
  ["to_lower", 0, 0],
  ["to_pascal_case", 0, 0],
  ["to_snake_case", 0, 0],
  ["to_upper", 0, 0],
  ["to_utf16_buffer", 0, 0],
  ["to_utf32_buffer", 0, 0],
  ["to_utf8_buffer", 0, 0],
  ["to_wchar_buffer", 0, 0],
  ["trim_prefix", 1, 1],
  ["trim_suffix", 1, 1],
  ["unicode_at", 1, 1],
  ["uri_decode", 0, 0],
  ["uri_encode", 0, 0],
  ["validate_filename", 0, 0],
  ["validate_node_name", 0, 0],
  ["xml_escape", 0, 1],
  ["xml_unescape", 0, 0],
];

// 实参**类型**那两句本门不管（既有那族 `face-arg-*` 管），所以「合法」那一格要给类型也对得上的实参；不在表里的名字一律按「收一支字符串」给
const A: Record<string, string[]> = {
  chr: ["1"], left: ["1"], right: ["1"], repeat: ["1"], indent: ['"x"'], unicode_at: ["1"], humanize_size: ["1"],
  lpad: ["1", '"x"'], rpad: ["1", '"x"'], pad_zeros: ["1"], pad_decimals: ["1"], insert: ["1", '"x"'], substr: ["1", "2"],
  erase: ["1", "2"], num: ["1.5"], num_scientific: ["1.5"], num_int64: ["1", "2", "true"], num_uint64: ["1", "2", "true"],
  format: ["[]"], join: ['PackedStringArray(["x"])'], count: ['"x"', "1", "2"], countn: ['"x"', "1", "2"],
  find: ['"x"', "1"], findn: ['"x"', "1"], rfind: ['"x"', "1"], rfindn: ['"x"', "1"],
  split: ['"x"', "1", "true"], rsplit: ['"x"', "true", "1"], split_floats: ['"x"', "1"],
  strip_edges: ["true", "true"], is_valid_hex_number: ["true"], xml_escape: ["true"],
  replace: ['"x"', '"y"'], replacen: ['"x"', '"y"'], get_slice: ['"x"', "1"], get_slicec: ["1", "2"],
};
const legal = (n: string, k: number): string =>
  (A[n] ?? Array.from({ length: k }, () => '"x"')).slice(0, k).join(", ");

describe("两头各一格：108 名逐名钉住两句", () => {
  it("少给读「至少」、多给读「至多」，量到的两端元数都合法", async () => {
    for (const [n, min, max] of T) {
      if (min > 0) eq("380", `${n} 零参`, (await diags(MOD(`\ts.${n}()`)))[0] ?? "没拒", FEW(n, min, 0));
      eq("380", `${n} 五参`, (await diags(MOD(`\ts.${n}(1, 2, 3, 4, 5)`)))[0] ?? "没拒", MANY(n, max, 5));
      eq("380", `${n} ${String(min)} 参合法`, await diags(MOD(`\ts.${n}(${legal(n, min)})`)), []);
      if (max !== min) eq("380", `${n} ${String(max)} 参合法`, await diags(MOD(`\ts.${n}(${legal(n, max)})`)), []);
    }
  });
});

describe("接收者的两种静态证明", () => {
  it("字面量直接当接收者", async () => {
    eq("380", "字面量接收者", (await diags(MOD('\tprint("ab".length(1))')))[0] ?? "没拒", MANY("length", 0, 1));
  });

  it("带标注的局部 var", async () => {
    eq("380", "标注接收者", (await diags(`${H}func _initialize():\n\tvar s: String = "ab"\n\ts.length(1)\n\tquit()\n`))[0] ?? "没拒", MANY("length", 0, 1));
  });

  it("另两面各自有表了（S389 量完，不再借 String 那张）", async () => {
    eq("389", "StringName 标注", (await diags(`${H}func _initialize():\n\tvar sn: StringName = &"ab"\n\tprint(sn.length(1))\n\tquit()\n`))[0] ?? "没拒", MANY("length", 0, 1));
    eq("389", "NodePath 标注", (await diags(`${H}func _initialize():\n\tvar np: NodePath = ^"ab"\n\tprint(np.length(1))\n\tquit()\n`)).join(","), 'Cannot find member "length" in base "NodePath".,Function "length()" not found in base NodePath.');
  });

  it("模块级 var 与 const 也是解析期那一形（S389）", async () => {
    eq("389", "模块标注 var", (await diags('var s: String = "ab"\n' + MOD("\tprint(s.length(1))")))[0] ?? "没拒", MANY("length", 0, 1));
    eq("389", "模块初值推断", (await diags("var s = \"ab\"\n" + MOD("\tprint(s.length(1))")))[0] ?? "没拒", MANY("length", 0, 1));
    eq("389", "模块 const", (await diags('const C: String = "ab"\n' + MOD("\tprint(C.length(1))")))[0] ?? "没拒", MANY("length", 0, 1));
  });

  it("形参标注与内部类字段同样在解析期拦（S391，读数 compare44/47/48）", async () => {
    eq("391", "形参标注 String", (await diags(`${H}func f(s: String):\n\tprint(s.length(1))\n`))[0] ?? "没拒", MANY("length", 0, 1));
    eq("391", "形参标注后又被赋值", (await diags(`${H}func f(s: String):\n\ts = "cd"\n\tprint(s.length(1))\n`))[0] ?? "没拒", MANY("length", 0, 1));
    eq("391", "形参未标注", await diags(`${H}func f(s):\n\tprint(s.length(1))\n`), []);
    eq("391", "内部类字段", (await diags(`${H}class Inner:\n\tvar s: String = "ab"\n\tfunc g():\n\t\tprint(s.length(1))\n`))[0] ?? "没拒", MANY("length", 0, 1));
    eq("391", "内部类字段初值推断", (await diags(`${H}class Inner:\n\tvar s = "ab"\n\tfunc g():\n\t\tprint(s.length(1))\n`))[0] ?? "没拒", MANY("length", 0, 1));
  });

  it("证不出来就不报：重新赋值过的名字与推断不出类型的接收者", async () => {
    eq("380", "被重新赋值过", await diags(MOD('\tvar t = "ab"\n\tt = "cd"\n\tt.length(1)')), []);
    eq("380", "形参接收者", await diags(`${H}func f(s) -> void:\n\ts.length(1)\n\nfunc _initialize():\n\tf("ab")\n\tquit()\n`), []);
  });

  it("表里没有的名字不猜元数", async () => {
    eq("380", "没量过的名字", await diags(MOD("\ts.frobnicate(1, 2, 3)")), []);
  });
});
