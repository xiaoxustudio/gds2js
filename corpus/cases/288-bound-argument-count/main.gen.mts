// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../packages/runtime/src/runtime/index";
import { print, printJoined, printRaw, printErr, printVerbose, printRich, printDebug, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
    override _initialize(): Promise<void> { return this.__gd__initialize(); }
  async __gd__initialize(): Promise<void> {
    let o = rt.V.object(new A());
    let h = rt.callable((__a: rt.Variant[]) => {
      const a = __a[0] as rt.Variant;
      return rt.ops.mul(a, rt.V.int(100));
    }, 1);
    let f = rt.callable((__a: rt.Variant[]) => {
      const a = __a[0] as rt.Variant;
      const b = __a[1] as rt.Variant;
      return rt.ops.add(rt.ops.mul(a, rt.V.int(100)), b);
    }, 2);
    let c = rt.callableCtor([]);
    print(rt.showArgs([rt.V.str("n01 "), rt.method(c, "get_argument_count", []), rt.V.str(" "), rt.method(c, "get_bound_arguments", []), rt.V.str(" "), rt.method(c, "is_null", [])]));
    print(rt.showArgs([rt.V.str("n02 "), rt.method(rt.method(c, "bind", [rt.V.int(1)]), "get_argument_count", []), rt.V.str(" "), rt.method(rt.method(c, "bind", [rt.V.int(1)]), "get_bound_arguments", []), rt.V.str(" "), rt.method(rt.method(c, "bind", [rt.V.int(1)]), "is_null", []), rt.V.str(" "), rt.typeOf(rt.method(c, "bind", [rt.V.int(1)]))]));
    print(rt.showArgs([rt.V.str("n03 "), rt.method(rt.method(c, "bind", [rt.V.int(1), rt.V.int(2)]), "get_argument_count", []), rt.V.str(" "), rt.method(rt.method(c, "bind", [rt.V.int(1), rt.V.int(2)]), "get_bound_arguments", []), rt.V.str(" "), rt.method(rt.method(c, "bind", [rt.V.int(1), rt.V.int(2)]), "is_null", [])]));
    print(rt.showArgs([rt.V.str("n04 "), rt.method(rt.method(rt.method(c, "bind", [rt.V.int(1)]), "bind", [rt.V.int(2)]), "get_argument_count", []), rt.V.str(" "), rt.method(rt.method(rt.method(c, "bind", [rt.V.int(1)]), "bind", [rt.V.int(2)]), "get_bound_arguments", [])]));
    print(rt.showArgs([rt.V.str("n05 "), rt.method(f, "get_argument_count", []), rt.V.str(" "), rt.method(f, "get_bound_arguments", []), rt.V.str(" "), rt.method(f, "is_null", [])]));
    print(rt.showArgs([rt.V.str("n06 "), rt.method(rt.method(f, "bind", [rt.V.int(7)]), "get_argument_count", []), rt.V.str(" "), rt.method(rt.method(f, "bind", [rt.V.int(7)]), "get_bound_arguments", []), rt.V.str(" "), rt.method(rt.method(f, "bind", [rt.V.int(7)]), "call", [rt.V.int(9)]), rt.V.str(" "), rt.method(rt.method(f, "bind", [rt.V.int(7)]), "get_bound_arguments_count", [])]));
    print(rt.showArgs([rt.V.str("o01 "), rt.method(rt.wrapValue(rt.attribute(o, "two")), "get_argument_count", []), rt.V.str(" "), rt.method(rt.method(rt.wrapValue(rt.attribute(o, "two")), "bind", [rt.V.int(1)]), "get_argument_count", []), rt.V.str(" "), rt.method(rt.method(rt.wrapValue(rt.attribute(o, "two")), "bind", [rt.V.int(1), rt.V.int(2)]), "get_argument_count", [])]));
    print(rt.showArgs([rt.V.str("o02 "), rt.method(rt.wrapValue(rt.attribute(o, "three")), "get_argument_count", []), rt.V.str(" "), rt.method(rt.method(rt.wrapValue(rt.attribute(o, "three")), "bind", [rt.V.int(1)]), "get_argument_count", []), rt.V.str(" "), rt.method(rt.method(rt.wrapValue(rt.attribute(o, "three")), "bind", [rt.V.int(1), rt.V.int(2)]), "get_argument_count", [])]));
    print(rt.showArgs([rt.V.str("over-method "), rt.method(rt.method(rt.wrapValue(rt.attribute(o, "one")), "bind", [rt.V.int(1), rt.V.int(2), rt.V.int(3)]), "get_argument_count", []), rt.V.str(" "), rt.method(rt.method(rt.wrapValue(rt.attribute(o, "one")), "bind", [rt.V.int(1), rt.V.int(2), rt.V.int(3)]), "get_bound_arguments", [])]));
    print(rt.showArgs([rt.V.str("over-lambda "), rt.method(rt.method(h, "bind", [rt.V.int(1), rt.V.int(2)]), "get_argument_count", []), rt.V.str(" "), rt.method(rt.method(h, "bind", [rt.V.int(1), rt.V.int(2)]), "get_bound_arguments", []), rt.V.str(" "), rt.method(rt.method(h, "bind", [rt.V.int(1), rt.V.int(2)]), "get_bound_arguments_count", [])]));
    print(rt.showArgs([rt.V.str("over-chained "), rt.method(rt.method(rt.method(h, "bind", [rt.V.int(1)]), "bind", [rt.V.int(2)]), "get_argument_count", []), rt.V.str(" "), rt.method(rt.method(rt.method(h, "bind", [rt.V.int(1)]), "bind", [rt.V.int(2)]), "get_bound_arguments", [])]));
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
rt.registerDictIdentity(__gd_d_Main, "res://main.gd", "", [], {}, (o) => { const s = o as Main; return []; });
rt.registerMethodArities(__gd_d_Main, { "_initialize": [0, 0] });
rt.registerNativeBase(__gd_d_Main, "SceneTree");
rt.registerScriptLabel(__gd_d_Main, "main.gd");
rt.registerScript("res://main.gd", __gd_d_Main);
class A extends rt.GdScriptObject {
  one(a: rt.Variant): rt.Variant {
    return a;
  }
  
  two(a: rt.Variant, b: rt.Variant): rt.Variant {
    return rt.ops.add(rt.ops.mul(a, rt.V.int(10)), b);
  }
  
  three(a: rt.Variant, b: rt.Variant, c: rt.Variant): rt.Variant {
    return rt.ops.add(rt.ops.add(rt.ops.mul(a, rt.V.int(100)), rt.ops.mul(b, rt.V.int(10))), c);
  }
  
  override __gdDispatch(name: string, args: rt.Variant[]): rt.Variant | null {
    switch (name) {
      case "one": return rt.wrapValue(this.one(args[0] as rt.Variant));
      case "two": return rt.wrapValue(this.two(args[0] as rt.Variant, args[1] as rt.Variant));
      case "three": return rt.wrapValue(this.three(args[0] as rt.Variant, args[1] as rt.Variant, args[2] as rt.Variant));
      default: return super.__gdDispatch(name, args);
    }
  }

}
const __gd_d_A = rt.defineClass(A, () => new A(), (o) => o instanceof A);
rt.nameClass(__gd_d_A, "A");
rt.registerDictIdentity(__gd_d_A, "res://main.gd", "A", [], {}, (o) => { const s = o as A; return []; });
rt.registerMethodArities(__gd_d_A, { "one": [1, 1], "two": [2, 2], "three": [3, 3] });
rt.registerNativeBase(__gd_d_A, "RefCounted");

const __gd_entry = new Main();
try {
  await __gd_entry.run();
} catch (__gd_e) {
  rt.reportRunFailure(__gd_e);
}
