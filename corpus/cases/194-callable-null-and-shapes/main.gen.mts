// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../src/runtime/index";
import { print, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
  async _initialize(): Promise<void> {
    let cb = rt.callableCtor([]);
    print(rt.showArgs([rt.V.str("r1 "), rt.typeOf(cb), rt.V.str(" "), rt.method(cb, "is_null", []), rt.V.str(" "), rt.method(cb, "is_valid", [])]));
    print(rt.showArgs([rt.V.str("r2 "), rt.ops.eq(rt.method(cb, "get_method", []), rt.V.str("")), rt.V.str(" "), rt.method(cb, "get_argument_count", []), rt.V.str(" "), rt.method(rt.method(cb, "get_bound_arguments", []), "size", [])]));
    print(rt.showArgs([rt.V.str("r3 "), rt.typeOf(rt.method(cb, "callv", [rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2)]))])), rt.V.str(" "), rt.ops.eq(rt.method(cb, "callv", [rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2)]))]), rt.V.nil())]));
    let b = rt.method(cb, "bind", [rt.V.int(1)]);
    print(rt.showArgs([rt.V.str("r4 "), rt.typeOf(b), rt.V.str(" "), rt.method(b, "is_null", [])]));
    let f = rt.callable((x) => {
      return x;
    });
    print(rt.showArgs([rt.V.str("r5 "), rt.method(f, "is_null", []), rt.V.str(" "), rt.method(f, "is_valid", []), rt.V.str(" "), rt.method(f, "get_method", [])]));
    let o = rt.V.object(new Thing());
    let im = rt.attribute(o, "hi");
    print(rt.showArgs([rt.V.str("r6 "), rt.method(im, "is_null", []), rt.V.str(" "), rt.method(im, "is_valid", []), rt.V.str(" "), rt.method(im, "get_method", []), rt.V.str(" "), rt.method(im, "call", [rt.V.int(7)])]));
    print(rt.showArgs([rt.V.str("r7 "), rt.typeOf(rt.callableCtor([o, rt.V.str("hi")])), rt.V.str(" "), rt.method(rt.callableCtor([o, rt.V.str("hi")]), "get_method", []), rt.V.str(" "), rt.method(rt.callableCtor([o, rt.V.str("hi")]), "call", [rt.V.int(8)])]));
    this.quit();
  }
  
}

rt.registerMethodArities(Main, { "_initialize": [0, 0] });
rt.registerNativeBase(Main, "SceneTree");
class Thing {
  hi(a): unknown {
    return a;
  }
  
}
rt.registerClass("Thing", Thing);
rt.registerMethodArities(Thing, { "hi": [1, 1] });
rt.registerNativeBase(Thing, "RefCounted");

await new Main().run();
