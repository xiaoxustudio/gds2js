// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../packages/runtime/src/runtime/index";
import { print, printJoined, printRaw, printErr, printVerbose, printRich, printDebug, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
  declare td: rt.Variant;

  __gd_fields__() {
    const __gd_frame = rt.frameEnter("res://main.gd", "@implicit_new");
    try {
      rt.frameLine(3);
      this.td = rt.stampDict(rt.dictOf([]), "Array", "int", true);
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
      rt.frameLine(6);
      let d = rt.dictOf([]);
      rt.frameLine(7);
      let a = rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2)]));
      rt.frameLine(8);
      {
        const _nv = rt.writeIdx(d, a, rt.V.int(5));
        if (_nv !== null) d = _nv;
      }
      rt.frameLine(9);
      print(rt.showArgs([d]));
      rt.frameLine(10);
      print(rt.showArgs([rt.method(d, "has", [a]), rt.V.str(" "), rt.method(d, "has", [rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2)]))]), rt.V.str(" "), rt.wrapValue(rt.index(d, rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2)])))), rt.V.str(" "), rt.method(d, "get", [rt.V.array(rt.GArray.of([rt.V.float(1), rt.V.float(2)])), rt.V.str("M")])]));
      rt.frameLine(11);
      {
        const _nv = rt.writeIdx(d, rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2)])), rt.V.int(6));
        if (_nv !== null) d = _nv;
      }
      rt.frameLine(12);
      print(rt.showArgs([d, rt.V.str(" size="), rt.method(d, "size", [])]));
      rt.frameLine(13);
      let e = rt.dictOf([[rt.V.str("x"), rt.V.int(1)]]);
      rt.frameLine(14);
      {
        const _nv = rt.writeIdx(d, e, rt.V.int(7));
        if (_nv !== null) d = _nv;
      }
      rt.frameLine(15);
      print(rt.showArgs([d, rt.V.str(" "), rt.method(d, "get", [rt.dictOf([[rt.V.str("x"), rt.V.int(1)]]), rt.V.str("M")]), rt.V.str(" "), rt.method(d, "get", [rt.dictOf([[rt.V.str("x"), rt.V.float(1)]]), rt.V.str("M")])]));
      rt.frameLine(16);
      print(rt.showArgs([rt.method(d, "keys", []), rt.V.str(" size="), rt.method(d, "size", [])]));
      rt.frameLine(17);
      let od = rt.dictOf([]);
      rt.frameLine(18);
      {
        const _nv = rt.writeIdx(od, rt.dictOf([[rt.V.str("a"), rt.V.int(1)], [rt.V.str("b"), rt.V.int(2)]]), rt.V.int(9));
        if (_nv !== null) od = _nv;
      }
      rt.frameLine(19);
      print(rt.showArgs([rt.method(od, "get", [rt.dictOf([[rt.V.str("b"), rt.V.int(2)], [rt.V.str("a"), rt.V.int(1)]]), rt.V.str("M")]), rt.V.str(" "), rt.method(od, "get", [rt.dictOf([[rt.V.str("a"), rt.V.int(1)], [rt.V.str("b"), rt.V.int(2)]]), rt.V.str("M")])]));
      rt.frameLine(20);
      let m = rt.V.array(rt.GArray.of([rt.V.int(1)]));
      rt.frameLine(21);
      {
        const _nv = rt.writeIdx(d, m, rt.V.int(8));
        if (_nv !== null) d = _nv;
      }
      rt.frameLine(22);
      rt.method(m, "append", [rt.V.int(2)]);
      rt.frameLine(23);
      print(rt.showArgs([rt.method(d, "size", []), rt.V.str(" "), rt.method(d, "has", [rt.V.array(rt.GArray.of([rt.V.int(1)]))]), rt.V.str(" "), rt.method(d, "has", [m]), rt.V.str(" "), d]));
      rt.frameLine(24);
      let c1 = rt.V.array(rt.GArray.of([rt.V.int(7), rt.V.int(8)]));
      rt.frameLine(25);
      let d2 = rt.dictOf([]);
      rt.frameLine(26);
      {
        const _nv = rt.writeIdx(d2, c1, rt.V.int(1));
        if (_nv !== null) d2 = _nv;
      }
      rt.frameLine(27);
      rt.method(c1, "append", [rt.V.int(9)]);
      rt.frameLine(28);
      {
        const _nv = rt.writeIdx(d2, rt.V.array(rt.GArray.of([rt.V.int(7), rt.V.int(8)])), rt.V.int(2));
        if (_nv !== null) d2 = _nv;
      }
      rt.frameLine(29);
      print(rt.showArgs([d2, rt.V.str(" size="), rt.method(d2, "size", []), rt.V.str(" "), rt.method(d2, "get", [rt.V.array(rt.GArray.of([rt.V.int(7), rt.V.int(8)])), rt.V.str("M")]), rt.V.str(" "), rt.method(d2, "get", [c1, rt.V.str("M")])]));
      rt.frameLine(30);
      print(rt.showArgs([rt.method(d2, "erase", [rt.V.array(rt.GArray.of([rt.V.int(7), rt.V.int(8)]))]), rt.V.str(" "), rt.method(d2, "erase", [c1]), rt.V.str(" size="), rt.method(d2, "size", [])]));
      rt.frameLine(31);
      let k3 = rt.V.array(rt.GArray.of([rt.V.int(1)]));
      rt.frameLine(32);
      let d3 = rt.dictOf([]);
      rt.frameLine(33);
      {
        const _nv = rt.writeIdx(d3, k3, rt.V.int(1));
        if (_nv !== null) d3 = _nv;
      }
      rt.frameLine(34);
      print(rt.showArgs([rt.method(d3, "erase", [rt.V.array(rt.GArray.of([rt.V.int(1)]))]), rt.V.str(" "), rt.method(d3, "erase", [rt.V.array(rt.GArray.of([rt.V.int(1)]))]), rt.V.str(" size="), rt.method(d3, "size", [])]));
      rt.frameLine(35);
      let sh = rt.dictOf([]);
      rt.frameLine(36);
      let kk = rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2)]));
      rt.frameLine(37);
      {
        const _nv = rt.writeIdx(sh, kk, rt.V.int(1));
        if (_nv !== null) sh = _nv;
      }
      rt.frameLine(38);
      let cp = rt.method(sh, "duplicate", []);
      rt.frameLine(39);
      rt.method(kk, "append", [rt.V.int(3)]);
      rt.frameLine(40);
      print(rt.showArgs([rt.method(cp, "get", [rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2)])), rt.V.str("M")]), rt.V.str(" "), rt.method(cp, "get", [rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2), rt.V.int(3)])), rt.V.str("M")]), rt.V.str(" "), cp]));
      rt.frameLine(41);
      let dp = rt.method(sh, "duplicate", [rt.V.bool(true)]);
      rt.frameLine(42);
      print(rt.showArgs([rt.method(dp, "get", [rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2), rt.V.int(3)])), rt.V.str("M")]), rt.V.str(" "), rt.method(dp, "get", [rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2)])), rt.V.str("M")]), rt.V.str(" "), dp]));
      rt.frameLine(43);
      let v = rt.vector2New([rt.V.int(1), rt.V.int(2)]);
      rt.frameLine(44);
      let d4 = rt.dictOf([[rt.vector2New([rt.V.int(1), rt.V.int(2)]), rt.V.int(1)]]);
      rt.frameLine(45);
      {
        const _nv = rt.writeIdx(d4, v, rt.V.int(2));
        if (_nv !== null) d4 = _nv;
      }
      rt.frameLine(46);
      print(rt.showArgs([d4, rt.V.str(" size="), rt.method(d4, "size", []), rt.V.str(" "), rt.method(d4, "has", [rt.vector2New([rt.V.float(1), rt.V.float(2)])])]));
      rt.frameLine(47);
      {
        const _nv = rt.writeProp(v, "x", rt.V.int(9));
        if (_nv !== null) v = _nv;
      }
      rt.frameLine(48);
      print(rt.showArgs([rt.method(d4, "has", [v]), rt.V.str(" "), rt.method(d4, "get", [rt.vector2New([rt.V.int(1), rt.V.int(2)]), rt.V.str("M")])]));
      rt.frameLine(49);
      let ta = rt.stampArray(rt.V.array(rt.GArray.of([rt.vector2New([rt.V.int(1), rt.V.int(2)])])), "Vector2", true);
      rt.frameLine(50);
      let d5 = rt.dictOf([]);
      rt.frameLine(51);
      {
        const _nv = rt.writeIdx(d5, ta, rt.V.int(3));
        if (_nv !== null) d5 = _nv;
      }
      rt.frameLine(52);
      print(rt.showArgs([d5, rt.V.str(" "), rt.method(d5, "get", [rt.V.array(rt.GArray.of([rt.vector2New([rt.V.int(1), rt.V.int(2)])])), rt.V.str("M")])]));
      rt.frameLine(53);
      {
        const _nv = rt.writeIdx(this.td, rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2)])), rt.V.int(5));
        if (_nv !== null) this.td = _nv;
      }
      rt.frameLine(54);
      print(rt.showArgs([this.td, rt.V.str(" "), rt.method(this.td, "get", [rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2)])), rt.V.str("M")]), rt.V.str(" "), rt.method(this.td, "get", [rt.V.array(rt.GArray.of([rt.V.float(1), rt.V.float(2)])), rt.V.str("M")])]));
      rt.frameLine(55);
      let d6 = rt.dictOf([]);
      rt.frameLine(56);
      {
        const _nv = rt.writeIdx(d6, rt.V.array(rt.GArray.of([])), rt.V.int(1));
        if (_nv !== null) d6 = _nv;
      }
      rt.frameLine(57);
      {
        const _nv = rt.writeIdx(d6, rt.dictOf([]), rt.V.int(2));
        if (_nv !== null) d6 = _nv;
      }
      rt.frameLine(58);
      print(rt.showArgs([d6, rt.V.str(" "), rt.method(d6, "get", [rt.V.array(rt.GArray.of([])), rt.V.str("M")]), rt.V.str(" "), rt.method(d6, "get", [rt.dictOf([]), rt.V.str("M")])]));
      rt.frameLine(59);
      let d7 = rt.dictOf([]);
      rt.frameLine(60);
      {
        const _nv = rt.writeIdx(d7, rt.V.array(rt.GArray.of([rt.V.int(1)])), rt.V.int(1));
        if (_nv !== null) d7 = _nv;
      }
      rt.frameLine(61);
      print(rt.showArgs([rt.method(d7, "get", [rt.V.array(rt.GArray.of([rt.V.int(1)])), rt.V.str("M")]), rt.V.str(" "), rt.method(d7, "get", [rt.V.array(rt.GArray.of([rt.V.float(1)])), rt.V.str("M")]), rt.V.str(" "), rt.method(d7, "get", [rt.V.array(rt.GArray.of([rt.V.bool(true)])), rt.V.str("M")]), rt.V.str(" "), rt.method(d7, "get", [rt.V.array(rt.GArray.of([rt.V.int(0)])), rt.V.str("M")])]));
      rt.frameLine(62);
      let inner = rt.V.array(rt.GArray.of([rt.V.int(1)]));
      rt.frameLine(63);
      let d8 = rt.dictOf([]);
      rt.frameLine(64);
      {
        const _nv = rt.writeIdx(d8, rt.V.array(rt.GArray.of([inner])), rt.V.int(8));
        if (_nv !== null) d8 = _nv;
      }
      rt.frameLine(65);
      rt.method(inner, "append", [rt.V.int(2)]);
      rt.frameLine(66);
      print(rt.showArgs([rt.method(d8, "get", [rt.V.array(rt.GArray.of([rt.V.array(rt.GArray.of([rt.V.int(1)]))])), rt.V.str("M")]), rt.V.str(" "), d8, rt.V.str(" "), rt.method(d8, "values", [])]));
      rt.frameLine(67);
      let d9 = rt.dictOf([]);
      rt.frameLine(68);
      {
        const _nv = rt.writeIdx(d9, rt.V.array(rt.GArray.of([rt.V.int(1)])), rt.V.str("one"));
        if (_nv !== null) d9 = _nv;
      }
      rt.frameLine(69);
      {
        const _nv = rt.writeIdx(d9, rt.V.str("s"), rt.V.str("two"));
        if (_nv !== null) d9 = _nv;
      }
      rt.frameLine(70);
      for (let key of rt.iter(d9)) {
        rt.frameLine(71);
        print(rt.showArgs([key, rt.V.str(" -> "), rt.wrapValue(rt.index(d9, key))]));
      }
      rt.frameLine(72);
      let da = rt.dictOf([[rt.V.str("z"), rt.dictOf([])]]);
      rt.frameLine(73);
      let db = rt.dictOf([]);
      rt.frameLine(74);
      {
        const _nv = rt.writeIdx(db, da, rt.V.int(1));
        if (_nv !== null) db = _nv;
      }
      rt.frameLine(75);
      {
      const _w0 = rt.V.str("z");
        const _nv = rt.writeIdx(rt.index(da, _w0), rt.V.str("y"), rt.V.int(1));
        if (_nv !== null) rt.setIndex(da, _w0, _nv);
      }
      rt.frameLine(76);
      print(rt.showArgs([rt.method(db, "get", [rt.dictOf([[rt.V.str("z"), rt.dictOf([])]]), rt.V.str("M")]), rt.V.str(" "), rt.method(db, "get", [rt.dictOf([[rt.V.str("z"), rt.dictOf([[rt.V.str("y"), rt.V.int(1)]])]]), rt.V.str("M")]), rt.V.str(" "), db]));
      rt.frameLine(77);
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
rt.registerScriptProps(__gd_d_Main, ["td"], (o) => { const s = o as Main; return [s.td]; });
rt.registerDictIdentity(__gd_d_Main, "res://main.gd", "", ["td"], {}, (o) => { const s = o as Main; return [s.td]; });
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
