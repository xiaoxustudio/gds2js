// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../src/runtime/index";
import { print, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
  async _initialize(): Promise<void> {
    let o = rt.V.object(new Thing());
    rt.method(o, "set", [rt.V.str("a"), rt.V.int(5)]);
    rt.method(o, "set", [rt.V.str("s"), rt.V.int(12)]);
    print(rt.showArgs([rt.V.str("r "), rt.attribute(o, "a"), rt.V.str(" "), rt.method(o, "get", [rt.V.str("a")]), rt.V.str(" "), rt.attribute(o, "s"), rt.V.str(" "), rt.method(o, "get", [rt.V.str("zz")]), rt.V.str(" "), rt.typeOf(rt.method(o, "get", [rt.V.str("zz")]))]));
    print(rt.showArgs([rt.V.str("r2 "), rt.typeOf(rt.method(o, "get", [rt.V.str("hi")])), rt.V.str(" "), rt.method(o, "call", [rt.V.str("hi")])]));
    this.quit();
  }
  
}

rt.registerMethodArities(Main, { "_initialize": [0, 0] });
rt.registerNativeBase(Main, "SceneTree");
class Thing {
  a = rt.V.int(7);
  s = rt.strOf(rt.V.str("x"));

  hi(): unknown {
    return rt.V.int(1);
  }
  
}
rt.registerClass("Thing", Thing);
rt.registerFieldTypes(Thing, {"s": "String"});
rt.registerMethodArities(Thing, { "hi": [0, 0] });
rt.registerNativeBase(Thing, "RefCounted");

await new Main().run();
