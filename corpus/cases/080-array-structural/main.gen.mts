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
      let a = rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2), rt.V.int(3)]));
      rt.frameLine(5);
      rt.method(a, "insert", [rt.V.int(0), rt.V.int(9)]);
      rt.frameLine(6);
      print(rt.showArgs([a]));
      rt.frameLine(7);
      rt.method(a, "insert", [rt.V.int(2), rt.V.int(8)]);
      rt.frameLine(8);
      print(rt.showArgs([a]));
      rt.frameLine(9);
      rt.method(a, "insert", [rt.V.int(10), rt.V.int(7)]);
      rt.frameLine(10);
      print(rt.showArgs([a]));
      rt.frameLine(11);
      rt.method(a, "insert", [rt.V.int(6), rt.V.int(6)]);
      rt.frameLine(12);
      print(rt.showArgs([a]));
      rt.frameLine(13);
      rt.method(a, "insert", [rt.V.int((-1)), rt.V.int(5)]);
      rt.frameLine(14);
      print(rt.showArgs([a]));
      rt.frameLine(15);
      rt.method(a, "insert", [rt.V.int((-9)), rt.V.int(4)]);
      rt.frameLine(16);
      print(rt.showArgs([a]));
      rt.frameLine(17);
      let emp = rt.V.array(rt.GArray.of([]));
      rt.frameLine(18);
      rt.method(emp, "insert", [rt.V.int(0), rt.V.int(1)]);
      rt.frameLine(19);
      print(rt.showArgs([emp]));
      rt.frameLine(20);
      rt.method(emp, "insert", [rt.V.int(5), rt.V.int(2)]);
      rt.frameLine(21);
      print(rt.showArgs([emp]));
      rt.frameLine(22);
      rt.method(emp, "insert", [rt.V.int((-1)), rt.V.int(3)]);
      rt.frameLine(23);
      print(rt.showArgs([emp]));
      rt.frameLine(24);
      let p = rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2), rt.V.int(3)]));
      rt.frameLine(25);
      print(rt.showArgs([rt.method(p, "pop_front", [])]));
      rt.frameLine(26);
      print(rt.showArgs([rt.method(p, "pop_back", [])]));
      rt.frameLine(27);
      print(rt.showArgs([p]));
      rt.frameLine(28);
      print(rt.showArgs([rt.method(p, "pop_at", [rt.V.int(0)])]));
      rt.frameLine(29);
      print(rt.showArgs([rt.method(p, "pop_at", [rt.V.int(5)])]));
      rt.frameLine(30);
      print(rt.showArgs([rt.method(p, "pop_at", [rt.V.int((-9))])]));
      rt.frameLine(31);
      print(rt.showArgs([p]));
      rt.frameLine(32);
      let q = rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2), rt.V.int(3)]));
      rt.frameLine(33);
      print(rt.showArgs([rt.method(q, "pop_at", [rt.V.int((-1))])]));
      rt.frameLine(34);
      print(rt.showArgs([q]));
      rt.frameLine(35);
      let r = rt.V.array(rt.GArray.of([]));
      rt.frameLine(36);
      print(rt.showArgs([rt.method(r, "pop_front", [])]));
      rt.frameLine(37);
      print(rt.showArgs([rt.method(r, "pop_back", [])]));
      rt.frameLine(38);
      print(rt.showArgs([rt.method(r, "pop_at", [rt.V.int(0)])]));
      rt.frameLine(39);
      print(rt.showArgs([r]));
      rt.frameLine(40);
      let s = rt.V.array(rt.GArray.of([rt.V.int(2)]));
      rt.frameLine(41);
      rt.method(s, "push_front", [rt.V.int(1)]);
      rt.frameLine(42);
      rt.method(s, "push_back", [rt.V.int(3)]);
      rt.frameLine(43);
      print(rt.showArgs([s]));
      rt.frameLine(44);
      let t = rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2), rt.V.int(3)]));
      rt.frameLine(45);
      rt.method(t, "remove_at", [rt.V.int(0)]);
      rt.frameLine(46);
      print(rt.showArgs([t]));
      rt.frameLine(47);
      rt.method(t, "remove_at", [rt.V.int(5)]);
      rt.frameLine(48);
      print(rt.showArgs([t]));
      rt.frameLine(49);
      rt.method(t, "remove_at", [rt.V.int((-1))]);
      rt.frameLine(50);
      print(rt.showArgs([t]));
      rt.frameLine(51);
      rt.method(t, "remove_at", [rt.V.int((-9))]);
      rt.frameLine(52);
      print(rt.showArgs([t]));
      rt.frameLine(53);
      let u = rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2), rt.V.int(3), rt.V.int(1)]));
      rt.frameLine(54);
      rt.method(u, "erase", [rt.V.int(2)]);
      rt.frameLine(55);
      print(rt.showArgs([u]));
      rt.frameLine(56);
      rt.method(u, "erase", [rt.V.int(9)]);
      rt.frameLine(57);
      print(rt.showArgs([u]));
      rt.frameLine(58);
      rt.method(u, "erase", [rt.V.int(1)]);
      rt.frameLine(59);
      print(rt.showArgs([u]));
      rt.frameLine(60);
      let nest = rt.V.array(rt.GArray.of([rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2)])), rt.V.int(3)]));
      rt.frameLine(61);
      rt.method(nest, "erase", [rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2)]))]);
      rt.frameLine(62);
      print(rt.showArgs([nest]));
      rt.frameLine(63);
      let mix = rt.V.array(rt.GArray.of([rt.V.float(1), rt.V.int(1)]));
      rt.frameLine(64);
      rt.method(mix, "erase", [rt.V.int(1)]);
      rt.frameLine(65);
      print(rt.showArgs([mix]));
      rt.frameLine(66);
      let rv = rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2), rt.V.int(3)]));
      rt.frameLine(67);
      rt.method(rv, "reverse", []);
      rt.frameLine(68);
      print(rt.showArgs([rv]));
      rt.frameLine(69);
      rt.method(rv, "clear", []);
      rt.frameLine(70);
      print(rt.showArgs([rv]));
      rt.frameLine(71);
      print(rt.showArgs([rt.method(rv, "is_empty", [])]));
      rt.frameLine(72);
      print(rt.showArgs([rt.method(rt.V.array(rt.GArray.of([rt.V.int(1)])), "is_empty", [])]));
      rt.frameLine(73);
      let fl = rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2)]));
      rt.frameLine(74);
      let src = rt.V.array(rt.GArray.of([rt.V.int(9)]));
      rt.frameLine(75);
      rt.method(fl, "fill", [src]);
      rt.frameLine(76);
      print(rt.showArgs([fl]));
      rt.frameLine(77);
      {
        const _nv = rt.writeIdx(src, rt.V.int(0), rt.V.int(5));
        if (_nv !== null) src = _nv;
      }
      rt.frameLine(78);
      print(rt.showArgs([fl]));
      rt.frameLine(79);
      let sl = rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2), rt.V.int(3), rt.V.int(4), rt.V.int(5)]));
      rt.frameLine(80);
      print(rt.showArgs([rt.method(sl, "slice", [rt.V.int(1), rt.V.int(3)])]));
      rt.frameLine(81);
      print(rt.showArgs([rt.method(sl, "slice", [rt.V.int((-2))])]));
      rt.frameLine(82);
      print(rt.showArgs([rt.method(sl, "slice", [rt.V.int(1)])]));
      rt.frameLine(83);
      print(rt.showArgs([rt.method(sl, "slice", [rt.V.int(0), rt.V.int(10)])]));
      rt.frameLine(84);
      print(rt.showArgs([rt.method(sl, "slice", [rt.V.int(3), rt.V.int(1)])]));
      rt.frameLine(85);
      print(rt.showArgs([rt.method(sl, "slice", [rt.V.int(0), rt.V.int(0)])]));
      rt.frameLine(86);
      print(rt.showArgs([rt.method(sl, "slice", [rt.V.int((-9))])]));
      rt.frameLine(87);
      print(rt.showArgs([rt.method(sl, "slice", [rt.V.int((-9)), rt.V.int((-6))])]));
      rt.frameLine(88);
      print(rt.showArgs([rt.method(sl, "slice", [rt.V.int(2), rt.V.int((-1))])]));
      rt.frameLine(89);
      print(rt.showArgs([rt.method(sl, "slice", [rt.V.int(0), rt.V.int(5), rt.V.int(2)])]));
      rt.frameLine(90);
      print(rt.showArgs([rt.method(sl, "slice", [rt.V.int(1), rt.V.int(4), rt.V.int(3)])]));
      rt.frameLine(91);
      print(rt.showArgs([rt.method(sl, "slice", [rt.V.int(0), rt.V.int(5), rt.V.int((-1))])]));
      rt.frameLine(92);
      print(rt.showArgs([rt.method(sl, "slice", [rt.V.int(4), rt.V.int(1), rt.V.int((-1))])]));
      rt.frameLine(93);
      print(rt.showArgs([rt.method(sl, "slice", [rt.V.int((-1)), rt.V.int((-6)), rt.V.int((-1))])]));
      rt.frameLine(94);
      print(rt.showArgs([rt.method(sl, "slice", [rt.V.int(9), rt.V.int(1), rt.V.int((-1))])]));
      rt.frameLine(95);
      print(rt.showArgs([rt.method(sl, "slice", [rt.V.int(0), rt.V.int(5), rt.V.int(0)])]));
      rt.frameLine(96);
      print(rt.showArgs([sl]));
      rt.frameLine(97);
      let sh = rt.V.array(rt.GArray.of([rt.V.array(rt.GArray.of([rt.V.int(1)])), rt.V.array(rt.GArray.of([rt.V.int(2)]))]));
      rt.frameLine(98);
      let shallow = rt.method(sh, "slice", [rt.V.int(0), rt.V.int(2)]);
      rt.frameLine(99);
      {
      const _w0 = rt.V.int(0);
        const _nv = rt.writeIdx(rt.index(shallow, _w0), rt.V.int(0), rt.V.int(9));
        if (_nv !== null) rt.setIndex(shallow, _w0, _nv);
      }
      rt.frameLine(100);
      print(rt.showArgs([sh]));
      rt.frameLine(101);
      let deep = rt.method(sh, "slice", [rt.V.int(0), rt.V.int(2), rt.V.int(1), rt.V.bool(true)]);
      rt.frameLine(102);
      {
      const _w0 = rt.V.int(1);
        const _nv = rt.writeIdx(rt.index(deep, _w0), rt.V.int(0), rt.V.int(8));
        if (_nv !== null) rt.setIndex(deep, _w0, _nv);
      }
      rt.frameLine(103);
      print(rt.showArgs([sh]));
      rt.frameLine(104);
      print(rt.showArgs([deep]));
      rt.frameLine(105);
      let dup = rt.V.array(rt.GArray.of([rt.V.array(rt.GArray.of([rt.V.int(1)]))]));
      rt.frameLine(106);
      let ds = rt.method(dup, "duplicate", []);
      rt.frameLine(107);
      {
      const _w0 = rt.V.int(0);
        const _nv = rt.writeIdx(rt.index(ds, _w0), rt.V.int(0), rt.V.int(9));
        if (_nv !== null) rt.setIndex(ds, _w0, _nv);
      }
      rt.frameLine(108);
      print(rt.showArgs([dup]));
      rt.frameLine(109);
      let dd = rt.method(dup, "duplicate", [rt.V.bool(true)]);
      rt.frameLine(110);
      {
      const _w0 = rt.V.int(0);
        const _nv = rt.writeIdx(rt.index(dd, _w0), rt.V.int(0), rt.V.int(5));
        if (_nv !== null) rt.setIndex(dd, _w0, _nv);
      }
      rt.frameLine(111);
      print(rt.showArgs([dup]));
      rt.frameLine(112);
      print(rt.showArgs([dd]));
      rt.frameLine(113);
      print(rt.showArgs([rt.method(rt.method(dup, "duplicate", []), "size", [])]));
      rt.frameLine(114);
      let ap = rt.V.array(rt.GArray.of([rt.V.int(1)]));
      rt.frameLine(115);
      rt.method(ap, "append_array", [rt.V.array(rt.GArray.of([rt.V.int(2), rt.V.array(rt.GArray.of([rt.V.int(3)]))]))]);
      rt.frameLine(116);
      print(rt.showArgs([ap]));
      rt.frameLine(117);
      let asrc = rt.V.array(rt.GArray.of([rt.V.array(rt.GArray.of([rt.V.int(9)]))]));
      rt.frameLine(118);
      let shared = rt.V.array(rt.GArray.of([]));
      rt.frameLine(119);
      rt.method(shared, "append_array", [asrc]);
      rt.frameLine(120);
      {
      const _w0 = rt.V.int(0);
        const _nv = rt.writeIdx(rt.index(asrc, _w0), rt.V.int(0), rt.V.int(7));
        if (_nv !== null) rt.setIndex(asrc, _w0, _nv);
      }
      rt.frameLine(121);
      print(rt.showArgs([shared]));
      rt.frameLine(122);
      let bs = rt.V.array(rt.GArray.of([rt.V.int(3)]));
      rt.frameLine(123);
      let asg = rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2)]));
      rt.frameLine(124);
      rt.method(asg, "assign", [bs]);
      rt.frameLine(125);
      {
        const _nv = rt.writeIdx(bs, rt.V.int(0), rt.V.int(9));
        if (_nv !== null) bs = _nv;
      }
      rt.frameLine(126);
      print(rt.showArgs([asg]));
      rt.frameLine(127);
      let nest_src = rt.V.array(rt.GArray.of([rt.V.array(rt.GArray.of([rt.V.int(1)]))]));
      rt.frameLine(128);
      let assigned = rt.V.array(rt.GArray.of([]));
      rt.frameLine(129);
      rt.method(assigned, "assign", [nest_src]);
      rt.frameLine(130);
      {
      const _w0 = rt.V.int(0);
        const _nv = rt.writeIdx(rt.index(nest_src, _w0), rt.V.int(0), rt.V.int(9));
        if (_nv !== null) rt.setIndex(nest_src, _w0, _nv);
      }
      rt.frameLine(131);
      print(rt.showArgs([assigned]));
      rt.frameLine(132);
      let idn = rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.float(1), rt.V.bool(true), rt.V.nil(), rt.V.stringName("a")]));
      rt.frameLine(133);
      print(rt.showArgs([rt.method(idn, "has", [rt.V.int(1)])]));
      rt.frameLine(134);
      print(rt.showArgs([rt.method(idn, "has", [rt.V.float(1)])]));
      rt.frameLine(135);
      print(rt.showArgs([rt.method(idn, "has", [rt.V.bool(true)])]));
      rt.frameLine(136);
      print(rt.showArgs([rt.method(idn, "has", [rt.V.nil()])]));
      rt.frameLine(137);
      print(rt.showArgs([rt.method(idn, "has", [rt.V.str("a")])]));
      rt.frameLine(138);
      print(rt.showArgs([rt.method(idn, "find", [rt.V.float(1)])]));
      rt.frameLine(139);
      print(rt.showArgs([rt.method(idn, "count", [rt.V.int(1)])]));
      rt.frameLine(140);
      print(rt.showArgs([rt.method(idn, "count", [rt.V.str("a")])]));
      rt.frameLine(141);
      print(rt.showArgs([rt.method(rt.V.array(rt.GArray.of([rt.V.int(1)])), "has", [rt.V.float(1)])]));
      rt.frameLine(142);
      print(rt.showArgs([rt.method(rt.V.array(rt.GArray.of([rt.V.int(1)])), "find", [rt.V.float(1)])]));
      rt.frameLine(143);
      print(rt.showArgs([rt.method(rt.V.array(rt.GArray.of([rt.V.int(1)])), "count", [rt.V.float(1)])]));
      rt.frameLine(144);
      print(rt.showArgs([rt.method(rt.V.array(rt.GArray.of([rt.V.int(0)])), "has", [rt.V.bool(false)])]));
      rt.frameLine(145);
      print(rt.showArgs([rt.method(rt.V.array(rt.GArray.of([rt.V.nil()])), "has", [rt.V.int(0)])]));
      rt.frameLine(146);
      print(rt.showArgs([rt.method(rt.V.array(rt.GArray.of([rt.V.array(rt.GArray.of([rt.V.int(1)]))])), "has", [rt.V.array(rt.GArray.of([rt.V.float(1)]))])]));
      rt.frameLine(147);
      print(rt.showArgs([rt.method(rt.V.array(rt.GArray.of([rt.V.array(rt.GArray.of([rt.V.int(1)]))])), "find", [rt.V.array(rt.GArray.of([rt.V.float(1)]))])]));
      rt.frameLine(148);
      print(rt.showArgs([rt.method(rt.V.array(rt.GArray.of([rt.dictOf([[rt.V.str("x"), rt.V.int(1)], [rt.V.str("y"), rt.V.int(2)]])])), "count", [rt.dictOf([[rt.V.str("y"), rt.V.int(2)], [rt.V.str("x"), rt.V.int(1)]])])]));
      rt.frameLine(149);
      print(rt.showArgs([rt.method(rt.V.array(rt.GArray.of([rt.vector2New([rt.V.int(1), rt.V.int(2)])])), "count", [rt.vector2New([rt.V.float(1), rt.V.float(2)])])]));
      rt.frameLine(150);
      print(rt.showArgs([rt.method(rt.V.array(rt.GArray.of([rt.vector2New([rt.V.int(1), rt.V.int(2)])])), "find", [rt.vector2New([rt.V.float(1), rt.V.float(2)])])]));
      rt.frameLine(151);
      let fr = rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2), rt.V.int(1), rt.V.int(2)]));
      rt.frameLine(152);
      print(rt.showArgs([rt.method(fr, "find", [rt.V.int(1)])]));
      rt.frameLine(153);
      print(rt.showArgs([rt.method(fr, "find", [rt.V.int(1), rt.V.int(1)])]));
      rt.frameLine(154);
      print(rt.showArgs([rt.method(fr, "find", [rt.V.int(1), rt.V.int(3)])]));
      rt.frameLine(155);
      print(rt.showArgs([rt.method(fr, "find", [rt.V.int(1), rt.V.int(9)])]));
      rt.frameLine(156);
      print(rt.showArgs([rt.method(fr, "find", [rt.V.int(1), rt.V.int((-1))])]));
      rt.frameLine(157);
      print(rt.showArgs([rt.method(fr, "rfind", [rt.V.int(1)])]));
      rt.frameLine(158);
      print(rt.showArgs([rt.method(fr, "rfind", [rt.V.int(1), rt.V.int(0)])]));
      rt.frameLine(159);
      print(rt.showArgs([rt.method(fr, "rfind", [rt.V.int(1), rt.V.int(1)])]));
      rt.frameLine(160);
      print(rt.showArgs([rt.method(fr, "rfind", [rt.V.int(1), rt.V.int((-2))])]));
      rt.frameLine(161);
      print(rt.showArgs([rt.method(fr, "rfind", [rt.V.int(1), rt.V.int((-4))])]));
      rt.frameLine(162);
      print(rt.showArgs([rt.method(fr, "rfind", [rt.V.int(1), rt.V.int((-9))])]));
      rt.frameLine(163);
      print(rt.showArgs([rt.method(fr, "rfind", [rt.V.int(9)])]));
      rt.frameLine(164);
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
