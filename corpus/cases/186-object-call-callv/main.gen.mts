// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../src/runtime/index";
import { print, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
  async _initialize(): Promise<void> {
    let o = rt.V.object(new Thing());
    print(rt.showArgs([rt.V.str("r "), rt.method(o, "call", [rt.V.str("hi"), rt.V.int(2), rt.V.int(3)]), rt.V.str(" "), rt.method(o, "callv", [rt.V.str("hi"), rt.V.array(rt.GArray.of([rt.V.int(4), rt.V.int(5)]))])]));
    print(rt.showArgs([rt.V.str("r2 "), rt.method(o, "call", [rt.V.str("twice")]), rt.V.str(" "), rt.method(o, "call", [rt.V.str("twice"), rt.V.str("q")]), rt.V.str(" "), rt.method(o, "has_method", [rt.V.str("hi")])]));
    this.quit();
  }
  
}

rt.registerMethodArities(Main, { "_initialize": [0, 0] });
rt.registerNativeBase(Main, "SceneTree");
class Thing {
  hi(x, y): unknown {
    return rt.ops.add(x, y);
  }
  
  twice(s = rt.V.str("z")): unknown {
    return rt.ops.add(s, s);
  }
  
}
rt.registerClass("Thing", Thing);
rt.registerMethodArities(Thing, { "hi": [2, 2], "twice": [0, 1] });
rt.registerNativeBase(Thing, "RefCounted");

await new Main().run();
