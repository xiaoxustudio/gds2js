// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../src/runtime/index";
import { print, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
  async _initialize(): Promise<void> {
    let o = rt.V.object(new Thing());
    print(rt.showArgs([rt.V.str("r "), rt.method(o, "get_class", []), rt.V.str(" "), rt.method(o, "is_class", [rt.V.str("RefCounted")]), rt.V.str(" "), rt.method(o, "is_class", [rt.V.str("Object")]), rt.V.str(" "), rt.method(o, "is_class", [rt.V.str("Thing")]), rt.V.str(" "), rt.method(o, "is_class", [rt.V.str("Node")]), rt.V.str(" "), rt.method(o, "is_class", [rt.V.str("Nope")])]));
    this.quit();
  }
  
}

rt.registerMethodArities(Main, { "_initialize": [0, 0] });
rt.registerNativeBase(Main, "SceneTree");
class Thing {
  a = rt.V.int(7);

}
rt.registerClass("Thing", Thing);
rt.registerNativeBase(Thing, "RefCounted");

await new Main().run();
