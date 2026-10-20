// NodePath 一族（语料 264 钉了 124 格引擎读数；本门钉语料看不见的那些：报错句、越界与哈希的拒、构造签名、
// 转换族与 c_escape 的打印形）。读数：`tmp/probe-nodepath/`（np.log–np7.log 与 g-*/h-*/k-*/q-*/o-* 探头）。
import { describe, it } from "vitest";
import { eq } from "@gds2js/testkit";
import { V, type Variant } from "@gds2js/runtime/runtime/tags";
import { GDict, nodePathCtor, repr, show, varToStr, valueEq } from "@gds2js/runtime/runtime/values";
import { ops } from "@gds2js/runtime/runtime/ops";
import { method } from "@gds2js/runtime/runtime/methods";
import { variantHashNumber } from "@gds2js/runtime/runtime/builtins";
import { vector2 } from "@gds2js/runtime/runtime/vector2";
import { asType, isType, typeOf } from "@gds2js/runtime/runtime/patterns";
import { variantConvert } from "@gds2js/runtime/runtime/convert";
import { I, S } from "./support/variants";

const np = (s: string): Variant => nodePathCtor([S(s)]);

/** 抛出来的东西统一折成 `[code] 文案`，中文自述只取第一个「：」之前（后面那段是缘由说明，不参与钉格）。 */
function code(f: () => unknown): string {
  try {
    f();
    return "没抛";
  } catch (e) {
    const err = e as { code?: string; message?: string };
    const msg = (err.message ?? "").split("：")[0];
    return `[${err.code ?? "?"}] ${msg}`;
  }
}

const OP = (who: string, op: string): string => `[${who}-operands] Invalid operands 'NodePath' and 'NodePath' in operator '${op}'.`;

