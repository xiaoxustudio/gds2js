// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../packages/runtime/src/runtime/index";
import { print, printJoined, printRaw, printErr, printVerbose, printRich, printDebug, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
    override _initialize(): Promise<void> { return this.__gd__initialize(); }
  async __gd__initialize(): Promise<void> {
    for (let a of rt.iter(rt.V.array(rt.GArray.of([rt.vector2New([rt.V.int(0), rt.V.int(0)]), rt.vector2New([rt.V.int(1), rt.V.int(1)]), rt.vector2New([rt.V.int((-4)), rt.V.int(8)]), rt.vector2New([rt.V.float(0.1), rt.V.float(0.2)]), rt.vector2New([rt.V.int(3), rt.V.int(4)]), rt.vector2New([rt.V.int(10000000), rt.V.int(20000000)])])))) {
      print(rt.showArgs([rt.V.str("MT2|"), a, rt.V.str("|"), rt.method(a, "move_toward", [rt.vector2New([rt.V.int(10), rt.V.int(0)]), rt.V.float(3)]), rt.V.str("|"), rt.method(a, "move_toward", [rt.vector2New([rt.V.int(1), rt.V.int(1)]), rt.V.float(5)]), rt.V.str("|"), rt.method(a, "move_toward", [rt.vector2New([rt.V.float(7.7), rt.V.float((-3.3))]), rt.V.float(4.9)]), rt.V.str("|"), rt.method(a, "move_toward", [rt.vector2New([rt.V.float(7.7), rt.V.float((-3.3))]), rt.V.float(12)])]));
    }
    print(rt.showArgs([rt.V.str("MT2X|"), rt.method(rt.vector2New([rt.V.float(0.5), rt.V.float((-0.25))]), "move_toward", [rt.vector2New([rt.V.float((-7.25)), rt.V.float(6.125)]), rt.V.float(0.375)]), rt.V.str("|"), rt.method(rt.vector2New([rt.V.float(0.5), rt.V.float((-0.25))]), "move_toward", [rt.vector2New([rt.V.float((-7.25)), rt.V.float(6.125)]), rt.V.float(100)]), rt.V.str("|"), rt.method(rt.vector2New([rt.V.float(10000000), rt.V.float(20000000)]), "move_toward", [rt.vector2New([rt.ops.add(rt.V.float(10000000), rt.V.int(1)), rt.ops.add(rt.V.float(20000000), rt.V.int(1))]), rt.V.float(0.5)])]));
    print(rt.showArgs([rt.V.str("MT2Y|"), rt.method(rt.vector2New([rt.V.int((-4)), rt.V.int(8)]), "move_toward", [rt.vector2New([rt.V.int(1), rt.V.int(1)]), rt.V.float(2)]), rt.V.str("|"), rt.method(rt.vector2New([rt.V.int((-4)), rt.V.int(8)]), "move_toward", [rt.vector2New([rt.V.int(1), rt.V.int(1)]), rt.V.float(8.6)]), rt.V.str("|"), rt.method(rt.vector2New([rt.V.int((-4)), rt.V.int(8)]), "move_toward", [rt.vector2New([rt.V.int(1), rt.V.int(1)]), rt.V.float(8.602325)])]));
    this.quit();
  }
  
  override __gdDispatch(name: string, args: rt.Variant[]): rt.Variant | null {
    switch (name) {
      case "_initialize": return rt.wrapValue(this.__gd__initialize());
      default: return super.__gdDispatch(name, args);
    }
  }

}

const __gd_d_Main = rt.defineClass(Main, () => new Main(), (o) => o instanceof Main);
rt.registerDictIdentity(__gd_d_Main, "res://main.gd", "", [], {}, (o) => { const s = o as Main; return []; });
rt.registerMethodArities(__gd_d_Main, { "_initialize": [0, 0] });
rt.registerNativeBase(__gd_d_Main, "SceneTree");
rt.registerScriptLabel(__gd_d_Main, "main.gd");
rt.registerScript("res://main.gd", __gd_d_Main);
const __gd_entry = new Main();
try {
  await __gd_entry.run();
} catch (__gd_e) {
  rt.reportRunFailure(__gd_e);
}
