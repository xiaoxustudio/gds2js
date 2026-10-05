// 由 tools/ops-check.ts 机械搬迁：region 696-779。
// 断言口径、以及「一个 it() = 一个原子 region、不可再拆成一格一个 it()」的理由，见 @gds2js/testkit。

import { describe, it } from "vitest";
import { eq } from "@gds2js/testkit";
import { UnsupportedError } from "@gds2js/runtime/runtime/errors";
import { GdScriptObject, wrapValue } from "@gds2js/runtime/runtime/object";
import { V, type Variant } from "@gds2js/runtime/runtime/tags";
import { GArray, GDict, show, strToVar, varToStr } from "@gds2js/runtime/runtime/values";
import { GBytes } from "@gds2js/runtime/runtime/packed";
import { variantConvert } from "@gds2js/runtime/runtime/convert";
import { vector2 } from "@gds2js/runtime/runtime/vector2";
import { vector3 } from "@gds2js/runtime/runtime/vector3";
import { vector3i } from "@gds2js/runtime/runtime/vector3i";
import { typeOf } from "@gds2js/runtime/runtime/patterns";
import { F, I, S } from "./support/variants";

describe("runtime · 类型转换族（236）", () => {
  it("236 · var_to_str 的整数按 int64 全宽打", async () => {
    const arrOf = (xs: Variant[]) => V.array(GArray.of(xs));
    const gd = (pairs: [Variant, Variant][]) => {
      const g = new GDict();
      for (const [k, v] of pairs) g.set(k, v);
      return V.dict(g);
    };
    /** 引擎实测的形状逐格对上；没实测过的类型走响亮拒，这里把 code 也当输出比一遍。 */
    const vs = (v: Variant): string => {
      try {
        return varToStr(v);
      } catch (e) {
        return `[${(e as UnsupportedError).code}]`;
      }
    };

    eq("236", "var_to_str 的整数按 int64 全宽打", `${vs(I(7))}|${vs(I(-17))}|${vs(I(2147483648))}|${vs(I(4611686018427387904n))}`, "7|-17|2147483648|4611686018427387904");
    eq("236", "var_to_str 的 null 与布尔是小写", `${vs(V.nil())}|${vs(V.bool(true))}|${vs(V.bool(false))}`, "null|true|false");
    eq("236", "var_to_str 的字符串加引号，只有引号与反斜杠转义", `${vs(S("x"))}|${vs(S(""))}|${vs(S('a"b'))}|${vs(S("a\\b"))}`, '"x"|""|"a\\"b"|"a\\\\b"');
    eq("236", "var_to_str 的制表符回车响铃原样留着（引擎 hex 22 09 22）", vs(S("a\tb\rc\u0007d")), '"a\tb\rc\u0007d"');
    eq("236", "var_to_str 不把非 ASCII 折成 \\u（引擎 hex 22 c3 a9 22）", `${vs(S("é"))}|${vs(S("😀"))}`, '"é"|"😀"');
    eq("236", "var_to_str 的 StringName 前面挂 &", vs(V.stringName("name")), '&"name"');
    eq("236", "var_to_str 的数组一行打完，空数组是 []", `${vs(arrOf([I(1), I(2)]))}|${vs(arrOf([]))}`, "[1, 2]|[]");
    eq("236", "var_to_str 的数组按元素递归", vs(arrOf([S("a"), V.nil(), V.bool(true)])), '["a", null, true]');
    eq("236", "var_to_str 的空容器套空容器", vs(arrOf([arrOf([]), gd([])])), "[[], {}]");
    eq("236", "var_to_str 里装 pack 与 StringName", vs(arrOf([V.object(new GBytes([1, 2], "byte")), V.stringName("s")])), '[PackedByteArray(1, 2), &"s"]');
    eq("236", "var_to_str 的字典上下各一行、键值冒号空格", vs(gd([[S("a"), I(1)]])), '{\n"a": 1\n}');
    eq("236", "var_to_str 的空字典是单行 {}", vs(gd([])), "{}");
    eq("236", "var_to_str 的字典按键排序：null<bool<int<float<String<StringName", vs(gd([[V.stringName("b"), I(1)], [S("a"), I(2)], [I(10), I(3)], [S("10"), I(4)], [V.bool(true), I(5)]])), '{\ntrue: 5,\n10: 3,\n"10": 4,\n"a": 2,\n&"b": 1\n}');
    eq("236", "var_to_str 的同级字符串键按码点（引擎把 \"10\" 排在 \"a\" 前）", vs(gd([[S("B"), I(1)], [S("a"), I(2)], [S("A"), I(3)]])), '{\n"A": 3,\n"B": 1,\n"a": 2\n}');
    eq("236", "var_to_str 的嵌套字典不缩进", vs(gd([[S("a"), gd([[S("b"), gd([[S("c"), I(1)]])]])]])), '{\n"a": {\n"b": {\n"c": 1\n}\n}\n}');
    eq("236", "var_to_str 的字典里数组仍单行", vs(gd([[S("a"), arrOf([arrOf([I(1), I(2)]), arrOf([I(3)])])]])), '{\n"a": [[1, 2], [3]]\n}');
    eq("236", "var_to_str 的 pack 打成构造器形状", `${vs(V.object(new GBytes([1, 2], "byte")))}|${vs(V.object(new GBytes([], "byte")))}`, "PackedByteArray(1, 2)|PackedByteArray()");
    eq("236", "var_to_str 认 int32/int64/string 三支 pack", `${vs(V.object(new GBytes([1, 2], "int32")))}|${vs(V.object(new GBytes([1], "int64")))}|${vs(V.object(new GBytes(["a", "b"], "string")))}`, 'PackedInt32Array(1, 2)|PackedInt64Array(1)|PackedStringArray("a", "b")');
    eq("236", "var_to_str 的浮点尾数没量出取数式子，响亮拒", vs(F(2.5)), "[var-to-str-float]");
    eq("236", "var_to_str 撞见装浮点的数组也拒", vs(arrOf([F(1)])), "[var-to-str-float]");
    eq("236", "var_to_str 撞见装浮点的 pack 也拒", vs(V.object(new GBytes([1.5], "float32"))), "[var-to-str-float]");
    eq("236", "var_to_str 的对象形状没实测，响亮拒", vs(wrapValue(new GdScriptObject())), "[var-to-str-type]");
    eq("236", "var_to_str 的数组键照元素递归打（引擎 onearrkey 那格）", vs(gd([[arrOf([I(1), I(2)]), I(9)]])), "{\n[1, 2]: 9\n}");
    eq("236", "var_to_str 的字典键自己也是多行（引擎 onedictkey 那格）", vs(gd([[gd([[S("z"), I(1)]]), I(5)]])), '{\n{\n"z": 1\n}: 5\n}');
    eq("236", "两个数组键的排序式子没量出，响亮拒", vs(gd([[arrOf([I(1), I(2)]), I(9)], [arrOf([I(3)]), I(8)]])), "[var-to-str-key]");
    eq("236", "数组里装了字典就跟着字典换行（引擎 arrval 那格）", vs(arrOf([arrOf([I(1), I(2)]), gd([[I(3), I(4)]])])), "[[1, 2], {\n3: 4\n}]");
    eq("236", "字典值是对象时照样响亮拒", vs(gd([[S("n"), wrapValue(new GdScriptObject())]])), "[var-to-str-type]");

    /** `str_to_var()` 的读数按「typeof|打印」两栏比，与语料同一个口径。 */
    const sv = (s: string): string => {
      try {
        const got = strToVar(S(s));
        return `${String((typeOf(got) as { v: number }).v)}|${show(got)}`;
      } catch (e) {
        return `[${(e as UnsupportedError).code}]`;
      }
    };
    eq("236", "str_to_var 的数字：整数走 int64、带点或带 e 就是 float", `${sv("7")}|${sv("1.5")}|${sv("007")}|${sv("-0")}|${sv("1e")}`, "2|7|3|1.5|2|7|2|0|3|1.0");
    eq("236", "str_to_var 只读一个值，后面跟着的不看（`1 2` 取 1、`0x10` 取 0、`1.5.2` 停在第二个点）", `${sv("1 2")}|${sv("0x10")}|${sv("1.5.2")}|${sv("1_000")}`, "2|1|2|0|3|1.5|2|1");
    eq("236", "str_to_var 的指数：`1e` 与 `1e+` 都算 1.0，正负号各一格，1e400 溢出成 inf", `${sv("1e")}|${sv("1e+")}|${sv("1.")}|${sv("1e+3")}|${sv("1e-3")}|${sv("1E3")}`, "3|1.0|3|1.0|3|1.0|3|1000.0|3|0.001|3|1000.0");
    eq("236", "str_to_var 认 inf / -inf / inf_neg / nan，大写与 + 号全不认", `${sv("inf")}|${sv("-inf")}|${sv("inf_neg")}|${sv("nan")}|${sv("+inf")}|${sv("-nan")}|${sv("- 7")}|${sv("-")}|${sv(".5")}`, "3|inf|3|-inf|3|-inf|3|nan|0|<null>|0|<null>|0|<null>|0|<null>|0|<null>");
    eq("236", "str_to_var 的字面量只认小写 null / true / false", `${sv("null")}|${sv("true")}|${sv("false")}|${sv("TRUE")}|${sv("True")}|${sv("Null")}|${sv("NaN")}|${sv("abc")}`, "0|<null>|1|true|1|false|0|<null>|0|<null>|0|<null>|0|<null>|0|<null>");
    eq("236", "str_to_var 的空白：前后空格与换行都跳掉，空串给 null", `${sv(" 7 ")}|${sv("\n7")}|${sv("")}|${sv("   ")}`, "2|7|2|7|0|<null>|0|<null>");
    eq("236", "str_to_var 的转义：n t r b f 是真控制符，反斜杠与斜杠照字面", `${sv('"a\\nb"')}|${sv('"a\\tb"')}|${sv('"a\\rb"')}|${sv('"a\\bb"')}|${sv('"a\\fb"')}|${sv('"a\\\\b"')}`, "4|a\nb|4|a\tb|4|a\rb|4|a\bb|4|a\fb|4|a\\b");
    eq("236", "str_to_var 的字符串只认双引号，未闭合给 null", `${sv('"x"')}|${sv('"a\\"b"')}|${sv("'x'")}|${sv('"abc')}`, "4|x|4|a\"b|0|<null>|0|<null>");
    eq("236", "str_to_var 认不出的转义字母是「删掉反斜杠留原字符」（实测 \\a \\v \\q \\x \\0）", `${sv('"a\\ab"')}|${sv('"a\\vb"')}|${sv('"a\\qb"')}|${sv('"a\\x41b"')}|${sv('"a\\0b"')}`, "4|aab|4|avb|4|aqb|4|ax41b|4|a0b");
    eq("236", "str_to_var 的 \\u 吃四个十六进制位，大小写都收", `${sv('"\\u0041"')}|${sv('"\\u00e9"')}|${sv('"\\uAbCd"')}|${sv('"a\\uFFFFb"')}`, "4|A|4|é|4|\uabcd|4|a\uffffb");
    eq("236", "str_to_var 的代理区、缺位与非法十六进制的 \\u 整串作废", `${sv('"a\\uD800b"')}|${sv('"a\\uDFFFb"')}|${sv('"a\\u41b"')}|${sv('"a\\uZZZZb"')}`, "0|<null>|0|<null>|0|<null>|0|<null>");
    eq("236", "str_to_var 的 \\U 吃满六位，多出来的照字面留着（u14）", sv('"a\\U0001F600b"'), "4|aǶ00b");
    eq("236", "str_to_var 的 StringName：&\"...\" 收，&'...' 与 &name 都不收", `${sv('&"name"')}|${sv('&"a\\tb"')}|${sv("&'name'")}|${sv("&name")}`, "21|name|21|a\tb|0|<null>|0|<null>");
    eq("236", "str_to_var 的数组：分隔符齐就收，尾逗号也收", `${sv("[1,2]")}|${sv("[ 1 , 2 ]")}|${sv("[1, 2,]")}|${sv("[ ]")}|${sv("[1, [2, 3]]")}`, "28|[1, 2]|28|[1, 2]|28|[1, 2]|28|[]|28|[1, [2, 3]]");
    eq("236", "str_to_var 的数组缺一角就整串作废（未闭合、缺逗号、空元素、裸词）", `${sv("[1")}|${sv("[1,,2]")}|${sv("[1 2]")}|${sv("[,]")}|${sv("[.]")}|${sv("[abc]")}`, "0|<null>|0|<null>|0|<null>|0|<null>|0|<null>|0|<null>");
    eq("236", "str_to_var 的字典打印是 `{ 元素 }`，键的类型实测那六种都收", `${sv("{1: 2}")}|${sv('{1: 2, "b": 3}')}|${sv("{1.5: 2}")}|${sv("{true: 1}")}|${sv("{null: 1}")}|${sv('{&"a": 1}')}`, "27|{ 1: 2 }|27|{ 1: 2, \"b\": 3 }|27|{ 1.5: 2 }|27|{ true: 1 }|27|{ <null>: 1 }|27|{ &\"a\": 1 }");
    eq("236", "str_to_var 的字典认多行写法与尾逗号，重复键后者盖前者", `${sv('{\n"a": 1,\n"b": 2\n}')}|${sv('{"a": 1,}')}|${sv("{1: 2, 1: 3}")}|${sv("{ }")}|${sv("{}")}`, '27|{ "a": 1, "b": 2 }|27|{ "a": 1 }|27|{ 1: 3 }|27|{  }|27|{  }');
    eq("236", "str_to_var 的字典缺冒号、缺值或键是裸词都整串作废", `${sv("{a: 1}")}|${sv('{"a"}')}|${sv("{: 1}")}|${sv('{"a": }')}|${sv('{"a" 1}')}`, "0|<null>|0|<null>|0|<null>|0|<null>|0|<null>");
    eq("236", "str_to_var 的嵌套：字典里套字典再套数组与 StringName 键", sv('{"a": {"b": [1, {&"c": 2}]}}'), '27|{ "a": { "b": [1, { &"c": 2 }] } }');
    eq("236", "str_to_var 的向量与颜色按实测 arity：arity 不对给 null", `${sv("Vector2(1.5, 2)")}|${sv("Vector2 (1, 2)")}|${sv("Vector2(1,2)")}|${sv("Vector2(1)")}|${sv("Vector2()")}|${sv("Vector2(1, 2, 3)")}`, "5|(1.5, 2.0)|5|(1.0, 2.0)|5|(1.0, 2.0)|0|<null>|0|<null>|0|<null>");
    eq("236", "str_to_var 的整型向量把浮点截断（实测 -1.7 → -1）", `${sv("Vector2i(-1.7, 2)")}|${sv("Vector3i(1.5, 2, 3)")}|${sv("Vector3(1, 2, 3)")}|${sv("Color(1, 0, 0, 1)")}|${sv("Color(1, 0, 0)")}`, "6|(-1, 2)|10|(1, 2, 3)|9|(1.0, 2.0, 3.0)|20|(1.0, 0.0, 0.0, 1.0)|0|<null>");
    eq("236", "str_to_var 的构造参数只量过数字：串与嵌套构造式全给 null", `${sv('Vector2("1", 2)')}|${sv("Vector2(Vector2(1, 2), 3)")}|${sv('Vector2i("a", 2)')}|${sv("Vector2(1, 2,)")}|${sv("(1, 2)")}`, "0|<null>|0|<null>|0|<null>|0|<null>|0|<null>");
    eq("236", "str_to_var 的 pack 构造式按类型收敛：byte 回绕、int 截断、int64 饱和", `${sv("PackedByteArray(1, 2)")}|${sv("PackedByteArray(300)")}|${sv("PackedByteArray(-1)")}|${sv("PackedByteArray(1.7)")}|${sv("PackedByteArray()")}`, "29|[1, 2]|29|[44]|29|[255]|29|[1]|29|[]");
    eq("236", "str_to_var 认其余六支 pack 的形状", `${sv("PackedInt32Array(1.7, 2)")}|${sv("PackedInt64Array(1)")}|${sv("PackedFloat32Array(1)")}|${sv("PackedFloat64Array(1.5)")}|${sv('PackedStringArray("a")')}|${sv("PackedVector2Array(1, 2)")}`, "30|[1, 2]|31|[1]|32|[1.0]|33|[1.5]|34|[\"a\"]|35|[(1.0, 2.0)]");
    eq("236", "str_to_var 的 pack 元素类型不合式给 null（实测 int 串互斥）", `${sv('PackedByteArray("a")')}|${sv('PackedInt32Array("a")')}|${sv("PackedStringArray(1)")}|${sv("PackedByteArray(1, 2,)")}`, "0|<null>|0|<null>|0|<null>|0|<null>");
    eq("236", "str_to_var 的 int64 饱和（引擎同时往 stderr 打一句 Too large，值这边一致）", `${sv("99999999999999999999")}|${sv("PackedInt64Array(99999999999999999999)")}`, "2|9223372036854775807|31|[9223372036854775807]");
    eq("236", "str_to_var 撞见引擎给得出而我们没形状的类型，响亮拒", `${sv("Rect2(1, 2, 3, 4)")}|${sv("Quaternion(1, 2, 3, 4)")}|${sv("PackedColorArray()")}`, "[str-to-var-type]|[str-to-var-type]|[str-to-var-type]");
    eq("236", "str_to_var 撞见没量过的构造式名字响亮拒（引擎的 null 只量过 NoSuchType 那一格）", sv("NoSuchType(1)"), "[str-to-var-shape]");
    eq("236", "str_to_var 的实参只量过 String：给 int 就拒", String(((() => { try { return strToVar(I(7)); } catch (e) { return `[${(e as UnsupportedError).code}]`; } })())), "[str-to-var-arg]");
    eq("236", "var_to_str 打出去的写法，str_to_var 能原样读回来", sv(vs(gd([[S("a"), arrOf([I(1), gd([[S("b"), I(2)]])])], [I(3), S("z")]]))), '27|{ 3: "z", "a": [1, { "b": 2 }] }');
  });
});

