// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../packages/runtime/src/runtime/index";
import { print, printJoined, printRaw, printErr, printVerbose, printRich, printDebug, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
  declare m: rt.Variant;

  __gd_fields__() {
    const __gd_frame = rt.frameEnter("res://main.gd", "@implicit_new");
    try {
      rt.frameLine(3);
      this.m = rt.toVec3(rt.vector3New([rt.V.int(1), rt.V.int(2), rt.V.int(3)]));
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
      p = rt.paramSlot(p, "Vector3", 1, "bump", this);
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
  
  make(): rt.Variant {
    const __gd_frame = rt.frameEnter("res://main.gd", "make");
    try {
      rt.frameLine(10);
      let t = rt.vector3New([rt.V.int(1), rt.V.int(2), rt.V.int(3)]);
      rt.frameLine(11);
      return t;
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return rt.vector3(0, 0, 0);
    } finally {
      rt.frameExit(__gd_frame);
    }
      return rt.V.nil();
  }
  
    override _initialize(): Promise<void> { return this.__gd__initialize(); }
  async __gd__initialize(): Promise<void> {
    const __gd_frame = rt.frameEnter("res://main.gd", "_initialize");
    try {
      rt.frameLine(14);
      let v = rt.vector3New([rt.V.int(1), rt.V.int(2), rt.V.int(3)]);
      rt.frameLine(15);
      print(rt.showArgs([v, rt.V.str(" "), rt.vector3New([]), rt.V.str(" "), rt.vector3New([v])]));
      rt.frameLine(16);
      print(rt.showArgs([rt.wrapValue(rt.attribute(v, "x")), rt.V.str(" "), rt.wrapValue(rt.attribute(v, "y")), rt.V.str(" "), rt.wrapValue(rt.attribute(v, "z")), rt.V.str(" "), rt.wrapValue(rt.index(v, rt.V.int(0))), rt.V.str(" "), rt.wrapValue(rt.index(v, rt.V.int(2))), rt.V.str(" "), rt.wrapValue(rt.index(v, rt.V.str("y")))]));
      rt.frameLine(17);
      print(rt.showArgs([rt.wrapValue(rt.attribute(rt.vector3New([rt.V.float(0.1), rt.V.int(0), rt.V.int(0)]), "x"))]));
      rt.frameLine(18);
      print(rt.showArgs([rt.ops.add(rt.vector3New([rt.V.int(1), rt.V.int(2), rt.V.int(3)]), rt.vector3New([rt.V.float(0.5), rt.V.int(0), rt.V.int(0)])), rt.V.str(" | "), rt.ops.sub(rt.vector3New([rt.V.int(1), rt.V.int(2), rt.V.int(3)]), rt.vector3New([rt.V.int(1), rt.V.int(1), rt.V.int(1)]))]));
      rt.frameLine(19);
      print(rt.showArgs([rt.ops.mul(rt.vector3New([rt.V.int(1), rt.V.int(2), rt.V.int(3)]), rt.V.float(2.5)), rt.V.str(" | "), rt.ops.mul(rt.vector3New([rt.V.int(2), rt.V.int(3), rt.V.int(4)]), rt.vector3New([rt.V.float(0.5), rt.V.int(1), rt.V.int(2)])), rt.V.str(" | "), rt.ops.div(rt.vector3New([rt.V.int(2), rt.V.int(3), rt.V.int(4)]), rt.V.int(2)), rt.V.str(" | "), rt.ops.div(rt.vector3New([rt.V.int(2), rt.V.int(3), rt.V.int(4)]), rt.vector3New([rt.V.int(2), rt.V.int(3), rt.V.int(4)]))]));
      rt.frameLine(20);
      print(rt.showArgs([rt.ops.neg(rt.vector3New([rt.V.int(1), rt.V.int(2), rt.V.int(3)]))]));
      rt.frameLine(21);
      let w = v;
      rt.frameLine(22);
      {
        const _nv = rt.writeProp(w, "z", rt.V.int(9));
        if (_nv !== null) w = _nv;
      }
      rt.frameLine(23);
      print(rt.showArgs([v, rt.V.str(" "), w]));
      rt.frameLine(24);
      let a = rt.V.array(rt.GArray.of([rt.vector3New([rt.V.int(1), rt.V.int(2), rt.V.int(3)])]));
      rt.frameLine(25);
      {
      const _w0 = rt.V.int(0);
        const _nv = rt.writeProp(rt.index(a, _w0), "x", rt.V.int(5));
        if (_nv !== null) rt.setIndex(a, _w0, _nv);
      }
      rt.frameLine(26);
      print(rt.showArgs([a]));
      rt.frameLine(27);
      let d = rt.dictOf([[rt.V.str("k"), rt.vector3New([rt.V.int(1), rt.V.int(2), rt.V.int(3)])]]);
      rt.frameLine(28);
      {
      const _w0 = rt.V.str("k");
        const _nv = rt.writeProp(rt.index(d, _w0), "y", rt.V.int(8));
        if (_nv !== null) rt.setIndex(d, _w0, _nv);
      }
      rt.frameLine(29);
      print(rt.showArgs([d]));
      rt.frameLine(30);
      {
        const _nv = rt.writeProp(this.m, "x", rt.V.int(4));
        if (_nv !== null) this.m = _nv;
      }
      rt.frameLine(31);
      print(rt.showArgs([this.m]));
      rt.frameLine(32);
      {
        const _nv = rt.writeIdx(v, rt.V.int(1), rt.V.float(2.5));
        if (_nv !== null) v = _nv;
      }
      rt.frameLine(33);
      {
        const _nv = rt.writeIdx(v, rt.V.str("z"), rt.V.int(1));
        if (_nv !== null) v = _nv;
      }
      rt.frameLine(34);
      print(rt.showArgs([v, rt.V.str(" "), rt.wrapValue(rt.attribute(v, "y"))]));
      rt.frameLine(35);
      print(rt.showArgs([rt.ops.lt(rt.vector3New([rt.V.int(1), rt.V.int(2), rt.V.int(3)]), rt.vector3New([rt.V.int(1), rt.V.int(2), rt.V.int(4)])), rt.V.str(" "), rt.ops.lt(rt.vector3New([rt.V.int(1), rt.V.int(3), rt.V.int(0)]), rt.vector3New([rt.V.int(2), rt.V.int(0), rt.V.int(0)])), rt.V.str(" "), rt.ops.lt(rt.vector3New([rt.V.int(0), rt.V.int(1), rt.V.int(9)]), rt.vector3New([rt.V.int(0), rt.V.int(2), rt.V.int(0)])), rt.V.str(" "), rt.ops.lte(rt.vector3New([rt.V.int(1), rt.V.int(2), rt.V.int(3)]), rt.vector3New([rt.V.int(1), rt.V.int(2), rt.V.int(3)])), rt.V.str(" "), rt.ops.gte(rt.vector3New([rt.V.int(1), rt.V.int(2), rt.V.int(3)]), rt.vector3New([rt.V.int(1), rt.V.int(2), rt.V.int(4)]))]));
      rt.frameLine(36);
      print(rt.showArgs([rt.ops.eq(rt.vector3New([rt.V.int(1), rt.V.int(2), rt.V.int(3)]), rt.vector3New([rt.V.int(1), rt.V.int(2), rt.V.float(3.0000001)])), rt.V.str(" "), rt.ops.eq(rt.vector3New([rt.V.float((0.1 + 0.2)), rt.V.int(0), rt.V.int(0)]), rt.vector3New([rt.V.float(0.3), rt.V.int(0), rt.V.int(0)])), rt.V.str(" "), rt.ops.neq(rt.vector3New([rt.V.int(1), rt.V.int(2), rt.V.int(3)]), rt.V.nil()), rt.V.str(" "), rt.ops.eq(rt.vector3New([rt.V.int(1), rt.V.int(2), rt.V.int(3)]), rt.V.nil())]));
      rt.frameLine(37);
      print(rt.showArgs([rt.vector3Const("UP"), rt.V.str(" "), rt.vector3Const("DOWN"), rt.V.str(" "), rt.vector3Const("LEFT"), rt.V.str(" "), rt.vector3Const("RIGHT"), rt.V.str(" "), rt.vector3Const("FORWARD"), rt.V.str(" "), rt.vector3Const("BACK"), rt.V.str(" "), rt.vector3Const("ONE"), rt.V.str(" "), rt.vector3Const("ZERO"), rt.V.str(" "), rt.vector3Const("INF")]));
      rt.frameLine(38);
      print(rt.showArgs([rt.method(v, "length", []), rt.V.str(" "), rt.method(v, "length_squared", []), rt.V.str(" "), rt.method(rt.vector3New([rt.V.int(3), rt.V.int(4), rt.V.int(0)]), "length", [])]));
      rt.frameLine(39);
      print(rt.showArgs([rt.method(rt.vector3New([rt.V.int(1), rt.V.int(0), rt.V.int(0)]), "dot", [rt.vector3New([rt.V.int(0), rt.V.int(1), rt.V.int(0)])]), rt.V.str(" "), rt.method(rt.vector3New([rt.V.int(1), rt.V.int(0), rt.V.int(0)]), "cross", [rt.vector3New([rt.V.int(0), rt.V.int(1), rt.V.int(0)])]), rt.V.str(" "), rt.method(rt.vector3New([rt.V.int(1), rt.V.int(2), rt.V.int(3)]), "cross", [rt.vector3New([rt.V.int(0), rt.V.int(1), rt.V.int(0)])])]));
      rt.frameLine(40);
      print(rt.showArgs([rt.method(rt.vector3New([rt.V.int(3), rt.V.int(4), rt.V.int(0)]), "normalized", []), rt.V.str(" "), rt.method(rt.vector3Const("ZERO"), "normalized", []), rt.V.str(" "), rt.method(rt.vector3New([rt.V.int(1), rt.V.int(2), rt.V.int(3)]), "limit_length", [rt.V.float(1)]), rt.V.str(" "), rt.method(rt.vector3New([rt.V.float(0.1), rt.V.float(0.2), rt.V.float(0.3)]), "limit_length", [rt.V.float(10)])]));
      rt.frameLine(41);
      print(rt.showArgs([rt.method(rt.vector3New([rt.V.int(1), rt.V.int(2), rt.V.int(3)]), "lerp", [rt.vector3New([rt.V.int(2), rt.V.int(3), rt.V.int(4)]), rt.V.float(0.5)]), rt.V.str(" "), rt.method(rt.vector3New([rt.V.int(1), rt.V.int(2), rt.V.int(3)]), "distance_to", [rt.vector3New([rt.V.int(1), rt.V.int(2), rt.V.int(4)])]), rt.V.str(" "), rt.method(rt.vector3New([rt.V.int(1), rt.V.int(2), rt.V.int(3)]), "distance_squared_to", [rt.vector3New([rt.V.int(1), rt.V.int(2), rt.V.int(4)])]), rt.V.str(" "), rt.method(rt.vector3New([rt.V.int(1), rt.V.int(2), rt.V.int(3)]), "direction_to", [rt.vector3New([rt.V.int(1), rt.V.int(2), rt.V.int(4)])])]));
      rt.frameLine(42);
      print(rt.showArgs([rt.method(rt.vector3New([rt.V.float((-1.5)), rt.V.int(2), rt.V.int((-3))]), "abs", []), rt.V.str(" "), rt.method(rt.vector3New([rt.V.float((-1.5)), rt.V.int(0), rt.V.int(3)]), "sign", []), rt.V.str(" "), rt.method(rt.vector3New([rt.V.float(1.7), rt.V.float((-1.2)), rt.V.float(0.5)]), "floor", []), rt.V.str(" "), rt.method(rt.vector3New([rt.V.float(1.7), rt.V.float((-1.2)), rt.V.float(0.5)]), "ceil", []), rt.V.str(" "), rt.method(rt.vector3New([rt.V.float(1.5), rt.V.float(2.5), rt.V.float((-0.5))]), "round", []), rt.V.str(" "), rt.method(rt.vector3New([rt.V.float((-1.5)), rt.V.float((-2.5)), rt.V.float(3.5)]), "round", [])]));
      rt.frameLine(43);
      print(rt.showArgs([rt.method(rt.vector3New([rt.V.float(1.2), rt.V.float(2.6), rt.V.float(3.1)]), "snapped", [rt.vector3New([rt.V.float(0.5), rt.V.float(0.5), rt.V.float(0.5)])]), rt.V.str(" "), rt.method(rt.vector3New([rt.V.float(1.4), rt.V.float(2.6), rt.V.float(3.1)]), "snappedf", [rt.V.float(1)])]));
      rt.frameLine(44);
      print(rt.showArgs([rt.method(rt.vector3New([rt.V.int(1), rt.V.int(2), rt.V.int(3)]), "clamp", [rt.vector3New([rt.V.float(1.5), rt.V.float(1.5), rt.V.float(1.5)]), rt.vector3New([rt.V.float(2.5), rt.V.float(2.5), rt.V.float(2.5)])]), rt.V.str(" "), rt.method(rt.vector3New([rt.V.int(1), rt.V.int(2), rt.V.int(3)]), "min", [rt.vector3New([rt.V.int(2), rt.V.int(1), rt.V.int(5)])]), rt.V.str(" "), rt.method(rt.vector3New([rt.V.int(1), rt.V.int(2), rt.V.int(3)]), "max", [rt.vector3New([rt.V.int(2), rt.V.int(1), rt.V.int(5)])])]));
      rt.frameLine(45);
      print(rt.showArgs([rt.method(rt.vector3New([rt.V.int(0), rt.V.int(1), rt.V.int(0)]), "angle_to", [rt.vector3New([rt.V.int(1), rt.V.int(0), rt.V.int(0)])])]));
      rt.frameLine(46);
      print(rt.showArgs([rt.method(rt.vector3New([rt.V.int(1), rt.V.int(2), rt.V.int(3)]), "cubic_interpolate", [rt.vector3New([rt.V.int(2), rt.V.int(2), rt.V.int(2)]), rt.vector3New([rt.V.int(3), rt.V.int(3), rt.V.int(3)]), rt.vector3New([rt.V.int(4), rt.V.int(4), rt.V.int(4)]), rt.V.float(0.5)])]));
      rt.frameLine(47);
      print(rt.showArgs([rt.method(rt.vector3New([rt.V.int(1), rt.V.int(2), rt.V.int(3)]), "min_axis_index", []), rt.method(rt.vector3New([rt.V.int(1), rt.V.int(2), rt.V.int(3)]), "max_axis_index", [])]));
      rt.frameLine(48);
      print(rt.showArgs([rt.method(rt.vector3New([rt.V.int(1), rt.V.int(2), rt.V.int(3)]), "is_equal_approx", [rt.vector3New([rt.V.float(1.0000095), rt.V.int(2), rt.V.int(3)])]), rt.V.str(" "), rt.method(rt.vector3New([rt.V.int(1), rt.V.int(2), rt.V.int(3)]), "is_equal_approx", [rt.vector3New([rt.V.float(1.00001), rt.V.int(2), rt.V.int(3)])])]));
      rt.frameLine(49);
      print(rt.showArgs([rt.method(rt.vector3New([rt.V.int(3), rt.V.int(4), rt.V.int(5)]), "is_equal_approx", [rt.vector3New([rt.V.float(3.000029), rt.V.int(4), rt.V.int(5)])]), rt.V.str(" "), rt.method(rt.vector3New([rt.V.int(3), rt.V.int(4), rt.V.int(5)]), "is_equal_approx", [rt.vector3New([rt.V.float(3.000031), rt.V.int(4), rt.V.int(5)])])]));
      rt.frameLine(50);
      print(rt.showArgs([rt.method(rt.vector3New([rt.V.float(0.001), rt.V.int(0), rt.V.int(0)]), "is_equal_approx", [rt.vector3New([rt.V.float(0.0010002), rt.V.int(0), rt.V.int(0)])]), rt.V.str(" "), rt.method(rt.vector3New([rt.V.int(1), rt.V.int(2), rt.V.int(3)]), "is_equal_approx", [rt.vector3New([rt.V.int(1), rt.V.int(2), rt.V.int(3)])])]));
      rt.frameLine(51);
      print(rt.showArgs([rt.method(rt.vector3New([rt.V.int(1), rt.V.int(1), rt.V.int(1)]), "is_normalized", []), rt.V.str(" "), rt.method(rt.vector3New([rt.V.int(1), rt.V.int(0), rt.V.int(0)]), "is_normalized", []), rt.V.str(" "), rt.method(rt.vector3New([rt.V.float(0.7071067811865475), rt.V.float(0.7071067811865475), rt.V.int(0)]), "is_normalized", [])]));
      rt.frameLine(52);
      print(rt.showArgs([rt.method(rt.vector3New([rt.V.float(1e+300), rt.V.int(0), rt.V.int(0)]), "is_finite", []), rt.V.str(" "), rt.method(rt.vector3New([rt.V.int(1), rt.V.int(2), rt.V.int(3)]), "is_finite", [])]));
      rt.frameLine(53);
      print(rt.showArgs([rt.typeOf(v), rt.V.str(" "), rt.isType(v, "Vector3"), rt.V.str(" "), rt.isType(v, "Vector2"), rt.V.str(" "), rt.strBuiltin([v])]));
      rt.frameLine(54);
      let dd = rt.dictOf([]);
      rt.frameLine(55);
      {
        const _nv = rt.writeIdx(dd, rt.vector3New([rt.V.int(1), rt.V.int(2), rt.V.int(3)]), rt.V.int(5));
        if (_nv !== null) dd = _nv;
      }
      rt.frameLine(56);
      print(rt.showArgs([dd, rt.V.str(" "), rt.method(dd, "get", [rt.vector3New([rt.V.float(1), rt.V.float(2), rt.V.float(3)]), rt.V.str("M")]), rt.V.str(" "), rt.method(dd, "has", [rt.vector3New([rt.V.int(9), rt.V.int(2), rt.V.int(3)])])]));
      rt.frameLine(57);
      let ta = rt.stampArray(rt.V.array(rt.GArray.of([])), "Vector3", true);
      rt.frameLine(58);
      rt.method(ta, "resize", [rt.V.int(2)]);
      rt.frameLine(59);
      print(rt.showArgs([ta]));
      rt.frameLine(60);
      {
        const _nv = rt.writeIdx(ta, rt.V.int(0), rt.vector3New([rt.V.int(1), rt.V.int(2), rt.V.int(3)]));
        if (_nv !== null) ta = _nv;
      }
      rt.frameLine(61);
      print(rt.showArgs([ta, rt.V.str(" "), rt.wrapValue(rt.attribute(rt.wrapValue(rt.index(ta, rt.V.int(0), "Array[Vector3]")), "z"))]));
      rt.frameLine(62);
      let sv = rt.V.array(rt.GArray.of([rt.vector3New([rt.V.int(3), rt.V.int(1), rt.V.int(0)]), rt.vector3New([rt.V.int(1), rt.V.int(2), rt.V.int(3)]), rt.vector3New([rt.V.int(2), rt.V.int(0), rt.V.int(0)])]));
      rt.frameLine(63);
      rt.method(sv, "sort", []);
      rt.frameLine(64);
      print(rt.showArgs([sv]));
      rt.frameLine(65);
      print(rt.showArgs([rt.method(sv, "has", [rt.vector3New([rt.V.int(3), rt.V.int(1), rt.V.int(0)])]), rt.V.str(" "), rt.method(sv, "count", [rt.vector3New([rt.V.float(1), rt.V.float(2), rt.V.float(3)])])]));
      rt.frameLine(66);
      this.bump(v);
      rt.frameLine(67);
      print(rt.showArgs([v]));
      rt.frameLine(68);
      let r = this.make();
      rt.frameLine(69);
      {
        const _nv = rt.writeProp(r, "x", rt.V.int(3));
        if (_nv !== null) r = _nv;
      }
      rt.frameLine(70);
      print(rt.showArgs([r, rt.V.str(" "), this.make()]));
      rt.frameLine(71);
      let arr2 = rt.V.array(rt.GArray.of([rt.vector3New([rt.V.int(1), rt.V.int(2), rt.V.int(3)])]));
      rt.frameLine(72);
      for (let x of rt.iter(arr2)) {
        rt.frameLine(73);
        {
          const _nv = rt.writeProp(x, "z", rt.V.int(100));
          if (_nv !== null) x = _nv;
        }
      }
      rt.frameLine(74);
      print(rt.showArgs([arr2]));
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
      case "bump": return rt.wrapValue(this.bump(args[0] as rt.Variant));
      case "make": return rt.wrapValue(this.make());
      case "_initialize": return rt.wrapValue(this.__gd__initialize());
      default: return super.__gdDispatch(name, args);
    }
  }

}

const __gd_d_Main = rt.defineClass(Main, () => new Main(), (o) => o instanceof Main);
rt.registerScriptProps(__gd_d_Main, ["m"], (o) => { const s = o as Main; return [s.m]; });
rt.registerDictIdentity(__gd_d_Main, "res://main.gd", "", ["m"], {}, (o) => { const s = o as Main; return [s.m]; });
rt.registerMethodArities(__gd_d_Main, { "bump": [1, 1], "make": [0, 0], "_initialize": [0, 0] });
rt.registerMethodParams(__gd_d_Main, { "bump": ["Vector3"] });
rt.registerNativeBase(__gd_d_Main, "SceneTree");
rt.registerScriptLabel(__gd_d_Main, "main.gd");
rt.registerScript("res://main.gd", __gd_d_Main);
const __gd_entry = new Main();
try {
  await __gd_entry.run();
} catch (__gd_e) {
  rt.reportRunFailure(__gd_e);
}
