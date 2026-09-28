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
    print(rt.show(rt.V.str("u1 ")), rt.show(rt.typeOf(rt.callableOf(this.top.bind(this), "top", rt.V.object(this)))), rt.show(rt.V.str(" ")), rt.show(rt.typeOf(rt.attribute(a, "im"))), rt.show(rt.V.str(" ")), rt.show(rt.typeOf(rt.attribute(A, "sm"))), rt.show(rt.V.str(" ")), rt.show(rt.typeOf(this.fired)));
    print(rt.show(rt.V.str("u2 ")), rt.show(rt.method(rt.callableOf(this.top.bind(this), "top", rt.V.object(this)), "is_null", [])), rt.show(rt.V.str(" ")), rt.show(rt.method(rt.attribute(a, "im"), "is_null", [])), rt.show(rt.V.str(" ")), rt.show(rt.method(this.fired, "is_null", [])));
    print(rt.show(rt.V.str("u3 ")), rt.show(rt.method(rt.callableOf(this.top.bind(this), "top", rt.V.object(this)), "is_valid", [])), rt.show(rt.V.str(" ")), rt.show(rt.method(rt.attribute(a, "im"), "is_valid", [])));
    print(rt.show(rt.V.str("u4 ")), rt.show(rt.method(rt.callableOf(this.top.bind(this), "top", rt.V.object(this)), "get_method", [])), rt.show(rt.V.str(" | ")), rt.show(rt.method(rt.attribute(a, "im"), "get_method", [])), rt.show(rt.V.str(" | ")), rt.show(rt.method(rt.attribute(A, "sm"), "get_method", [])));
    print(rt.show(rt.V.str("u5 ")), rt.show(rt.method(rt.callableOf(this.top.bind(this), "top", rt.V.object(this)), "call", [rt.V.int(5)])), rt.show(rt.V.str(" ")), rt.show(rt.method(rt.callableOf(this.top.bind(this), "top", rt.V.object(this)), "callv", [rt.V.array(rt.GArray.of([rt.V.int(6)]))])));
    print(rt.show(rt.V.str("u6 ")), rt.show(rt.method(cb, "call", [rt.V.int(21)])), rt.show(rt.V.str(" ")), rt.show(rt.method(cb, "callv", [rt.V.array(rt.GArray.of([rt.V.int(5)]))])));
    print(rt.show(rt.V.str("u7 ")), rt.show(rt.method(this.fired, "get_name", [])));
    print(rt.show(rt.V.str("u8 ")), rt.show(rt.method(rt.attribute(A, "sm"), "call", [rt.V.int(9)])));
    print(rt.show(rt.V.str("u9 ")), rt.show(rt.method(cb, "is_null", [])), rt.show(rt.V.str(" ")), rt.show(rt.method(cb, "get_method", [])));
    this.quit();
  }
  
}

class A {
  im(v): unknown {
    return rt.ops.mul(v, rt.V.int(2));
  }
  
  static sm(v): unknown {
    return v;
  }
  
}
rt.registerClass("A", A);
rt.registerStaticMethods(A, ["sm"]);

await new Main().run();
