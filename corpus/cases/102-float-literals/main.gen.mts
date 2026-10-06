// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../packages/runtime/src/runtime/index";
import { print, printJoined, printRaw, printErr, printVerbose, printRich, printDebug, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
    override _initialize(): Promise<void> { return this.__gd__initialize(); }
  async __gd__initialize(): Promise<void> {
    let a = 9007199254740994;
    print(rt.showArgs([rt.V.str("f1 "), rt.toInt(rt.V.float(a)), rt.V.str(" | "), rt.V.float(a)]));
    let b = 9007199254740994;
    print(rt.showArgs([rt.V.str("f2 "), rt.toInt(rt.V.float(b))]));
    let c = 0.12345678901234568;
    print(rt.showArgs([rt.V.str("f3 "), rt.toInt(rt.V.float((c * 100000000000000000))), rt.V.str(" | "), rt.V.float(c)]));
    let d = 1.2345678901e-7;
    print(rt.showArgs([rt.V.str("f4 "), rt.toInt(rt.V.float((d * 1e+25))), rt.V.str(" | "), rt.V.float(d)]));
    let e = 1;
    print(rt.showArgs([rt.V.str("f5 "), rt.toInt(rt.V.float((e * 1000000000000000000)))]));
    let f = 100000000000000000;
    print(rt.showArgs([rt.V.str("f6 "), rt.toInt(rt.V.float(f))]));
    let g = 1234567890123456800;
    print(rt.showArgs([rt.V.str("f7 "), rt.toInt(rt.V.float(g))]));
    let h = 1;
    print(rt.showArgs([rt.V.str("f8 "), rt.V.float(h), rt.V.str(" | "), rt.toInt(rt.V.float(h))]));
    print(rt.showArgs([rt.V.str("f9 "), rt.toInt(rt.V.float((1e-23 * 1e+30))), rt.V.str(" | "), rt.V.float((1e-23 * 1e+30))]));
    print(rt.showArgs([rt.V.str("f10 "), rt.V.bool((a === 9007199254740994)), rt.V.str(" | "), rt.V.bool((a > 9007199254740992)), rt.V.str(" | "), rt.V.bool((d < 1.2345678901e-7))]));
    let i = 1000000.25;
    print(rt.showArgs([rt.V.str("f11 "), rt.toInt(rt.V.float(i)), rt.V.str(" | "), rt.V.float(i)]));
    let j = rt.V.float((-9007199254740994));
    print(rt.showArgs([rt.V.str("f12 "), rt.toInt(j)]));
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
