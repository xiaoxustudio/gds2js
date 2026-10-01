// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../src/runtime/index";
import { print, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
  async _initialize(): Promise<void> {
    let v = rt.V.str("x");
    v = rt.V.int(5);
    let p = rt.bytesCtor([rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2)]))]);
    print(rt.showArgs([rt.V.str("r1 "), rt.method(p, "has", [v]), rt.V.str(" "), rt.method(p, "has", [rt.V.int(2)]), rt.V.str(" "), rt.method(p, "count", [rt.V.int(1)])]));
    let q = rt.packCtor("string", [rt.V.array(rt.GArray.of([rt.V.str("a")]))]);
    print(rt.showArgs([rt.V.str("r2 "), rt.method(q, "has", [rt.V.str("a")]), rt.V.str(" "), rt.method(q, "count", [rt.V.str("a")]), rt.V.str(" "), rt.method(q, "find", [rt.V.str("a")])]));
    print(rt.showArgs([rt.V.str("r3 "), rt.method(rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2)])), "size", []), rt.V.str(" "), rt.method(rt.V.str("|"), "join", [rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2)]))])]));
    this.quit();
  }
  
}

rt.registerMethodArities(Main, { "_initialize": [0, 0] });
rt.registerNativeBase(Main, "SceneTree");
await new Main().run();
