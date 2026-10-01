// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../src/runtime/index";
import { print, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
  async _initialize(): Promise<void> {
    let o = rt.V.object(new Thing());
    let p = rt.V.object(new Thing());
    print(rt.showArgs([rt.V.str("r1 "), rt.ops.eq(rt.attribute(o, "add3"), rt.attribute(o, "add3")), rt.V.str(" "), rt.ops.eq(rt.attribute(o, "add3"), rt.attribute(p, "add3"))]));
    print(rt.showArgs([rt.V.str("r2 "), rt.ops.eq(rt.method(rt.attribute(o, "add3"), "bind", [rt.V.int(1)]), rt.method(rt.attribute(o, "add3"), "bind", [rt.V.int(2)]))]));
    print(rt.showArgs([rt.V.str("r3 "), rt.ops.eq(rt.attribute(Thing, "sm"), rt.attribute(Thing, "sm"))]));
    let f = rt.callable((x) => {
      return x;
    });
    let g = rt.callable((x) => {
      return x;
    });
    print(rt.showArgs([rt.V.str("r4 "), rt.ops.eq(f, f), rt.V.str(" "), rt.ops.eq(f, g)]));
    let a = rt.V.array(rt.GArray.of([rt.attribute(o, "add3"), rt.attribute(o, "add3")]));
    print(rt.showArgs([rt.V.str("r5 "), rt.method(a, "has", [rt.attribute(o, "add3")]), rt.V.str(" "), rt.method(a, "size", [])]));
    print(rt.showArgs([rt.V.str("r6 "), rt.ops.eq(rt.callableCtor([]), rt.callableCtor([])), rt.V.str(" "), rt.ops.neq(rt.callableCtor([]), rt.callableCtor([]))]));
    this.quit();
  }
  
}

rt.registerMethodArities(Main, { "_initialize": [0, 0] });
rt.registerNativeBase(Main, "SceneTree");
class Thing {
  add3(a, b, c): unknown {
    return rt.ops.add(rt.ops.add(a, b), c);
  }
  
  static sm(x): unknown {
    return x;
  }
  
}
rt.registerClass("Thing", Thing);
rt.registerMethodArities(Thing, { "add3": [3, 3], "sm": [1, 1] });
rt.registerStaticMethods(Thing, ["sm"]);
rt.registerNativeBase(Thing, "RefCounted");

await new Main().run();
