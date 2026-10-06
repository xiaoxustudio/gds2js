// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../packages/runtime/src/runtime/index";
import { print, printJoined, printRaw, printErr, printVerbose, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
    override _initialize(): Promise<void> { return this.__gd__initialize(); }
  async __gd__initialize(): Promise<void> {
    let d = new Map<unknown, number>([]);
    let i = 0;
    let s = 0;
    while ((i < 3)) {
      d.set(i, rt.fast.iMulC(i, 10));
      i = rt.fast.iAddC(i, 1);
    }
    let j = 0;
    while ((j < d.size)) {
      s = rt.fast.iAddC(s, rt.fast.rawDictGet(d, j));
      j = rt.fast.iAddC(j, 1);
    }
    print(rt.showArgs([rt.V.int(s)]));
    print(rt.showArgs([rt.V.int(d.size)]));
    print(rt.showArgs([rt.V.int(rt.fast.rawDictGet(d, 2))]));
    let e = new Map<unknown, number>([]);
    e.set("a", 1);
    e.set("b", 2);
    print(rt.showArgs([rt.V.int(rt.fast.iAddC(rt.fast.rawDictGet(e, "a"), rt.fast.rawDictGet(e, "b")))]));
    print(rt.showArgs([rt.V.int(e.size)]));
    let g = rt.dictOf([]);
    {
      const _nv = rt.writeIdx(g, rt.V.float(1), rt.V.int(5));
      if (_nv !== null) g = _nv;
    }
    print(rt.showArgs([rt.wrapValue(rt.index(g, rt.V.float(1)))]));
    let m = rt.dictOf([]);
    {
      const _nv = rt.writeIdx(m, rt.V.int(0), rt.V.int(1));
      if (_nv !== null) m = _nv;
    }
    {
      const _nv = rt.writeIdx(m, rt.V.int(1), rt.V.float(2.5));
      if (_nv !== null) m = _nv;
    }
    print(rt.showArgs([rt.ops.add(rt.wrapValue(rt.index(m, rt.V.int(0))), rt.wrapValue(rt.index(m, rt.V.int(1))))]));
    let h = rt.dictOf([]);
    {
      const _nv = rt.writeIdx(h, rt.V.int(0), rt.V.int(1));
      if (_nv !== null) h = _nv;
    }
    let k = h;
    {
      const _nv = rt.writeIdx(k, rt.V.int(1), rt.V.int(2));
      if (_nv !== null) k = _nv;
    }
    print(rt.showArgs([rt.method(h, "size", [])]));
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
