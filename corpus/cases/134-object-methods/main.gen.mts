// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../src/runtime/index";
import { print, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
  async _initialize(): Promise<void> {
    let a = rt.V.object(new A());
    rt.method(a, "set_meta", [rt.V.str("k"), rt.V.int(5)]);
    rt.method(a, "set_meta", [rt.V.stringName("sn"), rt.V.int(6)]);
    print(rt.showArgs([rt.V.str("t1 "), rt.method(a, "has_meta", [rt.V.str("sn")]), rt.V.str(" "), rt.method(a, "get_meta", [rt.V.str("sn")])]));
    rt.method(a, "remove_meta", [rt.V.str("k")]);
    print(rt.showArgs([rt.V.str("t2 "), rt.method(a, "has_meta", [rt.V.str("k")]), rt.V.str(" "), rt.method(a, "get_meta", [rt.V.str("k"), rt.V.int(99)])]));
    print(rt.showArgs([rt.V.str("t3 "), rt.method(rt.V.object(this), "get_class", []), rt.V.str(" | "), rt.method(a, "get_class", [])]));
    print(rt.showArgs([rt.V.str("t4 "), rt.method(a, "has_method", [rt.V.str("sm")]), rt.V.str(" "), rt.method(a, "has_method", [rt.V.str("get_class")])]));
    print(rt.showArgs([rt.V.str("t5 "), rt.method(rt.V.object(this), "has_method", [rt.V.str("_initialize")]), rt.V.str(" "), rt.method(rt.V.object(this), "has_method", [rt.V.str("print")])]));
    print(rt.showArgs([rt.V.str("t6 "), rt.method(a, "has_method", [rt.V.str("")])]));
    rt.method(a, "set_meta", [rt.V.str("k"), rt.V.int(8)]);
    print(rt.showArgs([rt.V.str("t7 "), rt.method(a, "get_meta", [rt.V.str("k")]), rt.V.str(" "), rt.method(a, "get_meta", [rt.V.str("nope"), rt.V.str("dflt")])]));
    print(rt.showArgs([rt.V.str("t8 "), rt.typeOf(rt.method(a, "get_meta", [rt.V.str("nope"), rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2)]))]))]));
    this.quit();
  }
  
}

rt.registerMethodArities(Main, { "_initialize": [0, 0] });
rt.registerNativeBase(Main, "SceneTree");
class A {
  im(): unknown {
    return rt.V.int(1);
  }
  
  static sm(): unknown {
    return rt.V.int(2);
  }
  
}
rt.registerClass("A", A);
rt.registerMethodArities(A, { "im": [0, 0], "sm": [0, 0] });
rt.registerStaticMethods(A, ["sm"]);
rt.registerNativeBase(A, "RefCounted");

await new Main().run();
