/**
 * 接收者静态已知（字面量 / 标注变量 / 形参标注）而方法名在那一面不存在时，引擎发的是解析期拒：
 * `String` / `Array` 两句，`Dictionary` 只发第二句；初值推断的名字与 `Variant` 装箱都不算静态（那两形运行期才给 `Invalid call. …`）。
 * 尺 `tmp/probe-slice/{round2,round3,round4,round8}.mts`，读数 `compare{104,105,106,110}.txt`（158 名 × 四面 + 180 名 × pack 九支的确认不存在名单）。
 * pack 那一面「标注变量发、推断变量不发」是 `tmp/probe-slice/r7c.gd` 一行一行对出来的。
 */
import { describe, expect, it } from "vitest";
import { analyze } from "@gds2js/compiler/analyze";
import { lower } from "@gds2js/compiler/lower/lower";
import { parseSource } from "@gds2js/compiler/parse/parser";

async function diags(body: string): Promise<string[]> {
  return analyze(lower(await parseSource(`extends SceneTree\n\nfunc _initialize():\n${body}\n\tquit()\n`))).diagnostics.map((d) => d.message);
}

const ONE = (t: string, n: string): string => `Function "${n}()" not found in base ${t}.`;
const BOTH = (t: string, n: string): string[] => [`Cannot find member "${n}" in base "${t}".`, ONE(t, n)];

