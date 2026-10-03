// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../packages/runtime/src/runtime/index";
import { print, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
    override _initialize(): Promise<void> { return this.__gd__initialize(); }
  async __gd__initialize(): Promise<void> {
    let a = rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2), rt.V.int(3)]));
    rt.method(a, "insert", [rt.V.int(0), rt.V.int(9)]);
    print(rt.showArgs([a]));
    rt.method(a, "insert", [rt.V.int(2), rt.V.int(8)]);
    print(rt.showArgs([a]));
    rt.method(a, "insert", [rt.V.int(10), rt.V.int(7)]);
    print(rt.showArgs([a]));
    rt.method(a, "insert", [rt.V.int(6), rt.V.int(6)]);
    print(rt.showArgs([a]));
    rt.method(a, "insert", [rt.V.int((-1)), rt.V.int(5)]);
    print(rt.showArgs([a]));
    rt.method(a, "insert", [rt.V.int((-9)), rt.V.int(4)]);
    print(rt.showArgs([a]));
    let emp = rt.V.array(rt.GArray.of([]));
    rt.method(emp, "insert", [rt.V.int(0), rt.V.int(1)]);
    print(rt.showArgs([emp]));
    rt.method(emp, "insert", [rt.V.int(5), rt.V.int(2)]);
    print(rt.showArgs([emp]));
    rt.method(emp, "insert", [rt.V.int((-1)), rt.V.int(3)]);
    print(rt.showArgs([emp]));
    let p = rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2), rt.V.int(3)]));
    print(rt.showArgs([rt.method(p, "pop_front", [])]));
    print(rt.showArgs([rt.method(p, "pop_back", [])]));
    print(rt.showArgs([p]));
    print(rt.showArgs([rt.method(p, "pop_at", [rt.V.int(0)])]));
    print(rt.showArgs([rt.method(p, "pop_at", [rt.V.int(5)])]));
    print(rt.showArgs([rt.method(p, "pop_at", [rt.V.int((-9))])]));
    print(rt.showArgs([p]));
    let q = rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2), rt.V.int(3)]));
    print(rt.showArgs([rt.method(q, "pop_at", [rt.V.int((-1))])]));
    print(rt.showArgs([q]));
    let r = rt.V.array(rt.GArray.of([]));
    print(rt.showArgs([rt.method(r, "pop_front", [])]));
    print(rt.showArgs([rt.method(r, "pop_back", [])]));
    print(rt.showArgs([rt.method(r, "pop_at", [rt.V.int(0)])]));
    print(rt.showArgs([r]));
    let s = rt.V.array(rt.GArray.of([rt.V.int(2)]));
    rt.method(s, "push_front", [rt.V.int(1)]);
    rt.method(s, "push_back", [rt.V.int(3)]);
    print(rt.showArgs([s]));
    let t = rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2), rt.V.int(3)]));
    rt.method(t, "remove_at", [rt.V.int(0)]);
    print(rt.showArgs([t]));
    rt.method(t, "remove_at", [rt.V.int(5)]);
    print(rt.showArgs([t]));
    rt.method(t, "remove_at", [rt.V.int((-1))]);
    print(rt.showArgs([t]));
    rt.method(t, "remove_at", [rt.V.int((-9))]);
    print(rt.showArgs([t]));
    let u = rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2), rt.V.int(3), rt.V.int(1)]));
    rt.method(u, "erase", [rt.V.int(2)]);
    print(rt.showArgs([u]));
    rt.method(u, "erase", [rt.V.int(9)]);
    print(rt.showArgs([u]));
    rt.method(u, "erase", [rt.V.int(1)]);
    print(rt.showArgs([u]));
    let nest = rt.V.array(rt.GArray.of([rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2)])), rt.V.int(3)]));
    rt.method(nest, "erase", [rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2)]))]);
    print(rt.showArgs([nest]));
    let mix = rt.V.array(rt.GArray.of([rt.V.float(1), rt.V.int(1)]));
    rt.method(mix, "erase", [rt.V.int(1)]);
    print(rt.showArgs([mix]));
    let rv = rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2), rt.V.int(3)]));
    rt.method(rv, "reverse", []);
    print(rt.showArgs([rv]));
    rt.method(rv, "clear", []);
    print(rt.showArgs([rv]));
    print(rt.showArgs([rt.method(rv, "is_empty", [])]));
    print(rt.showArgs([rt.method(rt.V.array(rt.GArray.of([rt.V.int(1)])), "is_empty", [])]));
    let fl = rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2)]));
    let src = rt.V.array(rt.GArray.of([rt.V.int(9)]));
    rt.method(fl, "fill", [src]);
    print(rt.showArgs([fl]));
    {
      const _nv = rt.writeIdx(src, rt.V.int(0), rt.V.int(5));
      if (_nv !== null) src = _nv;
    }
    print(rt.showArgs([fl]));
    let sl = rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2), rt.V.int(3), rt.V.int(4), rt.V.int(5)]));
    print(rt.showArgs([rt.method(sl, "slice", [rt.V.int(1), rt.V.int(3)])]));
    print(rt.showArgs([rt.method(sl, "slice", [rt.V.int((-2))])]));
    print(rt.showArgs([rt.method(sl, "slice", [rt.V.int(1)])]));
    print(rt.showArgs([rt.method(sl, "slice", [rt.V.int(0), rt.V.int(10)])]));
    print(rt.showArgs([rt.method(sl, "slice", [rt.V.int(3), rt.V.int(1)])]));
    print(rt.showArgs([rt.method(sl, "slice", [rt.V.int(0), rt.V.int(0)])]));
    print(rt.showArgs([rt.method(sl, "slice", [rt.V.int((-9))])]));
    print(rt.showArgs([rt.method(sl, "slice", [rt.V.int((-9)), rt.V.int((-6))])]));
    print(rt.showArgs([rt.method(sl, "slice", [rt.V.int(2), rt.V.int((-1))])]));
    print(rt.showArgs([rt.method(sl, "slice", [rt.V.int(0), rt.V.int(5), rt.V.int(2)])]));
    print(rt.showArgs([rt.method(sl, "slice", [rt.V.int(1), rt.V.int(4), rt.V.int(3)])]));
    print(rt.showArgs([rt.method(sl, "slice", [rt.V.int(0), rt.V.int(5), rt.V.int((-1))])]));
    print(rt.showArgs([rt.method(sl, "slice", [rt.V.int(4), rt.V.int(1), rt.V.int((-1))])]));
    print(rt.showArgs([rt.method(sl, "slice", [rt.V.int((-1)), rt.V.int((-6)), rt.V.int((-1))])]));
    print(rt.showArgs([rt.method(sl, "slice", [rt.V.int(9), rt.V.int(1), rt.V.int((-1))])]));
    print(rt.showArgs([rt.method(sl, "slice", [rt.V.int(0), rt.V.int(5), rt.V.int(0)])]));
    print(rt.showArgs([sl]));
    let sh = rt.V.array(rt.GArray.of([rt.V.array(rt.GArray.of([rt.V.int(1)])), rt.V.array(rt.GArray.of([rt.V.int(2)]))]));
    let shallow = rt.method(sh, "slice", [rt.V.int(0), rt.V.int(2)]);
    {
    const _w0 = rt.V.int(0);
      const _nv = rt.writeIdx(rt.index(shallow, _w0), rt.V.int(0), rt.V.int(9));
      if (_nv !== null) rt.setIndex(shallow, _w0, _nv);
    }
    print(rt.showArgs([sh]));
    let deep = rt.method(sh, "slice", [rt.V.int(0), rt.V.int(2), rt.V.int(1), rt.V.bool(true)]);
    {
    const _w0 = rt.V.int(1);
      const _nv = rt.writeIdx(rt.index(deep, _w0), rt.V.int(0), rt.V.int(8));
      if (_nv !== null) rt.setIndex(deep, _w0, _nv);
    }
    print(rt.showArgs([sh]));
    print(rt.showArgs([deep]));
    let dup = rt.V.array(rt.GArray.of([rt.V.array(rt.GArray.of([rt.V.int(1)]))]));
    let ds = rt.method(dup, "duplicate", []);
    {
    const _w0 = rt.V.int(0);
      const _nv = rt.writeIdx(rt.index(ds, _w0), rt.V.int(0), rt.V.int(9));
      if (_nv !== null) rt.setIndex(ds, _w0, _nv);
    }
    print(rt.showArgs([dup]));
    let dd = rt.method(dup, "duplicate", [rt.V.bool(true)]);
    {
    const _w0 = rt.V.int(0);
      const _nv = rt.writeIdx(rt.index(dd, _w0), rt.V.int(0), rt.V.int(5));
      if (_nv !== null) rt.setIndex(dd, _w0, _nv);
    }
    print(rt.showArgs([dup]));
    print(rt.showArgs([dd]));
    print(rt.showArgs([rt.method(rt.method(dup, "duplicate", []), "size", [])]));
    let ap = rt.V.array(rt.GArray.of([rt.V.int(1)]));
    rt.method(ap, "append_array", [rt.V.array(rt.GArray.of([rt.V.int(2), rt.V.array(rt.GArray.of([rt.V.int(3)]))]))]);
    print(rt.showArgs([ap]));
    let asrc = rt.V.array(rt.GArray.of([rt.V.array(rt.GArray.of([rt.V.int(9)]))]));
    let shared = rt.V.array(rt.GArray.of([]));
    rt.method(shared, "append_array", [asrc]);
    {
    const _w0 = rt.V.int(0);
      const _nv = rt.writeIdx(rt.index(asrc, _w0), rt.V.int(0), rt.V.int(7));
      if (_nv !== null) rt.setIndex(asrc, _w0, _nv);
    }
    print(rt.showArgs([shared]));
    let bs = rt.V.array(rt.GArray.of([rt.V.int(3)]));
    let asg = rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2)]));
    rt.method(asg, "assign", [bs]);
    {
      const _nv = rt.writeIdx(bs, rt.V.int(0), rt.V.int(9));
      if (_nv !== null) bs = _nv;
    }
    print(rt.showArgs([asg]));
    let nest_src = rt.V.array(rt.GArray.of([rt.V.array(rt.GArray.of([rt.V.int(1)]))]));
    let assigned = rt.V.array(rt.GArray.of([]));
    rt.method(assigned, "assign", [nest_src]);
    {
    const _w0 = rt.V.int(0);
      const _nv = rt.writeIdx(rt.index(nest_src, _w0), rt.V.int(0), rt.V.int(9));
      if (_nv !== null) rt.setIndex(nest_src, _w0, _nv);
    }
    print(rt.showArgs([assigned]));
    let idn = rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.float(1), rt.V.bool(true), rt.V.nil(), rt.V.stringName("a")]));
    print(rt.showArgs([rt.method(idn, "has", [rt.V.int(1)])]));
    print(rt.showArgs([rt.method(idn, "has", [rt.V.float(1)])]));
    print(rt.showArgs([rt.method(idn, "has", [rt.V.bool(true)])]));
    print(rt.showArgs([rt.method(idn, "has", [rt.V.nil()])]));
    print(rt.showArgs([rt.method(idn, "has", [rt.V.str("a")])]));
    print(rt.showArgs([rt.method(idn, "find", [rt.V.float(1)])]));
    print(rt.showArgs([rt.method(idn, "count", [rt.V.int(1)])]));
    print(rt.showArgs([rt.method(idn, "count", [rt.V.str("a")])]));
    print(rt.showArgs([rt.method(rt.V.array(rt.GArray.of([rt.V.int(1)])), "has", [rt.V.float(1)])]));
    print(rt.showArgs([rt.method(rt.V.array(rt.GArray.of([rt.V.int(1)])), "find", [rt.V.float(1)])]));
    print(rt.showArgs([rt.method(rt.V.array(rt.GArray.of([rt.V.int(1)])), "count", [rt.V.float(1)])]));
    print(rt.showArgs([rt.method(rt.V.array(rt.GArray.of([rt.V.int(0)])), "has", [rt.V.bool(false)])]));
    print(rt.showArgs([rt.method(rt.V.array(rt.GArray.of([rt.V.nil()])), "has", [rt.V.int(0)])]));
    print(rt.showArgs([rt.method(rt.V.array(rt.GArray.of([rt.V.array(rt.GArray.of([rt.V.int(1)]))])), "has", [rt.V.array(rt.GArray.of([rt.V.float(1)]))])]));
    print(rt.showArgs([rt.method(rt.V.array(rt.GArray.of([rt.V.array(rt.GArray.of([rt.V.int(1)]))])), "find", [rt.V.array(rt.GArray.of([rt.V.float(1)]))])]));
    print(rt.showArgs([rt.method(rt.V.array(rt.GArray.of([rt.dictOf([[rt.V.str("x"), rt.V.int(1)], [rt.V.str("y"), rt.V.int(2)]])])), "count", [rt.dictOf([[rt.V.str("y"), rt.V.int(2)], [rt.V.str("x"), rt.V.int(1)]])])]));
    print(rt.showArgs([rt.method(rt.V.array(rt.GArray.of([rt.vector2New([rt.V.int(1), rt.V.int(2)])])), "count", [rt.vector2New([rt.V.float(1), rt.V.float(2)])])]));
    print(rt.showArgs([rt.method(rt.V.array(rt.GArray.of([rt.vector2New([rt.V.int(1), rt.V.int(2)])])), "find", [rt.vector2New([rt.V.float(1), rt.V.float(2)])])]));
    let fr = rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2), rt.V.int(1), rt.V.int(2)]));
    print(rt.showArgs([rt.method(fr, "find", [rt.V.int(1)])]));
    print(rt.showArgs([rt.method(fr, "find", [rt.V.int(1), rt.V.int(1)])]));
    print(rt.showArgs([rt.method(fr, "find", [rt.V.int(1), rt.V.int(3)])]));
    print(rt.showArgs([rt.method(fr, "find", [rt.V.int(1), rt.V.int(9)])]));
    print(rt.showArgs([rt.method(fr, "find", [rt.V.int(1), rt.V.int((-1))])]));
    print(rt.showArgs([rt.method(fr, "rfind", [rt.V.int(1)])]));
    print(rt.showArgs([rt.method(fr, "rfind", [rt.V.int(1), rt.V.int(0)])]));
    print(rt.showArgs([rt.method(fr, "rfind", [rt.V.int(1), rt.V.int(1)])]));
    print(rt.showArgs([rt.method(fr, "rfind", [rt.V.int(1), rt.V.int((-2))])]));
    print(rt.showArgs([rt.method(fr, "rfind", [rt.V.int(1), rt.V.int((-4))])]));
    print(rt.showArgs([rt.method(fr, "rfind", [rt.V.int(1), rt.V.int((-9))])]));
    print(rt.showArgs([rt.method(fr, "rfind", [rt.V.int(9)])]));
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
const __gd_entry = new Main();
try {
  await __gd_entry.run();
} catch (__gd_e) {
  rt.reportRunFailure(__gd_e);
}
