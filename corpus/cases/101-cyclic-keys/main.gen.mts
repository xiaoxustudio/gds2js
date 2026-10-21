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

  nest(n: rt.Variant): rt.Variant {
    const __gd_frame = rt.frameEnter("res://main.gd", "nest");
    try {
      n = rt.paramSlot(n, "int", 1, "nest", this);
      rt.frameLine(4);
      let c = rt.V.array(rt.GArray.of([]));
      rt.frameLine(5);
      for (let i of rt.rangeSeq([n])) {
        rt.frameLine(6);
        let x = rt.V.array(rt.GArray.of([]));
        rt.frameLine(7);
        rt.method(x, "append", [c]);
        rt.frameLine(8);
        c = x;
      }
      rt.frameLine(9);
      return c;
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return rt.V.nil();
    } finally {
      rt.frameExit(__gd_frame);
    }
  }
  
    override _initialize(): Promise<void> { return this.__gd__initialize(); }
  async __gd__initialize(): Promise<void> {
    const __gd_frame = rt.frameEnter("res://main.gd", "_initialize");
    try {
      rt.frameLine(12);
      let a = rt.V.array(rt.GArray.of([]));
      rt.frameLine(13);
      rt.method(a, "append", [a]);
      rt.frameLine(14);
      let d = rt.dictOf([]);
      rt.frameLine(15);
      {
        const _nv = rt.writeIdx(d, a, rt.V.int(1));
        if (_nv !== null) d = _nv;
      }
      rt.frameLine(16);
      print(rt.showArgs([rt.V.str("k1a "), rt.method(d, "size", []), rt.V.str(" "), rt.method(d, "has", [a]), rt.V.str(" "), rt.wrapValue(rt.index(d, a)), rt.V.str(" "), rt.method(d, "get", [a])]));
      rt.frameLine(17);
      let b = rt.V.array(rt.GArray.of([]));
      rt.frameLine(18);
      rt.method(b, "append", [b]);
      rt.frameLine(19);
      print(rt.showArgs([rt.V.str("k1b "), rt.method(d, "has", [b]), rt.V.str(" "), rt.wrapValue(rt.index(d, b)), rt.V.str(" "), rt.ops.eq(b, a)]));
      rt.frameLine(20);
      {
        const _nv = rt.writeIdx(d, b, rt.V.int(2));
        if (_nv !== null) d = _nv;
      }
      rt.frameLine(21);
      print(rt.showArgs([rt.V.str("k1c "), rt.method(d, "size", []), rt.V.str(" "), rt.wrapValue(rt.index(d, a)), rt.V.str(" "), rt.wrapValue(rt.index(d, b))]));
      rt.frameLine(22);
      print(rt.showArgs([rt.V.str("k1d "), rt.method(rt.strBuiltin([rt.method(d, "keys", [])]), "length", [])]));
      rt.frameLine(23);
      print(rt.showArgs([rt.V.str("k1e "), rt.method(rt.strBuiltin([d]), "length", [])]));
      rt.frameLine(24);
      rt.method(d, "erase", [a]);
      rt.frameLine(25);
      print(rt.showArgs([rt.V.str("k1f "), rt.method(d, "size", []), rt.V.str(" "), rt.method(d, "has", [b])]));
      rt.frameLine(26);
      let p = rt.V.array(rt.GArray.of([]));
      rt.frameLine(27);
      let q = rt.V.array(rt.GArray.of([p]));
      rt.frameLine(28);
      rt.method(p, "append", [q]);
      rt.frameLine(29);
      let r = rt.V.array(rt.GArray.of([]));
      rt.frameLine(30);
      let s = rt.V.array(rt.GArray.of([r]));
      rt.frameLine(31);
      rt.method(r, "append", [s]);
      rt.frameLine(32);
      let d2 = rt.dictOf([]);
      rt.frameLine(33);
      {
        const _nv = rt.writeIdx(d2, p, rt.V.int(1));
        if (_nv !== null) d2 = _nv;
      }
      rt.frameLine(34);
      print(rt.showArgs([rt.V.str("k2a "), rt.ops.eq(p, r), rt.V.str(" "), rt.method(d2, "has", [r]), rt.V.str(" "), rt.wrapValue(rt.index(d2, r)), rt.V.str(" "), rt.method(d2, "size", [])]));
      rt.frameLine(35);
      print(rt.showArgs([rt.V.str("k2b "), rt.method(d2, "has", [rt.V.array(rt.GArray.of([p]))]), rt.V.str(" "), rt.method(d2, "has", [rt.V.array(rt.GArray.of([rt.V.array(rt.GArray.of([p]))]))])]));
      rt.frameLine(36);
      let e = rt.V.array(rt.GArray.of([]));
      rt.frameLine(37);
      let f = rt.V.array(rt.GArray.of([]));
      rt.frameLine(38);
      rt.method(f, "append", [e]);
      rt.frameLine(39);
      print(rt.showArgs([rt.V.str("k2c "), rt.ops.eq(e, f)]));
      rt.frameLine(40);
      let d3 = rt.dictOf([]);
      rt.frameLine(41);
      {
        const _nv = rt.writeIdx(d3, e, rt.V.int(1));
        if (_nv !== null) d3 = _nv;
      }
      rt.frameLine(42);
      {
        const _nv = rt.writeIdx(d3, f, rt.V.int(2));
        if (_nv !== null) d3 = _nv;
      }
      rt.frameLine(43);
      print(rt.showArgs([rt.V.str("k2d "), rt.method(d3, "size", []), rt.V.str(" "), rt.wrapValue(rt.index(d3, e)), rt.V.str(" "), rt.wrapValue(rt.index(d3, f)), rt.V.str(" "), d3]));
      rt.frameLine(44);
      let d4 = rt.dictOf([]);
      rt.frameLine(45);
      {
        const _nv = rt.writeIdx(d4, this.nest(rt.V.int(101)), rt.V.int(1));
        if (_nv !== null) d4 = _nv;
      }
      rt.frameLine(46);
      print(rt.showArgs([rt.V.str("k3a "), rt.method(d4, "has", [this.nest(rt.V.int(102))]), rt.V.str(" "), rt.wrapValue(rt.index(d4, this.nest(rt.V.int(102)))), rt.V.str(" "), rt.ops.eq(this.nest(rt.V.int(101)), this.nest(rt.V.int(102)))]));
      rt.frameLine(47);
      {
        const _nv = rt.writeIdx(d4, this.nest(rt.V.int(102)), rt.V.int(2));
        if (_nv !== null) d4 = _nv;
      }
      rt.frameLine(48);
      print(rt.showArgs([rt.V.str("k3b "), rt.method(d4, "size", []), rt.V.str(" "), rt.wrapValue(rt.index(d4, this.nest(rt.V.int(101))))]));
      rt.frameLine(49);
      print(rt.showArgs([rt.V.str("k3c "), rt.method(d4, "has", [this.nest(rt.V.int(3))]), rt.V.str(" "), rt.ops.eq(this.nest(rt.V.int(3)), this.nest(rt.V.int(4)))]));
      rt.frameLine(50);
      print(rt.showArgs([rt.V.str("k3d "), rt.ops.eq(a, this.nest(rt.V.int(101))), rt.V.str(" "), rt.ops.eq(a, this.nest(rt.V.int(100)))]));
      rt.frameLine(51);
      let d5 = rt.dictOf([]);
      rt.frameLine(52);
      {
        const _nv = rt.writeIdx(d5, a, rt.V.int(7));
        if (_nv !== null) d5 = _nv;
      }
      rt.frameLine(53);
      {
        const _nv = rt.writeIdx(d5, this.nest(rt.V.int(101)), rt.V.int(8));
        if (_nv !== null) d5 = _nv;
      }
      rt.frameLine(54);
      print(rt.showArgs([rt.V.str("k3e "), rt.method(d5, "size", []), rt.V.str(" "), rt.wrapValue(rt.index(d5, a)), rt.V.str(" "), rt.wrapValue(rt.index(d5, this.nest(rt.V.int(101))))]));
      rt.frameLine(55);
      let ca = rt.dictOf([]);
      rt.frameLine(56);
      {
        const _nv = rt.writeIdx(ca, rt.V.str("k"), ca);
        if (_nv !== null) ca = _nv;
      }
      rt.frameLine(57);
      let cb = rt.dictOf([]);
      rt.frameLine(58);
      {
        const _nv = rt.writeIdx(cb, rt.V.str("k"), cb);
        if (_nv !== null) cb = _nv;
      }
      rt.frameLine(59);
      print(rt.showArgs([rt.V.str("k4a "), rt.ops.eq(ca, cb)]));
      rt.frameLine(60);
      let d6 = rt.dictOf([]);
      rt.frameLine(61);
      {
        const _nv = rt.writeIdx(d6, ca, rt.V.int(1));
        if (_nv !== null) d6 = _nv;
      }
      rt.frameLine(62);
      {
        const _nv = rt.writeIdx(d6, cb, rt.V.int(2));
        if (_nv !== null) d6 = _nv;
      }
      rt.frameLine(63);
      print(rt.showArgs([rt.V.str("k4b "), rt.method(d6, "size", []), rt.V.str(" "), rt.wrapValue(rt.index(d6, ca)), rt.V.str(" "), rt.wrapValue(rt.index(d6, cb)), rt.V.str(" "), rt.method(rt.strBuiltin([d6]), "length", [])]));
      rt.frameLine(64);
      let md = rt.dictOf([]);
      rt.frameLine(65);
      let mx = rt.V.array(rt.GArray.of([]));
      rt.frameLine(66);
      rt.method(mx, "append", [md]);
      rt.frameLine(67);
      {
        const _nv = rt.writeIdx(md, rt.V.str("a"), mx);
        if (_nv !== null) md = _nv;
      }
      rt.frameLine(68);
      let d7 = rt.dictOf([]);
      rt.frameLine(69);
      {
        const _nv = rt.writeIdx(d7, mx, rt.V.int(1));
        if (_nv !== null) d7 = _nv;
      }
      rt.frameLine(70);
      print(rt.showArgs([rt.V.str("k4c "), rt.method(d7, "has", [mx]), rt.V.str(" "), rt.wrapValue(rt.index(d7, mx)), rt.V.str(" "), rt.method(d7, "size", [])]));
      rt.frameLine(71);
      let arr = rt.V.array(rt.GArray.of([ca, mx]));
      rt.frameLine(72);
      print(rt.showArgs([rt.V.str("k4d "), rt.method(arr, "has", [ca]), rt.V.str(" "), rt.method(arr, "count", [cb]), rt.V.str(" "), rt.method(arr, "has", [md])]));
      rt.frameLine(73);
      let ghost = rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2)]));
      rt.frameLine(74);
      let d8 = rt.dictOf([]);
      rt.frameLine(75);
      {
        const _nv = rt.writeIdx(d8, ghost, rt.V.int(5));
        if (_nv !== null) d8 = _nv;
      }
      rt.frameLine(76);
      rt.method(ghost, "append", [rt.V.int(3)]);
      rt.frameLine(77);
      print(rt.showArgs([rt.V.str("k4e "), rt.method(d8, "size", []), rt.V.str(" "), rt.method(d8, "has", [ghost]), rt.V.str(" "), rt.method(d8, "has", [rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2)]))]), rt.V.str(" "), d8]));
      rt.frameLine(78);
      print(rt.showArgs([rt.V.str("k5a "), rt.ops.eq(a, this.nest(rt.V.int(51))), rt.V.str(" "), rt.ops.eq(a, this.nest(rt.V.int(52))), rt.V.str(" "), rt.ops.eq(this.nest(rt.V.int(51)), this.nest(rt.V.int(52))), rt.V.str(" "), rt.ops.eq(this.nest(rt.V.int(52)), this.nest(rt.V.int(53))), rt.V.str(" "), rt.ops.eq(this.nest(rt.V.int(52)), this.nest(rt.V.int(54)))]));
      rt.frameLine(79);
      print(rt.showArgs([rt.V.str("k5b "), rt.method(rt.strBuiltin([this.nest(rt.V.int(51))]), "length", []), rt.V.str(" "), rt.method(rt.strBuiltin([this.nest(rt.V.int(101))]), "length", []), rt.V.str(" "), rt.method(rt.strBuiltin([this.nest(rt.V.int(102))]), "length", [])]));
      rt.frameLine(80);
      let d9 = rt.dictOf([]);
      rt.frameLine(81);
      {
        const _nv = rt.writeIdx(d9, this.nest(rt.V.int(100)), rt.V.int(1));
        if (_nv !== null) d9 = _nv;
      }
      rt.frameLine(82);
      print(rt.showArgs([rt.V.str("k5c "), rt.method(d9, "has", [this.nest(rt.V.int(101))]), rt.V.str(" "), rt.method(d9, "size", []), rt.V.str(" "), rt.method(d9, "has", [this.nest(rt.V.int(40))]), rt.V.str(" "), rt.ops.eq(this.nest(rt.V.int(100)), this.nest(rt.V.int(101)))]));
      rt.frameLine(83);
      let da = rt.dictOf([]);
      rt.frameLine(84);
      {
        const _nv = rt.writeIdx(da, this.nest(rt.V.int(101)), rt.V.int(1));
        if (_nv !== null) da = _nv;
      }
      rt.frameLine(85);
      print(rt.showArgs([rt.V.str("k5d "), rt.method(da, "has", [this.nest(rt.V.int(102))]), rt.V.str(" "), rt.method(da, "size", []), rt.V.str(" "), rt.wrapValue(rt.index(da, this.nest(rt.V.int(102))))]));
      rt.frameLine(86);
      let db = rt.dictOf([]);
      rt.frameLine(87);
      let g1 = rt.V.array(rt.GArray.of([]));
      rt.frameLine(88);
      rt.method(g1, "append", [g1]);
      rt.frameLine(89);
      let g2 = rt.V.array(rt.GArray.of([]));
      rt.frameLine(90);
      rt.method(g2, "append", [rt.V.array(rt.GArray.of([g2]))]);
      rt.frameLine(91);
      {
        const _nv = rt.writeIdx(db, g1, rt.V.int(1));
        if (_nv !== null) db = _nv;
      }
      rt.frameLine(92);
      print(rt.showArgs([rt.V.str("k5e "), rt.method(db, "has", [g2]), rt.V.str(" "), rt.ops.eq(g1, g2), rt.V.str(" "), rt.method(db, "size", [])]));
      rt.frameLine(93);
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
      case "nest": return rt.wrapValue(this.nest(args[0] as rt.Variant));
      case "_initialize": return rt.wrapValue(this.__gd__initialize());
      default: return super.__gdDispatch(name, args);
    }
  }

}

const __gd_d_Main = rt.defineClass(Main, () => new Main(), (o) => o instanceof Main);
rt.registerDictIdentity(__gd_d_Main, "res://main.gd", "", [], {}, (o) => { const s = o as Main; return []; });
rt.registerMethodArities(__gd_d_Main, { "nest": [1, 1], "_initialize": [0, 0] });
rt.registerMethodParams(__gd_d_Main, { "nest": ["int"] });
rt.registerNativeBase(__gd_d_Main, "SceneTree");
rt.registerScriptLabel(__gd_d_Main, "main.gd");
rt.registerScript("res://main.gd", __gd_d_Main);
const __gd_entry = new Main();
try {
  await __gd_entry.run();
} catch (__gd_e) {
  rt.reportRunFailure(__gd_e);
}
