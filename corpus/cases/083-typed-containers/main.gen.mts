// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../src/runtime/index";
import { print, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
  member = rt.stampArray(rt.V.array(rt.GArray.of([rt.V.int(7)])), "int", true);

  async _initialize(): Promise<void> {
    let a = rt.stampArray(rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.float(2.5), rt.V.float((-1.9)), rt.V.bool(true)])), "int", true);
    print(rt.show(a));
    rt.method(a, "append", [rt.V.int(3)]);
    rt.method(a, "append", [rt.V.float(4.9)]);
    rt.method(a, "append", [rt.V.str("s")]);
    rt.method(a, "append", [rt.V.nil()]);
    print(rt.show(a));
    print(rt.show(rt.method(a, "pop_front", [])));
    print(rt.show(rt.method(a, "pop_back", [])));
    print(rt.show(a));
    print(rt.show(rt.method(a, "count", [rt.V.int(1)])));
    print(rt.show(rt.method(a, "find", [rt.V.float(1)])));
    print(rt.show(rt.method(a, "has", [rt.V.float(1)])));
    print(rt.show(rt.method(a, "rfind", [rt.V.int(1)])));
    rt.method(a, "insert", [rt.V.int(0), rt.V.float(2.2)]);
    print(rt.show(a));
    rt.method(a, "insert", [rt.V.int(0), rt.V.str("x")]);
    print(rt.show(a));
    let alias = a;
    {
      const _nv = rt.writeIdx(alias, rt.V.int(0), rt.V.float(9.8));
      if (_nv !== null) alias = _nv;
    }
    print(rt.show(a));
    {
      const _nv = rt.writeIdx(alias, rt.V.int(0), rt.V.str("no"));
      if (_nv !== null) alias = _nv;
    }
    print(rt.show(a));
    rt.method(a, "resize", [rt.V.int(6)]);
    print(rt.show(a));
    rt.method(a, "resize", [rt.V.int(2)]);
    print(rt.show(a));
    rt.method(a, "fill", [rt.V.float(5.7)]);
    print(rt.show(a));
    print(rt.show(rt.method(rt.method(a, "duplicate", [rt.V.bool(true)]), "pop_back", [])));
    print(rt.show(a));
    print(rt.show(rt.method(rt.method(a, "slice", [rt.V.int(0), rt.V.int(2)]), "pop_back", [])));
    print(rt.show(a));
    let f = rt.stampArray(rt.V.array(rt.GArray.of([])), "float", true);
    rt.method(f, "append", [rt.V.int(1)]);
    rt.method(f, "append", [rt.V.bool(true)]);
    rt.method(f, "append", [rt.V.float(2.5)]);
    print(rt.show(f));
    let s = rt.stampArray(rt.V.array(rt.GArray.of([rt.V.str("a"), rt.V.stringName("b")])), "String", true);
    print(rt.show(s));
    rt.method(s, "append", [rt.V.int(3)]);
    print(rt.show(s));
    let nm = rt.stampArray(rt.V.array(rt.GArray.of([])), "StringName", true);
    rt.method(nm, "append", [rt.V.str("x")]);
    rt.method(nm, "resize", [rt.V.int(3)]);
    print(rt.show(nm));
    let b = rt.stampArray(rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(1)])), "bool", true);
    print(rt.show(b));
    rt.method(b, "append", [rt.V.str("t")]);
    rt.method(b, "append", [rt.V.float(2.5)]);
    print(rt.show(b));
    let v = rt.stampArray(rt.V.array(rt.GArray.of([])), "Vector2", true);
    rt.method(v, "resize", [rt.V.int(2)]);
    print(rt.show(v));
    rt.method(v, "append", [rt.V.int(1)]);
    print(rt.show(v));
    let na = rt.stampArray(rt.V.array(rt.GArray.of([])), "Array", true);
    rt.method(na, "resize", [rt.V.int(2)]);
    print(rt.show(na));
    let nd = rt.stampArray(rt.V.array(rt.GArray.of([])), "Dictionary", true);
    rt.method(nd, "resize", [rt.V.int(1)]);
    print(rt.show(nd));
    let filtered = rt.method(a, "filter", [rt.callable((x) => {
      return rt.V.bool(true);
    })]);
    rt.method(filtered, "append", [rt.V.str("s")]);
    print(rt.show(filtered));
    let mapped = rt.method(a, "map", [rt.callable((x) => {
      return x;
    })]);
    rt.method(mapped, "append", [rt.V.str("s")]);
    print(rt.show(mapped));
    let joined = rt.ops.add(a, rt.V.array(rt.GArray.of([rt.V.int(1)])));
    rt.method(joined, "append", [rt.V.str("s")]);
    print(rt.show(joined));
    rt.method(a, "assign", [rt.V.array(rt.GArray.of([rt.V.float(2.5), rt.V.float(3.5)]))]);
    print(rt.show(a));
    rt.method(a, "assign", [rt.V.array(rt.GArray.of([rt.V.int(4), rt.V.str("s")]))]);
    print(rt.show(a));
    rt.method(a, "append_array", [rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.str("s")]))]);
    print(rt.show(a));
    rt.method(a, "append_array", [rt.V.array(rt.GArray.of([rt.V.float(6.5), rt.V.float(7.5)]))]);
    print(rt.show(a));
    rt.method(this.member, "append", [rt.V.float(2.5)]);
    print(rt.show(this.member));
    let u = rt.V.array(rt.GArray.of([rt.V.int(1)]));
    rt.method(u, "resize", [rt.V.int(3)]);
    rt.method(u, "append", [rt.V.str("s")]);
    print(rt.show(u));
    let d = rt.stampDict(rt.dictOf([[rt.V.str("a"), rt.V.float(1.9)]]), "String", "int", true);
    print(rt.show(d));
    {
      const _nv = rt.writeIdx(d, rt.V.str("b"), rt.V.float(2.7));
      if (_nv !== null) d = _nv;
    }
    print(rt.show(d));
    let dalias = d;
    {
      const _nv = rt.writeIdx(dalias, rt.V.str("c"), rt.V.float(3.5));
      if (_nv !== null) dalias = _nv;
    }
    print(rt.show(d));
    print(rt.show(rt.method(d, "keys", [])));
    print(rt.show(rt.method(d, "values", [])));
    let dc = rt.method(d, "duplicate", []);
    {
      const _nv = rt.writeIdx(dc, rt.V.str("z"), rt.V.float(4.5));
      if (_nv !== null) dc = _nv;
    }
    print(rt.show(dc));
    print(rt.show(d));
    let ds = rt.stampDict(rt.dictOf([]), "String", "String", true);
    {
      const _nv = rt.writeIdx(ds, rt.V.str("k"), rt.V.stringName("v"));
      if (_nv !== null) ds = _nv;
    }
    print(rt.show(ds));
    let dv = rt.stampDict(rt.dictOf([]), "int", "Array", true);
    {
      const _nv = rt.writeIdx(dv, rt.V.int(1), rt.V.array(rt.GArray.of([rt.V.int(2)])));
      if (_nv !== null) dv = _nv;
    }
    print(rt.show(dv));
    let q = rt.stampArray(rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2)])), "int", true);
    print(rt.show(rt.method(q, "has", [rt.V.float(1)])));
    print(rt.show(rt.method(q, "count", [rt.V.float(1)])));
    print(rt.show(rt.method(q, "find", [rt.V.float(1)])));
    print(rt.show(rt.method(q, "rfind", [rt.V.float(1)])));
    rt.method(q, "erase", [rt.V.float(2.5)]);
    print(rt.show(q));
    let qs = rt.stampArray(rt.V.array(rt.GArray.of([rt.V.str("x")])), "String", true);
    print(rt.show(rt.method(qs, "has", [rt.V.stringName("x")])));
    print(rt.show(rt.method(qs, "find", [rt.V.stringName("x")])));
    let qb = rt.stampArray(rt.V.array(rt.GArray.of([rt.V.int(1)])), "int", true);
    print(rt.show(rt.method(qb, "has", [rt.V.bool(true)])));
    print(rt.show(rt.method(qb, "count", [rt.V.bool(true)])));
    let dq = rt.stampDict(rt.dictOf([[rt.V.str("a"), rt.V.int(1)]]), "String", "int", true);
    print(rt.show(rt.method(dq, "has", [rt.V.stringName("a")])));
    print(rt.show(rt.method(dq, "get", [rt.V.int(1)])));
    print(rt.show(rt.method(dq, "find_key", [rt.V.float(1)])));
    rt.method(dq, "erase", [rt.V.str("a")]);
    print(rt.show(dq));
    this.quit();
  }
  
}

await new Main().run();