describe("静态接收者的表外方法名", () => {
  const CASES: Array<[string, string, string[]]> = [
    ["字面量 String 表外名", '\tprint("abcdef".slice(1))', BOTH("String", "slice")],
    ["字面量 String 乱造名", '\tprint("abcdef".nosuch(1))', BOTH("String", "nosuch")],
    ["标注 String 表外名", '\tvar s: String = "abcd"\n\tprint(s.slice(1))', BOTH("String", "slice")],
    ["推断 String 表外名放过", '\tvar s = "abcd"\n\tprint(s.slice(1))', []],
    ["字面量 Array 表外名", "\tprint([1, 2].nosuch())", BOTH("Array", "nosuch")],
    ["字面量字典表外名只第二句", '\tprint({1: 2}.nosuch())', [ONE("Dictionary", "nosuch")]],
    ["标注字典表外名只第二句", '\tvar d: Dictionary = {}\n\tprint(d.nosuch())', [ONE("Dictionary", "nosuch")]],
    ["字典推断变量放过", '\tvar d = {1: 2}\n\tprint(d.nosuch())', []],
    ["pack 构造位表外名", '\tprint(PackedStringArray(["a"]).join("-"))', BOTH("PackedStringArray", "join")],
    ["pack 标注变量表外名", '\tvar p: PackedStringArray = PackedStringArray(["a"])\n\tprint(p.join("-"))', BOTH("PackedStringArray", "join")],
    ["链式 float 面读表外名报两遍（S464）", '\tvar v: Vector2 = Vector2(1, 2)\n\tprint(v.angle().zzz)', ['Cannot find member "zzz" in base "float".', 'Cannot find member "zzz" in base "float".']],
    ["链式 int 面读表外名报两遍（S464）", '\tvar vi: Vector2i = Vector2i(1, 2)\n\tprint(vi.length_squared().zzz)', ['Cannot find member "zzz" in base "int".', 'Cannot find member "zzz" in base "int".']],
    ["链式返回 float 配 int 放过", '\tvar v: Vector2 = Vector2(1, 2)\n\tprint(v.angle() + 1)', []],
    ["元素读 int 面表外名报两遍（S464）", '\tvar ea: Array[int] = [1]\n\tprint(ea[0].zzz)', ['Cannot find member "zzz" in base "int".', 'Cannot find member "zzz" in base "int".']],
    ["字典值读表外名报两遍（S473）", '\tvar dv: Dictionary[String, Vector2] = {"a": Vector2(1, 2)}\n\tprint(dv["a"].zzz)', ['Cannot find member "zzz" in base "Vector2".', 'Cannot find member "zzz" in base "Vector2".']],
    ["字典值读用名字的键同样开口（S473）", '\tvar dv: Dictionary[String, Vector2] = {"a": Vector2(1, 2)}\n\tvar k: String = "a"\n\tprint(dv[k].zzz)', ['Cannot find member "zzz" in base "Vector2".', 'Cannot find member "zzz" in base "Vector2".']],
    ["数组读用非常量下标同样开口（S473）", '\tvar ea: Array[Vector2] = [Vector2(1, 2)]\n\tvar j: int = 0\n\tprint(ea[j].zzz)', ['Cannot find member "zzz" in base "Vector2".', 'Cannot find member "zzz" in base "Vector2".']],
    ["字典值读的 int 面表外名（S473）", '\tvar di: Dictionary[String, int] = {"a": 1}\n\tprint(di["a"].zzz)', ['Cannot find member "zzz" in base "int".', 'Cannot find member "zzz" in base "int".']],
    ["字典值读的表外方法调用两句（S473）", '\tvar dv: Dictionary[String, Vector2] = {"a": Vector2(1, 2)}\n\tprint(dv["a"].nosuch())', BOTH("Vector2", "nosuch")],
    ["字典值读的元数两句（S473）", '\tvar dv: Dictionary[String, Vector2] = {"a": Vector2(1, 2)}\n\tprint(dv["a"].length(1))', ['Too many arguments for "length()" call. Expected at most 0 but received 1.']],
    ["元素读的 String 面元数（S473）", '\tvar es: Array[String] = ["x"]\n\tprint(es[0].length(1))', ['Too many arguments for "length()" call. Expected at most 0 but received 1.']],
    ["字典值读的 String 面元数（S473）", '\tvar ds: Dictionary[String, String] = {"a": "x"}\n\tprint(ds["a"].length(1))', ['Too many arguments for "length()" call. Expected at most 0 but received 1.']],
    ["元素读的 String 面真成员放过（S473）", '\tvar es: Array[String] = ["x"]\n\tprint(es[0].split(" "))', []],
    ["字典值读的真成员放过（S473）", '\tvar dv: Dictionary[String, Vector2] = {"a": Vector2(1, 2)}\n\tprint(dv["a"].x)', []],
    ["字典值读的方法名当值放过（S473）", '\tvar dv: Dictionary[String, Vector2] = {"a": Vector2(1, 2)}\n\tprint(dv["a"].normalized)', []],
    ["属性读的 float 面表外名两句（S474）", '\tvar v: Vector2 = Vector2(1, 2)\n\tprint(v.x.zzz)', ['Cannot find member "zzz" in base "float".', 'Cannot find member "zzz" in base "float".']],
    ["属性读的 int 面表外名两句（S474）", '\tvar vi: Vector2i = Vector2i(1, 2)\n\tprint(vi.x.zzz)', ['Cannot find member "zzz" in base "int".', 'Cannot find member "zzz" in base "int".']],
    ["属性读上的调用两句（S474）", '\tvar v: Vector2 = Vector2(1, 2)\n\tprint(v.x.length(1))', BOTH("float", "length")],
    ["链到底的属性读两句（S474）", '\tvar v: Vector2 = Vector2(1, 2)\n\tprint(v.normalized().x.zzz)', ['Cannot find member "zzz" in base "float".', 'Cannot find member "zzz" in base "float".']],
    ["Color 的 int 成员面（S474）", '\tvar c: Color = Color(1, 2, 3, 4)\n\tprint(c.r8.sign())', BOTH("int", "sign")],
    ["元素读下的属性读两句（S474）", '\tvar ea: Array[Vector2] = [Vector2(1, 2)]\n\tprint(ea[0].x.zzz)', ['Cannot find member "zzz" in base "float".', 'Cannot find member "zzz" in base "float".']],
    ["属性读配标量放过（S474）", '\tvar v: Vector2 = Vector2(1, 2)\n\tprint(v.x + 1)', []],
    ["pack 表外名走全集（S480）", "\tprint(PackedInt32Array([1]).zzz)", ['Cannot find member "zzz" in base "PackedInt32Array".', 'Cannot find member "zzz" in base "PackedInt32Array".']],
    ["pack 表外名的调用两句走全集（S480）", "\tprint(PackedInt64Array([1]).nosuch())", BOTH("PackedInt64Array", "nosuch")],
    ["pack 真成员名放过（S480）", "\tprint(PackedFloat32Array([1]).size())", []],
    ["pack 的 byte 独有名在其余八支开口（S480）", "\tprint(PackedInt32Array([1]).hex_encode())", BOTH("PackedInt32Array", "hex_encode")],
    ["往 pack 表外名上写也是那两句（S480）", "\tvar b: PackedByteArray = PackedByteArray([1])\n\tb.zzz = 1", ['Cannot find member "zzz" in base "PackedByteArray".', 'Cannot find member "zzz" in base "PackedByteArray".']],
    ["链子交出 pack 面的成员名两句（S480）", '\tvar s: String = "abcd"\n\tprint(s.hex_decode().zzz)', ['Cannot find member "zzz" in base "PackedByteArray".', 'Cannot find member "zzz" in base "PackedByteArray".']],
    ["链子交出 pack 面的调用两句（S480）", '\tvar s: String = "abcd"\n\tprint(s.bigrams().nosuch())', BOTH("PackedStringArray", "nosuch")],
    ["链子交出 pack 面的真成员放过（S480）", '\tvar s: String = "abcd"\n\tprint(s.hex_decode().size())', []],
    ["元素读 String 面真成员放过", '\tvar es: Array[String] = ["a"]\n\tprint(es[0].length())', []],
    ["pack 推断变量放过", '\tvar p = PackedStringArray(["a"])\n\tprint(p.join("-"))', []],
    ["byte 独有的名在其余八支开口", "\tprint(PackedInt32Array([1]).hex_encode())", BOTH("PackedInt32Array", "hex_encode")],
    ["byte 独有的名在 byte 放过", "\tprint(PackedByteArray([1]).hex_encode())", []],
    ["to_byte_array 只在 byte 开口", "\tprint(PackedByteArray([1]).to_byte_array())", BOTH("PackedByteArray", "to_byte_array")],
    ["to_byte_array 在其余八支放过", "\tprint(PackedInt32Array([1]).to_byte_array())", []],
    ["byte 独有的名也吃元数两句（至多）", "\tprint(PackedByteArray([1]).hex_encode(1))", ['Too many arguments for "hex_encode()" call. Expected at most 0 but received 1.']],
    ["compress 的上界一支", "\tprint(PackedByteArray([1]).compress(1, 2))", ['Too many arguments for "compress()" call. Expected at most 1 but received 2.']],
    ["decompress 的下界一支", "\tvar b: PackedByteArray = PackedByteArray([1])\n\tprint(b.decompress())", ['Too few arguments for "decompress()" call. Expected at least 1 but received 0.']],
    ["合法元数不许拦", "\tprint(PackedByteArray([1]).hex_encode())", []],
  ];

  it.each(CASES)("%s", async (_label, body, want) => {
    expect(await diags(body)).toEqual(want);
  });
});

