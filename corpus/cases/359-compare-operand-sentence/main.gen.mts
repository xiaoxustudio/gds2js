// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../packages/runtime/src/runtime/index";
import { print, printJoined, printRaw, printErr, printVerbose, printRich, printDebug, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
  w0(): void {
    let x = rt.V.nil();
    let y = rt.V.int(1);
    print(rt.showArgs([rt.ops.lt(x, y)]));
  }
  
  w1(): void {
    let x = rt.packCtor("string", [rt.V.array(rt.GArray.of([rt.V.str("a")]))]);
    let y = rt.V.int(1);
    print(rt.showArgs([rt.ops.lt(x, y)]));
  }
  
  w2(): void {
    let x = rt.dictOf([[rt.V.str("a"), rt.V.int(1)]]);
    let y = rt.V.int(1);
    print(rt.showArgs([rt.ops.gt(x, y)]));
  }
  
  w3(): void {
    let x = rt.colorNew([rt.V.int(1), rt.V.int(0), rt.V.int(0), rt.V.int(1)]);
    let y = rt.colorNew([rt.V.int(0), rt.V.int(1), rt.V.int(0), rt.V.int(1)]);
    print(rt.showArgs([rt.ops.lt(x, y)]));
  }
  
  w4(): void {
    let x = rt.V.int(1);
    let y = rt.V.float(1.5);
    print(rt.showArgs([rt.ops.lt(x, y)]));
    print(rt.showArgs([rt.V.str("末格给值")]));
  }
  
    override _initialize(): Promise<void> { return this.__gd__initialize(); }
  async __gd__initialize(): Promise<void> {
    this.w0();
    this.w1();
    this.w2();
    this.w3();
    this.w4();
    this.quit();
  }
  
  override __gdDispatch(name: string, args: rt.Variant[]): rt.Variant | null {
    switch (name) {
      case "w0": return rt.wrapValue(this.w0());
      case "w1": return rt.wrapValue(this.w1());
      case "w2": return rt.wrapValue(this.w2());
      case "w3": return rt.wrapValue(this.w3());
      case "w4": return rt.wrapValue(this.w4());
      case "_initialize": return rt.wrapValue(this.__gd__initialize());
      default: return super.__gdDispatch(name, args);
    }
  }

}

const __gd_d_Main = rt.defineClass(Main, () => new Main(), (o) => o instanceof Main);
rt.registerDictIdentity(__gd_d_Main, "res://main.gd", "", [], {}, (o) => { const s = o as Main; return []; });
rt.registerMethodArities(__gd_d_Main, { "w0": [0, 0], "w1": [0, 0], "w2": [0, 0], "w3": [0, 0], "w4": [0, 0], "_initialize": [0, 0] });
rt.registerNativeBase(__gd_d_Main, "SceneTree");
rt.registerScriptLabel(__gd_d_Main, "main.gd");
rt.registerScript("res://main.gd", __gd_d_Main);
const __gd_entry = new Main();
try {
  await __gd_entry.run();
} catch (__gd_e) {
  rt.reportRunFailure(__gd_e);
}
