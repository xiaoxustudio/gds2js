// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../packages/runtime/src/runtime/index";
import { print, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
  td = rt.stampDict(rt.dictOf([]), "Array", "int", true);

    override _initialize(): Promise<void> { return this.__gd__initialize(); }
  async __gd__initialize(): Promise<void> {
    let d = rt.dictOf([]);
    let a = rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2)]));
    {
      const _nv = rt.writeIdx(d, a, rt.V.int(5));
      if (_nv !== null) d = _nv;
    }
    print(rt.showArgs([d]));
    print(rt.showArgs([rt.method(d, "has", [a]), rt.V.str(" "), rt.method(d, "has", [rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2)]))]), rt.V.str(" "), rt.wrapValue(rt.index(d, rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2)])))), rt.V.str(" "), rt.method(d, "get", [rt.V.array(rt.GArray.of([rt.V.float(1), rt.V.float(2)])), rt.V.str("M")])]));
    {
      const _nv = rt.writeIdx(d, rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2)])), rt.V.int(6));
      if (_nv !== null) d = _nv;
    }
    print(rt.showArgs([d, rt.V.str(" size="), rt.method(d, "size", [])]));
    let e = rt.dictOf([[rt.V.str("x"), rt.V.int(1)]]);
    {
      const _nv = rt.writeIdx(d, e, rt.V.int(7));
      if (_nv !== null) d = _nv;
    }
    print(rt.showArgs([d, rt.V.str(" "), rt.method(d, "get", [rt.dictOf([[rt.V.str("x"), rt.V.int(1)]]), rt.V.str("M")]), rt.V.str(" "), rt.method(d, "get", [rt.dictOf([[rt.V.str("x"), rt.V.float(1)]]), rt.V.str("M")])]));
    print(rt.showArgs([rt.method(d, "keys", []), rt.V.str(" size="), rt.method(d, "size", [])]));
    let od = rt.dictOf([]);
    {
      const _nv = rt.writeIdx(od, rt.dictOf([[rt.V.str("a"), rt.V.int(1)], [rt.V.str("b"), rt.V.int(2)]]), rt.V.int(9));
      if (_nv !== null) od = _nv;
    }
    print(rt.showArgs([rt.method(od, "get", [rt.dictOf([[rt.V.str("b"), rt.V.int(2)], [rt.V.str("a"), rt.V.int(1)]]), rt.V.str("M")]), rt.V.str(" "), rt.method(od, "get", [rt.dictOf([[rt.V.str("a"), rt.V.int(1)], [rt.V.str("b"), rt.V.int(2)]]), rt.V.str("M")])]));
    let m = rt.V.array(rt.GArray.of([rt.V.int(1)]));
    {
      const _nv = rt.writeIdx(d, m, rt.V.int(8));
      if (_nv !== null) d = _nv;
    }
    rt.method(m, "append", [rt.V.int(2)]);
    print(rt.showArgs([rt.method(d, "size", []), rt.V.str(" "), rt.method(d, "has", [rt.V.array(rt.GArray.of([rt.V.int(1)]))]), rt.V.str(" "), rt.method(d, "has", [m]), rt.V.str(" "), d]));
    let c1 = rt.V.array(rt.GArray.of([rt.V.int(7), rt.V.int(8)]));
    let d2 = rt.dictOf([]);
    {
      const _nv = rt.writeIdx(d2, c1, rt.V.int(1));
      if (_nv !== null) d2 = _nv;
    }
    rt.method(c1, "append", [rt.V.int(9)]);
    {
      const _nv = rt.writeIdx(d2, rt.V.array(rt.GArray.of([rt.V.int(7), rt.V.int(8)])), rt.V.int(2));
      if (_nv !== null) d2 = _nv;
    }
    print(rt.showArgs([d2, rt.V.str(" size="), rt.method(d2, "size", []), rt.V.str(" "), rt.method(d2, "get", [rt.V.array(rt.GArray.of([rt.V.int(7), rt.V.int(8)])), rt.V.str("M")]), rt.V.str(" "), rt.method(d2, "get", [c1, rt.V.str("M")])]));
    print(rt.showArgs([rt.method(d2, "erase", [rt.V.array(rt.GArray.of([rt.V.int(7), rt.V.int(8)]))]), rt.V.str(" "), rt.method(d2, "erase", [c1]), rt.V.str(" size="), rt.method(d2, "size", [])]));
    let k3 = rt.V.array(rt.GArray.of([rt.V.int(1)]));
    let d3 = rt.dictOf([]);
    {
      const _nv = rt.writeIdx(d3, k3, rt.V.int(1));
      if (_nv !== null) d3 = _nv;
    }
    print(rt.showArgs([rt.method(d3, "erase", [rt.V.array(rt.GArray.of([rt.V.int(1)]))]), rt.V.str(" "), rt.method(d3, "erase", [rt.V.array(rt.GArray.of([rt.V.int(1)]))]), rt.V.str(" size="), rt.method(d3, "size", [])]));
    let sh = rt.dictOf([]);
    let kk = rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2)]));
    {
      const _nv = rt.writeIdx(sh, kk, rt.V.int(1));
      if (_nv !== null) sh = _nv;
    }
    let cp = rt.method(sh, "duplicate", []);
    rt.method(kk, "append", [rt.V.int(3)]);
    print(rt.showArgs([rt.method(cp, "get", [rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2)])), rt.V.str("M")]), rt.V.str(" "), rt.method(cp, "get", [rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2), rt.V.int(3)])), rt.V.str("M")]), rt.V.str(" "), cp]));
    let dp = rt.method(sh, "duplicate", [rt.V.bool(true)]);
    print(rt.showArgs([rt.method(dp, "get", [rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2), rt.V.int(3)])), rt.V.str("M")]), rt.V.str(" "), rt.method(dp, "get", [rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2)])), rt.V.str("M")]), rt.V.str(" "), dp]));
    let v = rt.vector2New([rt.V.int(1), rt.V.int(2)]);
    let d4 = rt.dictOf([[rt.vector2New([rt.V.int(1), rt.V.int(2)]), rt.V.int(1)]]);
    {
      const _nv = rt.writeIdx(d4, v, rt.V.int(2));
      if (_nv !== null) d4 = _nv;
    }
    print(rt.showArgs([d4, rt.V.str(" size="), rt.method(d4, "size", []), rt.V.str(" "), rt.method(d4, "has", [rt.vector2New([rt.V.float(1), rt.V.float(2)])])]));
    {
      const _nv = rt.writeProp(v, "x", rt.V.int(9));
      if (_nv !== null) v = _nv;
    }
    print(rt.showArgs([rt.method(d4, "has", [v]), rt.V.str(" "), rt.method(d4, "get", [rt.vector2New([rt.V.int(1), rt.V.int(2)]), rt.V.str("M")])]));
    let ta = rt.stampArray(rt.V.array(rt.GArray.of([rt.vector2New([rt.V.int(1), rt.V.int(2)])])), "Vector2", true);
    let d5 = rt.dictOf([]);
    {
      const _nv = rt.writeIdx(d5, ta, rt.V.int(3));
      if (_nv !== null) d5 = _nv;
    }
    print(rt.showArgs([d5, rt.V.str(" "), rt.method(d5, "get", [rt.V.array(rt.GArray.of([rt.vector2New([rt.V.int(1), rt.V.int(2)])])), rt.V.str("M")])]));
    {
      const _nv = rt.writeIdx(this.td, rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2)])), rt.V.int(5));
      if (_nv !== null) this.td = _nv;
    }
    print(rt.showArgs([this.td, rt.V.str(" "), rt.method(this.td, "get", [rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2)])), rt.V.str("M")]), rt.V.str(" "), rt.method(this.td, "get", [rt.V.array(rt.GArray.of([rt.V.float(1), rt.V.float(2)])), rt.V.str("M")])]));
    let d6 = rt.dictOf([]);
    {
      const _nv = rt.writeIdx(d6, rt.V.array(rt.GArray.of([])), rt.V.int(1));
      if (_nv !== null) d6 = _nv;
    }
    {
      const _nv = rt.writeIdx(d6, rt.dictOf([]), rt.V.int(2));
      if (_nv !== null) d6 = _nv;
    }
    print(rt.showArgs([d6, rt.V.str(" "), rt.method(d6, "get", [rt.V.array(rt.GArray.of([])), rt.V.str("M")]), rt.V.str(" "), rt.method(d6, "get", [rt.dictOf([]), rt.V.str("M")])]));
    let d7 = rt.dictOf([]);
    {
      const _nv = rt.writeIdx(d7, rt.V.array(rt.GArray.of([rt.V.int(1)])), rt.V.int(1));
      if (_nv !== null) d7 = _nv;
    }
    print(rt.showArgs([rt.method(d7, "get", [rt.V.array(rt.GArray.of([rt.V.int(1)])), rt.V.str("M")]), rt.V.str(" "), rt.method(d7, "get", [rt.V.array(rt.GArray.of([rt.V.float(1)])), rt.V.str("M")]), rt.V.str(" "), rt.method(d7, "get", [rt.V.array(rt.GArray.of([rt.V.bool(true)])), rt.V.str("M")]), rt.V.str(" "), rt.method(d7, "get", [rt.V.array(rt.GArray.of([rt.V.int(0)])), rt.V.str("M")])]));
    let inner = rt.V.array(rt.GArray.of([rt.V.int(1)]));
    let d8 = rt.dictOf([]);
    {
      const _nv = rt.writeIdx(d8, rt.V.array(rt.GArray.of([inner])), rt.V.int(8));
      if (_nv !== null) d8 = _nv;
    }
    rt.method(inner, "append", [rt.V.int(2)]);
    print(rt.showArgs([rt.method(d8, "get", [rt.V.array(rt.GArray.of([rt.V.array(rt.GArray.of([rt.V.int(1)]))])), rt.V.str("M")]), rt.V.str(" "), d8, rt.V.str(" "), rt.method(d8, "values", [])]));
    let d9 = rt.dictOf([]);
    {
      const _nv = rt.writeIdx(d9, rt.V.array(rt.GArray.of([rt.V.int(1)])), rt.V.str("one"));
      if (_nv !== null) d9 = _nv;
    }
    {
      const _nv = rt.writeIdx(d9, rt.V.str("s"), rt.V.str("two"));
      if (_nv !== null) d9 = _nv;
    }
    for (let key of rt.iter(d9)) {
      print(rt.showArgs([key, rt.V.str(" -> "), rt.wrapValue(rt.index(d9, key))]));
    }
    let da = rt.dictOf([[rt.V.str("z"), rt.dictOf([])]]);
    let db = rt.dictOf([]);
    {
      const _nv = rt.writeIdx(db, da, rt.V.int(1));
      if (_nv !== null) db = _nv;
    }
    {
    const _w0 = rt.V.str("z");
      const _nv = rt.writeIdx(rt.index(da, _w0), rt.V.str("y"), rt.V.int(1));
      if (_nv !== null) rt.setIndex(da, _w0, _nv);
    }
    print(rt.showArgs([rt.method(db, "get", [rt.dictOf([[rt.V.str("z"), rt.dictOf([])]]), rt.V.str("M")]), rt.V.str(" "), rt.method(db, "get", [rt.dictOf([[rt.V.str("z"), rt.dictOf([[rt.V.str("y"), rt.V.int(1)]])]]), rt.V.str("M")]), rt.V.str(" "), db]));
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
rt.registerScriptProps(__gd_d_Main, ["td"]);
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