describe("pack 的属性两面（读数 tmp/probe-attr/compare3.txt）", () => {
  const attrSay = (t: string, n: string): string => `Cannot find member "${n}" in base "${t}".`;
  const CASES: Array<[string, string, string[]]> = [
    ["构造位读表外名报两遍", "\tprint(PackedByteArray([1]).keys)", [attrSay("PackedByteArray", "keys"), attrSay("PackedByteArray", "keys")]],
    ["构造位写表外名报两遍", "\tPackedStringArray([\"a\"]).keys = 1", [attrSay("PackedStringArray", "keys"), attrSay("PackedStringArray", "keys")]],
    ["标注位读表外名", "\tvar q: PackedInt64Array = PackedInt64Array([1])\n\tprint(q.values)", [attrSay("PackedInt64Array", "values"), attrSay("PackedInt64Array", "values")]],
    ["byte 独有的名在其余八支开口", "\tprint(PackedInt32Array([1]).hex_encode)", [attrSay("PackedInt32Array", "hex_encode"), attrSay("PackedInt32Array", "hex_encode")]],
    ["byte 独有的名在 byte 放过", "\tprint(PackedByteArray([1]).hex_encode)", []],
    ["推断位读表外名放过", "\tvar q = PackedByteArray([1])\n\tprint(q.keys)", []],
    ["方法名当值读放过", "\tprint(PackedByteArray([1]).size)", []],
    ["写成员名给常量那一句", "\tvar q: PackedColorArray = PackedColorArray([Color(1, 0, 0, 1)])\n\tq.size = 1", ["Cannot assign a new value to a constant."]],
    ["写成员名换名照旧那一句", "\tvar q: PackedInt32Array = PackedInt32Array([1])\n\tq.remove_at = 1", ["Cannot assign a new value to a constant."]],
    ["构造位写成员名", "\tPackedStringArray([\"a\"]).append = 1", ["Cannot assign a new value to a constant."]],
    ["推断位写成员名放过", "\tvar q = PackedByteArray([1])\n\tq.duplicate = 1", []],
    ["读成员名不许发常量那句", "\tvar q: PackedColorArray = PackedColorArray([Color(1, 0, 0, 1)])\n\tprint(q.size)", []],
    ["标注 Array 读表外名报两遍", '\tvar a: Array = [1, 2]\n\tprint(a.nosuch)', [attrSay("Array", "nosuch"), attrSay("Array", "nosuch")]],
    ["标注 Array 写成员名给常量那一句", "\tvar a: Array = [1, 2]\n\ta.append = 1", ["Cannot assign a new value to a constant."]],
    ["标注 String 读表外名报两遍", '\tvar s: String = "abcd"\n\tprint(s.nosuch)', [attrSay("String", "nosuch"), attrSay("String", "nosuch")]],
    ["标注 String 写成员名给常量那一句", '\tvar s: String = "abcd"\n\ts.to_upper = 1', ["Cannot assign a new value to a constant."]],
    ["标注 Dictionary 读属性不在解析期开口", '\tvar d: Dictionary = {1: 2}\n\tprint(d.nosuch)', []],
    ["标注 Dictionary 写属性不在解析期开口", '\tvar d: Dictionary = {1: 2}\n\td.nosuch = 1', []],
    ["字面量 Array 读表外名报两遍", "\tprint([1, 2].nosuch)", [attrSay("Array", "nosuch"), attrSay("Array", "nosuch")]],
    ["字面量 Array 写成员名给常量那一句", "\t[1, 2].append = 1", ["Cannot assign a new value to a constant."]],
    ["构造位 Array 读表外名报两遍", "\tprint(Array([1, 2]).nosuch)", [attrSay("Array", "nosuch"), attrSay("Array", "nosuch")]],
    ["字面量 String 读表外名报两遍", '\tprint("abcd".nosuch)', [attrSay("String", "nosuch"), attrSay("String", "nosuch")]],
    ["字面量 String 写成员名给常量那一句", '\t"abcd".to_upper = 1', ["Cannot assign a new value to a constant."]],
    ["构造位 String 读表外名报两遍", '\tprint(String("abcd").nosuch)', [attrSay("String", "nosuch"), attrSay("String", "nosuch")]],
    ["推断来的 Array 读属性放过", "\tvar a = [1, 2]\n\tprint(a.nosuch)", []],
    ["字面量字典读表外名放过", "\tprint({1: 2}.nosuch)", []],
  ];

  it.each(CASES)("%s", async (_label, body, want) => {
    expect(await diags(body)).toEqual(want);
  });
});

