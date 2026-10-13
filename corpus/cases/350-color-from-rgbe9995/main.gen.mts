// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../packages/runtime/src/runtime/index";
import { print, printJoined, printRaw, printErr, printVerbose, printRich, printDebug, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
    override _initialize(): Promise<void> { return this.__gd__initialize(); }
  async __gd__initialize(): Promise<void> {
    print(rt.showArgs([rt.V.str("A|"), rt.colorStatic("from_rgbe9995", [rt.V.int(0)])]));
    print(rt.showArgs([rt.V.str("B|"), rt.colorStatic("from_rgbe9995", [rt.V.int(1)])]));
    print(rt.showArgs([rt.V.str("C|"), rt.colorStatic("from_rgbe9995", [rt.V.int(511)])]));
    print(rt.showArgs([rt.V.str("D|"), rt.colorStatic("from_rgbe9995", [rt.V.int(524287)])]));
    print(rt.showArgs([rt.V.str("E|"), rt.colorStatic("from_rgbe9995", [rt.V.int(524288)])]));
    print(rt.showArgs([rt.V.str("F|"), rt.colorStatic("from_rgbe9995", [rt.V.int(33554431)])]));
    print(rt.showArgs([rt.V.str("G|"), rt.colorStatic("from_rgbe9995", [rt.V.int(4294967295)])]));
    print(rt.showArgs([rt.V.str("H|"), rt.colorStatic("from_rgbe9995", [rt.ops.bor(rt.ops.bor(rt.ops.bor(rt.V.int(1), rt.ops.shl(rt.V.int(2), rt.V.int(9))), rt.ops.shl(rt.V.int(3), rt.V.int(18))), rt.ops.shl(rt.V.int(15), rt.V.int(27)))])]));
    print(rt.showArgs([rt.V.str("I|"), rt.colorStatic("from_rgbe9995", [rt.ops.bor(rt.ops.bor(rt.ops.bor(rt.V.int(511), rt.ops.shl(rt.V.int(511), rt.V.int(9))), rt.ops.shl(rt.V.int(511), rt.V.int(18))), rt.ops.shl(rt.V.int(15), rt.V.int(27)))])]));
    print(rt.showArgs([rt.V.str("J|"), rt.colorStatic("from_rgbe9995", [rt.ops.bor(rt.ops.bor(rt.ops.bor(rt.V.int(1), rt.ops.shl(rt.V.int(0), rt.V.int(9))), rt.ops.shl(rt.V.int(0), rt.V.int(18))), rt.ops.shl(rt.V.int(255), rt.V.int(27)))])]));
    print(rt.showArgs([rt.V.str("K|"), rt.colorStatic("from_rgbe9995", [rt.ops.bor(rt.ops.bor(rt.ops.bor(rt.V.int(511), rt.ops.shl(rt.V.int(0), rt.V.int(9))), rt.ops.shl(rt.V.int(0), rt.V.int(18))), rt.ops.shl(rt.V.int(255), rt.V.int(27)))])]));
    print(rt.showArgs([rt.V.str("L|"), rt.colorStatic("from_rgbe9995", [rt.ops.bor(rt.ops.bor(rt.ops.bor(rt.V.int(0), rt.ops.shl(rt.V.int(0), rt.V.int(9))), rt.ops.shl(rt.V.int(0), rt.V.int(18))), rt.ops.shl(rt.V.int(127), rt.V.int(27)))])]));
    print(rt.showArgs([rt.V.str("M|"), rt.colorStatic("from_rgbe9995", [rt.ops.bor(rt.ops.bor(rt.ops.bor(rt.V.int(100), rt.ops.shl(rt.V.int(200), rt.V.int(9))), rt.ops.shl(rt.V.int(300), rt.V.int(18))), rt.ops.shl(rt.V.int(20), rt.V.int(27)))])]));
    print(rt.showArgs([rt.V.str("N|"), rt.colorStatic("from_rgbe9995", [rt.ops.bor(rt.ops.bor(rt.ops.bor(rt.V.int(0), rt.ops.shl(rt.V.int(1), rt.V.int(9))), rt.ops.shl(rt.V.int(2), rt.V.int(18))), rt.ops.shl(rt.V.int(9), rt.V.int(27)))])]));
    print(rt.showArgs([rt.V.str("O|"), rt.colorStatic("from_rgbe9995", [rt.V.int((-1))])]));
    print(rt.showArgs([rt.V.str("P|"), rt.colorStatic("from_rgbe9995", [rt.ops.band(rt.V.int((-1)), rt.V.int(4294967295))])]));
    print(rt.showArgs([rt.V.str("Q|"), rt.colorStatic("from_rgbe9995", [rt.V.int(4294967296)])]));
    print(rt.showArgs([rt.V.str("R|"), rt.colorStatic("from_rgbe9995", [rt.V.int(2147483648)])]));
    print(rt.showArgs([rt.V.str("S|"), rt.colorStatic("from_rgbe9995", [rt.V.int(2147483647)])]));
    print(rt.showArgs([rt.V.str("T|"), rt.colorStatic("from_rgbe9995", [rt.ops.shl(rt.V.int(1), rt.V.int(40))])]));
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
