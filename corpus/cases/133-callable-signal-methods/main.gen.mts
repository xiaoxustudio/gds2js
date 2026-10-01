// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../src/runtime/index";
import { print, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
  fired = new rt.Signal("fired");

  top(v): unknown {
    return v;
  }
  
  async _initialize(): Promise<void> {
    let a = rt.V.object(new A());
    let cb = rt.attribute(a, "im");
    print(rt.showArgs([rt.V.str("u1 "), rt.typeOf(rt.callableOf(this.top.bind(this), "top", rt.V.object(this))), rt.V.str(" "), rt.typeOf(rt.attribute(a, "im")), rt.V.str(" "), rt.typeOf(rt.attribute(A, "sm")), rt.V.str(" "), rt.typeOf(this.fired)]));
    print(rt.showArgs([rt.V.str("u2 "), rt.method(rt.callableOf(this.top.bind(this), "top", rt.V.object(this)), "is_null", []), rt.V.str(" "), rt.method(rt.attribute(a, "im"), "is_null", []), rt.V.str(" "), rt.method(this.fired, "is_null", [])]));
    print(rt.showArgs([rt.V.str("u3 "), rt.method(rt.callableOf(this.top.bind(this), "top", rt.V.object(this)), "is_valid", []), rt.V.str(" "), rt.method(rt.attribute(a, "im"), "is_valid", [])]));
    print(rt.showArgs([rt.V.str("u4 "), rt.method(rt.callableOf(this.top.bind(this), "top", rt.V.object(this)), "get_method", []), rt.V.str(" | "), rt.method(rt.attribute(a, "im"), "get_method", []), rt.V.str(" | "), rt.method(rt.attribute(A, "sm"), "get_method", [])]));
    print(rt.showArgs([rt.V.str("u5 "), rt.method(rt.callableOf(this.top.bind(this), "top", rt.V.object(this)), "call", [rt.V.int(5)]), rt.V.str(" "), rt.method(rt.callableOf(this.top.bind(this), "top", rt.V.object(this)), "callv", [rt.V.array(rt.GArray.of([rt.V.int(6)]))])]));
    print(rt.showArgs([rt.V.str("u6 "), rt.method(cb, "call", [rt.V.int(21)]), rt.V.str(" "), rt.method(cb, "callv", [rt.V.array(rt.GArray.of([rt.V.int(5)]))])]));
    print(rt.showArgs([rt.V.str("u7 "), rt.method(this.fired, "get_name", [])]));
    print(rt.showArgs([rt.V.str("u8 "), rt.method(rt.attribute(A, "sm"), "call", [rt.V.int(9)])]));
    print(rt.showArgs([rt.V.str("u9 "), rt.method(cb, "is_null", []), rt.V.str(" "), rt.method(cb, "get_method", [])]));
    this.quit();
  }
  
}

rt.registerMethodArities(Main, { "top": [1, 1], "_initialize": [0, 0] });
rt.registerNativeBase(Main, "SceneTree");
class A {
  im(v): unknown {
    return rt.ops.mul(v, rt.V.int(2));
  }
  
  static sm(v): unknown {
    return v;
  }
  
}
rt.registerClass("A", A);
rt.registerMethodArities(A, { "im": [1, 1] });
rt.registerStaticMethods(A, ["sm"]);
rt.registerNativeBase(A, "RefCounted");

await new Main().run();
