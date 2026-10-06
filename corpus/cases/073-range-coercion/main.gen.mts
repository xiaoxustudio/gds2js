// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../packages/runtime/src/runtime/index";
import { print, printJoined, printRaw, printErr, printVerbose, printRich, printDebug, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
    override _initialize(): Promise<void> { return this.__gd__initialize(); }
  async __gd__initialize(): Promise<void> {
    print(rt.showArgs([rt.V.array(rt.range([rt.V.float(0.5), rt.V.float(2.5)]))]));
    print(rt.showArgs([rt.V.array(rt.range([rt.V.float(2.5)]))]));
    print(rt.showArgs([rt.V.array(rt.range([rt.V.int(0), rt.V.float(3.9)]))]));
    print(rt.showArgs([rt.V.array(rt.range([rt.V.int(0), rt.V.int(3), rt.V.float(2.5)]))]));
    print(rt.showArgs([rt.V.array(rt.range([rt.V.int(0), rt.V.int(3), rt.V.bool(true)]))]));
    print(rt.showArgs([rt.V.array(rt.range([rt.V.int((-2))]))]));
    print(rt.showArgs([rt.V.array(rt.range([rt.V.int(0), rt.V.int(0)]))]));
    print(rt.showArgs([rt.V.array(rt.range([rt.V.int(3)]))]));
    print(rt.showArgs([rt.V.array(rt.range([rt.V.int(1), rt.V.int(4)]))]));
    print(rt.showArgs([rt.V.array(rt.range([rt.V.int(4), rt.V.int(0), rt.V.int((-2))]))]));
    print(rt.showArgs([rt.V.array(rt.range([rt.V.int(0), rt.V.int(5), rt.V.int(2)]))]));
    print(rt.showArgs([rt.V.array(rt.range([rt.V.float(0.9), rt.V.float(0.1)]))]));
    print(rt.showArgs([rt.V.array(rt.range([rt.V.float((-1.5)), rt.V.float(1.5)]))]));
    print(rt.showArgs([rt.V.array(rt.range([rt.V.int(0), rt.V.int(3), rt.V.float(1.001)]))]));
    let st = 1.7;
    print(rt.showArgs([rt.V.array(rt.range([rt.V.int(0), rt.V.int(6), rt.V.float(st)]))]));
    for (let i of rt.rangeSeq([rt.V.float(2.5)])) {
      print(rt.showArgs([rt.V.int(i)]));
    }
    for (let i of rt.rangeSeq([rt.V.int(0), rt.V.int(3), rt.V.float(1.5)])) {
      print(rt.showArgs([rt.V.int(i)]));
    }
    let total = 0;
    for (let i of rt.rangeSeq([rt.V.float(0.5), rt.V.float(4.5)])) {
      total = rt.fast.iAddC(total, i);
    }
    print(rt.showArgs([rt.V.int(total)]));
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
