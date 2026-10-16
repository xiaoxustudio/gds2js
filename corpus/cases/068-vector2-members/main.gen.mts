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
      let a = rt.vector2New([rt.V.int(3), rt.V.int(4)]);
      rt.frameLine(5);
      let b = rt.vector2New([rt.V.int((-1)), rt.V.int(2)]);
      rt.frameLine(6);
      print(rt.showArgs([rt.vector2Const("ZERO")]));
      rt.frameLine(7);
      print(rt.showArgs([rt.vector2Const("ONE")]));
      rt.frameLine(8);
      print(rt.showArgs([rt.vector2Const("INF")]));
      rt.frameLine(9);
      print(rt.showArgs([rt.vector2Const("LEFT")]));
      rt.frameLine(10);
      print(rt.showArgs([rt.vector2Const("RIGHT")]));
      rt.frameLine(11);
      print(rt.showArgs([rt.vector2Const("UP")]));
      rt.frameLine(12);
      print(rt.showArgs([rt.vector2Const("DOWN")]));
      rt.frameLine(13);
      let d = rt.toVec2(rt.vector2(0, 0));
      rt.frameLine(14);
      print(rt.showArgs([d]));
      rt.frameLine(15);
      print(rt.showArgs([rt.vector2New([])]));
      rt.frameLine(16);
      print(rt.showArgs([rt.ops.add(a, b)]));
      rt.frameLine(17);
      print(rt.showArgs([rt.ops.sub(a, b)]));
      rt.frameLine(18);
      print(rt.showArgs([rt.ops.mul(a, b)]));
      rt.frameLine(19);
      print(rt.showArgs([rt.ops.div(a, b)]));
      rt.frameLine(20);
      print(rt.showArgs([rt.ops.mul(a, rt.V.float(2.5))]));
      rt.frameLine(21);
      print(rt.showArgs([rt.ops.mul(rt.V.float(2.5), a)]));
      rt.frameLine(22);
      print(rt.showArgs([rt.ops.div(a, rt.V.float(2.5))]));
      rt.frameLine(23);
      print(rt.showArgs([rt.ops.neg(a)]));
      rt.frameLine(24);
      print(rt.showArgs([rt.ops.eq(a, b)]));
      rt.frameLine(25);
      print(rt.showArgs([rt.ops.neq(a, b)]));
      rt.frameLine(26);
      print(rt.showArgs([rt.ops.lt(a, b)]));
      rt.frameLine(27);
      print(rt.showArgs([rt.ops.gt(a, b)]));
      rt.frameLine(28);
      print(rt.showArgs([rt.ops.lte(a, a)]));
      rt.frameLine(29);
      print(rt.showArgs([rt.ops.gte(a, a)]));
      rt.frameLine(30);
      print(rt.showArgs([rt.ops.lt(a, rt.vector2New([rt.V.int(2), rt.V.int(5)]))]));
      rt.frameLine(31);
      print(rt.showArgs([rt.ops.gt(a, rt.vector2New([rt.V.int(2), rt.V.int(5)]))]));
      rt.frameLine(32);
      print(rt.showArgs([rt.wrapValue(rt.index(a, rt.V.int(0)))]));
      rt.frameLine(33);
      print(rt.showArgs([rt.wrapValue(rt.index(a, rt.V.int(1)))]));
      rt.frameLine(34);
      print(rt.showArgs([rt.wrapValue(rt.attribute(a, "x"))]));
      rt.frameLine(35);
      print(rt.showArgs([rt.wrapValue(rt.attribute(a, "y"))]));
      rt.frameLine(36);
      print(rt.showArgs([rt.method(a, "length", [])]));
      rt.frameLine(37);
      print(rt.showArgs([rt.method(a, "length_squared", [])]));
      rt.frameLine(38);
      print(rt.showArgs([rt.method(a, "normalized", [])]));
      rt.frameLine(39);
      print(rt.showArgs([rt.method(rt.vector2New([rt.V.int(0), rt.V.int(0)]), "normalized", [])]));
      rt.frameLine(40);
      print(rt.showArgs([rt.method(rt.vector2New([rt.V.float(1000000000000000), rt.V.int(1)]), "normalized", [])]));
      rt.frameLine(41);
      print(rt.showArgs([rt.method(a, "dot", [b])]));
      rt.frameLine(42);
      print(rt.showArgs([rt.method(rt.vector2New([rt.V.float(0.1), rt.V.float(0.2)]), "dot", [rt.vector2New([rt.V.float(0.1), rt.V.float(0.2)])])]));
      rt.frameLine(43);
      print(rt.showArgs([rt.method(a, "cross", [b])]));
      rt.frameLine(44);
      print(rt.showArgs([rt.method(a, "distance_to", [b])]));
      rt.frameLine(45);
      print(rt.showArgs([rt.method(a, "distance_squared_to", [b])]));
      rt.frameLine(46);
      print(rt.showArgs([rt.method(a, "direction_to", [b])]));
      rt.frameLine(47);
      print(rt.showArgs([rt.method(a, "angle", [])]));
      rt.frameLine(48);
      print(rt.showArgs([rt.method(rt.vector2New([rt.V.int(0), rt.V.int(0)]), "angle", [])]));
      rt.frameLine(49);
      print(rt.showArgs([rt.method(rt.vector2New([rt.V.int((-3)), rt.V.int((-4))]), "angle", [])]));
      rt.frameLine(50);
      print(rt.showArgs([rt.method(a, "angle_to", [b])]));
      rt.frameLine(51);
      print(rt.showArgs([rt.method(a, "angle_to", [rt.vector2New([rt.V.int(0), rt.V.int(0)])])]));
      rt.frameLine(52);
      print(rt.showArgs([rt.method(a, "angle_to_point", [b])]));
      rt.frameLine(53);
      print(rt.showArgs([rt.method(a, "abs", [])]));
      rt.frameLine(54);
      print(rt.showArgs([rt.method(a, "sign", [])]));
      rt.frameLine(55);
      print(rt.showArgs([rt.method(rt.vector2New([rt.V.int(0), rt.V.int(0)]), "sign", [])]));
      rt.frameLine(56);
      print(rt.showArgs([rt.method(rt.vector2New([rt.V.int((-3)), rt.V.int((-4))]), "sign", [])]));
      rt.frameLine(57);
      print(rt.showArgs([rt.method(rt.vector2New([rt.V.float(1.5), rt.V.float((-2.5))]), "floor", [])]));
      rt.frameLine(58);
      print(rt.showArgs([rt.method(rt.vector2New([rt.V.float(1.5), rt.V.float((-2.5))]), "ceil", [])]));
      rt.frameLine(59);
      print(rt.showArgs([rt.method(rt.vector2New([rt.V.float(1.5), rt.V.float((-2.5))]), "round", [])]));
      rt.frameLine(60);
      print(rt.showArgs([rt.method(rt.vector2New([rt.V.float(2.5), rt.V.float((-0.5))]), "round", [])]));
      rt.frameLine(61);
      print(rt.showArgs([rt.method(rt.vector2New([rt.V.float(3.5), rt.V.float((-3.5))]), "round", [])]));
      rt.frameLine(62);
      print(rt.showArgs([rt.method(rt.vector2New([rt.V.float(2.5), rt.V.float((-0.5))]), "snapped", [rt.vector2New([rt.V.int(1), rt.V.int(1)])])]));
      rt.frameLine(63);
      print(rt.showArgs([rt.method(rt.vector2New([rt.V.int(1), rt.V.int(1)]), "snapped", [rt.vector2New([rt.V.int(3), rt.V.int(3)])])]));
      rt.frameLine(64);
      print(rt.showArgs([rt.method(a, "snapped", [rt.vector2New([rt.V.int(0), rt.V.int(1)])])]));
      rt.frameLine(65);
      print(rt.showArgs([rt.method(a, "orthogonal", [])]));
      rt.frameLine(66);
      print(rt.showArgs([rt.method(rt.vector2New([rt.V.int((-3)), rt.V.int(4)]), "orthogonal", [])]));
      rt.frameLine(67);
      print(rt.showArgs([rt.method(a, "rotated", [rt.V.float(1)])]));
      rt.frameLine(68);
      print(rt.showArgs([rt.method(rt.vector2New([rt.V.int(1), rt.V.int(0)]), "rotated", [rt.V.float((-1.5707963267949))])]));
      rt.frameLine(69);
      print(rt.showArgs([rt.method(a, "aspect", [])]));
      rt.frameLine(70);
      print(rt.showArgs([rt.method(rt.vector2New([rt.V.float(1.5), rt.V.float((-2.5))]), "aspect", [])]));
      rt.frameLine(71);
      print(rt.showArgs([rt.method(rt.vector2New([rt.V.int(0), rt.V.int(0)]), "aspect", [])]));
      rt.frameLine(72);
      print(rt.showArgs([rt.method(a, "lerp", [b, rt.V.float(0.5)])]));
      rt.frameLine(73);
      print(rt.showArgs([rt.method(a, "lerp", [b, rt.V.float(2)])]));
      rt.frameLine(74);
      print(rt.showArgs([rt.method(a, "move_toward", [b, rt.V.float(2)])]));
      rt.frameLine(75);
      print(rt.showArgs([rt.method(a, "move_toward", [b, rt.V.float(100)])]));
      rt.frameLine(76);
      print(rt.showArgs([rt.method(rt.vector2New([rt.V.int(0), rt.V.int(0)]), "move_toward", [rt.vector2New([rt.V.int(1), rt.V.int(1)]), rt.V.float(0.5)])]));
      rt.frameLine(77);
      print(rt.showArgs([rt.method(a, "limit_length", [rt.V.float(2)])]));
      rt.frameLine(78);
      print(rt.showArgs([rt.method(a, "limit_length", [rt.V.float(100)])]));
      rt.frameLine(79);
      print(rt.showArgs([rt.method(a, "is_finite", [])]));
      rt.frameLine(80);
      print(rt.showArgs([rt.method(rt.vector2Const("INF"), "is_finite", [])]));
      rt.frameLine(81);
      print(rt.showArgs([rt.method(rt.vector2Const("INF"), "length", [])]));
      rt.frameLine(82);
      print(rt.showArgs([rt.method(rt.vector2Const("INF"), "normalized", [])]));
      rt.frameLine(83);
      print(rt.showArgs([rt.vector2New([rt.V.float(100000000000000000000), rt.V.float((-100000000000000000000))])]));
      rt.frameLine(84);
      print(rt.showArgs([rt.vector2New([rt.V.float(0.9999999), rt.V.float(0.000001)])]));
      rt.frameLine(85);
      print(rt.showArgs([rt.vector2New([rt.V.float(1234567), rt.V.float(0.00001)])]));
      rt.frameLine(86);
      print(rt.showArgs([rt.vector2New([rt.V.float(1000000000000000), rt.V.float(1e-7)])]));
      rt.frameLine(87);
      print(rt.showArgs([rt.vector2New([rt.V.float(123456789.123), rt.V.float(1e-7)])]));
      rt.frameLine(88);
      print(rt.showArgs([rt.strBuiltin([a])]));
      rt.frameLine(89);
      print(rt.showArgs([rt.V.array(rt.GArray.of([a]))]));
      rt.frameLine(90);
      print(rt.showArgs([rt.dictOf([[rt.V.str("v"), a]])]));
      rt.frameLine(91);
      print(rt.showArgs([rt.isType(a, "Vector2")]));
      rt.frameLine(92);
      print(rt.showArgs([rt.typeOf(a)]));
      rt.frameLine(93);
      print(rt.showArgs([rt.asType(a, "Vector2")]));
      rt.frameLine(94);
      print(rt.showArgs([rt.ops.div(rt.vector2New([rt.V.int(1), rt.V.int(1)]), rt.vector2New([rt.V.int(0), rt.V.int(0)]))]));
      rt.frameLine(95);
      print(rt.showArgs([rt.ops.eq(rt.vector2New([rt.V.float(0.1), rt.V.int(0)]), rt.vector2New([rt.V.float(0.100000001), rt.V.int(0)]))]));
      rt.frameLine(96);
      print(rt.showArgs([rt.vector2New([rt.V.float((-0)), rt.V.int(5)])]));
      rt.frameLine(97);
      print(rt.showArgs([rt.vector2New([rt.V.float((-4e-7)), rt.V.float(6e-7)])]));
      rt.frameLine(98);
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
