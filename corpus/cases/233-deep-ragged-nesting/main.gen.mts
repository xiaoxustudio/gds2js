// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../packages/runtime/src/runtime/index";
import { print, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
    override _initialize(): Promise<void> { return this.__gd__initialize(); }
  async __gd__initialize(): Promise<void> {
    let d3 = rt.V.array(rt.GArray.of([rt.V.array(rt.GArray.of([rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2)])), rt.V.array(rt.GArray.of([rt.V.int(3)]))])), rt.V.array(rt.GArray.of([rt.V.array(rt.GArray.of([rt.V.int(4)])), rt.V.array(rt.GArray.of([rt.V.int(5), rt.V.int(6)]))]))]));
    print(rt.showArgs([rt.ops.add(rt.V.str("3d-print\t"), rt.strBuiltin([d3]))]));
    print(rt.showArgs([rt.ops.add(rt.ops.add(rt.ops.add(rt.ops.add(rt.ops.add(rt.V.str("3d-size\t"), rt.strBuiltin([rt.method(d3, "size", [])])), rt.V.str(" ")), rt.strBuiltin([rt.method(rt.wrapValue(rt.index(d3, rt.V.int(0))), "size", [])])), rt.V.str(" ")), rt.strBuiltin([rt.method(rt.wrapValue(rt.index(rt.wrapValue(rt.index(d3, rt.V.int(0))), rt.V.int(0))), "size", [])]))]));
    let ragged = rt.V.array(rt.GArray.of([rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2), rt.V.int(3)])), rt.V.array(rt.GArray.of([rt.V.int(4)])), rt.V.array(rt.GArray.of([rt.V.int(5), rt.V.int(6)]))]));
    print(rt.showArgs([rt.ops.add(rt.V.str("ragged-print\t"), rt.strBuiltin([ragged]))]));
    print(rt.showArgs([rt.ops.add(rt.ops.add(rt.ops.add(rt.V.str("ragged-eq\t"), rt.strBuiltin([rt.ops.eq(ragged, rt.V.array(rt.GArray.of([rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2), rt.V.int(3)])), rt.V.array(rt.GArray.of([rt.V.int(4)])), rt.V.array(rt.GArray.of([rt.V.int(5), rt.V.int(6)]))])))])), rt.V.str(" ")), rt.strBuiltin([rt.ops.eq(ragged, rt.V.array(rt.GArray.of([rt.V.array(rt.GArray.of([rt.V.int(1)])), rt.V.array(rt.GArray.of([rt.V.int(2)]))])))]))]));
    print(rt.showArgs([rt.ops.add(rt.V.str("deep-eq\t"), rt.strBuiltin([rt.ops.eq(d3, rt.V.array(rt.GArray.of([rt.V.array(rt.GArray.of([rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2)])), rt.V.array(rt.GArray.of([rt.V.int(3)]))])), rt.V.array(rt.GArray.of([rt.V.array(rt.GArray.of([rt.V.int(4)])), rt.V.array(rt.GArray.of([rt.V.int(5), rt.V.int(6)]))]))])))]))]));
    let a = rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.array(rt.GArray.of([rt.V.int(2), rt.V.array(rt.GArray.of([rt.V.int(3), rt.V.array(rt.GArray.of([rt.V.int(4), rt.V.array(rt.GArray.of([rt.V.int(5)]))]))]))]))]));
    print(rt.showArgs([rt.ops.add(rt.V.str("nested-str\t"), rt.strBuiltin([a]))]));
    print(rt.showArgs([rt.ops.add(rt.V.str("nested-idx\t"), rt.strBuiltin([rt.wrapValue(rt.index(rt.wrapValue(rt.index(rt.wrapValue(rt.index(rt.wrapValue(rt.index(a, rt.V.int(1))), rt.V.int(1))), rt.V.int(1))), rt.V.int(1)))]))]));
    let cyc = rt.V.array(rt.GArray.of([]));
    rt.method(cyc, "append", [cyc]);
    print(rt.showArgs([rt.ops.add(rt.V.str("self-cyc-size\t"), rt.strBuiltin([rt.method(cyc, "size", [])]))]));
    let m = rt.dictOf([[rt.V.str("a"), rt.dictOf([[rt.V.str("b"), rt.dictOf([[rt.V.str("c"), rt.V.array(rt.GArray.of([rt.V.int(1), rt.dictOf([[rt.V.str("d"), rt.V.int(2)]])]))]])]])]]);
    print(rt.showArgs([rt.ops.add(rt.V.str("dict-in\t"), rt.strBuiltin([m]))]));
    print(rt.showArgs([rt.ops.add(rt.V.str("dict-in-eq\t"), rt.strBuiltin([rt.ops.eq(m, rt.dictOf([[rt.V.str("a"), rt.dictOf([[rt.V.str("b"), rt.dictOf([[rt.V.str("c"), rt.V.array(rt.GArray.of([rt.V.int(1), rt.dictOf([[rt.V.str("d"), rt.V.int(2)]])]))]])]])]]))]))]));
    let dup = rt.method(a, "duplicate", [rt.V.bool(true)]);
    {
    const _w0 = rt.V.int(1);
    const _w1 = rt.V.int(1);
    const _w2 = rt.V.int(1);
      const _nv = rt.writeIdx(rt.index(rt.index(rt.index(dup, _w0), _w1), _w2), rt.V.int(1), rt.V.int(99));
      if (_nv !== null) rt.setIndex(rt.index(rt.index(dup, _w0), _w1), _w2, _nv);
    }
    print(rt.showArgs([rt.ops.add(rt.ops.add(rt.ops.add(rt.V.str("dup-deep\t"), rt.strBuiltin([rt.wrapValue(rt.index(rt.wrapValue(rt.index(rt.wrapValue(rt.index(rt.wrapValue(rt.index(a, rt.V.int(1))), rt.V.int(1))), rt.V.int(1))), rt.V.int(1)))])), rt.V.str(" ")), rt.strBuiltin([rt.wrapValue(rt.index(rt.wrapValue(rt.index(rt.wrapValue(rt.index(rt.wrapValue(rt.index(dup, rt.V.int(1))), rt.V.int(1))), rt.V.int(1))), rt.V.int(1)))]))]));
    let shallow = rt.method(a, "duplicate", [rt.V.bool(false)]);
    {
    const _w0 = rt.V.int(1);
    const _w1 = rt.V.int(1);
    const _w2 = rt.V.int(1);
      const _nv = rt.writeIdx(rt.index(rt.index(rt.index(shallow, _w0), _w1), _w2), rt.V.int(1), rt.V.int(77));
      if (_nv !== null) rt.setIndex(rt.index(rt.index(shallow, _w0), _w1), _w2, _nv);
    }
    print(rt.showArgs([rt.ops.add(rt.V.str("dup-shallow\t"), rt.strBuiltin([rt.wrapValue(rt.index(rt.wrapValue(rt.index(rt.wrapValue(rt.index(rt.wrapValue(rt.index(a, rt.V.int(1))), rt.V.int(1))), rt.V.int(1))), rt.V.int(1)))]))]));
    let t = rt.stampArray(rt.V.array(rt.GArray.of([rt.V.array(rt.GArray.of([rt.V.int(1)])), rt.V.array(rt.GArray.of([rt.V.int(2), rt.V.int(3)]))])), "Array", true);
    print(rt.showArgs([rt.ops.add(rt.ops.add(rt.ops.add(rt.ops.add(rt.ops.add(rt.V.str("typed-nested\t"), rt.strBuiltin([t])), rt.V.str(" ")), rt.strBuiltin([rt.method(t, "size", [])])), rt.V.str(" ")), rt.strBuiltin([rt.method(rt.wrapValue(rt.index(t, rt.V.int(1))), "size", [])]))]));
    let pack = rt.V.array(rt.GArray.of([rt.packCtor("int32", [rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2)]))]), rt.packCtor("int32", [])]));
    print(rt.showArgs([rt.ops.add(rt.ops.add(rt.ops.add(rt.V.str("typed-pack\t"), rt.strBuiltin([pack])), rt.V.str(" ")), rt.strBuiltin([rt.method(rt.wrapValue(rt.index(pack, rt.V.int(1))), "size", [])]))]));
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
