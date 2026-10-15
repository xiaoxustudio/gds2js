// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../packages/runtime/src/runtime/index";
import { print, printJoined, printRaw, printErr, printVerbose, printRich, printDebug, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
    override _initialize(): Promise<void> { return this.__gd__initialize(); }
  async __gd__initialize(): Promise<void> {
    let a = rt.dictOf([[rt.V.str("a"), rt.V.int(1)]]);
    print(rt.showArgs([rt.V.str("merged 并新键 → "), rt.method(a, "merged", [rt.dictOf([[rt.V.str("b"), rt.V.int(2)]])]), rt.V.str(" | 接收者 "), a]));
    print(rt.showArgs([rt.V.str("merged 同键不覆盖 → "), rt.method(a, "merged", [rt.dictOf([[rt.V.str("a"), rt.V.int(2)]])])]));
    print(rt.showArgs([rt.V.str("merged 同键覆盖 → "), rt.method(a, "merged", [rt.dictOf([[rt.V.str("a"), rt.V.int(2)]]), rt.V.bool(true)])]));
    print(rt.showArgs([rt.V.str("merged 的键序 → "), rt.method(rt.dictOf([[rt.V.str("b"), rt.V.int(1)]]), "merged", [rt.dictOf([[rt.V.str("a"), rt.V.int(2)], [rt.V.str("c"), rt.V.int(3)]])])]));
    print(rt.showArgs([rt.V.str("merged 不深挖 → "), rt.method(rt.dictOf([[rt.V.str("k"), rt.dictOf([[rt.V.str("x"), rt.V.int(1)]])]]), "merged", [rt.dictOf([[rt.V.str("k"), rt.dictOf([[rt.V.str("y"), rt.V.int(2)]])]]), rt.V.bool(true)])]));
    let base = rt.dictOf([[rt.V.str("x"), rt.V.int(1)]]);
    let copy = rt.method(base, "merged", [rt.dictOf([])]);
    {
      const _nv = rt.writeIdx(copy, rt.V.str("y"), rt.V.int(2));
      if (_nv !== null) copy = _nv;
    }
    print(rt.showArgs([rt.V.str("merged 给的是新字典 → "), base, rt.V.str(" | "), copy]));
    let inner = rt.dictOf([[rt.V.str("n"), rt.V.int(1)]]);
    let shallow = rt.method(rt.dictOf([[rt.V.str("k"), inner]]), "merged", [rt.dictOf([])]);
    {
    const _w0 = rt.V.str("k");
      const _nv = rt.writeIdx(rt.index(shallow, _w0), rt.V.str("n"), rt.V.int(9));
      if (_nv !== null) rt.setIndex(shallow, _w0, _nv);
    }
    print(rt.showArgs([rt.V.str("merged 的值是浅拷 → "), inner]));
    let g = rt.dictOf([[rt.V.str("k"), rt.V.int(1)]]);
    print(rt.showArgs([rt.V.str("get_or_add 键已在 → "), rt.method(g, "get_or_add", [rt.V.str("k"), rt.V.int(9)]), rt.V.str(" | "), g]));
    print(rt.showArgs([rt.V.str("get_or_add 键不在 → "), rt.method(g, "get_or_add", [rt.V.str("j"), rt.V.int(9)]), rt.V.str(" | "), g]));
    print(rt.showArgs([rt.V.str("get_or_add 单实参落 null → "), rt.method(g, "get_or_add", [rt.V.str("z")]), rt.V.str(" | "), g]));
    let ord = rt.dictOf([[rt.V.str("k"), rt.V.int(1)], [rt.V.str("m"), rt.V.int(2)]]);
    rt.method(ord, "get_or_add", [rt.V.str("j"), rt.V.int(9)]);
    print(rt.showArgs([rt.V.str("get_or_add 键序 → "), rt.method(ord, "keys", [])]));
    let shared = rt.dictOf([]);
    let inner2 = rt.dictOf([[rt.V.str("x"), rt.V.int(1)]]);
    let got = rt.method(shared, "get_or_add", [rt.V.str("k"), inner2]);
    {
      const _nv = rt.writeIdx(got, rt.V.str("y"), rt.V.int(2));
      if (_nv !== null) got = _nv;
    }
    print(rt.showArgs([rt.V.str("get_or_add 装的是同一份 → "), shared, rt.V.str(" | "), inner2]));
    print(rt.showArgs([rt.V.str("recursive_equal 相等 → "), rt.method(rt.dictOf([[rt.V.str("a"), rt.V.int(1)]]), "recursive_equal", [rt.dictOf([[rt.V.str("a"), rt.V.int(1)]]), rt.V.int(0)])]));
    print(rt.showArgs([rt.V.str("recursive_equal 计数不影响 → "), rt.method(rt.dictOf([[rt.V.str("a"), rt.V.int(1)]]), "recursive_equal", [rt.dictOf([[rt.V.str("a"), rt.V.int(1)]]), rt.V.int(99)]), rt.V.str(" | "), rt.method(rt.dictOf([[rt.V.str("a"), rt.V.int(1)]]), "recursive_equal", [rt.dictOf([[rt.V.str("a"), rt.V.int(1)]]), rt.V.int((-1))])]));
    print(rt.showArgs([rt.V.str("recursive_equal 嵌套 → "), rt.method(rt.dictOf([[rt.V.str("a"), rt.dictOf([[rt.V.str("b"), rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2)]))]])]]), "recursive_equal", [rt.dictOf([[rt.V.str("a"), rt.dictOf([[rt.V.str("b"), rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2)]))]])]]), rt.V.int(0)])]));
    print(rt.showArgs([rt.V.str("recursive_equal 键序 → "), rt.method(rt.dictOf([[rt.V.str("a"), rt.V.int(1)], [rt.V.str("b"), rt.V.int(2)]]), "recursive_equal", [rt.dictOf([[rt.V.str("b"), rt.V.int(2)], [rt.V.str("a"), rt.V.int(1)]]), rt.V.int(0)])]));
    print(rt.showArgs([rt.V.str("recursive_equal 不等 → "), rt.method(rt.dictOf([[rt.V.str("a"), rt.V.int(1)]]), "recursive_equal", [rt.dictOf([[rt.V.str("a"), rt.V.int(2)]]), rt.V.int(0)])]));
    print(rt.showArgs([rt.V.str("recursive_equal 深层不等 → "), rt.method(rt.dictOf([[rt.V.str("a"), rt.dictOf([[rt.V.str("b"), rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2)]))]])]]), "recursive_equal", [rt.dictOf([[rt.V.str("a"), rt.dictOf([[rt.V.str("b"), rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(3)]))]])]]), rt.V.int(0)])]));
    print(rt.showArgs([rt.V.str("recursive_equal 与 == 同口径 → "), rt.ops.eq(rt.dictOf([[rt.V.str("a"), rt.dictOf([[rt.V.str("b"), rt.V.int(1)]])]]), rt.dictOf([[rt.V.str("a"), rt.dictOf([[rt.V.str("b"), rt.V.int(1)]])]]))]));
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
rt.registerDictIdentity(__gd_d_Main, "res://main.gd", "", [], {}, (o) => { const s = o as Main; return []; });
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
