// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../packages/runtime/src/runtime/index";
import { print, printJoined, printRaw, printErr, printVerbose, printRich, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
    override _initialize(): Promise<void> { return this.__gd__initialize(); }
  async __gd__initialize(): Promise<void> {
    let x = rt.V.object(new A());
    let f = rt.toFloat(rt.V.float(2.7));
    let big = rt.toFloat(rt.V.float(1e+30));
    let sn = rt.V.stringName("nm");
    let vi = rt.vector2iNew([rt.V.int(3), rt.V.int(4)]);
    let v = rt.vector2New([rt.V.float(1.7), rt.V.float(2.2)]);
    print(rt.showArgs([rt.V.str("t1 "), rt.method(x, "p_int", [rt.V.int(7)]), rt.V.str(" "), rt.method(x, "p_int", [f]), rt.V.str(" "), rt.method(x, "p_int", [rt.V.bool(true)]), rt.V.str(" "), rt.method(x, "p_int", [rt.V.bool(false)])]));
    print(rt.showArgs([rt.V.str("t2 "), rt.method(x, "p_int", [big])]));
    print(rt.showArgs([rt.V.str("t3 "), rt.method(x, "p_float", [rt.V.int(1)]), rt.V.str(" "), rt.method(x, "p_float", [rt.V.float(2.5)]), rt.V.str(" "), rt.method(x, "p_float", [rt.V.bool(true)])]));
    print(rt.showArgs([rt.V.str("t4 "), rt.method(x, "p_bool", [rt.V.int(3)]), rt.V.str(" "), rt.method(x, "p_bool", [rt.V.int(0)]), rt.V.str(" "), rt.method(x, "p_bool", [rt.V.float(2.7)])]));
    print(rt.showArgs([rt.V.str("t5 "), rt.method(x, "p_str", [rt.V.str("abc")]), rt.V.str(" "), rt.method(x, "p_str", [sn])]));
    print(rt.showArgs([rt.V.str("t6 "), rt.method(x, "p_vec2", [vi]), rt.V.str(" "), rt.method(x, "p_vec2", [rt.vector2New([rt.V.int(1), rt.V.int(2)])])]));
    print(rt.showArgs([rt.V.str("t7 "), rt.method(x, "p_vec2i", [v]), rt.V.str(" "), rt.method(x, "p_vec2i", [rt.vector2iNew([rt.V.int(5), rt.V.int(6)])])]));
    print(rt.showArgs([rt.V.str("t8 "), rt.method(x, "p_color", [rt.V.str("abc")]), rt.V.str(" "), rt.method(x, "p_color", [rt.colorNew([rt.V.float(0.25), rt.V.float(0.5), rt.V.float(0.75), rt.V.int(1)])])]));
    print(rt.showArgs([rt.V.str("t9 "), rt.method(x, "math", [rt.V.float(2.7)]), rt.V.str(" "), rt.method(x, "math", [rt.V.bool(true)])]));
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
class A extends rt.GdScriptObject {
  p_int(a: rt.Variant): rt.Variant {
    a = rt.paramSlot(a, "int", 1, "p_int", this);
    return rt.formatOf(rt.V.str("int<-%s(%s)"), rt.V.array(rt.GArray.of([rt.strBuiltin([a]), rt.typeOf(a)])));
  }
  
  p_float(a: rt.Variant): rt.Variant {
    a = rt.paramSlot(a, "float", 1, "p_float", this);
    return rt.formatOf(rt.V.str("float<-%s(%s)"), rt.V.array(rt.GArray.of([rt.strBuiltin([a]), rt.typeOf(a)])));
  }
  
  p_bool(a: rt.Variant): rt.Variant {
    a = rt.paramSlot(a, "bool", 1, "p_bool", this);
    return rt.formatOf(rt.V.str("bool<-%s(%s)"), rt.V.array(rt.GArray.of([rt.strBuiltin([a]), rt.typeOf(a)])));
  }
  
  p_str(a: rt.Variant): rt.Variant {
    a = rt.paramSlot(a, "String", 1, "p_str", this);
    return rt.formatOf(rt.V.str("str<-%s(%s)"), rt.V.array(rt.GArray.of([a, rt.typeOf(a)])));
  }
  
  p_vec2(a: rt.Variant): rt.Variant {
    a = rt.paramSlot(a, "Vector2", 1, "p_vec2", this);
    return rt.formatOf(rt.V.str("vec2<-%s(%s)"), rt.V.array(rt.GArray.of([rt.strBuiltin([a]), rt.typeOf(a)])));
  }
  
  p_vec2i(a: rt.Variant): rt.Variant {
    a = rt.paramSlot(a, "Vector2i", 1, "p_vec2i", this);
    return rt.formatOf(rt.V.str("vec2i<-%s(%s)"), rt.V.array(rt.GArray.of([rt.strBuiltin([a]), rt.typeOf(a)])));
  }
  
  p_color(a: rt.Variant): rt.Variant {
    a = rt.paramSlot(a, "Color", 1, "p_color", this);
    return rt.formatOf(rt.V.str("color<-%s(%s)"), rt.V.array(rt.GArray.of([rt.strBuiltin([a]), rt.typeOf(a)])));
  }
  
  math(a: rt.Variant): rt.Variant {
    a = rt.paramSlot(a, "int", 1, "math", this);
    return rt.formatOf(rt.V.str("math<-%s|%s"), rt.V.array(rt.GArray.of([rt.strBuiltin([a]), rt.strBuiltin([rt.ops.mul(a, rt.V.int(2))])])));
  }
  
  override __gdDispatch(name: string, args: rt.Variant[]): rt.Variant | null {
    switch (name) {
      case "p_int": return rt.wrapValue(this.p_int(args[0] as rt.Variant));
      case "p_float": return rt.wrapValue(this.p_float(args[0] as rt.Variant));
      case "p_bool": return rt.wrapValue(this.p_bool(args[0] as rt.Variant));
      case "p_str": return rt.wrapValue(this.p_str(args[0] as rt.Variant));
      case "p_vec2": return rt.wrapValue(this.p_vec2(args[0] as rt.Variant));
      case "p_vec2i": return rt.wrapValue(this.p_vec2i(args[0] as rt.Variant));
      case "p_color": return rt.wrapValue(this.p_color(args[0] as rt.Variant));
      case "math": return rt.wrapValue(this.math(args[0] as rt.Variant));
      default: return super.__gdDispatch(name, args);
    }
  }

}
const __gd_d_A = rt.defineClass(A, () => new A(), (o) => o instanceof A);
rt.nameClass(__gd_d_A, "A");
rt.registerMethodArities(__gd_d_A, { "p_int": [1, 1], "p_float": [1, 1], "p_bool": [1, 1], "p_str": [1, 1], "p_vec2": [1, 1], "p_vec2i": [1, 1], "p_color": [1, 1], "math": [1, 1] });
rt.registerNativeBase(__gd_d_A, "RefCounted");

const __gd_entry = new Main();
try {
  await __gd_entry.run();
} catch (__gd_e) {
  rt.reportRunFailure(__gd_e);
}