describe("runtime · NodePath 一族", () => {
  it("等式看三段，与 null 比是假", () => {
    const a = np("a/b");
    eq("264", "同型的四格：绝对位 / 名字表 / 子名表（实测 n44–n48）", [
      String(valueEq(a, np("a/b"))),
      String(valueEq(a, np("a/c"))),
      String(valueEq(np("/a/b"), a)),
      String(valueEq(a, np("a/b:"))),
      String(valueEq(np("a" + "\\" + ":b"), np("a:b"))),
    ].join("|"), "true|false|false|true|false");
    eq("264", "与 null：== 假、!= 真（实测 q09 与 variant_op 的 AlwaysTrue 那条）", [
      String(valueEq(a, V.nil())),
      String(ops.neq(a, V.nil()).v),
    ].join("|"), "false|true");
    eq("264", "八种来源各量过一格，全是同一句模板", [
      code(() => ops.eq(a, I(5))),
      code(() => ops.eq(a, V.float(1.5))),
      code(() => ops.eq(a, V.bool(true))),
      code(() => ops.eq(a, S("a/b"))),
      code(() => ops.eq(a, V.stringName("a/b"))),
      code(() => ops.eq(a, V.array([] as Variant[]))),
      code(() => ops.eq(a, V.dict(new GDict()))),
      code(() => ops.eq(a, vector2(1, 2))),
    ].join(" | "), [
      "int", "float", "bool", "String", "StringName", "Array", "Dictionary", "Vector2",
    ].map((n) => `[eq-operands] Invalid operands 'NodePath' and '${n}' in operator '=='.`).join(" | "));
    eq("264", "!= 那句里写的是 != 而不是 ==", code(() => ops.neq(a, I(5))), "[eq-operands] Invalid operands 'NodePath' and 'int' in operator '!='.");
  });

  it("排序与算术一律是运行期那一句", () => {
    const x = np("x");
    eq("264", "同型也不给排序：< / <= / > / >= 四句（实测 lt / le / gt / ge 四段）", [
      code(() => ops.lt(x, np("y"))),
      code(() => ops.lte(x, np("y"))),
      code(() => ops.gt(x, np("y"))),
      code(() => ops.gte(x, np("y"))),
    ].join(" | "), ["<", "<=", ">", ">="].map((o) => OP("compare", o)).join(" | "));
    eq("264", "与 String 比的 < 同一句（实测 ltstr）", code(() => ops.lt(x, S("y"))), "[compare-operands] Invalid operands 'NodePath' and 'String' in operator '<'.");
    eq("264", "+ 两个来源（实测 addnp / addstr）", [
      code(() => ops.add(x, np("y"))),
      code(() => ops.add(x, S("y"))),
    ].join(" | "), "[add-operands] Invalid operands 'NodePath' and 'NodePath' in operator '+'. | [add-operands] Invalid operands 'NodePath' and 'String' in operator '+'.");
    eq("264", "- 那一格（实测 subnp）", code(() => ops.sub(x, np("y"))), OP("sub", "-"));
  });

  it("方法面：七支发出，越界与哈希拒", () => {
    const p = np("a/b:1");
    eq("264", "名数 / 子名数 / 取值 / 绝对位 / 判空（实测 b01–b06 与 n20–n32）", [
      String(method(p, "get_name_count", []).v),
      String(method(p, "get_subname_count", []).v),
      show(method(p, "get_name", [I(1)])),
      String(typeOf(method(p, "get_name", [I(0)])).v),
      String(method(np("/a"), "is_absolute", []).v),
      String(method(np(""), "is_empty", []).v),
      String(method(np("/"), "is_empty", []).v),
    ].join("|"), "2|1|b|21|true|true|false");
    eq("264", "属性路径的五形（实测 a01–a08 与 v53）", [
      show(method(np("a/b"), "get_as_property_path", [])),
      show(method(p, "get_as_property_path", [])),
      show(method(np("x:"), "get_as_property_path", [])),
      show(method(np("/"), "get_as_property_path", [])),
      show(method(np("a" + "\\" + ":b"), "get_as_property_path", [])),
    ].join("|"), ":a/b|:a/b:1|:x|/|:a\\:b");
    eq("264", "六支的元数句一支一名（实测 m1–m6 与 P2–P4）", [
      code(() => method(p, "get_name_count", [I(1)])),
      code(() => method(p, "get_name", [])),
      code(() => method(p, "get_name", [I(0), I(1)])),
      code(() => method(p, "get_subname", [])),
      code(() => method(p, "is_absolute", [I(1)])),
      code(() => method(p, "get_as_property_path", [I(1)])),
    ].join(" | "), [
      'Too many arguments for "get_name_count()" call. Expected at most 0 but received 1.',
      'Too few arguments for "get_name()" call. Expected at least 1 but received 0.',
      'Too many arguments for "get_name()" call. Expected at most 1 but received 2.',
      'Too few arguments for "get_subname()" call. Expected at least 1 but received 0.',
      'Too many arguments for "is_absolute()" call. Expected at most 0 but received 1.',
      'Too many arguments for "get_as_property_path()" call. Expected at most 0 but received 1.',
    ].map((s) => `[arity] ${s}`).join(" | "));
    eq("264", "越界拒（实测 P6 / dynidx：引擎打的是带 core/string/ 行号的 ERROR）", [
      code(() => method(np("a"), "get_name", [I(3)])),
      code(() => method(np("a"), "get_name", [I(-1)])),
    ].join(" | "), "[node-path-index] NodePath.get_name(3) 越界 | [node-path-index] NodePath.get_name(-1) 越界");
    eq("264", "下标只量过 int 来源", code(() => method(p, "get_name", [S("0")])), "[node-path-arg] NodePath.get_name() 的下标实参只量过 int（收到 String）");
    eq("541", "hash() 与全局 hash 同值（S541 解出式子）", [
      show(method(p, "hash", [])),
      String(variantHashNumber(p)),
    ].join(" | "), "311100680 | 311100680");
    const HASHES: Array<[string, string]> = [
      ["", "0"],
      ["a", "3608900604"],
      ["a/b", "1780534522"],
      ["/a", "686066691"],
      ["a:b", "1732909862"],
      ["a:b:c", "2319611842"],
      ["x:y", "2828350315"],
      ["/a/b:c/d", "2286972979"],
      [".", "2937937738"],
      ["/", "1537813453"],
      ["a b/c", "2818862689"],
      ["a/b:1", "311100680"],
      ["/a/b:1", "3983866615"],
      ["a/b:1:2", "1176488632"],
    ];
    for (const [text, want] of HASHES) {
      eq("541", `NodePath("${text}")`, `${show(method(np(text), "hash", []))}|${String(variantHashNumber(np(text)))}`, `${want}|${want}`);
    }
    eq("264", "别的名给运行期那句 Nonexistent function（实测 dyn）", code(() => method(p, "bogus", [])), "[node-path-method] Invalid call. Nonexistent function 'bogus' in base 'NodePath'.");
  });

  it("构造、解析式子与打印的实测形", () => {
    eq("264", "零 / 一实参与拷贝三形（实测 a05 / a06 / P7 / r05）", [
      show(nodePathCtor([])),
      String(method(nodePathCtor([]), "is_empty", []).v),
      show(nodePathCtor([V.stringName("a/b")])),
      show(nodePathCtor([np("a:b")])),
      String(method(nodePathCtor([np("a:b")]), "get_subname_count", []).v),
    ].join("|"), "|true|a/b|a:b|1");
    eq("264", "不合式的签名按引擎那句（实测 P8 / many）", [
      code(() => nodePathCtor([I(42)])),
      code(() => nodePathCtor([S("a"), S("b")])),
    ].join(" | "), '[node-path-ctor] No constructor of "NodePath" matches the signature "NodePath(int)". | [node-path-ctor] No constructor of "NodePath" matches the signature "NodePath(String, String)".');
    eq("264", "解析式子的十二形（实测 n06–n19 与 e1/e2/e5）", [
      show(np("")),
      show(np("/")),
      show(np(".")),
      show(np("a/")),
      show(np("a//b")),
      show(np("//a")),
      show(np("x:")),
      show(np("a:b:c")),
      show(np("  a  ")),
      show(np("A/b/../c")),
      show(np("a" + "\\" + "/b")),
      show(np(":a")),
    ].join("|"), "|/|.|a|a/b|/a|x|a:b:c|  a  |A/b/../c|a\\/b|:a");
    eq("264", "中间空子名那一形拒（实测 P1：引擎回空路径并打一句 ERROR）", code(() => np("a::b")), '[node-path-invalid] NodePath("a::b") 的解析式子没量过（引擎给空路径并打一句 core/string/ 的 ERROR）');
    eq("264", "三种打印形：裸串 / ^\"…\" / NodePath(\"…\")，后两形过 c_escape（实测 v06 / v07 / v15）", [
      show(np("a\\:b")),
      repr(np("a\\:b")),
      varToStr(np("a\\:b")),
      repr(np("a/b")),
      varToStr(np("a/b")),
      repr(np("a" + "\\" + "\\" + ":b")),
    ].join(" | "), "a\\:b | ^\"a\\\\:b\" | NodePath(\"a\\\\:b\") | ^\"a/b\" | NodePath(\"a/b\") | ^\"a\\\\\\\\:b\"");
  });

  it("typeof / is / as / 转换族", () => {
    eq("264", "typeof 22 与 is 的两格（实测 e01 / g7）", [
      String(typeOf(np("a")).v),
      String(isType(np("a"), "NodePath").v),
      String(isType(S("a"), "NodePath").v),
    ].join("|"), "22|true|false");
    eq("264", "as 的三形：同型 / String / StringName 进，其余是那一句（实测 r20 / caststr / srn / castnil / int / bool / dict）", [
      show(asType(np("a/b"), "NodePath")),
      show(asType(S("a/b"), "NodePath")),
      show(asType(V.stringName("a/b"), "NodePath")),
      code(() => asType(V.nil(), "NodePath")),
      code(() => asType(I(7), "NodePath")),
    ].join(" | "), "a/b | a/b | a/b | [as-node-path] Invalid cast: could not convert value to 'NodePath'. | [as-node-path] Invalid cast: could not convert value to 'NodePath'.");
    eq("264", "转换族六格（实测 a12–a15 / r10–r17）", [
      show(variantConvert(np("a/b"), I(4), true)),
      String(typeOf(variantConvert(np("a/b"), I(4), true)).v),
      show(variantConvert(np("a/b"), I(21), true)),
      String(valueEq(variantConvert(np("a/b"), I(22), true), np("a/b"))),
      show(variantConvert(S("a/b"), I(22), true)),
      show(variantConvert(I(5), I(22), false)),
    ].join("|"), "a/b|4|a/b|true|a/b|");
    eq("264", "var_to_str 的键序：NodePath 排在 StringName 之后，并列按插入序（实测 o01 / o02）", (() => {
      const d = new GDict();
      d.set(S("s"), I(1));
      d.set(V.stringName("sn"), I(2));
      d.set(np("a/b"), I(3));
      d.set(I(7), I(4));
      return varToStr(V.dict(d));
    })(), "{\n7: 4,\n\"s\": 1,\n&\"sn\": 2,\nNodePath(\"a/b\"): 3\n}");
  });
});
