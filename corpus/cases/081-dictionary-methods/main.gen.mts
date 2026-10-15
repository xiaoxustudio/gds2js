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
      rt.frameLine(4);
      let d = rt.dictOf([[rt.V.str("a"), rt.V.int(1)], [rt.V.str("b"), rt.V.int(2)]]);
      rt.frameLine(5);
      print(rt.showArgs([rt.method(d, "erase", [rt.V.str("a")])]));
      rt.frameLine(6);
      print(rt.showArgs([d]));
      rt.frameLine(7);
      print(rt.showArgs([rt.method(d, "erase", [rt.V.str("zz")])]));
      rt.frameLine(8);
      print(rt.showArgs([d]));
      rt.frameLine(9);
      print(rt.showArgs([rt.method(d, "has", [rt.V.str("b")])]));
      rt.frameLine(10);
      let c = rt.dictOf([[rt.V.int(1), rt.V.int(2)]]);
      rt.frameLine(11);
      rt.method(c, "clear", []);
      rt.frameLine(12);
      print(rt.showArgs([c]));
      rt.frameLine(13);
      print(rt.showArgs([rt.method(c, "size", [])]));
      rt.frameLine(14);
      print(rt.showArgs([rt.method(c, "is_empty", [])]));
      rt.frameLine(15);
      print(rt.showArgs([rt.method(rt.dictOf([[rt.V.int(1), rt.V.int(2)]]), "is_empty", [])]));
      rt.frameLine(16);
      let m = rt.dictOf([[rt.V.str("a"), rt.V.int(1)]]);
      rt.frameLine(17);
      rt.method(m, "merge", [rt.dictOf([[rt.V.str("a"), rt.V.int(9)], [rt.V.str("b"), rt.V.int(2)]])]);
      rt.frameLine(18);
      print(rt.showArgs([m]));
      rt.frameLine(19);
      rt.method(m, "merge", [rt.dictOf([[rt.V.str("a"), rt.V.int(9)]]), rt.V.bool(false)]);
      rt.frameLine(20);
      print(rt.showArgs([m]));
      rt.frameLine(21);
      rt.method(m, "merge", [rt.dictOf([[rt.V.str("a"), rt.V.int(9)]]), rt.V.bool(true)]);
      rt.frameLine(22);
      print(rt.showArgs([m]));
      rt.frameLine(23);
      rt.method(m, "merge", [rt.dictOf([])]);
      rt.frameLine(24);
      print(rt.showArgs([m]));
      rt.frameLine(25);
      let ha = rt.dictOf([[rt.V.str("a"), rt.V.int(1)], [rt.V.str("b"), rt.V.int(2)]]);
      rt.frameLine(26);
      print(rt.showArgs([rt.method(ha, "has_all", [rt.V.array(rt.GArray.of([rt.V.str("a"), rt.V.str("b")]))])]));
      rt.frameLine(27);
      print(rt.showArgs([rt.method(ha, "has_all", [rt.V.array(rt.GArray.of([rt.V.str("a"), rt.V.str("z")]))])]));
      rt.frameLine(28);
      print(rt.showArgs([rt.method(ha, "has_all", [rt.V.array(rt.GArray.of([]))])]));
      rt.frameLine(29);
      print(rt.showArgs([rt.method(rt.dictOf([]), "has_all", [rt.V.array(rt.GArray.of([]))])]));
      rt.frameLine(30);
      let fk = rt.dictOf([[rt.V.str("a"), rt.V.int(1)], [rt.V.str("b"), rt.V.int(2)]]);
      rt.frameLine(31);
      print(rt.showArgs([rt.method(fk, "find_key", [rt.V.int(2)])]));
      rt.frameLine(32);
      print(rt.showArgs([rt.method(fk, "find_key", [rt.V.int(1)])]));
      rt.frameLine(33);
      print(rt.showArgs([rt.method(fk, "find_key", [rt.V.int(99)])]));
      rt.frameLine(34);
      print(rt.showArgs([rt.method(fk, "get", [rt.V.str("a")])]));
      rt.frameLine(35);
      print(rt.showArgs([rt.method(fk, "get", [rt.V.str("zz")])]));
      rt.frameLine(36);
      print(rt.showArgs([rt.method(fk, "get", [rt.V.str("zz"), rt.V.int(7)])]));
      rt.frameLine(37);
      print(rt.showArgs([rt.wrapValue(rt.index(fk, rt.V.stringName("a")))]));
      rt.frameLine(38);
      print(rt.showArgs([rt.method(fk, "has", [rt.V.stringName("a")])]));
      rt.frameLine(39);
      let dd = rt.dictOf([[rt.V.str("k"), rt.V.array(rt.GArray.of([rt.V.int(1)]))]]);
      rt.frameLine(40);
      let ds = rt.method(dd, "duplicate", []);
      rt.frameLine(41);
      {
      const _w0 = rt.V.str("k");
        const _nv = rt.writeIdx(rt.index(ds, _w0), rt.V.int(0), rt.V.int(9));
        if (_nv !== null) rt.setIndex(ds, _w0, _nv);
      }
      rt.frameLine(42);
      print(rt.showArgs([dd]));
      rt.frameLine(43);
      let deep = rt.method(dd, "duplicate", [rt.V.bool(true)]);
      rt.frameLine(44);
      {
      const _w0 = rt.V.str("k");
        const _nv = rt.writeIdx(rt.index(deep, _w0), rt.V.int(0), rt.V.int(5));
        if (_nv !== null) rt.setIndex(deep, _w0, _nv);
      }
      rt.frameLine(45);
      print(rt.showArgs([dd]));
      rt.frameLine(46);
      print(rt.showArgs([deep]));
      rt.frameLine(47);
      let eo = rt.dictOf([]);
      rt.frameLine(48);
      let es = rt.method(eo, "duplicate", []);
      rt.frameLine(49);
      {
        const _nv = rt.writeIdx(es, rt.V.str("k"), rt.V.int(1));
        if (_nv !== null) es = _nv;
      }
      rt.frameLine(50);
      print(rt.showArgs([eo]));
      rt.frameLine(51);
      print(rt.showArgs([es]));
      rt.frameLine(52);
      let order = rt.dictOf([]);
      rt.frameLine(53);
      {
        const _nv = rt.writeIdx(order, rt.V.str("b"), rt.V.int(1));
        if (_nv !== null) order = _nv;
      }
      rt.frameLine(54);
      {
        const _nv = rt.writeIdx(order, rt.V.str("a"), rt.V.int(2));
        if (_nv !== null) order = _nv;
      }
      rt.frameLine(55);
      {
        const _nv = rt.writeIdx(order, rt.V.str("b"), rt.V.int(3));
        if (_nv !== null) order = _nv;
      }
      rt.frameLine(56);
      print(rt.showArgs([rt.method(order, "keys", [])]));
      rt.frameLine(57);
      print(rt.showArgs([rt.method(order, "values", [])]));
      rt.frameLine(58);
      rt.method(order, "erase", [rt.V.str("b")]);
      rt.frameLine(59);
      {
        const _nv = rt.writeIdx(order, rt.V.str("b"), rt.V.int(4));
        if (_nv !== null) order = _nv;
      }
      rt.frameLine(60);
      print(rt.showArgs([rt.method(order, "keys", [])]));
      rt.frameLine(61);
      let asg = rt.dictOf([[rt.V.str("x"), rt.V.int(1)]]);
      rt.frameLine(62);
      let src = rt.dictOf([[rt.V.str("y"), rt.V.int(2)]]);
      rt.frameLine(63);
      rt.method(asg, "assign", [src]);
      rt.frameLine(64);
      {
        const _nv = rt.writeIdx(src, rt.V.str("y"), rt.V.int(9));
        if (_nv !== null) src = _nv;
      }
      rt.frameLine(65);
      print(rt.showArgs([asg]));
      rt.frameLine(66);
      let eq1 = rt.dictOf([[rt.V.str("x"), rt.V.int(1)], [rt.V.str("y"), rt.V.int(2)]]);
      rt.frameLine(67);
      let eq2 = rt.dictOf([[rt.V.str("y"), rt.V.int(2)], [rt.V.str("x"), rt.V.int(1)]]);
      rt.frameLine(68);
      print(rt.showArgs([rt.ops.eq(eq1, eq2)]));
      rt.frameLine(69);
      print(rt.showArgs([rt.ops.neq(eq1, eq2)]));
      rt.frameLine(70);
      print(rt.showArgs([rt.ops.eq(eq1, rt.dictOf([[rt.V.str("x"), rt.V.int(1)]]))]));
      rt.frameLine(71);
      let nest = rt.dictOf([[rt.V.str("l"), rt.V.array(rt.GArray.of([rt.V.int(1), rt.dictOf([[rt.V.str("n"), rt.V.int(2)]])]))]]);
      rt.frameLine(72);
      print(rt.showArgs([nest]));
      rt.frameLine(73);
      print(rt.showArgs([rt.ops.eq(rt.method(nest, "duplicate", [rt.V.bool(true)]), nest)]));
      rt.frameLine(74);
      print(rt.showArgs([rt.ops.eq(rt.wrapValue(rt.index(rt.method(nest, "duplicate", [rt.V.bool(true)]), rt.V.str("l"))), rt.wrapValue(rt.index(nest, rt.V.str("l"))))]));
      rt.frameLine(75);
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