describe("runtime/convert · convert 与 type_convert 的目标表", () => {
  it("236 · 两支转换的目标表、就近默认值与三条响亮拒", async () => {
    const arrOf = (...xs: Variant[]): Variant => V.array(GArray.of(xs));
    const gd = (pairs: [Variant, Variant][]): Variant => {
      const g = new GDict();
      for (const [k, v] of pairs) g.set(k, v);
      return V.dict(g);
    };
    const cv = (v: Variant, t: number, strict: boolean): string => {
      try {
        const r = variantConvert(v, I(t), strict);
        return `${String((typeOf(r) as { v: number }).v)}|${show(r)}`;
      } catch (e) {
        return `[${(e as UnsupportedError).code}]`;
      }
    };
    eq("236", "convert 的标量三支：bool / int / float，浮点截断往零走", `${cv(I(1), 1, true)}|${cv(I(0), 1, true)}|${cv(F(2.7), 2, true)}|${cv(F(-2.7), 2, true)}|${cv(F(2.7), 3, true)}`, "1|true|1|false|2|2|2|-2|3|2.7");
    eq("236", "convert 的字符串走 to_int 那条道（0x10 取 10、1e3 取 13）", `${cv(S("7"), 2, true)}|${cv(S("abc"), 2, true)}|${cv(S("0x10"), 2, true)}|${cv(S("1e3"), 2, true)}|${cv(S("1e3"), 3, true)}`, "2|7|2|0|2|10|2|13|3|1000.0");
    eq("236", "convert 的 String 与 StringName：掉 & 才算文本", `${cv(S("x"), 4, true)}|${cv(V.stringName("x"), 4, true)}|${cv(S("x"), 21, true)}|${cv(I(1), 4, true)}`, "4|x|4|x|21|x|0|<null>");
    eq("236", "convert 的向量族：同族两支过、跨族给 null", `${cv(vector2(1.7, 2), 6, true)}|${cv(vector3(1, 2, 3), 10, true)}|${cv(vector2(1, 2), 9, true)}|${cv(I(1), 5, true)}`, "6|(1, 2)|10|(1, 2, 3)|0|<null>|0|<null>");
    eq("236", "convert 的 int 转 Color 是 0xRRGGBBAA 拆字节", `${cv(I(1), 20, true)}|${cv(I(255), 20, true)}|${cv(I(256), 20, true)}|${cv(I(-1), 20, true)}`, "20|(0.0, 0.0, 0.0, 0.0039)|20|(0.0, 0.0, 0.0, 1.0)|20|(0.0, 0.0, 0.0039, 0.0)|20|(1.0, 1.0, 1.0, 1.0)");
    eq("236", "convert 的数组进 pack、pack 进数组", `${cv(arrOf(I(1), I(2)), 30, true)}|${cv(arrOf(S("a")), 30, true)}|${cv(arrOf(I(1), I(2)), 34, true)}|${cv(V.object(new GBytes([1, 2], "byte")), 28, true)}`, '30|[1, 2]|30|[0]|34|["1", "2"]|28|[1, 2]');
    eq("236", "convert 的跨种 pack 与给不出的形状都是 null", `${cv(V.object(new GBytes([1, 2], "byte")), 30, true)}|${cv(arrOf(I(1)), 27, true)}|${cv(gd([]), 28, true)}`, "0|<null>|0|<null>|0|<null>");
    eq("236", "type_convert 的就近默认值：零向量、空名、空容器", `${cv(I(7), 5, false)}|${cv(I(7), 21, false)}|${cv(arrOf(), 1, false)}|${cv(S(""), 1, false)}|${cv(I(7), 28, false)}|${cv(I(7), 27, false)}`, "5|(0.0, 0.0)|21||1|false|1|false|28|[]|27|{  }");
    eq("236", "type_convert 的 String 走 print：null 给 <null>", `${cv(V.nil(), 4, false)}|${cv(gd([]), 4, false)}|${cv(V.stringName("s"), 4, false)}`, "4|<null>|4|{  }|4|s");
    eq("236", "type_convert 的向量跨族：v3 掉 z、v2 补 0", `${cv(vector3(1, 2, 3), 5, false)}|${cv(vector2(1, 2), 10, false)}|${cv(vector3i(1, 2, 3), 6, false)}`, "5|(1.0, 2.0)|10|(1, 2, 0)|6|(1, 2)");
    eq("236", "空 pack 是假（引擎 type_convert(PackedByteArray(), TYPE_BOOL) 那一格）", cv(V.object(new GBytes([], "byte")), 1, false), "1|false");
    eq("236", "越界目标原样返回（实测 -1 与 TYPE_MAX 两格）", `${cv(I(7), -1, false)}|${cv(I(7), 39, true)}`, "2|7|2|7");
    eq("236", "我们没形状的目标类型响亮拒（Rect2 / Callable / PackedColorArray）", `${cv(I(7), 7, true)}|${cv(I(7), 25, false)}|${cv(I(7), 37, false)}`, "[convert-target]|[convert-target]|[convert-target]");
    eq("236", "目标实参不是 int 响亮拒", String(((() => {
      try {
        return show(variantConvert(I(7), S("2"), true));
      } catch (e) {
        return `[${(e as UnsupportedError).code}]`;
      }
    })())), "[convert-target]");
    eq("236", "字符串转 Color 走名字表与 hex（S241 量齐后发出，认不出的给 (0,0,0,1) 而不是 null）", `${cv(S("red"), 20, true)}|${cv(S("red"), 20, false)}`, "20|(1.0, 0.0, 0.0, 1.0)|20|(1.0, 0.0, 0.0, 1.0)");
    eq("236", "pack 的同型转换拷一份（实测写回不串原包）", (() => {
      const src = V.object(new GBytes([1, 2], "byte"));
      const copy = variantConvert(src, I(29), true) as Variant;
      (copy.v as GBytes).raw()[0] = 9;
      return `${show(src)}|${show(copy)}`;
    })(), "[1, 2]|[9, 2]");
    eq("236", "数组与字典的同型转换是同一个对象（实测 append 会串回去）", (() => {
      const a = arrOf(I(1));
      const b = variantConvert(a, I(28), true) as Variant;
      (b.v as GArray).raw().push(I(2));
      return `${show(a)}|${String(a === b)}`;
    })(), "[1, 2]|true");
  });
});
