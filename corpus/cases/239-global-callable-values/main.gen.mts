// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../packages/runtime/src/runtime/index";
import { print, printJoined, printRaw, printErr, printVerbose, printRich, SceneTree } from "../../../tools/harness/scene-tree";

const INF = rt.V.float(Number.POSITIVE_INFINITY);
const NAN = rt.V.float(Number.NaN);
const PI = rt.V.float(3.141592653589793);
const TYPE_INT = rt.V.int(2);

export class Main extends SceneTree {
    override _initialize(): Promise<void> { return this.__gd__initialize(); }
  async __gd__initialize(): Promise<void> {
    print(rt.showArgs([rt.V.str("abs => "), rt.typeOf(rt.globalCallable("abs")), rt.V.str("|"), rt.globalCallable("abs")]));
    print(rt.showArgs([rt.V.str("str => "), rt.typeOf(rt.globalCallable("str")), rt.V.str("|"), rt.globalCallable("str")]));
    print(rt.showArgs([rt.V.str("len => "), rt.typeOf(rt.globalCallable("len")), rt.V.str("|"), rt.globalCallable("len")]));
    print(rt.showArgs([rt.V.str("range => "), rt.typeOf(rt.globalCallable("range")), rt.V.str("|"), rt.globalCallable("range")]));
    print(rt.showArgs([rt.V.str("convert => "), rt.typeOf(rt.globalCallable("convert")), rt.V.str("|"), rt.globalCallable("convert")]));
    print(rt.showArgs([rt.V.str("type_convert => "), rt.typeOf(rt.globalCallable("type_convert")), rt.V.str("|"), rt.globalCallable("type_convert")]));
    print(rt.showArgs([rt.V.str("load => "), rt.typeOf(rt.globalCallable("load")), rt.V.str("|"), rt.globalCallable("load")]));
    print(rt.showArgs([rt.V.str("prints => "), rt.typeOf(rt.globalCallable("prints")), rt.V.str("|"), rt.globalCallable("prints")]));
    print(rt.showArgs([rt.V.str("push_warning => "), rt.typeOf(rt.globalCallable("push_warning")), rt.V.str("|"), rt.globalCallable("push_warning")]));
    print(rt.showArgs([rt.V.str("randi => "), rt.typeOf(rt.globalCallable("randi")), rt.V.str("|"), rt.globalCallable("randi")]));
    print(rt.showArgs([rt.V.str("seed => "), rt.typeOf(rt.globalCallable("seed")), rt.V.str("|"), rt.globalCallable("seed")]));
    print(rt.showArgs([rt.V.str("weakref => "), rt.typeOf(rt.globalCallable("weakref")), rt.V.str("|"), rt.globalCallable("weakref")]));
    print(rt.showArgs([rt.V.str("get_stack => "), rt.typeOf(rt.globalCallable("get_stack")), rt.V.str("|"), rt.globalCallable("get_stack")]));
    print(rt.showArgs([rt.V.str("wrapi => "), rt.typeOf(rt.globalCallable("wrapi")), rt.V.str("|"), rt.globalCallable("wrapi")]));
    print(rt.showArgs([rt.V.str("var_to_str => "), rt.typeOf(rt.globalCallable("var_to_str")), rt.V.str("|"), rt.globalCallable("var_to_str")]));
    print(rt.showArgs([rt.V.str("fmt|"), rt.formatOf(rt.V.str("%s"), rt.globalCallable("abs"))]));
    print(rt.showArgs([rt.V.str("eq|"), rt.ops.eq(rt.globalCallable("abs"), rt.globalCallable("abs")), rt.V.str("|"), rt.ops.eq(rt.globalCallable("abs"), rt.globalCallable("sign")), rt.V.str("|"), rt.ops.eq(rt.globalCallable("str_to_var"), rt.globalCallable("str_to_var")), rt.V.str("|"), rt.ops.eq(rt.globalCallable("abs"), rt.callableCtor([])), rt.V.str("|"), rt.ops.eq(rt.globalCallable("len"), rt.globalCallable("load"))]));
    let f = rt.globalCallable("abs");
    print(rt.showArgs([rt.V.str("eqvar|"), rt.typeOf(f), rt.V.str("|"), f, rt.V.str("|"), rt.ops.eq(f, rt.globalCallable("abs")), rt.V.str("|"), rt.ops.eq(f, rt.globalCallable("sign"))]));
    print(rt.showArgs([rt.V.str("face|"), rt.method(rt.globalCallable("abs"), "is_valid", []), rt.V.str("|"), rt.method(rt.globalCallable("abs"), "is_null", []), rt.V.str("|"), rt.typeOf(rt.method(rt.globalCallable("abs"), "get_method", [])), rt.V.str("|"), rt.method(rt.globalCallable("abs"), "get_method", [])]));
    print(rt.showArgs([rt.V.str("face2|"), rt.method(rt.globalCallable("abs"), "get_argument_count", []), rt.V.str("|"), rt.method(rt.globalCallable("max"), "get_argument_count", []), rt.V.str("|"), rt.method(rt.globalCallable("lerp"), "get_argument_count", []), rt.V.str("|"), rt.method(rt.globalCallable("range"), "get_argument_count", []), rt.V.str("|"), rt.method(rt.globalCallable("prints"), "get_argument_count", [])]));
    print(rt.showArgs([rt.V.str("face3|"), rt.method(rt.globalCallable("abs"), "get_bound_arguments_count", []), rt.V.str("|"), rt.method(rt.method(rt.globalCallable("abs"), "bind", [rt.V.int(1), rt.V.int(2)]), "get_bound_arguments_count", []), rt.V.str("|"), rt.method(rt.method(rt.globalCallable("abs"), "bind", [rt.V.int(1), rt.V.int(2)]), "get_bound_arguments", [])]));
    print(rt.showArgs([rt.V.str("face4|"), rt.method(rt.method(rt.globalCallable("abs"), "bind", []), "get_method", []), rt.V.str("|"), rt.ops.eq(rt.method(rt.globalCallable("abs"), "bind", []), rt.globalCallable("abs")), rt.V.str("|"), rt.ops.eq(rt.method(rt.globalCallable("abs"), "bind", [rt.V.int(1)]), rt.method(rt.globalCallable("abs"), "bind", [rt.V.int(2)]))]));
    print(rt.showArgs([rt.V.str("call-abs|"), rt.typeOf(rt.method(rt.globalCallable("abs"), "call", [rt.V.int((-3))])), rt.V.str("|"), rt.method(rt.globalCallable("abs"), "call", [rt.V.int((-3))])]));
    print(rt.showArgs([rt.V.str("call-minmax|"), rt.method(rt.globalCallable("max"), "call", [rt.V.int(2), rt.V.int(7)]), rt.V.str("|"), rt.method(rt.globalCallable("min"), "call", [rt.V.int(2), rt.V.int(7)]), rt.V.str("|"), rt.method(rt.globalCallable("maxi"), "call", [rt.V.int(2), rt.V.int(7)]), rt.V.str("|"), rt.method(rt.globalCallable("mini"), "call", [rt.V.int(2), rt.V.int(7)]), rt.V.str("|"), rt.method(rt.globalCallable("maxf"), "call", [rt.V.int(2), rt.V.int(7)])]));
    print(rt.showArgs([rt.V.str("call-str|"), rt.typeOf(rt.method(rt.globalCallable("str"), "call", [rt.V.int(1), rt.V.int(2), rt.V.int(3)])), rt.V.str("|"), rt.method(rt.globalCallable("str"), "call", [rt.V.int(1), rt.V.int(2), rt.V.int(3)]), rt.V.str("|"), rt.method(rt.globalCallable("str"), "call", [rt.V.int(5)])]));
    print(rt.showArgs([rt.V.str("call-len|"), rt.method(rt.globalCallable("len"), "call", [rt.V.str("abcd")]), rt.V.str("|"), rt.method(rt.globalCallable("len"), "call", [rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2)]))])]));
    print(rt.showArgs([rt.V.str("call-range|"), rt.typeOf(rt.method(rt.globalCallable("range"), "call", [rt.V.int(3)])), rt.V.str("|"), rt.method(rt.globalCallable("range"), "call", [rt.V.int(3)]), rt.V.str("|"), rt.method(rt.globalCallable("range"), "call", [rt.V.int(1), rt.V.int(5)]), rt.V.str("|"), rt.method(rt.globalCallable("range"), "call", [rt.V.int(1), rt.V.int(2), rt.V.int(3)]), rt.V.str("|"), rt.method(rt.globalCallable("range"), "call", [rt.V.int((-2))])]));
    print(rt.showArgs([rt.V.str("call-convert|"), rt.method(rt.globalCallable("convert"), "call", [rt.V.str("7"), TYPE_INT]), rt.V.str("|"), rt.method(rt.globalCallable("type_convert"), "call", [rt.V.str("7"), TYPE_INT])]));
    print(rt.showArgs([rt.V.str("call-vts|"), rt.method(rt.globalCallable("var_to_str"), "call", [rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2)]))]), rt.V.str("|"), rt.method(rt.globalCallable("str_to_var"), "call", [rt.V.str("[1,2]")])]));
    print(rt.showArgs([rt.V.str("call-hash|"), rt.method(rt.globalCallable("hash"), "call", [rt.V.int(7)])]));
    print(rt.showArgs([rt.V.str("call-sign|"), rt.method(rt.globalCallable("sign"), "call", [rt.V.int((-9))]), rt.V.str("|"), rt.method(rt.globalCallable("signf"), "call", [rt.V.int((-9))]), rt.V.str("|"), rt.method(rt.globalCallable("signi"), "call", [rt.V.float((-9.5))])]));
    print(rt.showArgs([rt.V.str("call-pow|"), rt.method(rt.globalCallable("sqrt"), "call", [rt.V.float(9)]), rt.V.str("|"), rt.method(rt.globalCallable("pow"), "call", [rt.V.int(2), rt.V.int(10)]), rt.V.str("|"), rt.method(rt.globalCallable("exp"), "call", [rt.V.float(0)]), rt.V.str("|"), rt.method(rt.globalCallable("log"), "call", [rt.V.float(1)])]));
    print(rt.showArgs([rt.V.str("call-round|"), rt.method(rt.globalCallable("floor"), "call", [rt.V.float(3.7)]), rt.V.str("|"), rt.method(rt.globalCallable("ceil"), "call", [rt.V.float(3.2)]), rt.V.str("|"), rt.method(rt.globalCallable("round"), "call", [rt.V.float(3.5)]), rt.V.str("|"), rt.method(rt.globalCallable("floorf"), "call", [rt.V.float(3.7)]), rt.V.str("|"), rt.method(rt.globalCallable("ceili"), "call", [rt.V.float(3.2)]), rt.V.str("|"), rt.method(rt.globalCallable("roundi"), "call", [rt.V.float(2.5)])]));
    print(rt.showArgs([rt.V.str("call-clamp|"), rt.method(rt.globalCallable("clamp"), "call", [rt.V.int(5), rt.V.int(1), rt.V.int(3)]), rt.V.str("|"), rt.method(rt.globalCallable("clampi"), "call", [rt.V.int(5), rt.V.int(1), rt.V.int(3)]), rt.V.str("|"), rt.method(rt.globalCallable("clampf"), "call", [rt.V.int(5), rt.V.int(1), rt.V.int(3)])]));
    print(rt.showArgs([rt.V.str("call-wrap|"), rt.method(rt.globalCallable("wrapi"), "call", [rt.V.int(5), rt.V.int(0), rt.V.int(3)]), rt.V.str("|"), rt.method(rt.globalCallable("wrapf"), "call", [rt.V.float(5), rt.V.float(0), rt.V.float(3)])]));
    print(rt.showArgs([rt.V.str("call-mod|"), rt.method(rt.globalCallable("posmod"), "call", [rt.V.int((-7)), rt.V.int(3)]), rt.V.str("|"), rt.method(rt.globalCallable("fmod"), "call", [rt.V.int(7), rt.V.float(2.5)]), rt.V.str("|"), rt.method(rt.globalCallable("fposmod"), "call", [rt.V.int((-7)), rt.V.int(3)])]));
    print(rt.showArgs([rt.V.str("call-mix|"), rt.method(rt.globalCallable("lerp"), "call", [rt.V.float(1), rt.V.float(2), rt.V.float(0.5)]), rt.V.str("|"), rt.method(rt.globalCallable("lerpf"), "call", [rt.V.float(1), rt.V.float(2), rt.V.float(0.5)]), rt.V.str("|"), rt.method(rt.globalCallable("inverse_lerp"), "call", [rt.V.float(0), rt.V.float(10), rt.V.float(2.5)])]));
    print(rt.showArgs([rt.V.str("call-geom|"), rt.method(rt.globalCallable("move_toward"), "call", [rt.V.float(1), rt.V.float(5), rt.V.float(2)]), rt.V.str("|"), rt.method(rt.globalCallable("snapped"), "call", [rt.V.float(1.2), rt.V.float(0.5)]), rt.V.str("|"), rt.method(rt.globalCallable("snappedi"), "call", [rt.V.int(7), rt.V.int(5)]), rt.V.str("|"), rt.method(rt.globalCallable("snappedf"), "call", [rt.V.float(1.2), rt.V.float(0.5)])]));
    print(rt.showArgs([rt.V.str("call-ang|"), rt.method(rt.globalCallable("deg_to_rad"), "call", [rt.V.float(180)]), rt.V.str("|"), rt.method(rt.globalCallable("rad_to_deg"), "call", [PI]), rt.V.str("|"), rt.method(rt.globalCallable("angle_difference"), "call", [rt.V.float(0), PI])]));
    print(rt.showArgs([rt.V.str("call-cmp|"), rt.method(rt.globalCallable("is_equal_approx"), "call", [rt.V.float(1), rt.V.float(1)]), rt.V.str("|"), rt.method(rt.globalCallable("is_zero_approx"), "call", [rt.V.float(0)]), rt.V.str("|"), rt.method(rt.globalCallable("is_nan"), "call", [NAN]), rt.V.str("|"), rt.method(rt.globalCallable("is_inf"), "call", [INF]), rt.V.str("|"), rt.method(rt.globalCallable("is_finite"), "call", [rt.V.float(1)])]));
    print(rt.showArgs([rt.V.str("call-adv|"), rt.method(rt.globalCallable("ease"), "call", [rt.V.float(0.5), rt.V.float(2)]), rt.V.str("|"), rt.method(rt.globalCallable("smoothstep"), "call", [rt.V.float(0), rt.V.float(1), rt.V.float(0.5)]), rt.V.str("|"), rt.method(rt.globalCallable("remap"), "call", [rt.V.float(5), rt.V.float(0), rt.V.float(10), rt.V.float(0), rt.V.float(2)]), rt.V.str("|"), rt.method(rt.globalCallable("cubic_interpolate"), "call", [rt.V.float(1), rt.V.float(2), rt.V.float(1), rt.V.float(2), rt.V.float(0.5)])]));
    print(rt.showArgs([rt.V.str("call-typeof|"), rt.method(rt.globalCallable("typeof"), "call", [rt.V.int(1)]), rt.V.str("|"), rt.method(rt.globalCallable("typeof"), "call", [rt.V.str("a")])]));
    print(rt.showArgs([rt.V.str("call-f|"), rt.method(f, "call", [rt.V.int((-5))]), rt.V.str("|"), f]));
    print(rt.showArgs([rt.V.str("callv|"), rt.method(rt.globalCallable("abs"), "callv", [rt.V.array(rt.GArray.of([rt.V.int((-4))]))]), rt.V.str("|"), rt.typeOf(rt.method(rt.globalCallable("abs"), "callv", [rt.V.array(rt.GArray.of([]))])), rt.V.str("|"), rt.method(rt.globalCallable("abs"), "callv", [rt.V.array(rt.GArray.of([]))])]));
    print(rt.showArgs([rt.V.str("callv2|"), rt.method(rt.globalCallable("abs"), "callv", [rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2)]))]), rt.V.str("|"), rt.method(rt.globalCallable("max"), "callv", [rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(7)]))])]));
    print(rt.showArgs([rt.V.str("bind|"), rt.method(rt.method(rt.globalCallable("abs"), "bind", []), "call", [rt.V.int((-8))]), rt.V.str("|"), rt.method(rt.method(rt.globalCallable("abs"), "bind", [rt.V.int((-9))]), "callv", [rt.V.array(rt.GArray.of([]))])]));
    print(rt.showArgs([rt.V.str("arr|"), rt.strBuiltin([rt.V.array(rt.GArray.of([rt.globalCallable("abs"), rt.globalCallable("len"), rt.globalCallable("prints")]))])]));
    print(rt.showArgs([rt.V.str("arrhas|"), rt.method(rt.V.array(rt.GArray.of([rt.globalCallable("abs"), rt.globalCallable("sign")])), "has", [rt.globalCallable("sign")]), rt.V.str("|"), rt.method(rt.V.array(rt.GArray.of([rt.globalCallable("abs"), rt.globalCallable("sign")])), "has", [rt.globalCallable("len")])]));
    print(rt.showArgs([rt.V.str("dicthas|"), rt.method(rt.dictOf([[rt.globalCallable("abs"), rt.V.int(1)]]), "has", [rt.globalCallable("abs")]), rt.V.str("|"), rt.method(rt.dictOf([[rt.globalCallable("abs"), rt.V.int(1)]]), "has", [rt.globalCallable("sign")])]));
    print(rt.showArgs([rt.V.str("dictstr|"), rt.strBuiltin([rt.dictOf([[rt.V.str("a"), rt.globalCallable("abs")]])])]));
    print(rt.showArgs([rt.V.str("vts|"), rt.V.str(rt.varToStr(rt.globalCallable("abs"))), rt.V.str("|"), rt.V.str(rt.varToStr(rt.callableCtor([])))]));
    print(rt.showArgs([rt.V.str("lamvts|"), rt.V.str(rt.varToStr(rt.callable((__a: rt.Variant[]) => {
      return rt.V.int(1);
    }, 0)))]));
    print(rt.showArgs([rt.V.str("inner|"), rt.typeOf(rt.method(rt.V.object(new Inner()), "v", [])), rt.V.str("|"), rt.method(rt.V.object(new Inner()), "v", []), rt.V.str("|"), rt.method(rt.method(rt.V.object(new Inner()), "v", []), "call", [rt.V.int((-2))])]));
    print(rt.showArgs([rt.V.str("static|"), rt.method(rt.V.object(__gd_d_Inner), "sv", []), rt.V.str("|"), rt.method(rt.method(rt.V.object(__gd_d_Inner), "sv", []), "call", [rt.V.str("abcd")])]));
    let lam = rt.callable((__a: rt.Variant[]) => {
      return rt.globalCallable("max");
    }, 0);
    print(rt.showArgs([rt.V.str("lambda|"), rt.typeOf(rt.method(lam, "call", [])), rt.V.str("|"), rt.method(lam, "call", []), rt.V.str("|"), rt.method(rt.method(lam, "call", []), "call", [rt.V.int(3), rt.V.int(9)])]));
    let len = rt.V.int(5);
    print(rt.showArgs([rt.V.str("shadow|"), len, rt.V.str("|"), rt.typeOf(len), rt.V.str("|"), rt.globalCallable("abs")]));
    let abs2 = 7;
    print(rt.showArgs([rt.V.str("shadow2|"), rt.V.int(abs2), rt.V.str("|"), rt.typeOf(rt.V.int(abs2)), rt.V.str("|"), rt.globalCallable("str")]));
    let g = rt.callable((__a: rt.Variant[]) => {
      const abs = __a[0] as rt.Variant;
      return rt.V.array(rt.GArray.of([abs, rt.typeOf(abs), rt.globalCallable("sign")]));
    }, 1);
    print(rt.showArgs([rt.V.str("shadow3|"), rt.method(g, "call", [rt.V.int(9)])]));
    for (let sign of rt.iter(rt.V.int(3))) {
      print(rt.showArgs([rt.V.str("shadow4|"), sign]));
    }
    print(rt.showArgs([rt.V.str("afterfor|"), rt.globalCallable("sign"), rt.V.str("|"), rt.globalCallable("abs")]));
    this.quit();
  }
  
  override __gdDispatch(name: string, args: rt.Variant[]): rt.Variant | null {
    switch (name) {
      case "_initialize": return rt.wrapValue(this.__gd__initialize());
      default: return super.__gdDispatch(name, args);
    }
  }

}

