// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../packages/runtime/src/runtime/index";
import { print, printJoined, printRaw, printErr, printVerbose, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
    override _initialize(): Promise<void> { return this.__gd__initialize(); }
  async __gd__initialize(): Promise<void> {
    let a: number[] = [];
    let i = 0;
    let s = 0;
    while ((i < 3)) {
      a.push(i);
      s = rt.fast.iAddC(s, rt.fast.rawArrGetNum(a, i));
      i = rt.fast.iAddC(i, 1);
    }
    print(rt.showArgs([rt.V.int(s)]));
    print(rt.showArgs([rt.V.int(rt.fast.rawArrGetNum(a, 1))]));
    print(rt.showArgs([rt.V.int(a.length)]));
    let b: number[] = [1.5];
    let j = 0;
    let s2 = 0;
    b.push(2);
    b.push(2.5);
    while ((j < b.length)) {
      s2 = (s2 + rt.fast.rawArrGetNum(b, j));
      j = rt.fast.iAddC(j, 1);
    }
    print(rt.showArgs([rt.V.float(s2)]));
    let e = rt.V.array(rt.GArray.of([]));
    rt.method(e, "append", [rt.V.int(7)]);
    let f = e;
    rt.method(f, "append", [rt.V.int(8)]);
    print(rt.showArgs([e]));
    print(rt.showArgs([rt.method(e, "size", [])]));
    let w: number[] = [1, 2];
    rt.fast.rawArrSetNum(w, 0, 5);
    print(rt.showArgs([rt.V.int(rt.fast.rawArrGetNum(w, 0))]));
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