describe("形参标注的属性面与 var 标注同一形（读数 tmp/probe-bincall/compare6.txt 的 N1–N4）", () => {
  const say2 = (t: string, n: string): string => `Cannot find member "${n}" in base "${t}".`;
  const src = (sig: string, body: string): string => `extends SceneTree\n\nfunc f(${sig}):\n${body}\n\nfunc _initialize():\n\tquit()\n`;
  const CASES: Array<[string, string, string, string[]]> = [
    ["形参 Array 读表外名", "a: Array", "\tprint(a.nosuch)", [say2("Array", "nosuch"), say2("Array", "nosuch")]],
    ["形参 Array 写成员名", "a: Array", "\ta.append = 1", ["Cannot assign a new value to a constant."]],
    ["形参 String 读表外名", "s: String", "\tprint(s.nosuch)", [say2("String", "nosuch"), say2("String", "nosuch")]],
    ["形参 pack 读表外名", "p: PackedStringArray", "\tprint(p.keys)", [say2("PackedStringArray", "keys"), say2("PackedStringArray", "keys")]],
    ["形参 pack 写成员名", "p: PackedStringArray", "\tp.size = 1", ["Cannot assign a new value to a constant."]],
    ["形参 Dictionary 放过", "d: Dictionary", "\tprint(d.nosuch)", []],
    ["形参 Array 读成员名放过", "a: Array", "\tprint(a.append)", []],
    ["形参没标注放过", "a", "\tprint(a.nosuch)", []],
  ];

  it.each(CASES)("%s", async (_label, sig, body, want) => {
    const diags = analyze(lower(await parseSource(src(sig, body)))).diagnostics.map((d) => d.message);
    expect(diags).toEqual(want);
  });
});

describe("值类型面只接成员名当值，两形不许顺手拦", () => {
  const CASES: Array<[string, string, string[]]> = [
    ["Vector2 成员名当值放过", "\tvar v: Vector2 = Vector2(3, 4)\n\tprint(v.length)", []],
    ["构造位 Vector2 成员名当值放过", "\tprint(Vector2(1, 2).normalized)", []],
    ["值类型面的表外名报两遍（S461：实例成员全集取自本机 `--dump-extension-api`）", "\tvar v: Vector2 = Vector2(3, 4)\n\tprint(v.nosuchzz)", ['Cannot find member "nosuchzz" in base "Vector2".', 'Cannot find member "nosuchzz" in base "Vector2".']],
    ["值类型面上写成员名没读数就放过", "\tvar v: Vector2 = Vector2(3, 4)\n\tv.length = 1", []],
    ["StringName 成员名当值放过", "\tvar s: StringName = StringName(\"ab\")\n\tprint(s.hash)", []],
    ["NodePath 成员名当值放过", "\tvar n: NodePath = NodePath(\"a/b\")\n\tprint(n.get_name_count)", []],
    ["NodePath 字面量成员名当值放过", "\tprint(NodePath(\"a/b\").hash)", []],
  ];

  it.each(CASES)("%s", async (_label, body, want) => {
    expect(await diags(body)).toEqual(want);
  });
});

