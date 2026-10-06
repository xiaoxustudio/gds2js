// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../packages/runtime/src/runtime/index";
import { print, printJoined, printRaw, printErr, printVerbose, printRich, printDebug, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
    override _initialize(): Promise<void> { return this.__gd__initialize(); }
  async __gd__initialize(): Promise<void> {
    let a = rt.V.array(rt.GArray.of([]));
    for (let i of rt.iter(rt.V.int(10))) {
      a = rt.V.array(rt.GArray.of([a]));
    }
    print(rt.showArgs([rt.V.str("d10|"), rt.method(a, "hash", [])]));
    let b = rt.V.array(rt.GArray.of([]));
    for (let i of rt.iter(rt.V.int(100))) {
      b = rt.V.array(rt.GArray.of([b]));
    }
    print(rt.showArgs([rt.V.str("d100|"), rt.method(b, "hash", [])]));
    let c = rt.V.array(rt.GArray.of([]));
    for (let i of rt.iter(rt.V.int(101))) {
      c = rt.V.array(rt.GArray.of([c]));
    }
    print(rt.showArgs([rt.V.str("d101|"), rt.method(c, "hash", [])]));
    let dd = rt.dictOf([]);
    for (let i of rt.iter(rt.V.int(101))) {
      dd = rt.dictOf([[rt.V.str("k"), dd]]);
    }
    print(rt.showArgs([rt.V.str("dict101|"), rt.method(dd, "hash", [])]));
    let e = rt.V.array(rt.GArray.of([]));
    for (let i of rt.iter(rt.V.int(120))) {
      e = rt.V.array(rt.GArray.of([e]));
    }
    print(rt.showArgs([rt.V.str("d120|"), rt.method(e, "hash", [])]));
    let f = rt.V.array(rt.GArray.of([]));
    for (let i of rt.iter(rt.V.int(300))) {
      f = rt.V.array(rt.GArray.of([rt.dictOf([[rt.V.str("k"), rt.V.array(rt.GArray.of([f]))]])]));
    }
    print(rt.showArgs([rt.V.str("d300mix|"), rt.method(f, "hash", [])]));
    print(rt.showArgs([rt.V.str("flat|"), rt.method(rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2)])), "hash", [])]));
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
