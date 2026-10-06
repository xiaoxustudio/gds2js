// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../packages/runtime/src/runtime/index";
import { print, printJoined, printRaw, printErr, printVerbose, printRich, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
  nest(n: rt.Variant): rt.Variant {
    n = rt.paramSlot(n, "int", 1, "nest", this);
    let c = rt.V.array(rt.GArray.of([]));
    for (let i of rt.rangeSeq([n])) {
      let x = rt.V.array(rt.GArray.of([]));
      rt.method(x, "append", [c]);
      c = x;
    }
    return c;
  }
  
    override _initialize(): Promise<void> { return this.__gd__initialize(); }
  async __gd__initialize(): Promise<void> {
    let a = rt.V.array(rt.GArray.of([]));
    rt.method(a, "append", [a]);
    let d = rt.dictOf([]);
    {
      const _nv = rt.writeIdx(d, a, rt.V.int(1));
      if (_nv !== null) d = _nv;
    }
    print(rt.showArgs([rt.V.str("k1a "), rt.method(d, "size", []), rt.V.str(" "), rt.method(d, "has", [a]), rt.V.str(" "), rt.wrapValue(rt.index(d, a)), rt.V.str(" "), rt.method(d, "get", [a])]));
    let b = rt.V.array(rt.GArray.of([]));
    rt.method(b, "append", [b]);
    print(rt.showArgs([rt.V.str("k1b "), rt.method(d, "has", [b]), rt.V.str(" "), rt.wrapValue(rt.index(d, b)), rt.V.str(" "), rt.ops.eq(b, a)]));
    {
      const _nv = rt.writeIdx(d, b, rt.V.int(2));
      if (_nv !== null) d = _nv;
    }
    print(rt.showArgs([rt.V.str("k1c "), rt.method(d, "size", []), rt.V.str(" "), rt.wrapValue(rt.index(d, a)), rt.V.str(" "), rt.wrapValue(rt.index(d, b))]));
    print(rt.showArgs([rt.V.str("k1d "), rt.method(rt.strBuiltin([rt.method(d, "keys", [])]), "length", [])]));
    print(rt.showArgs([rt.V.str("k1e "), rt.method(rt.strBuiltin([d]), "length", [])]));
    rt.method(d, "erase", [a]);
    print(rt.showArgs([rt.V.str("k1f "), rt.method(d, "size", []), rt.V.str(" "), rt.method(d, "has", [b])]));
    let p = rt.V.array(rt.GArray.of([]));
    let q = rt.V.array(rt.GArray.of([p]));
    rt.method(p, "append", [q]);
    let r = rt.V.array(rt.GArray.of([]));
    let s = rt.V.array(rt.GArray.of([r]));
    rt.method(r, "append", [s]);
    let d2 = rt.dictOf([]);
    {
      const _nv = rt.writeIdx(d2, p, rt.V.int(1));
      if (_nv !== null) d2 = _nv;
    }
    print(rt.showArgs([rt.V.str("k2a "), rt.ops.eq(p, r), rt.V.str(" "), rt.method(d2, "has", [r]), rt.V.str(" "), rt.wrapValue(rt.index(d2, r)), rt.V.str(" "), rt.method(d2, "size", [])]));
    print(rt.showArgs([rt.V.str("k2b "), rt.method(d2, "has", [rt.V.array(rt.GArray.of([p]))]), rt.V.str(" "), rt.method(d2, "has", [rt.V.array(rt.GArray.of([rt.V.array(rt.GArray.of([p]))]))])]));
    let e = rt.V.array(rt.GArray.of([]));
    let f = rt.V.array(rt.GArray.of([]));
    rt.method(f, "append", [e]);
    print(rt.showArgs([rt.V.str("k2c "), rt.ops.eq(e, f)]));
    let d3 = rt.dictOf([]);
    {
      const _nv = rt.writeIdx(d3, e, rt.V.int(1));
      if (_nv !== null) d3 = _nv;
    }
    {
      const _nv = rt.writeIdx(d3, f, rt.V.int(2));
      if (_nv !== null) d3 = _nv;
    }
    print(rt.showArgs([rt.V.str("k2d "), rt.method(d3, "size", []), rt.V.str(" "), rt.wrapValue(rt.index(d3, e)), rt.V.str(" "), rt.wrapValue(rt.index(d3, f)), rt.V.str(" "), d3]));
    let d4 = rt.dictOf([]);
    {
      const _nv = rt.writeIdx(d4, this.nest(rt.V.int(101)), rt.V.int(1));
      if (_nv !== null) d4 = _nv;
    }
    print(rt.showArgs([rt.V.str("k3a "), rt.method(d4, "has", [this.nest(rt.V.int(102))]), rt.V.str(" "), rt.wrapValue(rt.index(d4, this.nest(rt.V.int(102)))), rt.V.str(" "), rt.ops.eq(this.nest(rt.V.int(101)), this.nest(rt.V.int(102)))]));
    {
      const _nv = rt.writeIdx(d4, this.nest(rt.V.int(102)), rt.V.int(2));
      if (_nv !== null) d4 = _nv;
    }
    print(rt.showArgs([rt.V.str("k3b "), rt.method(d4, "size", []), rt.V.str(" "), rt.wrapValue(rt.index(d4, this.nest(rt.V.int(101))))]));
    print(rt.showArgs([rt.V.str("k3c "), rt.method(d4, "has", [this.nest(rt.V.int(3))]), rt.V.str(" "), rt.ops.eq(this.nest(rt.V.int(3)), this.nest(rt.V.int(4)))]));
    print(rt.showArgs([rt.V.str("k3d "), rt.ops.eq(a, this.nest(rt.V.int(101))), rt.V.str(" "), rt.ops.eq(a, this.nest(rt.V.int(100)))]));
    let d5 = rt.dictOf([]);
    {
      const _nv = rt.writeIdx(d5, a, rt.V.int(7));
      if (_nv !== null) d5 = _nv;
    }
    {
      const _nv = rt.writeIdx(d5, this.nest(rt.V.int(101)), rt.V.int(8));
      if (_nv !== null) d5 = _nv;
    }
    print(rt.showArgs([rt.V.str("k3e "), rt.method(d5, "size", []), rt.V.str(" "), rt.wrapValue(rt.index(d5, a)), rt.V.str(" "), rt.wrapValue(rt.index(d5, this.nest(rt.V.int(101))))]));
    let ca = rt.dictOf([]);
    {
      const _nv = rt.writeIdx(ca, rt.V.str("k"), ca);
      if (_nv !== null) ca = _nv;
    }
    let cb = rt.dictOf([]);
    {
      const _nv = rt.writeIdx(cb, rt.V.str("k"), cb);
      if (_nv !== null) cb = _nv;
    }
    print(rt.showArgs([rt.V.str("k4a "), rt.ops.eq(ca, cb)]));
    let d6 = rt.dictOf([]);
    {
      const _nv = rt.writeIdx(d6, ca, rt.V.int(1));
      if (_nv !== null) d6 = _nv;
    }
    {
      const _nv = rt.writeIdx(d6, cb, rt.V.int(2));
      if (_nv !== null) d6 = _nv;
    }
    print(rt.showArgs([rt.V.str("k4b "), rt.method(d6, "size", []), rt.V.str(" "), rt.wrapValue(rt.index(d6, ca)), rt.V.str(" "), rt.wrapValue(rt.index(d6, cb)), rt.V.str(" "), rt.method(rt.strBuiltin([d6]), "length", [])]));
    let md = rt.dictOf([]);
    let mx = rt.V.array(rt.GArray.of([]));
    rt.method(mx, "append", [md]);
    {
      const _nv = rt.writeIdx(md, rt.V.str("a"), mx);
      if (_nv !== null) md = _nv;
    }
    let d7 = rt.dictOf([]);
    {
      const _nv = rt.writeIdx(d7, mx, rt.V.int(1));
      if (_nv !== null) d7 = _nv;
    }
    print(rt.showArgs([rt.V.str("k4c "), rt.method(d7, "has", [mx]), rt.V.str(" "), rt.wrapValue(rt.index(d7, mx)), rt.V.str(" "), rt.method(d7, "size", [])]));
    let arr = rt.V.array(rt.GArray.of([ca, mx]));
    print(rt.showArgs([rt.V.str("k4d "), rt.method(arr, "has", [ca]), rt.V.str(" "), rt.method(arr, "count", [cb]), rt.V.str(" "), rt.method(arr, "has", [md])]));
    let ghost = rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2)]));
    let d8 = rt.dictOf([]);
    {
      const _nv = rt.writeIdx(d8, ghost, rt.V.int(5));
      if (_nv !== null) d8 = _nv;
    }
    rt.method(ghost, "append", [rt.V.int(3)]);
    print(rt.showArgs([rt.V.str("k4e "), rt.method(d8, "size", []), rt.V.str(" "), rt.method(d8, "has", [ghost]), rt.V.str(" "), rt.method(d8, "has", [rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2)]))]), rt.V.str(" "), d8]));
    print(rt.showArgs([rt.V.str("k5a "), rt.ops.eq(a, this.nest(rt.V.int(51))), rt.V.str(" "), rt.ops.eq(a, this.nest(rt.V.int(52))), rt.V.str(" "), rt.ops.eq(this.nest(rt.V.int(51)), this.nest(rt.V.int(52))), rt.V.str(" "), rt.ops.eq(this.nest(rt.V.int(52)), this.nest(rt.V.int(53))), rt.V.str(" "), rt.ops.eq(this.nest(rt.V.int(52)), this.nest(rt.V.int(54)))]));
    print(rt.showArgs([rt.V.str("k5b "), rt.method(rt.strBuiltin([this.nest(rt.V.int(51))]), "length", []), rt.V.str(" "), rt.method(rt.strBuiltin([this.nest(rt.V.int(101))]), "length", []), rt.V.str(" "), rt.method(rt.strBuiltin([this.nest(rt.V.int(102))]), "length", [])]));
    let d9 = rt.dictOf([]);
    {
      const _nv = rt.writeIdx(d9, this.nest(rt.V.int(100)), rt.V.int(1));
      if (_nv !== null) d9 = _nv;
    }
    print(rt.showArgs([rt.V.str("k5c "), rt.method(d9, "has", [this.nest(rt.V.int(101))]), rt.V.str(" "), rt.method(d9, "size", []), rt.V.str(" "), rt.method(d9, "has", [this.nest(rt.V.int(40))]), rt.V.str(" "), rt.ops.eq(this.nest(rt.V.int(100)), this.nest(rt.V.int(101)))]));
    let da = rt.dictOf([]);
    {
      const _nv = rt.writeIdx(da, this.nest(rt.V.int(101)), rt.V.int(1));
      if (_nv !== null) da = _nv;
    }
    print(rt.showArgs([rt.V.str("k5d "), rt.method(da, "has", [this.nest(rt.V.int(102))]), rt.V.str(" "), rt.method(da, "size", []), rt.V.str(" "), rt.wrapValue(rt.index(da, this.nest(rt.V.int(102))))]));
    let db = rt.dictOf([]);
    let g1 = rt.V.array(rt.GArray.of([]));
    rt.method(g1, "append", [g1]);
    let g2 = rt.V.array(rt.GArray.of([]));
    rt.method(g2, "append", [rt.V.array(rt.GArray.of([g2]))]);
    {
      const _nv = rt.writeIdx(db, g1, rt.V.int(1));
      if (_nv !== null) db = _nv;
    }
    print(rt.showArgs([rt.V.str("k5e "), rt.method(db, "has", [g2]), rt.V.str(" "), rt.ops.eq(g1, g2), rt.V.str(" "), rt.method(db, "size", [])]));
    this.quit();
  }
  
  override __gdDispatch(name: string, args: rt.Variant[]): rt.Variant | null {
    switch (name) {
      case "nest": return rt.wrapValue(this.nest(args[0] as rt.Variant));
      case "_initialize": return rt.wrapValue(this.__gd__initialize());
      default: return super.__gdDispatch(name, args);
    }
  }

}

const __gd_d_Main = rt.defineClass(Main, () => new Main(), (o) => o instanceof Main);
rt.registerMethodArities(__gd_d_Main, { "nest": [1, 1], "_initialize": [0, 0] });
rt.registerNativeBase(__gd_d_Main, "SceneTree");
rt.registerScriptLabel(__gd_d_Main, "main.gd");
rt.registerScript("res://main.gd", __gd_d_Main);
const __gd_entry = new Main();
try {
  await __gd_entry.run();
} catch (__gd_e) {
  rt.reportRunFailure(__gd_e);
}
