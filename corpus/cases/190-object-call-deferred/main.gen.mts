// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../src/runtime/index";
import { print, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
  async _initialize(): Promise<void> {
    let o = rt.V.object(new Thing());
    print(rt.showArgs([rt.V.str("r "), rt.method(o, "call_deferred", [rt.V.str("hi"), rt.V.int(1), rt.V.int(2)])]));
    print(rt.showArgs([rt.V.str("r2 "), rt.method(o, "call_deferred", [rt.V.str("name2")])]));
    rt.method(o, "set", [rt.V.str("hi"), rt.V.int(5)]);
    print(rt.showArgs([rt.V.str("r3 "), rt.typeOf(rt.method(o, "get", [rt.V.str("hi")])), rt.V.str(" "), rt.attribute(o, "s")]));
    print(rt.showArgs([rt.V.str("r4 "), rt.method(o, "call", [rt.V.str("hi"), rt.V.int(3), rt.V.int(4)]), rt.V.str(" "), rt.typeOf(rt.method(o, "get", [rt.V.str("s")]))]));
    this.quit();
  }
  
}

rt.registerMethodArities(Main, { "_initialize": [0, 0] });
rt.registerNativeBase(Main, "SceneTree");
class Thing {
  s = rt.strOf(rt.V.str("x"));

  hi(a, b): unknown {
    return rt.ops.add(a, b);
  }
  
  name2(): unknown {
    return rt.V.str("nm");
  }
  
}
rt.registerClass("Thing", Thing);
rt.registerFieldTypes(Thing, {"s": "String"});
rt.registerMethodArities(Thing, { "hi": [2, 2], "name2": [0, 0] });
rt.registerNativeBase(Thing, "RefCounted");

await new Main().run();
