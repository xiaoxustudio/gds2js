// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../packages/runtime/src/runtime/index";
import { print, printJoined, printRaw, printErr, printVerbose, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
    override _initialize(): Promise<void> { return this.__gd__initialize(); }
  async __gd__initialize(): Promise<void> {
    let d = rt.dictOf([[rt.V.str("a"), rt.V.int(1)], [rt.V.str("b"), rt.V.int(2)]]);
    print(rt.showArgs([rt.method(d, "erase", [rt.V.str("a")])]));
    print(rt.showArgs([d]));
    print(rt.showArgs([rt.method(d, "erase", [rt.V.str("zz")])]));
    print(rt.showArgs([d]));
    print(rt.showArgs([rt.method(d, "has", [rt.V.str("b")])]));
    let c = rt.dictOf([[rt.V.int(1), rt.V.int(2)]]);
    rt.method(c, "clear", []);
    print(rt.showArgs([c]));
    print(rt.showArgs([rt.method(c, "size", [])]));
    print(rt.showArgs([rt.method(c, "is_empty", [])]));
    print(rt.showArgs([rt.method(rt.dictOf([[rt.V.int(1), rt.V.int(2)]]), "is_empty", [])]));
    let m = rt.dictOf([[rt.V.str("a"), rt.V.int(1)]]);
    rt.method(m, "merge", [rt.dictOf([[rt.V.str("a"), rt.V.int(9)], [rt.V.str("b"), rt.V.int(2)]])]);
    print(rt.showArgs([m]));
    rt.method(m, "merge", [rt.dictOf([[rt.V.str("a"), rt.V.int(9)]]), rt.V.bool(false)]);
    print(rt.showArgs([m]));
    rt.method(m, "merge", [rt.dictOf([[rt.V.str("a"), rt.V.int(9)]]), rt.V.bool(true)]);
    print(rt.showArgs([m]));
    rt.method(m, "merge", [rt.dictOf([])]);
    print(rt.showArgs([m]));
    let ha = rt.dictOf([[rt.V.str("a"), rt.V.int(1)], [rt.V.str("b"), rt.V.int(2)]]);
    print(rt.showArgs([rt.method(ha, "has_all", [rt.V.array(rt.GArray.of([rt.V.str("a"), rt.V.str("b")]))])]));
    print(rt.showArgs([rt.method(ha, "has_all", [rt.V.array(rt.GArray.of([rt.V.str("a"), rt.V.str("z")]))])]));
    print(rt.showArgs([rt.method(ha, "has_all", [rt.V.array(rt.GArray.of([]))])]));
    print(rt.showArgs([rt.method(rt.dictOf([]), "has_all", [rt.V.array(rt.GArray.of([]))])]));
    let fk = rt.dictOf([[rt.V.str("a"), rt.V.int(1)], [rt.V.str("b"), rt.V.int(2)]]);
    print(rt.showArgs([rt.method(fk, "find_key", [rt.V.int(2)])]));
    print(rt.showArgs([rt.method(fk, "find_key", [rt.V.int(1)])]));
    print(rt.showArgs([rt.method(fk, "find_key", [rt.V.int(99)])]));
    print(rt.showArgs([rt.method(fk, "get", [rt.V.str("a")])]));
    print(rt.showArgs([rt.method(fk, "get", [rt.V.str("zz")])]));
    print(rt.showArgs([rt.method(fk, "get", [rt.V.str("zz"), rt.V.int(7)])]));
    print(rt.showArgs([rt.wrapValue(rt.index(fk, rt.V.stringName("a")))]));
    print(rt.showArgs([rt.method(fk, "has", [rt.V.stringName("a")])]));
    let dd = rt.dictOf([[rt.V.str("k"), rt.V.array(rt.GArray.of([rt.V.int(1)]))]]);
    let ds = rt.method(dd, "duplicate", []);
    {
    const _w0 = rt.V.str("k");
      const _nv = rt.writeIdx(rt.index(ds, _w0), rt.V.int(0), rt.V.int(9));
      if (_nv !== null) rt.setIndex(ds, _w0, _nv);
    }
    print(rt.showArgs([dd]));
    let deep = rt.method(dd, "duplicate", [rt.V.bool(true)]);
    {
    const _w0 = rt.V.str("k");
      const _nv = rt.writeIdx(rt.index(deep, _w0), rt.V.int(0), rt.V.int(5));
      if (_nv !== null) rt.setIndex(deep, _w0, _nv);
    }
    print(rt.showArgs([dd]));
    print(rt.showArgs([deep]));
    let eo = rt.dictOf([]);
    let es = rt.method(eo, "duplicate", []);
    {
      const _nv = rt.writeIdx(es, rt.V.str("k"), rt.V.int(1));
      if (_nv !== null) es = _nv;
    }
    print(rt.showArgs([eo]));
    print(rt.showArgs([es]));
    let order = rt.dictOf([]);
    {
      const _nv = rt.writeIdx(order, rt.V.str("b"), rt.V.int(1));
      if (_nv !== null) order = _nv;
    }
    {
      const _nv = rt.writeIdx(order, rt.V.str("a"), rt.V.int(2));
      if (_nv !== null) order = _nv;
    }
    {
      const _nv = rt.writeIdx(order, rt.V.str("b"), rt.V.int(3));
      if (_nv !== null) order = _nv;
    }
    print(rt.showArgs([rt.method(order, "keys", [])]));
    print(rt.showArgs([rt.method(order, "values", [])]));
    rt.method(order, "erase", [rt.V.str("b")]);
    {
      const _nv = rt.writeIdx(order, rt.V.str("b"), rt.V.int(4));
      if (_nv !== null) order = _nv;
    }
    print(rt.showArgs([rt.method(order, "keys", [])]));
    let asg = rt.dictOf([[rt.V.str("x"), rt.V.int(1)]]);
    let src = rt.dictOf([[rt.V.str("y"), rt.V.int(2)]]);
    rt.method(asg, "assign", [src]);
    {
      const _nv = rt.writeIdx(src, rt.V.str("y"), rt.V.int(9));
      if (_nv !== null) src = _nv;
    }
    print(rt.showArgs([asg]));
    let eq1 = rt.dictOf([[rt.V.str("x"), rt.V.int(1)], [rt.V.str("y"), rt.V.int(2)]]);
    let eq2 = rt.dictOf([[rt.V.str("y"), rt.V.int(2)], [rt.V.str("x"), rt.V.int(1)]]);
    print(rt.showArgs([rt.ops.eq(eq1, eq2)]));
    print(rt.showArgs([rt.ops.neq(eq1, eq2)]));
    print(rt.showArgs([rt.ops.eq(eq1, rt.dictOf([[rt.V.str("x"), rt.V.int(1)]]))]));
    let nest = rt.dictOf([[rt.V.str("l"), rt.V.array(rt.GArray.of([rt.V.int(1), rt.dictOf([[rt.V.str("n"), rt.V.int(2)]])]))]]);
    print(rt.showArgs([nest]));
    print(rt.showArgs([rt.ops.eq(rt.method(nest, "duplicate", [rt.V.bool(true)]), nest)]));
    print(rt.showArgs([rt.ops.eq(rt.wrapValue(rt.index(rt.method(nest, "duplicate", [rt.V.bool(true)]), rt.V.str("l"))), rt.wrapValue(rt.index(nest, rt.V.str("l"))))]));
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
