// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../packages/runtime/src/runtime/index";
import { print, printJoined, printRaw, printErr, printVerbose, printRich, printDebug, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
  __gd_fields__() {
    const __gd_frame = rt.frameEnter("res://main.gd", "@implicit_new");
    try {
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return;
    } finally {
      rt.frameExit(__gd_frame);
    }
  }

  constructor() {
    super();
    this.__gd_fields__();
  }

    override _initialize(): Promise<void> { return this.__gd__initialize(); }
  async __gd__initialize(): Promise<void> {
    const __gd_frame = rt.frameEnter("res://main.gd", "_initialize");
    try {
      rt.frameLine(5);
      let a = rt.dictOf([[rt.V.str("a"), rt.V.int(1)]]);
      rt.frameLine(6);
      print(rt.showArgs([rt.V.str("merged 并新键 → "), rt.method(a, "merged", [rt.dictOf([[rt.V.str("b"), rt.V.int(2)]])]), rt.V.str(" | 接收者 "), a]));
      rt.frameLine(7);
      print(rt.showArgs([rt.V.str("merged 同键不覆盖 → "), rt.method(a, "merged", [rt.dictOf([[rt.V.str("a"), rt.V.int(2)]])])]));
      rt.frameLine(8);
      print(rt.showArgs([rt.V.str("merged 同键覆盖 → "), rt.method(a, "merged", [rt.dictOf([[rt.V.str("a"), rt.V.int(2)]]), rt.V.bool(true)])]));
      rt.frameLine(9);
      print(rt.showArgs([rt.V.str("merged 的键序 → "), rt.method(rt.dictOf([[rt.V.str("b"), rt.V.int(1)]]), "merged", [rt.dictOf([[rt.V.str("a"), rt.V.int(2)], [rt.V.str("c"), rt.V.int(3)]])])]));
      rt.frameLine(10);
      print(rt.showArgs([rt.V.str("merged 不深挖 → "), rt.method(rt.dictOf([[rt.V.str("k"), rt.dictOf([[rt.V.str("x"), rt.V.int(1)]])]]), "merged", [rt.dictOf([[rt.V.str("k"), rt.dictOf([[rt.V.str("y"), rt.V.int(2)]])]]), rt.V.bool(true)])]));
      rt.frameLine(11);
      let base = rt.dictOf([[rt.V.str("x"), rt.V.int(1)]]);
      rt.frameLine(12);
      let copy = rt.method(base, "merged", [rt.dictOf([])]);
      rt.frameLine(13);
      {
        const _nv = rt.writeIdx(copy, rt.V.str("y"), rt.V.int(2));
        if (_nv !== null) copy = _nv;
      }
      rt.frameLine(14);
      print(rt.showArgs([rt.V.str("merged 给的是新字典 → "), base, rt.V.str(" | "), copy]));
      rt.frameLine(15);
      let inner = rt.dictOf([[rt.V.str("n"), rt.V.int(1)]]);
      rt.frameLine(16);
      let shallow = rt.method(rt.dictOf([[rt.V.str("k"), inner]]), "merged", [rt.dictOf([])]);
      rt.frameLine(17);
      {
      const _w0 = rt.V.str("k");
        const _nv = rt.writeIdx(rt.index(shallow, _w0), rt.V.str("n"), rt.V.int(9));
        if (_nv !== null) rt.setIndex(shallow, _w0, _nv);
      }
      rt.frameLine(18);
      print(rt.showArgs([rt.V.str("merged 的值是浅拷 → "), inner]));
      rt.frameLine(19);
      let g = rt.dictOf([[rt.V.str("k"), rt.V.int(1)]]);
      rt.frameLine(20);
      print(rt.showArgs([rt.V.str("get_or_add 键已在 → "), rt.method(g, "get_or_add", [rt.V.str("k"), rt.V.int(9)]), rt.V.str(" | "), g]));
      rt.frameLine(21);
      print(rt.showArgs([rt.V.str("get_or_add 键不在 → "), rt.method(g, "get_or_add", [rt.V.str("j"), rt.V.int(9)]), rt.V.str(" | "), g]));
      rt.frameLine(22);
      print(rt.showArgs([rt.V.str("get_or_add 单实参落 null → "), rt.method(g, "get_or_add", [rt.V.str("z")]), rt.V.str(" | "), g]));
      rt.frameLine(23);
      let ord = rt.dictOf([[rt.V.str("k"), rt.V.int(1)], [rt.V.str("m"), rt.V.int(2)]]);
      rt.frameLine(24);
      rt.method(ord, "get_or_add", [rt.V.str("j"), rt.V.int(9)]);
      rt.frameLine(25);
      print(rt.showArgs([rt.V.str("get_or_add 键序 → "), rt.method(ord, "keys", [])]));
      rt.frameLine(26);
      let shared = rt.dictOf([]);
      rt.frameLine(27);
      let inner2 = rt.dictOf([[rt.V.str("x"), rt.V.int(1)]]);
      rt.frameLine(28);
      let got = rt.method(shared, "get_or_add", [rt.V.str("k"), inner2]);
      rt.frameLine(29);
      {
        const _nv = rt.writeIdx(got, rt.V.str("y"), rt.V.int(2));
        if (_nv !== null) got = _nv;
      }
      rt.frameLine(30);
      print(rt.showArgs([rt.V.str("get_or_add 装的是同一份 → "), shared, rt.V.str(" | "), inner2]));
      rt.frameLine(31);
      print(rt.showArgs([rt.V.str("recursive_equal 相等 → "), rt.method(rt.dictOf([[rt.V.str("a"), rt.V.int(1)]]), "recursive_equal", [rt.dictOf([[rt.V.str("a"), rt.V.int(1)]]), rt.V.int(0)])]));
      rt.frameLine(32);
      print(rt.showArgs([rt.V.str("recursive_equal 计数不影响 → "), rt.method(rt.dictOf([[rt.V.str("a"), rt.V.int(1)]]), "recursive_equal", [rt.dictOf([[rt.V.str("a"), rt.V.int(1)]]), rt.V.int(99)]), rt.V.str(" | "), rt.method(rt.dictOf([[rt.V.str("a"), rt.V.int(1)]]), "recursive_equal", [rt.dictOf([[rt.V.str("a"), rt.V.int(1)]]), rt.V.int((-1))])]));
      rt.frameLine(33);
      print(rt.showArgs([rt.V.str("recursive_equal 嵌套 → "), rt.method(rt.dictOf([[rt.V.str("a"), rt.dictOf([[rt.V.str("b"), rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2)]))]])]]), "recursive_equal", [rt.dictOf([[rt.V.str("a"), rt.dictOf([[rt.V.str("b"), rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2)]))]])]]), rt.V.int(0)])]));
      rt.frameLine(34);
      print(rt.showArgs([rt.V.str("recursive_equal 键序 → "), rt.method(rt.dictOf([[rt.V.str("a"), rt.V.int(1)], [rt.V.str("b"), rt.V.int(2)]]), "recursive_equal", [rt.dictOf([[rt.V.str("b"), rt.V.int(2)], [rt.V.str("a"), rt.V.int(1)]]), rt.V.int(0)])]));
      rt.frameLine(35);
      print(rt.showArgs([rt.V.str("recursive_equal 不等 → "), rt.method(rt.dictOf([[rt.V.str("a"), rt.V.int(1)]]), "recursive_equal", [rt.dictOf([[rt.V.str("a"), rt.V.int(2)]]), rt.V.int(0)])]));
      rt.frameLine(36);
      print(rt.showArgs([rt.V.str("recursive_equal 深层不等 → "), rt.method(rt.dictOf([[rt.V.str("a"), rt.dictOf([[rt.V.str("b"), rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2)]))]])]]), "recursive_equal", [rt.dictOf([[rt.V.str("a"), rt.dictOf([[rt.V.str("b"), rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(3)]))]])]]), rt.V.int(0)])]));
      rt.frameLine(37);
      print(rt.showArgs([rt.V.str("recursive_equal 与 == 同口径 → "), rt.ops.eq(rt.dictOf([[rt.V.str("a"), rt.dictOf([[rt.V.str("b"), rt.V.int(1)]])]]), rt.dictOf([[rt.V.str("a"), rt.dictOf([[rt.V.str("b"), rt.V.int(1)]])]]))]));
      rt.frameLine(38);
      this.quit();
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return;
    } finally {
      rt.frameExit(__gd_frame);
    }
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