describe("值类型与两支名字面的属性读按七面名单分岔（S432）", () => {
  const say2 = (t: string, n: string): string => `Cannot find member "${n}" in base "${t}".`;
  const CASES: Array<[string, string, string[]]> = [
    ["Vector2 读宇宙内表外名报两遍", "\tvar v: Vector2 = Vector2(3, 4)\n\tprint(v.keys)", [say2("Vector2", "keys"), say2("Vector2", "keys")]],
    ["Vector2 那一名宇宙外也报两遍（S461）", "\tvar v: Vector2 = Vector2(3, 4)\n\tprint(v.nosuchzz)", [say2("Vector2", "nosuchzz"), say2("Vector2", "nosuchzz")]],
    ["值类型面的写形没读数不开口", "\tvar v: Vector2 = Vector2(3, 4)\n\tv.keys = 1", []],
    ["Color 读成员名放过", "\tvar c: Color = Color(1, 0.5, 0.25, 1)\n\tprint(c.to_html)", []],
    ["StringName 读表外名报两遍", "\tvar s: StringName = StringName(\"ab\")\n\tprint(s.size)", [say2("StringName", "size"), say2("StringName", "size")]],
    ["NodePath 读表外名报两遍", "\tvar n: NodePath = NodePath(\"a/b\")\n\tprint(n.keys)", [say2("NodePath", "keys"), say2("NodePath", "keys")]],
    ["NodePath 读成员名放过", "\tvar n: NodePath = NodePath(\"a/b\")\n\tprint(n.get_name_count)", []],
    ["Vector3 读真属性放过", "\tvar q: Vector3 = Vector3(1, 2, 2)\n\tprint(q.z)", []],
  ];

  it.each(CASES)("%s", async (_label, body, want) => {
    expect(await diags(body)).toEqual(want);
  });
});

describe("存在但没量元数的名字不许误拦", () => {
  const OKAY: Array<[string, string]> = [
    ["字典 set", '\tvar d: Dictionary = {}\n\td.set(1, 2)'],
    ["字典 is_typed", "\tprint({1: 2}.is_typed())"],
    ["数组 set", "\tprint([1, 2].set(0, 3))"],
    ["pack erase", "\tprint(PackedInt32Array([1]).erase(1))"],
    ["byte compress", "\tprint(PackedByteArray([1]).compress(1))"],
    ["byte decompress", "\tprint(PackedByteArray([1]).decompress(6, 1))"],
    ["byte to_float32_array", "\tprint(PackedByteArray([1]).to_float32_array())"],
    ["byte to_int64_array", "\tprint(PackedByteArray([1]).to_int64_array())"],
    ["byte get_string_from_utf8", '\tprint(PackedByteArray([1]).get_string_from_utf8())'],
    ["String is_valid_ascii_identifier", '\tvar s: String = "abcd"\n\tprint(s.is_valid_ascii_identifier())'],
    ["String is_valid_unicode_identifier", '\tvar s: String = "abcd"\n\tprint(s.is_valid_unicode_identifier())'],
    ["String uri_file_decode", '\tvar s: String = "abcd"\n\tprint(s.uri_file_decode())'],
    ["String remove_char", '\tvar s: String = "abcd"\n\tprint(s.remove_char(97))'],
    ["String remove_chars", '\tvar s: String = "abcd"\n\tprint(s.remove_chars(97))'],
    ["String replace_char", '\tvar s: String = "abcd"\n\tprint(s.replace_char(97, 98))'],
    ["String replace_chars", '\tvar s: String = "abcd"\n\tprint(s.replace_chars(97, 98))'],
    ["String to_multibyte_char_buffer", '\tvar s: String = "abcd"\n\tprint(s.to_multibyte_char_buffer())'],
  ];

  it.each(OKAY)("%s", async (_label, body) => {
    expect((await diags(body)).filter((m) => /not found in base/.test(m))).toEqual([]);
  });
});
