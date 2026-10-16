// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../packages/runtime/src/runtime/index";
import { print, printJoined, printRaw, printErr, printVerbose, printRich, printDebug, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
  declare m: rt.Variant;

  __gd_fields__() {
    const __gd_frame = rt.frameEnter("res://main.gd", "@implicit_new");
    try {
      rt.frameLine(3);
      this.m = rt.toVec2i(rt.vector2iNew([rt.V.int(1), rt.V.int(2)]));
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

  bump(p: rt.Variant): void {
    const __gd_frame = rt.frameEnter("res://main.gd", "bump");
    try {
      p = rt.paramSlot(p, "Vector2i", 1, "bump", this);
      rt.frameLine(6);
      {
        const _nv = rt.writeProp(p, "x", rt.V.int(7));
        if (_nv !== null) p = _nv;
      }
      rt.frameLine(7);
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
      rt.frameLine(10);
      let w = rt.vector2iNew([rt.V.int(1), rt.V.int(2)]);
      rt.frameLine(11);
      print(rt.showArgs([w, rt.V.str(" "), rt.vector2iNew([]), rt.V.str(" "), rt.vector2iNew([rt.V.float((-1.7)), rt.V.float((-2.2))]), rt.V.str(" "), rt.vector2iNew([w]), rt.V.str(" "), rt.vector2iNew([rt.vector2New([rt.V.float(1.7), rt.V.float(2.2)])])]));
      rt.frameLine(12);
      print(rt.showArgs([rt.vector2New([w]), rt.V.str(" "), rt.vector2New([rt.vector2New([rt.V.int(3), rt.V.int(4)])])]));
      rt.frameLine(13);
      print(rt.showArgs([rt.wrapValue(rt.attribute(w, "x")), rt.V.str(" "), rt.wrapValue(rt.attribute(w, "y")), rt.V.str(" "), rt.wrapValue(rt.index(w, rt.V.int(0))), rt.V.str(" "), rt.wrapValue(rt.index(w, rt.V.str("y")))]));
      rt.frameLine(14);
      print(rt.showArgs([rt.ops.eq(w, rt.vector2iNew([rt.V.float(1), rt.V.float(2)])), rt.V.str(" "), rt.ops.neq(w, rt.vector2iNew([rt.V.int(1), rt.V.int(3)])), rt.V.str(" "), rt.ops.eq(w, rt.V.nil()), rt.V.str(" "), rt.ops.neq(w, rt.V.nil())]));
      rt.frameLine(15);
      print(rt.showArgs([rt.ops.lt(w, rt.vector2iNew([rt.V.int(1), rt.V.int(3)])), rt.V.str(" "), rt.ops.gt(w, rt.vector2iNew([rt.V.int(0), rt.V.int(9)])), rt.V.str(" "), rt.ops.lte(w, rt.vector2iNew([rt.V.int(1), rt.V.int(2)]))]));
      rt.frameLine(16);
      print(rt.showArgs([rt.ops.add(w, rt.vector2iNew([rt.V.int(3), rt.V.int((-4))])), rt.V.str(" | "), rt.ops.sub(w, rt.vector2iNew([rt.V.int(1), rt.V.int(1)])), rt.V.str(" | "), rt.ops.mul(w, rt.vector2iNew([rt.V.int(4), rt.V.int(5)])), rt.V.str(" | "), rt.ops.mul(w, rt.V.int(2)), rt.V.str(" | "), rt.ops.div(w, rt.vector2iNew([rt.V.int(2), rt.V.int(2)])), rt.V.str(" | "), rt.ops.neg(w)]));
      rt.frameLine(17);
      print(rt.showArgs([rt.ops.div(rt.vector2iNew([rt.V.int(7), rt.V.int((-7))]), rt.vector2iNew([rt.V.int(2), rt.V.int(2)])), rt.V.str(" | "), rt.ops.mod(rt.vector2iNew([rt.V.int((-7)), rt.V.int(7)]), rt.vector2iNew([rt.V.int(2), rt.V.int((-2))])), rt.V.str(" | "), rt.ops.mul(rt.vector2iNew([rt.V.int(6), rt.V.int(6)]), rt.V.float(0.5)), rt.V.str(" | "), rt.ops.div(rt.vector2iNew([rt.V.int(6), rt.V.int(6)]), rt.V.float(4))]));
      rt.frameLine(18);
      print(rt.showArgs([rt.ops.add(rt.vector2iNew([rt.V.int(2147483647), rt.V.int(0)]), rt.vector2iNew([rt.V.int(1), rt.V.int(0)])), rt.V.str(" | "), rt.ops.sub(rt.vector2iNew([rt.V.int((-2147483648)), rt.V.int(5)]), rt.vector2iNew([rt.V.int(1), rt.V.int(0)])), rt.V.str(" | "), rt.ops.mul(rt.vector2iNew([rt.V.int(2147483647), rt.V.int(0)]), rt.V.int(2))]));
      rt.frameLine(19);
      let big = rt.vector2iNew([rt.V.int(2147483647), rt.V.int(1)]);
      rt.frameLine(20);
      print(rt.showArgs([rt.ops.mul(big, rt.vector2iNew([rt.V.int(2), rt.V.int(2)])), rt.V.str(" | "), rt.ops.neg(big), rt.V.str(" | "), rt.method(big, "length_squared", [])]));
      rt.frameLine(21);
      let v = rt.vector2iNew([rt.V.int(1), rt.V.int(2)]);
      rt.frameLine(22);
      {
        const _nv = rt.writeProp(v, "x", rt.V.float(2.7));
        if (_nv !== null) v = _nv;
      }
      rt.frameLine(23);
      print(rt.showArgs([v, rt.V.str(" "), rt.wrapValue(rt.attribute(v, "x"))]));
      rt.frameLine(24);
      {
        const _nv = rt.writeIdx(v, rt.V.int(1), rt.V.float((-0.9)));
        if (_nv !== null) v = _nv;
      }
      rt.frameLine(25);
      print(rt.showArgs([v]));
      rt.frameLine(26);
      {
        const _nv = rt.writeProp(v, "x", rt.V.int(2147483648));
        if (_nv !== null) v = _nv;
      }
      rt.frameLine(27);
      print(rt.showArgs([v]));
      rt.frameLine(28);
      {
        const _nv = rt.writeProp(this.m, "y", rt.V.int(9));
        if (_nv !== null) this.m = _nv;
      }
      rt.frameLine(29);
      print(rt.showArgs([this.m]));
      rt.frameLine(30);
      let arr = rt.V.array(rt.GArray.of([rt.vector2iNew([rt.V.int(1), rt.V.int(2)])]));
      rt.frameLine(31);
      {
      const _w0 = rt.V.int(0);
        const _nv = rt.writeProp(rt.index(arr, _w0), "x", rt.V.int(5));
        if (_nv !== null) rt.setIndex(arr, _w0, _nv);
      }
      rt.frameLine(32);
      print(rt.showArgs([arr]));
      rt.frameLine(33);
      let ddc = rt.dictOf([[rt.V.str("k"), rt.vector2iNew([rt.V.int(1), rt.V.int(2)])]]);
      rt.frameLine(34);
      {
      const _w0 = rt.V.str("k");
        const _nv = rt.writeProp(rt.index(ddc, _w0), "y", rt.V.int(8));
        if (_nv !== null) rt.setIndex(ddc, _w0, _nv);
      }
      rt.frameLine(35);
      print(rt.showArgs([ddc]));
      rt.frameLine(36);
      for (let x of rt.iter(arr)) {
        rt.frameLine(37);
        {
          const _nv = rt.writeProp(x, "y", rt.V.int(100));
          if (_nv !== null) x = _nv;
        }
      }
      rt.frameLine(38);
      print(rt.showArgs([arr]));
      rt.frameLine(39);
      let w2 = v;
      rt.frameLine(40);
      {
        const _nv = rt.writeProp(w2, "x", rt.V.int(42));
        if (_nv !== null) w2 = _nv;
      }
      rt.frameLine(41);
      print(rt.showArgs([v, rt.V.str(" "), w2]));
      rt.frameLine(42);
      let q = rt.vector2iNew([rt.V.int(3), rt.V.int((-4))]);
      rt.frameLine(43);
      print(rt.showArgs([rt.method(q, "length", []), rt.V.str(" | "), rt.method(q, "length_squared", []), rt.V.str(" | "), rt.method(q, "aspect", []), rt.V.str(" | "), rt.method(q, "abs", []), rt.V.str(" | "), rt.method(q, "sign", [])]));
      rt.frameLine(44);
      print(rt.showArgs([rt.method(q, "min", [rt.vector2iNew([rt.V.int(1), rt.V.int(9)])]), rt.V.str(" | "), rt.method(q, "max", [rt.vector2iNew([rt.V.int(1), rt.V.int(9)])]), rt.V.str(" | "), rt.method(q, "clamp", [rt.vector2iNew([rt.V.int(1), rt.V.int(1)]), rt.vector2iNew([rt.V.int(4), rt.V.int(4)])])]));
      rt.frameLine(45);
      let s7 = rt.vector2iNew([rt.V.int(7), rt.V.int(3)]);
      rt.frameLine(46);
      print(rt.showArgs([rt.method(s7, "snapped", [rt.vector2iNew([rt.V.int(2), rt.V.int(2)])]), rt.V.str(" | "), rt.method(s7, "distance_to", [rt.vector2iNew([rt.V.int(0), rt.V.int(0)])]), rt.V.str(" | "), rt.method(s7, "distance_squared_to", [rt.vector2iNew([rt.V.int(0), rt.V.int(0)])]), rt.V.str(" | "), rt.method(s7, "min_axis_index", []), rt.method(s7, "max_axis_index", [])]));
      rt.frameLine(47);
      print(rt.showArgs([rt.method(rt.vector2iNew([rt.V.int((-7)), rt.V.int(3)]), "snapped", [rt.vector2iNew([rt.V.int(2), rt.V.int(2)])]), rt.V.str(" | "), rt.method(rt.vector2iNew([rt.V.int((-7)), rt.V.int(3)]), "snapped", [rt.vector2iNew([rt.V.int(0), rt.V.int(1)])]), rt.V.str(" | "), rt.method(rt.vector2iNew([rt.V.int(0), rt.V.int(0)]), "length", []), rt.V.str(" | "), rt.method(rt.vector2iNew([rt.V.int(0), rt.V.int(0)]), "aspect", []), rt.V.str(" | "), rt.method(rt.vector2iNew([rt.V.int(3), rt.V.int(0)]), "aspect", [])]));
      rt.frameLine(48);
      print(rt.showArgs([rt.method(rt.vector2iConst("MIN"), "abs", []), rt.V.str(" | "), rt.ops.neg(rt.vector2iConst("MIN")), rt.V.str(" | "), rt.method(rt.vector2iConst("MIN"), "sign", [])]));
      rt.frameLine(49);
      print(rt.showArgs([rt.vector2iConst("ONE"), rt.V.str(" "), rt.vector2iConst("ZERO"), rt.V.str(" "), rt.vector2iConst("UP"), rt.V.str(" "), rt.vector2iConst("DOWN"), rt.V.str(" "), rt.vector2iConst("LEFT"), rt.V.str(" "), rt.vector2iConst("RIGHT"), rt.V.str(" "), rt.vector2iConst("MAX"), rt.V.str(" "), rt.vector2iConst("MIN")]));
      rt.frameLine(50);
      print(rt.showArgs([rt.typeOf(w), rt.V.str(" "), rt.isType(w, "Vector2i"), rt.V.str(" "), rt.isType(w, "Vector2"), rt.V.str(" "), rt.strBuiltin([w])]));
      rt.frameLine(51);
      let d = rt.dictOf([]);
      rt.frameLine(52);
      {
        const _nv = rt.writeIdx(d, rt.vector2iNew([rt.V.int(1), rt.V.int(2)]), rt.V.int(5));
        if (_nv !== null) d = _nv;
      }
      rt.frameLine(53);
      print(rt.showArgs([d, rt.V.str(" "), rt.method(d, "get", [rt.vector2iNew([rt.V.int(1), rt.V.int(2)]), rt.V.str("M")]), rt.V.str(" "), rt.method(d, "get", [rt.vector2iNew([rt.V.float(1.7), rt.V.float(2.2)]), rt.V.str("M")]), rt.V.str(" "), rt.method(d, "has", [rt.vector2iNew([rt.V.int(1), rt.V.int(3)])])]));
      rt.frameLine(54);
      let d2 = rt.dictOf([]);
      rt.frameLine(55);
      {
        const _nv = rt.writeIdx(d2, rt.vector2iNew([rt.V.int(1), rt.V.int(2)]), rt.V.int(1));
        if (_nv !== null) d2 = _nv;
      }
      rt.frameLine(56);
      {
        const _nv = rt.writeIdx(d2, rt.vector2iNew([rt.V.float(1.7), rt.V.float(2.2)]), rt.V.int(2));
        if (_nv !== null) d2 = _nv;
      }
      rt.frameLine(57);
      print(rt.showArgs([d2, rt.V.str(" size="), rt.method(d2, "size", [])]));
      rt.frameLine(58);
      let ta = rt.stampArray(rt.V.array(rt.GArray.of([])), "Vector2i", true);
      rt.frameLine(59);
      rt.method(ta, "resize", [rt.V.int(2)]);
      rt.frameLine(60);
      print(rt.showArgs([ta]));
      rt.frameLine(61);
      {
        const _nv = rt.writeIdx(ta, rt.V.int(0), rt.vector2iNew([rt.V.int(3), rt.V.int(4)]));
        if (_nv !== null) ta = _nv;
      }
      rt.frameLine(62);
      print(rt.showArgs([ta, rt.V.str(" "), rt.wrapValue(rt.attribute(rt.wrapValue(rt.index(ta, rt.V.int(0), "Array[Vector2i]")), "y"))]));
      rt.frameLine(63);
      let tdi = rt.stampDict(rt.dictOf([]), "Vector2i", "int", true);
      rt.frameLine(64);
      {
        const _nv = rt.writeIdx(tdi, rt.vector2iNew([rt.V.int(1), rt.V.int(2)]), rt.V.int(5));
        if (_nv !== null) tdi = _nv;
      }
      rt.frameLine(65);
      print(rt.showArgs([tdi, rt.V.str(" "), rt.method(tdi, "get", [rt.vector2iNew([rt.V.int(1), rt.V.int(2)]), rt.V.str("M")]), rt.V.str(" "), rt.method(tdi, "get", [rt.vector2iNew([rt.V.float(1.7), rt.V.float(2.2)]), rt.V.str("M")])]));
      rt.frameLine(66);
      let sv = rt.V.array(rt.GArray.of([rt.vector2iNew([rt.V.int(3), rt.V.int(1)]), rt.vector2iNew([rt.V.int(1), rt.V.int(2)]), rt.vector2iNew([rt.V.int(3), rt.V.int(0)])]));
      rt.frameLine(67);
      rt.method(sv, "sort", []);
      rt.frameLine(68);
      print(rt.showArgs([sv, rt.V.str(" "), rt.method(sv, "has", [rt.vector2iNew([rt.V.int(1), rt.V.int(2)])]), rt.V.str(" "), rt.method(sv, "count", [rt.vector2iNew([rt.V.float(1), rt.V.float(2)])])]));
      rt.frameLine(69);
      this.bump(v);
      rt.frameLine(70);
      print(rt.showArgs([v]));
      rt.frameLine(71);
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
      case "bump": return rt.wrapValue(this.bump(args[0] as rt.Variant));
      case "_initialize": return rt.wrapValue(this.__gd__initialize());
      default: return super.__gdDispatch(name, args);
    }
  }

}

const __gd_d_Main = rt.defineClass(Main, () => new Main(), (o) => o instanceof Main);
rt.registerScriptProps(__gd_d_Main, ["m"], (o) => { const s = o as Main; return [s.m]; });
rt.registerDictIdentity(__gd_d_Main, "res://main.gd", "", ["m"], {}, (o) => { const s = o as Main; return [s.m]; });
rt.registerMethodArities(__gd_d_Main, { "bump": [1, 1], "_initialize": [0, 0] });
rt.registerNativeBase(__gd_d_Main, "SceneTree");
rt.registerScriptLabel(__gd_d_Main, "main.gd");
rt.registerScript("res://main.gd", __gd_d_Main);
const __gd_entry = new Main();
try {
  await __gd_entry.run();
} catch (__gd_e) {
  rt.reportRunFailure(__gd_e);
}
