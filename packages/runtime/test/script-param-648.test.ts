/** 脚本方法**被调方入口**的实参位（S648，§2 0 ④ 那一格）。尺 `tmp/probe648/gen648.mjs`，读数 `params648.txt` 廿四形：
 *  拒的那一族发 `Invalid type in function '<名>' in base '<原生基类> (<类名>)'. Cannot convert argument <N> from <源> to <目标>.`，
 *  收下的按引擎的折法在入口折成目标型。表外的 want 与没量过的源形不动（不猜）。 */
import { describe, it } from "vitest";
import { eq } from "@gds2js/testkit";
import { V, tagName, type Variant } from "@gds2js/runtime/runtime/tags";
import { method } from "@gds2js/runtime/runtime/methods";
import { GArray, GDict } from "@gds2js/runtime/runtime/values";
import { GVector2 } from "@gds2js/runtime/runtime/class/vector/vector2";
import {
  GdScriptObject, methodParamsOf, nullCallable, registerClass, registerMethodParams, registerNativeBase,
  registerScriptLabel, wrapValue,
} from "@gds2js/runtime/runtime/class/object/script-object";
import { gdDispatchByName } from "./support/gd-dispatch";
import { F, I, S } from "./support/variants";

class Inner648 extends GdScriptObject {
  ti(a: Variant): Variant {
    return a;
  }

  tf(a: Variant): Variant {
    return a;
  }

  tb(a: Variant): Variant {
    return a;
  }

  ts(a: Variant): Variant {
    return a;
  }

  tsn(a: Variant): Variant {
    return a;
  }

  tv(a: Variant): Variant {
    return a;
  }

  freec(a: Variant): Variant {
    return I(7);
  }

  override __gdDispatch(name: string, args: Variant[]): Variant | null {
    return gdDispatchByName(this, name, args);
  }
}

const dInner = registerClass("Inner", Inner648, () => new Inner648(), (o) => o instanceof Inner648);
registerNativeBase(dInner, "RefCounted");
registerScriptLabel(dInner, "Inner");
registerMethodParams(dInner, {
  ti: ["int"], tf: ["float"], tb: ["bool"], ts: ["String"], tsn: ["StringName"], tv: ["Vector2"], freec: [null],
});
const o = wrapValue(new Inner648());

const say = (name: string, args: Variant[]): string => {
  try {
    void method(o, name, args);
    return "没抛";
  } catch (e) {
    const err = e as { code?: string; message?: string };
    return `[${err.code}] ${err.message ?? ""}`;
  }
};

const refuse = (name: string, arg: Variant, from: string, to: string): string =>
  `[script-param-type] Invalid type in function '${name}' in base 'RefCounted (Inner)'. Cannot convert argument 1 from ${from} to ${to}.`;

describe("runtime/methods · 脚本方法入口的实参位（S648）", () => {
  it("int 槽：八个坏源各发一句，源名照引擎", () => {
    eq("648", "int ← String", say("ti", [S("x")]), refuse("ti", S("x"), "String", "int"));
    eq("648", "int ← Nil", say("ti", [V.nil()]), refuse("ti", V.nil(), "Nil", "int"));
    eq("648", "int ← Array", say("ti", [V.array(GArray.of([]))]), refuse("ti", V.array(GArray.of([])), "Array", "int"));
    eq("648", "int ← Dictionary", say("ti", [V.dict(new GDict())]), refuse("ti", V.dict(new GDict()), "Dictionary", "int"));
    eq("648", "int ← Vector2", say("ti", [V.object(new GVector2(1, 2))]), refuse("ti", V.object(new GVector2(1, 2)), "Vector2", "int"));
    eq("648", "int ← Callable", say("ti", [nullCallable()]), refuse("ti", nullCallable(), "Callable", "int"));
    eq("648", "int ← StringName", say("ti", [V.stringName("a")]), refuse("ti", V.stringName("a"), "StringName", "int"));
  });

  it("float / bool 槽", () => {
    eq("648", "float ← String", say("tf", [S("x")]), refuse("tf", S("x"), "String", "float"));
    eq("648", "float ← Nil", say("tf", [V.nil()]), refuse("tf", V.nil(), "Nil", "float"));
    eq("648", "float ← Vector2", say("tf", [V.object(new GVector2(1, 2))]), refuse("tf", V.object(new GVector2(1, 2)), "Vector2", "float"));
    eq("648", "bool ← Nil", say("tb", [V.nil()]), refuse("tb", V.nil(), "Nil", "bool"));
    eq("648", "bool ← String", say("tb", [S("yes")]), refuse("tb", S("yes"), "String", "bool"));
  });

  it("String / StringName / Vector2 槽", () => {
    eq("648", "String ← int", say("ts", [I(1)]), refuse("ts", I(1), "int", "String"));
    eq("648", "String ← float", say("ts", [F(1.5)]), refuse("ts", F(1.5), "float", "String"));
    eq("648", "String ← Array", say("ts", [V.array(GArray.of([]))]), refuse("ts", V.array(GArray.of([])), "Array", "String"));
    eq("648", "String ← Nil", say("ts", [V.nil()]), refuse("ts", V.nil(), "Nil", "String"));
    eq("648", "String ← Vector2", say("ts", [V.object(new GVector2(1, 2))]), refuse("ts", V.object(new GVector2(1, 2)), "Vector2", "String"));
    eq("648", "StringName ← int", say("tsn", [I(1)]), refuse("tsn", I(1), "int", "StringName"));
    eq("648", "Vector2 ← int", say("tv", [I(1)]), refuse("tv", I(1), "int", "Vector2"));
    eq("648", "Vector2 ← Array", say("tv", [V.array(GArray.of([]))]), refuse("tv", V.array(GArray.of([])), "Array", "Vector2"));
  });

  it("收下的三档在入口折成目标型（语料 409 两侧逐字节）", () => {
    const folded = (name: string, arg: Variant): string => {
      const r = method(o, name, [arg]);
      return `${tagName(r.t)}:${typeof r.v === "object" ? "盒子" : String(r.v)}`;
    };
    eq("648", "int ← bool 折 1/0", `${folded("ti", V.bool(true))}|${folded("ti", V.bool(false))}`, "int:1|int:0");
    eq("648", "int ← float 向零截断", `${folded("ti", F(1.5))}|${folded("ti", F(-1.7))}`, "int:1|int:-1");
    eq("648", "float ← int 升 1.0", folded("tf", I(1)), "float:1");
    eq("648", "float ← bool 升 1.0", folded("tf", V.bool(true)), "float:1");
    eq("648", "bool ← int / float 按不等 0", `${folded("tb", I(1))}|${folded("tb", I(0))}|${folded("tb", F(0.5))}`, "bool:true|bool:false|bool:true");
    eq("648", "String ← StringName 折成 String", folded("ts", V.stringName("a")), "String:a");
    eq("648", "StringName ← String 折成 StringName", folded("tsn", S("a")), "StringName:a");
    eq("648", "没标注的位什么都收", folded("freec", S("anything")), "int:7");
    eq("648", "表没登记的名不动（nope）", methodParamsOf(new Inner648())?.["nope"] === undefined, true);
  });
});
