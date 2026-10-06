// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../packages/runtime/src/runtime/index";
import { print, printJoined, printRaw, printErr, printVerbose, printRich, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
    override _initialize(): Promise<void> { return this.__gd__initialize(); }
  async __gd__initialize(): Promise<void> {
    let d = rt.dictOf([[rt.V.int(1), rt.V.str("a")]]);
    {
      const _nv = rt.writeIdx(d, rt.V.float(1), rt.V.str("b"));
      if (_nv !== null) d = _nv;
    }
    print(rt.showArgs([d]));
    print(rt.showArgs([rt.wrapValue(rt.index(d, rt.V.int(1)))]));
    print(rt.showArgs([rt.wrapValue(rt.index(d, rt.V.float(1)))]));
    print(rt.showArgs([rt.method(d, "size", [])]));
    print(rt.showArgs([rt.method(d, "has", [rt.V.float(1.5)])]));
    print(rt.showArgs([rt.method(d, "has", [rt.V.int(1)])]));
    let g = rt.dictOf([[rt.V.int(1), rt.V.str("i")], [rt.V.bool(true), rt.V.str("b")], [rt.V.float(1), rt.V.str("f")]]);
    print(rt.showArgs([g]));
    print(rt.showArgs([rt.method(g, "size", [])]));
    print(rt.showArgs([rt.method(g, "has", [rt.V.int(1)])]));
    print(rt.showArgs([rt.method(g, "has", [rt.V.bool(true)])]));
    print(rt.showArgs([rt.method(g, "has", [rt.V.float(1)])]));
    let f = rt.dictOf([[rt.vector2New([rt.V.int(1), rt.V.int(2)]), rt.V.str("v")], [rt.vector2New([rt.V.int(2), rt.V.int(1)]), rt.V.str("w")]]);
    print(rt.showArgs([f]));
    print(rt.showArgs([rt.wrapValue(rt.index(f, rt.vector2New([rt.V.int(1), rt.V.int(2)])))]));
    print(rt.showArgs([rt.method(f, "size", [])]));
    let k = rt.dictOf([]);
    {
      const _nv = rt.writeIdx(k, rt.vector2New([rt.V.int(1), rt.V.int(2)]), rt.V.str("a"));
      if (_nv !== null) k = _nv;
    }
    {
      const _nv = rt.writeIdx(k, rt.vector2New([rt.V.float(1), rt.V.float(2)]), rt.V.str("b"));
      if (_nv !== null) k = _nv;
    }
    print(rt.showArgs([k]));
    print(rt.showArgs([rt.method(k, "size", [])]));
    let h = rt.dictOf([[rt.V.int(9007199254740993n), rt.V.str("big")], [rt.V.float(9007199254740992), rt.V.str("bigf")]]);
    print(rt.showArgs([h]));
    print(rt.showArgs([rt.method(h, "size", [])]));
    let e = rt.dictOf([]);
    {
      const _nv = rt.writeIdx(e, rt.V.float((0 / 0)), rt.V.str("nan1"));
      if (_nv !== null) e = _nv;
    }
    print(rt.showArgs([e]));
    print(rt.showArgs([rt.method(e, "size", [])]));
    let z = rt.dictOf([]);
    {
      const _nv = rt.writeIdx(z, rt.V.float(0), rt.V.str("zero"));
      if (_nv !== null) z = _nv;
    }
    {
      const _nv = rt.writeIdx(z, rt.V.float((-0)), rt.V.str("negzero"));
      if (_nv !== null) z = _nv;
    }
    print(rt.showArgs([z]));
    print(rt.showArgs([rt.method(z, "size", [])]));
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