const __gd_d_Main = rt.defineClass(Main, () => new Main(), (o) => o instanceof Main);
rt.registerMethodArities(__gd_d_Main, { "_initialize": [0, 0] });
rt.registerNativeBase(__gd_d_Main, "SceneTree");
rt.registerScriptLabel(__gd_d_Main, "main.gd");
rt.registerScript("res://main.gd", __gd_d_Main);
class Inner extends rt.GdScriptObject {
  v(): rt.Variant {
    return rt.globalCallable("abs");
  }
  
  static sv(): rt.Variant {
    return rt.globalCallable("len");
  }
  
  override __gdDispatch(name: string, args: rt.Variant[]): rt.Variant | null {
    switch (name) {
      case "v": return rt.wrapValue(this.v());
      default: return super.__gdDispatch(name, args);
    }
  }

}
const __gd_d_Inner = rt.defineClass(Inner, () => new Inner(), (o) => o instanceof Inner);
rt.nameClass(__gd_d_Inner, "Inner");
rt.registerMethodArities(__gd_d_Inner, { "v": [0, 0], "sv": [0, 0] });
rt.registerStaticMethods(__gd_d_Inner, ["sv"], {"sv": (a: rt.Variant[]): rt.Variant => rt.wrapValue(Inner.sv())});
rt.registerNativeBase(__gd_d_Inner, "RefCounted");

const __gd_entry = new Main();
try {
  await __gd_entry.run();
} catch (__gd_e) {
  rt.reportRunFailure(__gd_e);
}
