// `inst_to_dict`（语料 265 钉了 27 格引擎读数；本门钉语料看不见的那些：三处响亮拒的文案、类值的引擎那句、
// 继承链的字段序，以及产物没有 res 路径那一形）。读数：`tmp/probe-inst/`（S269）。
import { describe, it } from "vitest";
import { eq } from "@gds2js/testkit";
import { V, type Variant } from "@gds2js/runtime/runtime/tags";
import { show } from "@gds2js/runtime/runtime/values";
import {
  ClassDesc,
  GdScriptObject,
  defineClass,
  registerDictIdentity,
  registerNativeBase,
  setClassBase,
} from "@gds2js/runtime/runtime/class/object/script-object";
import { gInstToDict } from "@gds2js/runtime/runtime/builtins";
import { nativeClass } from "@gds2js/runtime/runtime/class/identity/native-class";
import { I, S } from "./support/variants";

class DictBase extends GdScriptObject {
  a = I(1);
}
const baseDesc: ClassDesc = defineClass(DictBase, () => new DictBase(), (o: object) => o instanceof DictBase);
registerNativeBase(baseDesc, "RefCounted");
registerDictIdentity(baseDesc, "res://m.gd", "DictBase", ["a"], {}, (o: object) => [(o as DictBase).a]);

class DictDerived extends GdScriptObject {
  a: Variant = I(1);
  b = I(2);
  ai: Variant = I(9);
}
const derivedDesc: ClassDesc = defineClass(DictDerived, () => new DictDerived(), (o: object) => o instanceof DictDerived);
registerNativeBase(derivedDesc, "RefCounted");
setClassBase(derivedDesc, baseDesc);
// `ai` 是带 get/set 的 int 属性：引擎不调 getter，出门的是类型默认值（实测 a01 那一格）。
registerDictIdentity(derivedDesc, "res://m.gd", "DictDerived", ["b", "ai"], { ai: "int" }, (o: object) => {
  const s = o as DictDerived;
  return [s.b, V.nil()];
});

class RectAcc extends GdScriptObject {}
const rectDesc: ClassDesc = defineClass(RectAcc, () => new RectAcc(), (o: object) => o instanceof RectAcc);
registerNativeBase(rectDesc, "RefCounted");
// Rect2 那一格的出门值没量过 → 响亮拒。
registerDictIdentity(rectDesc, "res://m.gd", "RectAcc", ["ar"], { ar: "Rect2" }, () => [V.nil()]);

class NoPath extends GdScriptObject {
  k = I(1);
}
const noPathDesc: ClassDesc = defineClass(NoPath, () => new NoPath(), (o: object) => o instanceof NoPath);
registerNativeBase(noPathDesc, "RefCounted");
registerDictIdentity(noPathDesc, null, "NoPath", ["k"], {}, (o: object) => [(o as NoPath).k]);

const code = (f: () => unknown): string => {
  try {
    f();
    return "没抛";
  } catch (e) {
    return `[${(e as { code?: string }).code ?? "?"}] ${(e as Error).message}`;
  }
};

describe("runtime · inst_to_dict 一族", () => {
  it("出门的形状与三处响亮拒", () => {
    eq("265", "三段身份：@subpath 是 NodePath、@path 是 String、字段键是 StringName",
      show(gInstToDict(V.object(new DictBase()))),
      '{ "@subpath": ^"DictBase", "@path": "res://m.gd", &"a": 1 }');
    eq("265", "继承链的字段序是基类在前（与 String.format 那条反着走，实测 h01）",
      show(gInstToDict(V.object(new DictDerived()))),
      '{ "@subpath": ^"DictDerived", "@path": "res://m.gd", &"a": 1, &"b": 2, &"ai": 0 }');
    eq("265", "accessor 的出门值只发量过的十六种类型",
      code(() => gInstToDict(V.object(new RectAcc()))),
      '[inst-to-dict-acc-type] inst_to_dict() 里 Rect2 类型的 get/set 属性没量过出门值（S269 ④ 量齐的是十六种形状），不猜');
    eq("265", "产物没有 res 路径时不发 @path 的猜测值",
      code(() => gInstToDict(V.object(new NoPath()))),
      "[inst-to-dict-path] inst_to_dict() 发不出 @path：这份产物没有模块的 res 路径（单文件模式），那一格没量过");
  });

  it("入参的四种来源按实测走", () => {
    eq("265", "null 给 null（实测 k05，不报错）", String((gInstToDict(V.nil()) as Variant).t), "0");
    eq("265", "脚本类值是运行期引擎那句（实测 classvalue，英文原文靠 --language en 取回）",
      code(() => gInstToDict(V.object(derivedDesc))),
      '[inst-to-dict] Error calling GDScript utility function "inst_to_dict()": Not a script with an instance.');
    eq("265", "引擎类值同一句", code(() => gInstToDict(nativeClass("Node"))),
      '[inst-to-dict] Error calling GDScript utility function "inst_to_dict()": Not a script with an instance.');
    eq("265", "非 Object 的实参是自家拒：引擎那几句是解析期的", code(() => gInstToDict(S("x"))),
      '[inst-to-dict-arg] inst_to_dict() 的实参只量过脚本实例、类值与 null（收到 String）：静态不合式的来源在引擎是解析期那句 argument 1 should be "Object"');
  });
});
