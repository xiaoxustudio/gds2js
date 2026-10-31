// `dict_to_inst`（语料 266 钉了 29 格引擎读数；本门钉语料看不见的那些：非 Dictionary 的引擎那句、三条失败原文、
// `@path` 给 NodePath 那一形、造不出宿主根类的自家拒，以及「灌进 accessor 的原值只住这一台实例」（实测 h04：旁两台照旧出门类型默认值））。
// 读数：`tmp/probe-inst/`（S269 ⑦ / S272，英文原文靠 `--language en`）。
import { describe, it } from "vitest";
import { eq } from "@gds2js/testkit";
import { V, type Variant } from "@gds2js/runtime/runtime/tags";
import { GDict, show } from "@gds2js/runtime/runtime/values";
import { nodePathValue } from "@gds2js/runtime/runtime/class/identity/node-path";
import {
  ClassDesc,
  GdScriptObject,
  defineClass,
  registerDictIdentity,
  registerNativeBase,
} from "@gds2js/runtime/runtime/class/object/script-object";
import { gInstToDict } from "@gds2js/runtime/runtime/builtins";
import { gDictToInst } from "@gds2js/runtime/runtime/methods";
import { I, S } from "./support/variants";

class Pack extends GdScriptObject {
  a = I(1);
  b = I(2);
}
const packDesc: ClassDesc = defineClass(Pack, () => new Pack(), (o: object) => o instanceof Pack);
registerNativeBase(packDesc, "RefCounted");
registerDictIdentity(packDesc, "res://m.gd", "Pack", ["a", "b"], {}, (o: object) => {
  const s = o as Pack;
  return [s.a, s.b];
});

class Acc extends GdScriptObject {
  _v = I(1);
}
const accDesc: ClassDesc = defineClass(Acc, () => new Acc(), (o: object) => o instanceof Acc);
registerNativeBase(accDesc, "RefCounted");
// `v` 是无类型的 get/set 属性、`ai` 是 int 的：读数器给 nil 占位，出门值由 runtime 换成声明类型的默认值。
registerDictIdentity(accDesc, "res://m.gd", "Acc", ["_v", "v", "ai"], { v: null, ai: "int" }, (o: object) => {
  const s = o as Acc;
  return [s._v, V.nil(), V.nil()];
});

class MainRoot extends GdScriptObject {}
const rootDesc: ClassDesc = defineClass(MainRoot, () => new MainRoot(), (o: object) => o instanceof MainRoot);
registerNativeBase(rootDesc, "RefCounted");
// 模块根类进表的是空类路径（产物就是这么登记的，S270 ①），`@subpath` 认不到类要靠它。
registerDictIdentity(rootDesc, "res://m.gd", "", [], {}, () => []);

/** 字典字面量：`@path` 与 `@subpath` 是 String 键，字段键在实参侧 String 与 StringName 都认（实测 s01 / t24）。 */
function dd(rows: Array<[string, Variant]>): Variant {
  const g = new GDict();
  for (const [k, val] of rows) g.set(V.str(k), val);
  return V.dict(g);
}

const code = (f: () => unknown): string => {
  try {
    f();
    return "没抛";
  } catch (e) {
    return `[${(e as { code?: string }).code ?? "?"}] ${(e as Error).message}`;
  }
};

