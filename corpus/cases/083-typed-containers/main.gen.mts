// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../packages/runtime/src/runtime/index";
import { print, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
  member = rt.stampArray(rt.V.array(rt.GArray.of([rt.V.int(7)])), "int", true);

    override _initialize(): Promise<void> { return this.__gd__initialize(); }
  async __gd__initialize(): Promise<void> {
    let a = rt.stampArray(rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.float(2.5), rt.V.float((-1.9)), rt.V.bool(true)])), "int", true);
    print(rt.showArgs([a]));
    rt.method(a, "append", [rt.V.int(3)]);
    rt.method(a, "append", [rt.V.float(4.9)]);
    rt.method(a, "append", [rt.V.str("s")]);
    rt.method(a, "append", [rt.V.nil()]);
    print(rt.showArgs([a]));
    print(rt.showArgs([rt.method(a, "pop_front", [])]));
    print(rt.showArgs([rt.method(a, "pop_back", [])]));
    print(rt.showArgs([a]));
    print(rt.showArgs([rt.method(a, "count", [rt.V.int(1)])]));
    print(rt.showArgs([rt.method(a, "find", [rt.V.float(1)])]));
    print(rt.showArgs([rt.method(a, "has", [rt.V.float(1)])]));
    print(rt.showArgs([rt.method(a, "rfind", [rt.V.int(1)])]));
    rt.method(a, "insert", [rt.V.int(0), rt.V.float(2.2)]);
    print(rt.showArgs([a]));
    rt.method(a, "insert", [rt.V.int(0), rt.V.str("x")]);
    print(rt.showArgs([a]));
    let alias = a;
    {
      const _nv = rt.writeIdx(alias, rt.V.int(0), rt.V.float(9.8));
      if (_nv !== null) alias = _nv;
    }
    print(rt.showArgs([a]));
    {
      const _nv = rt.writeIdx(alias, rt.V.int(0), rt.V.str("no"));
      if (_nv !== null) alias = _nv;
    }
    print(rt.showArgs([a]));
    rt.method(a, "resize", [rt.V.int(6)]);
    print(rt.showArgs([a]));
    rt.method(a, "resize", [rt.V.int(2)]);
    print(rt.showArgs([a]));
    rt.method(a, "fill", [rt.V.float(5.7)]);
    print(rt.showArgs([a]));
    print(rt.showArgs([rt.method(rt.method(a, "duplicate", [rt.V.bool(true)]), "pop_back", [])]));
    print(rt.showArgs([a]));
    print(rt.showArgs([rt.method(rt.method(a, "slice", [rt.V.int(0), rt.V.int(2)]), "pop_back", [])]));
    print(rt.showArgs([a]));
    let f = rt.stampArray(rt.V.array(rt.GArray.of([])), "float", true);
    rt.method(f, "append", [rt.V.int(1)]);
    rt.method(f, "append", [rt.V.bool(true)]);
    rt.method(f, "append", [rt.V.float(2.5)]);
    print(rt.showArgs([f]));
    let s = rt.stampArray(rt.V.array(rt.GArray.of([rt.V.str("a"), rt.V.stringName("b")])), "String", true);
    print(rt.showArgs([s]));
    rt.method(s, "append", [rt.V.int(3)]);
    print(rt.showArgs([s]));
    let nm = rt.stampArray(rt.V.array(rt.GArray.of([])), "StringName", true);
    rt.method(nm, "append", [rt.V.str("x")]);
    rt.method(nm, "resize", [rt.V.int(3)]);
    print(rt.showArgs([nm]));
    let b = rt.stampArray(rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(1)])), "bool", true);
    print(rt.showArgs([b]));
    rt.method(b, "append", [rt.V.str("t")]);
    rt.method(b, "append", [rt.V.float(2.5)]);
    print(rt.showArgs([b]));
    let v = rt.stampArray(rt.V.array(rt.GArray.of([])), "Vector2", true);
    rt.method(v, "resize", [rt.V.int(2)]);
    print(rt.showArgs([v]));
    rt.method(v, "append", [rt.V.int(1)]);
    print(rt.showArgs([v]));
    let na = rt.stampArray(rt.V.array(rt.GArray.of([])), "Array", true);
    rt.method(na, "resize", [rt.V.int(2)]);
    print(rt.showArgs([na]));
    let nd = rt.stampArray(rt.V.array(rt.GArray.of([])), "Dictionary", true);
    rt.method(nd, "resize", [rt.V.int(1)]);
    print(rt.showArgs([nd]));
    let filtered = rt.method(a, "filter", [rt.callable((__a: rt.Variant[]) => {
      const x = __a[0] as rt.Variant;
      return rt.V.bool(true);
    }, 1)]);
    rt.method(filtered, "append", [rt.V.str("s")]);
    print(rt.showArgs([filtered]));
    let mapped = rt.method(a, "map", [rt.callable((__a: rt.Variant[]) => {
      const x = __a[0] as rt.Variant;
      return x;
    }, 1)]);
    rt.method(mapped, "append", [rt.V.str("s")]);
    print(rt.showArgs([mapped]));
    let joined = rt.ops.add(a, rt.V.array(rt.GArray.of([rt.V.int(1)])));
    rt.method(joined, "append", [rt.V.str("s")]);
    print(rt.showArgs([joined]));
    rt.method(a, "assign", [rt.V.array(rt.GArray.of([rt.V.float(2.5), rt.V.float(3.5)]))]);
    print(rt.showArgs([a]));
    rt.method(a, "assign", [rt.V.array(rt.GArray.of([rt.V.int(4), rt.V.str("s")]))]);
    print(rt.showArgs([a]));
    rt.method(a, "append_array", [rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.str("s")]))]);
    print(rt.showArgs([a]));
    rt.method(a, "append_array", [rt.V.array(rt.GArray.of([rt.V.float(6.5), rt.V.float(7.5)]))]);
    print(rt.showArgs([a]));
    rt.method(this.member, "append", [rt.V.float(2.5)]);
    print(rt.showArgs([this.member]));
    let u = rt.V.array(rt.GArray.of([rt.V.int(1)]));
    rt.method(u, "resize", [rt.V.int(3)]);
    rt.method(u, "append", [rt.V.str("s")]);
    print(rt.showArgs([u]));
    let d = rt.stampDict(rt.dictOf([[rt.V.str("a"), rt.V.float(1.9)]]), "String", "int", true);
    print(rt.showArgs([d]));
    {
      const _nv = rt.writeIdx(d, rt.V.str("b"), rt.V.float(2.7));
      if (_nv !== null) d = _nv;
    }
    print(rt.showArgs([d]));
    let dalias = d;
    {
      const _nv = rt.writeIdx(dalias, rt.V.str("c"), rt.V.float(3.5));
      if (_nv !== null) dalias = _nv;
    }
    print(rt.showArgs([d]));
    print(rt.showArgs([rt.method(d, "keys", [])]));
    print(rt.showArgs([rt.method(d, "values", [])]));
    let dc = rt.method(d, "duplicate", []);
    {
      const _nv = rt.writeIdx(dc, rt.V.str("z"), rt.V.float(4.5));
      if (_nv !== null) dc = _nv;
    }
    print(rt.showArgs([dc]));
    print(rt.showArgs([d]));
    let ds = rt.stampDict(rt.dictOf([]), "String", "String", true);
    {
      const _nv = rt.writeIdx(ds, rt.V.str("k"), rt.V.stringName("v"));
      if (_nv !== null) ds = _nv;
    }
    print(rt.showArgs([ds]));
    let dv = rt.stampDict(rt.dictOf([]), "int", "Array", true);
    {
      const _nv = rt.writeIdx(dv, rt.V.int(1), rt.V.array(rt.GArray.of([rt.V.int(2)])));
      if (_nv !== null) dv = _nv;
    }
    print(rt.showArgs([dv]));
    let q = rt.stampArray(rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2)])), "int", true);
    print(rt.showArgs([rt.method(q, "has", [rt.V.float(1)])]));
    print(rt.showArgs([rt.method(q, "count", [rt.V.float(1)])]));
    print(rt.showArgs([rt.method(q, "find", [rt.V.float(1)])]));
    print(rt.showArgs([rt.method(q, "rfind", [rt.V.float(1)])]));
    rt.method(q, "erase", [rt.V.float(2.5)]);
    print(rt.showArgs([q]));
    let qs = rt.stampArray(rt.V.array(rt.GArray.of([rt.V.str("x")])), "String", true);
    print(rt.showArgs([rt.method(qs, "has", [rt.V.stringName("x")])]));
    print(rt.showArgs([rt.method(qs, "find", [rt.V.stringName("x")])]));
    let qb = rt.stampArray(rt.V.array(rt.GArray.of([rt.V.int(1)])), "int", true);
    print(rt.showArgs([rt.method(qb, "has", [rt.V.bool(true)])]));
    print(rt.showArgs([rt.method(qb, "count", [rt.V.bool(true)])]));
    let dq = rt.stampDict(rt.dictOf([[rt.V.str("a"), rt.V.int(1)]]), "String", "int", true);
    print(rt.showArgs([rt.method(dq, "has", [rt.V.stringName("a")])]));
    print(rt.showArgs([rt.method(dq, "get", [rt.V.int(1)])]));
    print(rt.showArgs([rt.method(dq, "find_key", [rt.V.float(1)])]));
    rt.method(dq, "erase", [rt.V.str("a")]);
    print(rt.showArgs([dq]));
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
