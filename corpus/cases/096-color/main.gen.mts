// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../packages/runtime/src/runtime/index";
import { print, printJoined, printRaw, printErr, printVerbose, printRich, printDebug, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
  declare c: rt.Variant;
  declare q: rt.Variant;

  __gd_fields__() {
    const __gd_frame = rt.frameEnter("res://main.gd", "@implicit_new");
    try {
      rt.frameLine(3);
      this.c = rt.toColor(rt.colorNew([rt.V.float(0.1), rt.V.float(0.2), rt.V.float(0.3), rt.V.float(0.4)]));
      rt.frameLine(4);
      this.q = rt.toColor(rt.color(0, 0, 0, 1));
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

  poke(p: rt.Variant): void {
    const __gd_frame = rt.frameEnter("res://main.gd", "poke");
    try {
      p = rt.paramSlot(p, "Color", 1, "poke", this);
      rt.frameLine(7);
      {
        const _nv = rt.writeProp(p, "r", rt.V.float(9));
        if (_nv !== null) p = _nv;
      }
      rt.frameLine(8);
      print(rt.showArgs([p]));
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return;
    } finally {
      rt.frameExit(__gd_frame);
    }
  }
  
    override _initialize(): Promise<void> { return this.__gd__initialize(); }
  async __gd__initialize(): Promise<void> {
    const __gd_frame = rt.frameEnter("res://main.gd", "_initialize");
    try {
      rt.frameLine(11);
      print(rt.showArgs([rt.typeOf(this.c), rt.V.str(" "), rt.colorNew([]), rt.V.str(" "), rt.colorNew([rt.V.int(1), rt.V.int(2), rt.V.int(3)]), rt.V.str(" "), rt.colorNew([rt.V.int(1), rt.V.int(2), rt.V.int(3), rt.V.int(4)]), rt.V.str(" "), rt.colorNew([this.c]), rt.V.str(" "), this.q]));
      rt.frameLine(12);
      print(rt.showArgs([rt.colorNew([rt.V.str("red")]), rt.V.str(" "), rt.colorNew([rt.V.str("#00ff00")]), rt.V.str(" "), rt.colorNew([rt.V.str("FF8000")]), rt.V.str(" "), rt.colorNew([rt.V.str("f00")]), rt.V.str(" "), rt.colorNew([rt.V.str("REBECCA_PURPLE")]), rt.V.str(" "), rt.colorNew([rt.V.str("medium_purple")])]));
      rt.frameLine(13);
      print(rt.showArgs([rt.colorStatic("html", [rt.V.str("80ff0000")]), rt.V.str(" "), rt.colorStatic("html", [rt.V.str("f00")]), rt.V.str(" "), rt.colorStatic("from_string", [rt.V.str("#00ff00"), rt.colorNew([rt.V.int(9), rt.V.int(9), rt.V.int(9), rt.V.int(9)])]), rt.V.str(" "), rt.colorStatic("from_string", [rt.V.str("alice_blue"), rt.colorNew([rt.V.int(9), rt.V.int(9), rt.V.int(9), rt.V.int(9)])])]));
      rt.frameLine(14);
      print(rt.showArgs([rt.colorStatic("from_hsv", [rt.V.float(0.5), rt.V.float(0.25), rt.V.float(0.5)]), rt.V.str(" "), rt.colorStatic("from_hsv", [rt.V.int(1), rt.V.int(1), rt.V.int(1)]), rt.V.str(" "), rt.colorStatic("from_hsv", [rt.V.int(0), rt.V.int(0), rt.V.int(0)]), rt.V.str(" "), rt.colorStatic("from_hsv", [rt.V.float(0.5), rt.V.float(0.25), rt.V.float(0.5), rt.V.float(0.125)])]));
      rt.frameLine(15);
      print(rt.showArgs([rt.colorStatic("RED"), rt.V.str(" "), rt.colorStatic("ALICE_BLUE"), rt.V.str(" "), rt.colorStatic("TRANSPARENT"), rt.V.str(" "), rt.colorStatic("MEDIUM_PURPLE"), rt.V.str(" "), rt.colorStatic("REBECCA_PURPLE")]));
      rt.frameLine(16);
      print(rt.showArgs([rt.colorNew([rt.V.float((1 / 3)), rt.V.float(0.1), rt.V.float(0.123456789), rt.V.float(1)]), rt.V.str(" "), rt.colorNew([rt.V.float((1 / 3)), rt.V.float(0.00001), rt.V.float((-0.00001)), rt.V.float((-0))])]));
      rt.frameLine(17);
      print(rt.showArgs([rt.colorNew([rt.V.float(100000000000000000000), rt.V.float(1e-8), rt.V.float((-1e-8)), rt.V.int(1)]), rt.V.str(" "), rt.colorNew([rt.V.float((0 / 0)), rt.V.float((1 / 0)), rt.V.float(((-1) / 0)), rt.V.int(1)]), rt.V.str(" "), rt.colorNew([rt.V.float(0.9999999), rt.V.float(0.00004), rt.V.float(0.00006), rt.V.float(0.5)])]));
      rt.frameLine(18);
      print(rt.showArgs([rt.wrapValue(rt.attribute(this.c, "r")), rt.V.str(" "), rt.wrapValue(rt.attribute(this.c, "g")), rt.V.str(" "), rt.wrapValue(rt.index(this.c, rt.V.int(0))), rt.V.str(" "), rt.wrapValue(rt.index(this.c, rt.V.str("g"))), rt.V.str(" "), rt.wrapValue(rt.attribute(this.c, "a")), rt.V.str(" "), rt.wrapValue(rt.index(this.c, rt.V.int(3)))]));
      rt.frameLine(19);
      print(rt.showArgs([rt.wrapValue(rt.attribute(this.c, "h")), rt.V.str(" "), rt.wrapValue(rt.attribute(this.c, "s")), rt.V.str(" "), rt.wrapValue(rt.attribute(this.c, "v")), rt.V.str(" "), rt.wrapValue(rt.index(this.c, rt.V.str("h"))), rt.V.str(" "), rt.wrapValue(rt.attribute(this.c, "r8")), rt.V.str(" "), rt.wrapValue(rt.attribute(this.c, "a8"))]));
      rt.frameLine(20);
      print(rt.showArgs([rt.wrapValue(rt.attribute(rt.colorNew([rt.V.float(0.5), rt.V.float(0.5), rt.V.float(0.5)]), "h")), rt.V.str(" "), rt.wrapValue(rt.attribute(rt.colorNew([rt.V.float(0.5), rt.V.float(0.5), rt.V.float(0.5)]), "s")), rt.V.str(" "), rt.wrapValue(rt.attribute(rt.colorNew([rt.V.int(0), rt.V.int(0), rt.V.int(0)]), "h")), rt.V.str(" "), rt.wrapValue(rt.attribute(rt.colorNew([rt.V.float((-0.5)), rt.V.float(0.2), rt.V.float(0.9)]), "h")), rt.V.str(" "), rt.wrapValue(rt.attribute(rt.colorNew([rt.V.float(0.2), rt.V.float(0.1), rt.V.float(0.3)]), "h"))]));
      rt.frameLine(21);
      print(rt.showArgs([rt.wrapValue(rt.attribute(rt.colorNew([rt.V.float(0.6), rt.V.float(0.4), rt.V.float(0.2), rt.V.int(1)]), "h")), rt.V.str(" "), rt.wrapValue(rt.attribute(rt.colorNew([rt.V.float(0.6), rt.V.float(0.4), rt.V.float(0.2), rt.V.int(1)]), "s")), rt.V.str(" "), rt.wrapValue(rt.attribute(rt.colorNew([rt.V.float(0.6), rt.V.float(0.4), rt.V.float(0.2), rt.V.int(1)]), "v")), rt.V.str(" "), rt.wrapValue(rt.attribute(rt.colorNew([rt.V.float((0 / 0)), rt.V.float((1 / 0)), rt.V.float(((-1) / 0)), rt.V.float(0.4)]), "r8"))]));
      rt.frameLine(22);
      let d = rt.colorNew([this.c]);
      rt.frameLine(23);
      {
        const _nv = rt.writeProp(d, "b", rt.V.int(1));
        if (_nv !== null) d = _nv;
      }
      rt.frameLine(24);
      print(rt.showArgs([this.c, rt.V.str(" | "), d]));
      rt.frameLine(25);
      this.poke(rt.colorNew([rt.V.float(0.1), rt.V.float(0.2), rt.V.float(0.3), rt.V.float(0.4)]));
      rt.frameLine(26);
      print(rt.showArgs([this.c, rt.V.str(" "), rt.ops.add(rt.colorNew([rt.V.int(1), rt.V.int(2), rt.V.int(3), rt.V.int(4)]), rt.colorNew([rt.V.float(0.5), rt.V.float(0.5), rt.V.float(0.5), rt.V.float(0.5)])), rt.V.str(" "), rt.ops.sub(rt.colorNew([rt.V.int(1), rt.V.int(2), rt.V.int(3), rt.V.int(4)]), rt.colorNew([rt.V.float(0.5), rt.V.float(0.5), rt.V.float(0.5), rt.V.float(0.5)]))]));
      rt.frameLine(27);
      print(rt.showArgs([rt.ops.mul(rt.colorNew([rt.V.int(1), rt.V.int(2), rt.V.int(3), rt.V.int(4)]), rt.colorNew([rt.V.int(2), rt.V.int(3), rt.V.int(4), rt.V.int(5)])), rt.V.str(" "), rt.ops.mul(rt.colorNew([rt.V.int(1), rt.V.int(2), rt.V.int(3), rt.V.int(4)]), rt.V.int(2)), rt.V.str(" "), rt.ops.mul(rt.V.int(2), rt.colorNew([rt.V.int(1), rt.V.int(2), rt.V.int(3), rt.V.int(4)]))]));
      rt.frameLine(28);
      print(rt.showArgs([rt.ops.div(rt.colorNew([rt.V.int(1), rt.V.int(2), rt.V.int(3), rt.V.int(4)]), rt.V.int(2)), rt.V.str(" "), rt.ops.div(rt.colorNew([rt.V.int(1), rt.V.int(2), rt.V.int(3), rt.V.int(4)]), rt.colorNew([rt.V.int(2), rt.V.int(4), rt.V.int(6), rt.V.int(8)])), rt.V.str(" "), rt.ops.div(rt.colorNew([rt.V.int(1), rt.V.int(2), rt.V.int(3), rt.V.int(4)]), rt.V.float(0))]));
      rt.frameLine(29);
      print(rt.showArgs([rt.ops.neg(rt.colorNew([rt.V.int(1), rt.V.int((-2)), rt.V.int(0), rt.V.float(0.5)])), rt.V.str(" "), rt.ops.eq(rt.colorNew([rt.V.int(1), rt.V.int(2), rt.V.int(3), rt.V.int(4)]), rt.colorNew([rt.V.int(1), rt.V.int(2), rt.V.int(3), rt.V.float(4)])), rt.V.str(" "), rt.ops.eq(rt.colorNew([rt.V.int(1), rt.V.int(2), rt.V.int(3), rt.V.int(4)]), rt.V.nil())]));
      rt.frameLine(30);
      print(rt.showArgs([rt.method(rt.colorNew([rt.V.float(0.6), rt.V.float(0.4), rt.V.float(0.2), rt.V.int(1)]), "to_html", []), rt.V.str(" "), rt.method(rt.colorNew([rt.V.float(0.25), rt.V.float(0.5), rt.V.float(0.75), rt.V.float(0.5)]), "to_html", [rt.V.bool(true)]), rt.V.str(" "), rt.method(rt.colorNew([rt.V.float(0.25), rt.V.float(0.5), rt.V.float(0.75), rt.V.float(0.5)]), "to_html", [rt.V.bool(false)])]));
      rt.frameLine(31);
      print(rt.showArgs([rt.method(rt.colorNew([rt.V.float(0.4), rt.V.float(0.5), rt.V.float(0.6), rt.V.float(0.7)]), "to_html", [rt.V.bool(true)]), rt.V.str(" "), rt.method(rt.colorNew([rt.V.int(1), rt.V.int(1), rt.V.int(1), rt.V.int(1)]), "to_rgba32", []), rt.V.str(" "), rt.method(rt.colorNew([rt.V.int(0), rt.V.int(0), rt.V.int(0), rt.V.int(0)]), "to_rgba32", [])]));
      rt.frameLine(32);
      print(rt.showArgs([rt.method(rt.colorNew([rt.V.float(0.6), rt.V.float(0.4), rt.V.float(0.2), rt.V.int(1)]), "to_rgba32", []), rt.V.str(" "), rt.method(rt.colorNew([rt.V.float(0.6), rt.V.float(0.4), rt.V.float(0.2), rt.V.int(1)]), "to_argb32", []), rt.V.str(" "), rt.method(rt.colorNew([rt.V.float(0.6), rt.V.float(0.4), rt.V.float(0.2), rt.V.int(1)]), "to_abgr32", [])]));
      rt.frameLine(33);
      print(rt.showArgs([rt.method(rt.colorNew([rt.V.float(0.5), rt.V.float(0.5), rt.V.float(0.5)]), "get_luminance", []), rt.V.str(" "), rt.method(rt.colorNew([rt.V.float(0.25), rt.V.float(0.5), rt.V.float(0.75)]), "get_luminance", []), rt.V.str(" "), rt.method(rt.colorNew([rt.V.float(0.6), rt.V.float(0.4), rt.V.float(0.2), rt.V.int(1)]), "get_luminance", [])]));
      rt.frameLine(34);
      print(rt.showArgs([rt.method(rt.colorNew([rt.V.float(0.6), rt.V.float(0.4), rt.V.float(0.2), rt.V.float(0.3)]), "lightened", [rt.V.float(0.5)]), rt.V.str(" "), rt.method(rt.colorNew([rt.V.float(0.6), rt.V.float(0.4), rt.V.float(0.2), rt.V.float(0.3)]), "darkened", [rt.V.float(0.5)]), rt.V.str(" "), rt.method(rt.colorNew([rt.V.int(1), rt.V.int(1), rt.V.int(1), rt.V.int(1)]), "lightened", [rt.V.float(0.5)])]));
      rt.frameLine(35);
      print(rt.showArgs([rt.method(rt.colorNew([rt.V.float(0.6), rt.V.float(0.4), rt.V.float(0.2), rt.V.int(1)]), "lightened", [rt.V.float((-0.5))]), rt.V.str(" "), rt.method(rt.colorNew([rt.V.float(0.6), rt.V.float(0.4), rt.V.float(0.2), rt.V.int(1)]), "darkened", [rt.V.float((-0.5))])]));
      rt.frameLine(36);
      print(rt.showArgs([rt.method(rt.colorNew([rt.V.float(0.6), rt.V.float(0.4), rt.V.float(0.2), rt.V.float(0.3)]), "inverted", []), rt.V.str(" "), rt.method(rt.colorNew([rt.V.float(0.1), rt.V.float(0.2), rt.V.float(0.3), rt.V.float(0.4)]), "lerp", [rt.colorNew([rt.V.float(0.7), rt.V.float(0.8), rt.V.float(0.9), rt.V.float(1)]), rt.V.float(0.333)])]));
      rt.frameLine(37);
      print(rt.showArgs([rt.method(rt.colorNew([rt.V.int(1), rt.V.int(2), rt.V.int(3), rt.V.int(4)]), "is_equal_approx", [rt.colorNew([rt.V.float(1.000009), rt.V.int(2), rt.V.int(3), rt.V.int(4)])]), rt.V.str(" "), rt.method(rt.colorNew([rt.V.int(1), rt.V.int(2), rt.V.int(3), rt.V.int(4)]), "is_equal_approx", [rt.colorNew([rt.V.float(1.00001), rt.V.int(2), rt.V.int(3), rt.V.int(4)])])]));
      rt.frameLine(38);
      let e = rt.colorNew([rt.V.float(0.1), rt.V.float(0.2), rt.V.float(0.3), rt.V.float(0.4)]);
      rt.frameLine(39);
      {
        const _nv = rt.writeProp(e, "h", rt.V.float(0.5));
        if (_nv !== null) e = _nv;
      }
      rt.frameLine(40);
      print(rt.showArgs([e]));
      rt.frameLine(41);
      let f = rt.colorNew([rt.V.float(0.1), rt.V.float(0.2), rt.V.float(0.3), rt.V.float(0.4)]);
      rt.frameLine(42);
      {
        const _nv = rt.writeProp(f, "s", rt.V.float(0.5));
        if (_nv !== null) f = _nv;
      }
      rt.frameLine(43);
      print(rt.showArgs([f]));
      rt.frameLine(44);
      let g = rt.colorNew([rt.V.float(0.1), rt.V.float(0.2), rt.V.float(0.3), rt.V.float(0.4)]);
      rt.frameLine(45);
      {
        const _nv = rt.writeIdx(g, rt.V.str("v"), rt.V.float(0.5));
        if (_nv !== null) g = _nv;
      }
      rt.frameLine(46);
      print(rt.showArgs([g]));
      rt.frameLine(47);
      let k = rt.colorNew([rt.V.float(0.1), rt.V.float(0.2), rt.V.float(0.3), rt.V.float(0.4)]);
      rt.frameLine(48);
      {
        const _nv = rt.writeProp(k, "r8", rt.V.int(128));
        if (_nv !== null) k = _nv;
      }
      rt.frameLine(49);
      print(rt.showArgs([k, rt.V.str(" "), rt.wrapValue(rt.attribute(k, "r")), rt.V.str(" "), rt.wrapValue(rt.attribute(k, "h")), rt.V.str(" "), rt.wrapValue(rt.attribute(k, "a8"))]));
      rt.frameLine(50);
      let m = rt.colorNew([rt.V.float(0.1), rt.V.float(0.2), rt.V.float(0.3), rt.V.float(0.4)]);
      rt.frameLine(51);
      {
        const _nv = rt.writeIdx(m, rt.V.str("a"), rt.V.float(0.5));
        if (_nv !== null) m = _nv;
      }
      rt.frameLine(52);
      {
        const _nv = rt.writeIdx(m, rt.V.int(3), rt.V.float(0.25));
        if (_nv !== null) m = _nv;
      }
      rt.frameLine(53);
      print(rt.showArgs([m]));
      rt.frameLine(54);
      let key = rt.colorNew([rt.V.int(1), rt.V.int(0), rt.V.int(0), rt.V.int(1)]);
      rt.frameLine(55);
      let dd = rt.dictOf([[key, rt.V.int(7)]]);
      rt.frameLine(56);
      {
        const _nv = rt.writeProp(key, "b", rt.V.int(1));
        if (_nv !== null) key = _nv;
      }
      rt.frameLine(57);
      print(rt.showArgs([dd, rt.V.str(" "), rt.method(dd, "has", [key]), rt.V.str(" "), rt.method(dd, "has", [rt.colorNew([rt.V.int(1), rt.V.int(0), rt.V.int(0), rt.V.int(1)])]), rt.V.str(" "), rt.wrapValue(rt.index(dd, rt.colorNew([rt.V.int(1), rt.V.int(0), rt.V.int(0), rt.V.int(1)])))]));
      rt.frameLine(58);
      let ta = rt.stampArray(rt.V.array(rt.GArray.of([rt.colorNew([rt.V.int(1), rt.V.int(0), rt.V.int(0), rt.V.int(1)])])), "Color", true);
      rt.frameLine(59);
      rt.method(ta, "resize", [rt.V.int(3)]);
      rt.frameLine(60);
      print(rt.showArgs([ta, rt.V.str(" "), rt.ops.eq(rt.wrapValue(rt.index(ta, rt.V.int(0))), rt.colorNew([rt.V.int(1), rt.V.int(0), rt.V.int(0), rt.V.int(1)])), rt.V.str(" "), rt.method(ta, "has", [rt.colorNew([rt.V.int(0), rt.V.int(0), rt.V.int(0), rt.V.int(1)])])]));
      rt.frameLine(61);
      {
      const _w0 = rt.V.int(0);
        const _nv = rt.writeProp(rt.index(ta, _w0), "g", rt.V.float(0.5));
        if (_nv !== null) rt.setIndex(ta, _w0, _nv);
      }
      rt.frameLine(62);
      print(rt.showArgs([ta]));
      rt.frameLine(63);
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
      case "poke": return rt.wrapValue(this.poke(args[0] as rt.Variant));
      case "_initialize": return rt.wrapValue(this.__gd__initialize());
      default: return super.__gdDispatch(name, args);
    }
  }

}

const __gd_d_Main = rt.defineClass(Main, () => new Main(), (o) => o instanceof Main);
rt.registerScriptProps(__gd_d_Main, ["c","q"], (o) => { const s = o as Main; return [s.c, s.q]; });
rt.registerDictIdentity(__gd_d_Main, "res://main.gd", "", ["c","q"], {}, (o) => { const s = o as Main; return [s.c, s.q]; });
rt.registerMethodArities(__gd_d_Main, { "poke": [1, 1], "_initialize": [0, 0] });
rt.registerNativeBase(__gd_d_Main, "SceneTree");
rt.registerScriptLabel(__gd_d_Main, "main.gd");
rt.registerScript("res://main.gd", __gd_d_Main);
const __gd_entry = new Main();
try {
  await __gd_entry.run();
} catch (__gd_e) {
  rt.reportRunFailure(__gd_e);
}
