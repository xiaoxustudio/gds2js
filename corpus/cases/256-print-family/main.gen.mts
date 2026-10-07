// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../packages/runtime/src/runtime/index";
import { print, printJoined, printRaw, printErr, printVerbose, printRich, printDebug, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
    override _initialize(): Promise<void> { return this.__gd__initialize(); }
  async __gd__initialize(): Promise<void> {
    printJoined(" ", [rt.V.str("x"), rt.V.bool(true), rt.V.nil(), rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2)])), rt.V.stringName("sn"), rt.vector2New([rt.V.int(1), rt.V.int(2)])]);
    printJoined(" ", [rt.V.str("a"), rt.V.int(1)]);
    printJoined("\t", [rt.V.str("aa"), rt.V.str("b"), rt.V.int(3)]);
    printJoined("\t", [rt.V.str("solo")]);
    printRaw([rt.V.str("r1")]);
    print(rt.showArgs([rt.V.str("r2")]));
    print(rt.showArgs([rt.V.str("m1")]));
    printRaw([rt.V.str("m2")]);
    printRaw([rt.V.str("m3")]);
    print(rt.showArgs([rt.V.str("m4")]));
    printRaw([rt.V.str("p1")]);
    printJoined(" ", [rt.V.str("p2"), rt.V.str("p3")]);
    print(rt.showArgs([rt.V.str("p4")]));
    printRaw([rt.V.str("t1")]);
    printJoined("\t", [rt.V.str("t2"), rt.V.str("t3")]);
    print(rt.showArgs([rt.V.str("t4")]));
    printRaw([rt.V.str("z1")]);
    printJoined(" ", []);
    print(rt.showArgs([rt.V.str("z2")]));
    printRaw([rt.V.str("z3")]);
    printJoined("\t", []);
    print(rt.showArgs([rt.V.str("z4")]));
    printRaw([rt.V.str("z5")]);
    printRaw([]);
    print(rt.showArgs([rt.V.str("z6")]));
    printRaw([rt.V.str("z7")]);
    printVerbose([]);
    printVerbose([rt.V.str("z8")]);
    print(rt.showArgs([rt.V.str("z9")]));
    printRaw([rt.V.str("w1")]);
    print(rt.showArgs([]));
    print(rt.showArgs([rt.V.str("w2")]));
    printRaw([rt.V.str("y1")]);
    printErr([]);
    print(rt.showArgs([rt.V.str("y2")]));
    printErr([rt.V.str("e1"), rt.V.int(2), rt.V.bool(true)]);
    print(rt.showArgs([rt.V.str("post")]));
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
