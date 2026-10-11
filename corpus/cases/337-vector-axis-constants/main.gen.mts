// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../packages/runtime/src/runtime/index";
import { print, printJoined, printRaw, printErr, printVerbose, printRich, printDebug, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
    override _initialize(): Promise<void> { return this.__gd__initialize(); }
  async __gd__initialize(): Promise<void> {
    print(rt.showArgs([rt.V.str("V|Vector2.AXIS_X||"), rt.vector2Const("AXIS_X"), rt.V.str(" | "), rt.typeOf(rt.vector2Const("AXIS_X"))]));
    print(rt.showArgs([rt.V.str("V|Vector2.AXIS_Y||"), rt.vector2Const("AXIS_Y"), rt.V.str(" | "), rt.typeOf(rt.vector2Const("AXIS_Y"))]));
    print(rt.showArgs([rt.V.str("V|Vector2i.AXIS_X||"), rt.vector2iConst("AXIS_X"), rt.V.str(" | "), rt.typeOf(rt.vector2iConst("AXIS_X"))]));
    print(rt.showArgs([rt.V.str("V|Vector2i.AXIS_Y||"), rt.vector2iConst("AXIS_Y"), rt.V.str(" | "), rt.typeOf(rt.vector2iConst("AXIS_Y"))]));
    print(rt.showArgs([rt.V.str("V|Vector3.AXIS_X||"), rt.vector3Const("AXIS_X"), rt.V.str(" | "), rt.typeOf(rt.vector3Const("AXIS_X"))]));
    print(rt.showArgs([rt.V.str("V|Vector3.AXIS_Y||"), rt.vector3Const("AXIS_Y"), rt.V.str(" | "), rt.typeOf(rt.vector3Const("AXIS_Y"))]));
    print(rt.showArgs([rt.V.str("V|Vector3.AXIS_Z||"), rt.vector3Const("AXIS_Z"), rt.V.str(" | "), rt.typeOf(rt.vector3Const("AXIS_Z"))]));
    print(rt.showArgs([rt.V.str("V|Vector3i.AXIS_X||"), rt.vector3iConst("AXIS_X"), rt.V.str(" | "), rt.typeOf(rt.vector3iConst("AXIS_X"))]));
    print(rt.showArgs([rt.V.str("V|Vector3i.AXIS_Y||"), rt.vector3iConst("AXIS_Y"), rt.V.str(" | "), rt.typeOf(rt.vector3iConst("AXIS_Y"))]));
    print(rt.showArgs([rt.V.str("V|Vector3i.AXIS_Z||"), rt.vector3iConst("AXIS_Z"), rt.V.str(" | "), rt.typeOf(rt.vector3iConst("AXIS_Z"))]));
    print(rt.showArgs([rt.V.str("M|算式||"), rt.ops.sub(rt.vector3Const("AXIS_X"), rt.V.int(1)), rt.V.str(" | "), rt.ops.mul(rt.vector3Const("AXIS_Z"), rt.V.int(2)), rt.V.str(" | "), rt.ops.eq(rt.vector2Const("AXIS_Y"), rt.V.int(1))]));
    print(rt.showArgs([rt.V.str("M|数组||"), rt.V.array(rt.GArray.of([rt.vector3Const("AXIS_X"), rt.vector3Const("AXIS_Y"), rt.vector3Const("AXIS_Z")])), rt.V.str(" | "), rt.V.array(rt.GArray.of([rt.vector2iConst("AXIS_X"), rt.vector2iConst("AXIS_Y")]))]));
    let i = rt.toInt(rt.vector3Const("AXIS_Y"));
    print(rt.showArgs([rt.V.str("T|int 标注||"), i]));
    let v = rt.vector2iConst("AXIS_X");
    print(rt.showArgs([rt.V.str("T|推断||"), v, rt.V.str(" | "), rt.typeOf(v)]));
    let vv = rt.vector3New([rt.V.int(10), rt.V.int(20), rt.V.int(30)]);
    print(rt.showArgs([rt.V.str("T|v3 下标||"), rt.wrapValue(rt.index(vv, rt.vector3Const("AXIS_Y")))]));
    let v2 = rt.vector2New([rt.V.float(7.5), rt.V.float(2.5)]);
    print(rt.showArgs([rt.V.str("T|v2 下标||"), rt.wrapValue(rt.index(v2, rt.vector2Const("AXIS_X"))), rt.V.str(" | "), rt.wrapValue(rt.index(v2, rt.vector2Const("AXIS_Y")))]));
    let v2i = rt.vector2iNew([rt.V.int((-3)), rt.V.int(5)]);
    print(rt.showArgs([rt.V.str("T|v2i 下标||"), rt.wrapValue(rt.index(v2i, rt.vector2iConst("AXIS_Y")))]));
    let v3i = rt.vector3iNew([rt.V.int(4), rt.V.int(5), rt.V.int(6)]);
    print(rt.showArgs([rt.V.str("T|v3i 下标||"), rt.wrapValue(rt.index(v3i, rt.vector3iConst("AXIS_Z")))]));
    print(rt.showArgs([rt.V.str("A|arm0||"), this.g(rt.V.int(0))]));
    print(rt.showArgs([rt.V.str("A|arm1||"), this.g(rt.V.int(1))]));
    print(rt.showArgs([rt.V.str("A|arm2||"), this.g(rt.V.int(2))]));
    print(rt.showArgs([rt.V.str("A|arm3||"), this.g(rt.V.int(3))]));
    this.quit();
  }
  
  g(q: rt.Variant): void {
    do {
      const __m0 = rt.matchPattern(q, rt.patConst(rt.vector3Const("AXIS_X")));
      if (__m0 !== null) {
        return rt.V.str("x");
        break;
      }
      const __m1 = rt.matchPattern(q, rt.patConst(rt.vector3iConst("AXIS_Y")));
      if (__m1 !== null) {
        return rt.V.str("y");
        break;
      }
      const __m2 = rt.matchPattern(q, rt.patConst(rt.vector3Const("AXIS_Z")));
      if (__m2 !== null && rt.ops.truthy(rt.ops.eq(q, rt.V.int(2)))) {
        return rt.V.str("z-guard");
        break;
      }
      const __m3 = rt.matchPattern(q, rt.patWild());
      if (__m3 !== null) {
        return rt.V.str("none");
        break;
      }
    } while (false);
  }
  
  override __gdDispatch(name: string, args: rt.Variant[]): rt.Variant | null {
    switch (name) {
      case "_initialize": return rt.wrapValue(this.__gd__initialize());
      case "g": return rt.wrapValue(this.g(args[0] as rt.Variant));
      default: return super.__gdDispatch(name, args);
    }
  }

}

const __gd_d_Main = rt.defineClass(Main, () => new Main(), (o) => o instanceof Main);
rt.registerDictIdentity(__gd_d_Main, "res://main.gd", "", [], {}, (o) => { const s = o as Main; return []; });
rt.registerMethodArities(__gd_d_Main, { "_initialize": [0, 0], "g": [1, 1] });
rt.registerNativeBase(__gd_d_Main, "SceneTree");
rt.registerScriptLabel(__gd_d_Main, "main.gd");
rt.registerScript("res://main.gd", __gd_d_Main);
const __gd_entry = new Main();
try {
  await __gd_entry.run();
} catch (__gd_e) {
  rt.reportRunFailure(__gd_e);
}
