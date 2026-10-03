// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../packages/runtime/src/runtime/index";
import { print, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
    override _initialize(): Promise<void> { return this.__gd__initialize(); }
  async __gd__initialize(): Promise<void> {
    let o = rt.V.object(new Thing());
    let c0 = rt.wrapValue(rt.attribute(o, "add3"));
    let c1 = rt.method(c0, "bind", [rt.V.int(1)]);
    let c2 = rt.method(c0, "bind", [rt.V.int(1), rt.V.int(2)]);
    let c3 = rt.method(c0, "bind", [rt.V.int(1), rt.V.int(2), rt.V.int(3)]);
    let ce = rt.method(c0, "bind", []);
    print(rt.showArgs([rt.V.str("r1 "), rt.method(c0, "get_argument_count", []), rt.V.str(" "), rt.method(c1, "get_argument_count", []), rt.V.str(" "), rt.method(c2, "get_argument_count", []), rt.V.str(" "), rt.method(c3, "get_argument_count", []), rt.V.str(" "), rt.method(ce, "get_argument_count", [])]));
    print(rt.showArgs([rt.V.str("r2 "), rt.method(rt.method(c1, "get_bound_arguments", []), "size", []), rt.V.str(" "), rt.method(rt.method(c3, "get_bound_arguments", []), "size", []), rt.V.str(" "), rt.method(rt.method(ce, "get_bound_arguments", []), "size", [])]));
    let st = rt.wrapValue(rt.attribute(rt.V.object(__gd_d_Thing), "sadd3"));
    print(rt.showArgs([rt.V.str("r3 "), rt.method(st, "get_argument_count", []), rt.V.str(" "), rt.method(rt.method(st, "bind", [rt.V.int(1)]), "get_argument_count", [])]));
    let f = rt.callable((__a: rt.Variant[]) => {
      const x = __a[0] as rt.Variant;
      const y = __a[1] as rt.Variant;
      const z = __a[2] as rt.Variant;
      return x;
    }, 3);
    print(rt.showArgs([rt.V.str("r4 "), rt.method(f, "get_argument_count", []), rt.V.str(" "), rt.method(rt.method(f, "bind", [rt.V.int(9)]), "get_argument_count", [])]));
    print(rt.showArgs([rt.V.str("r5 "), rt.method(c0, "call", [rt.V.int(1), rt.V.int(2), rt.V.int(3)]), rt.V.str(" "), rt.method(c0, "get_argument_count", [])]));
    print(rt.showArgs([rt.V.str("r6 "), rt.method(c2, "call", [rt.V.int(3)])]));
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
class Thing extends rt.GdScriptObject {
  add3(a: rt.Variant, b: rt.Variant, c: rt.Variant): rt.Variant {
    return rt.ops.add(rt.ops.add(a, b), c);
  }
  
  static sadd3(a: rt.Variant, b: rt.Variant, c: rt.Variant): rt.Variant {
    return rt.ops.add(rt.ops.add(a, b), c);
  }
  
  override __gdDispatch(name: string, args: rt.Variant[]): rt.Variant | null {
    switch (name) {
      case "add3": return rt.wrapValue(this.add3(args[0] as rt.Variant, args[1] as rt.Variant, args[2] as rt.Variant));
      default: return super.__gdDispatch(name, args);
    }
  }

}
const __gd_d_Thing = rt.defineClass(Thing, () => new Thing(), (o) => o instanceof Thing);
rt.nameClass(__gd_d_Thing, "Thing");
rt.registerMethodArities(__gd_d_Thing, { "add3": [3, 3], "sadd3": [3, 3] });
rt.registerStaticMethods(__gd_d_Thing, ["sadd3"], {"sadd3": (a: rt.Variant[]): rt.Variant => rt.wrapValue(Thing.sadd3(a[0] as rt.Variant, a[1] as rt.Variant, a[2] as rt.Variant))});
rt.registerNativeBase(__gd_d_Thing, "RefCounted");

const __gd_entry = new Main();
await __gd_entry.run();