describe("runtime · dict_to_inst 一族", () => {
  it("认类、灌值与三条口径", () => {
    eq("266", "按名单灌值、字典里多的键静默忽略",
      show(gInstToDict(gDictToInst(dd([["@path", S("res://m.gd")], ["@subpath", nodePathValue("Pack")], ["a", I(7)], ["zz", I(9)]])))),
      '{ "@subpath": ^"Pack", "@path": "res://m.gd", &"a": 7, &"b": 2 }');
    eq("266", "字典里少的那格留类声明的默认值（_init 不跑，所以也不是 _init 的结果）",
      show(gInstToDict(gDictToInst(dd([["@path", S("res://m.gd")], ["@subpath", nodePathValue("Pack")], ["a", I(7)]])))),
      '{ "@subpath": ^"Pack", "@path": "res://m.gd", &"a": 7, &"b": 2 }');
    eq("266", "@subpath 给 String 也认（实测 s01：引擎只按名字找类）",
      show(gInstToDict(gDictToInst(dd([["@path", S("res://m.gd")], ["@subpath", S("Pack")]])))),
      '{ "@subpath": ^"Pack", "@path": "res://m.gd", &"a": 1, &"b": 2 }');
    eq("266", "@path 给 NodePath 也造得出实例（实测 i05）",
      show(gInstToDict(gDictToInst(dd([["@path", nodePathValue("res://m.gd")], ["@subpath", nodePathValue("Pack")], ["b", I(5)]])))),
      '{ "@subpath": ^"Pack", "@path": "res://m.gd", &"a": 1, &"b": 5 }');
  });

  it("灌进 get/set 属性的原值只住这一台实例", () => {
    const built = gDictToInst(dd([["@path", S("res://m.gd")], ["@subpath", nodePathValue("Acc")], ["_v", I(3)], ["v", I(2)], ["ai", I(77)]]));
    eq("266", "普通字段照灌、accessor 那一格出门灌进去的原值（实测 k02 / h04）",
      show(gInstToDict(built)),
      '{ "@subpath": ^"Acc", "@path": "res://m.gd", &"_v": 3, &"v": 2, &"ai": 77 }');
    eq("266", "旁两台不受影响：accessor 照旧出门声明类型的默认值（h01/h03）",
      show(gInstToDict(V.object(new Acc()))),
      '{ "@subpath": ^"Acc", "@path": "res://m.gd", &"_v": 1, &"v": <null>, &"ai": 0 }');
    eq("266", "字典没给 accessor 时也出门默认值",
      show(gInstToDict(gDictToInst(dd([["@path", S("res://m.gd")], ["@subpath", nodePathValue("Acc")]])))),
      '{ "@subpath": ^"Acc", "@path": "res://m.gd", &"_v": 1, &"v": <null>, &"ai": 0 }');
  });

  it("四条失败按实测走", () => {
    eq("266", "实参不是 Dictionary 是引擎运行期那句（实测 d01：类型名走 valueTypeName）",
      code(() => gDictToInst(S("x"))),
      '[dict-to-inst-arg] Invalid type in GDScript utility function "dict_to_inst()". Cannot convert argument 1 from String to Dictionary.');
    eq("266", "int 那一形的类型名是 int（实测 d02）", code(() => gDictToInst(I(5))),
      '[dict-to-inst-arg] Invalid type in GDScript utility function "dict_to_inst()". Cannot convert argument 1 from int to Dictionary.');
    eq("266", "缺 @path", code(() => gDictToInst(dd([["@subpath", nodePathValue("Pack")]]))),
      '[dict-to-inst] Error calling GDScript utility function "dict_to_inst()": Invalid instance dictionary format (missing @path).');
    eq("266", "@path 加载不到（引擎前面那两句带 C++ 行号的 ERROR 不复刻）",
      code(() => gDictToInst(dd([["@path", S("res://nope.gd")]]))),
      '[dict-to-inst] Error calling GDScript utility function "dict_to_inst()": Invalid instance dictionary format (can\'t load script at @path).');
    eq("266", "@subpath 指名不存在的类是 dictionary 不是 dictionary format（实测 n03 原文）",
      code(() => gDictToInst(dd([["@path", S("res://m.gd")], ["@subpath", nodePathValue("NoSuch")]]))),
      '[dict-to-inst] Error calling GDScript utility function "dict_to_inst()": Invalid instance dictionary (invalid subclasses).');
    eq("266", "缺 @subpath 要造的是模块根类：只量过 SceneTree 那一形，响亮拒",
      code(() => gDictToInst(dd([["@path", S("res://m.gd")]]))),
      "[dict-to-inst-root] dict_to_inst() 造模块根类那一形（缺 @subpath 或 @subpath 是空路径）只量过 extends SceneTree 的模块：引擎真会造出宿主实例（实测造出 <SceneTree#号> 并漏出一片 RID），Tier 1 发不出那种实例，别的宿主基类也没量过，不猜");
    eq("266", "@subpath 给空 NodePath（inst_to_dict 对模块根类发的那一格）同一条拒",
      code(() => gDictToInst(dd([["@path", S("res://m.gd")], ["@subpath", nodePathValue("")]]))),
      "[dict-to-inst-root] dict_to_inst() 造模块根类那一形（缺 @subpath 或 @subpath 是空路径）只量过 extends SceneTree 的模块：引擎真会造出宿主实例（实测造出 <SceneTree#号> 并漏出一片 RID），Tier 1 发不出那种实例，别的宿主基类也没量过，不猜");
  });
});
