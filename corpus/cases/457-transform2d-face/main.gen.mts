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
      let i = rt.transform2dNew([]);
      rt.frameLine(5);
      let t = rt.transform2dNew([rt.vector2New([rt.V.int(1), rt.V.int(0)]), rt.vector2New([rt.V.int(0), rt.V.int(1)]), rt.vector2New([rt.V.int(3), rt.V.int(4)])]);
      rt.frameLine(6);
      let r = rt.transform2dNew([rt.V.float(0.5), rt.vector2New([rt.V.int(1), rt.V.int(2)])]);
      rt.frameLine(7);
      print(rt.showArgs([rt.V.str("k01|"), rt.strBuiltin([i]), rt.V.str("|"), rt.strBuiltin([t]), rt.V.str("|"), rt.strBuiltin([r]), rt.V.str("|"), rt.typeOf(t)]));
      rt.frameLine(8);
      print(rt.showArgs([rt.V.str("k02|"), rt.wrapValue(rt.attribute(t, "x")), rt.V.str("|"), rt.wrapValue(rt.attribute(t, "y")), rt.V.str("|"), rt.wrapValue(rt.attribute(t, "origin")), rt.V.str("|"), rt.strBuiltin([rt.transform2dNew([rt.wrapValue(rt.attribute(r, "x")), rt.wrapValue(rt.attribute(r, "y")), rt.wrapValue(rt.attribute(r, "origin"))])])]));
      rt.frameLine(9);
      print(rt.showArgs([rt.V.str("k03|"), rt.method(t, "determinant", []), rt.V.str("|"), rt.method(r, "determinant", []), rt.V.str("|"), rt.method(t, "get_rotation", []), rt.V.str("|"), rt.strBuiltin([rt.method(t, "get_scale", [])])]));
      rt.frameLine(10);
      print(rt.showArgs([rt.V.str("k04|"), rt.strBuiltin([rt.method(t, "affine_inverse", [])]), rt.V.str("|"), rt.strBuiltin([rt.ops.mul(rt.method(r, "affine_inverse", []), r)])]));
      rt.frameLine(11);
      print(rt.showArgs([rt.V.str("k05|"), rt.strBuiltin([rt.ops.mul(t, rt.vector2New([rt.V.int(1), rt.V.int(2)]))]), rt.V.str("|"), rt.strBuiltin([rt.ops.mul(r, rt.vector2New([rt.V.int(1), rt.V.int(2)]))])]));
      rt.frameLine(12);
      print(rt.showArgs([rt.V.str("k06|"), rt.strBuiltin([rt.ops.mul(t, r)]), rt.V.str("|"), rt.strBuiltin([rt.ops.mul(r, t)]), rt.V.str("|"), rt.strBuiltin([rt.ops.mul(i, t)]), rt.V.str("|"), rt.strBuiltin([rt.ops.mul(t, i)])]));
      rt.frameLine(13);
      print(rt.showArgs([rt.V.str("k07|"), rt.strBuiltin([rt.method(t, "translated", [rt.vector2New([rt.V.int(1), rt.V.int(1)])])]), rt.V.str("|"), rt.strBuiltin([rt.method(t, "rotated", [rt.V.float(0.5)])]), rt.V.str("|"), rt.strBuiltin([rt.method(t, "scaled", [rt.vector2New([rt.V.int(2), rt.V.int(2)])])])]));
      rt.frameLine(14);
      print(rt.showArgs([rt.V.str("k08|"), rt.strBuiltin([rt.transform2dNew([])]), rt.V.str("|"), rt.strBuiltin([rt.transform2dNew([rt.V.int(0), rt.vector2New([rt.V.int(0), rt.V.int(0)])])]), rt.V.str("|"), rt.ops.eq(t, rt.transform2dNew([rt.vector2New([rt.V.int(1), rt.V.int(0)]), rt.vector2New([rt.V.int(0), rt.V.int(1)]), rt.vector2New([rt.V.int(3), rt.V.int(4)])]))]));
      rt.frameLine(15);
      print(rt.showArgs([rt.V.str("k09|"), rt.V.str(rt.varToStr(t)), rt.V.str("|"), rt.ops.eq(rt.strToVar(rt.V.str(rt.varToStr(t))), t), rt.V.str("|"), rt.gVarToBytes(t), rt.V.str("|"), rt.ops.eq(rt.gBytesToVar(rt.gVarToBytes(t)), t)]));
      rt.frameLine(16);
      let arr = rt.V.array(rt.GArray.of([i, t]));
      rt.frameLine(17);
      let d = rt.dictOf([[t, rt.V.int(1)]]);
      rt.frameLine(18);
      print(rt.showArgs([rt.V.str("k10|"), rt.method(arr, "size", []), rt.V.str("|"), rt.ops.eq(rt.wrapValue(rt.index(arr, rt.V.int(0), "Array[Transform2D]")), i), rt.V.str("|"), rt.method(d, "has", [rt.transform2dNew([rt.vector2New([rt.V.int(1), rt.V.int(0)]), rt.vector2New([rt.V.int(0), rt.V.int(1)]), rt.vector2New([rt.V.int(3), rt.V.int(4)])])]), rt.V.str("|"), rt.wrapValue(rt.index(d, t))]));
      rt.frameLine(19);
      let z = rt.transform2d(1, 0, 0, 1, 0, 0);
      rt.frameLine(20);
      print(rt.showArgs([rt.V.str("k11|"), rt.strBuiltin([z]), rt.V.str("|"), rt.isType(z, "Transform2D"), rt.V.str("|"), rt.method(t, "is_conformal", []), rt.V.str("|"), rt.ops.eq(rt.variantHash([t]), rt.variantHash([rt.transform2dNew([rt.vector2New([rt.V.int(1), rt.V.int(0)]), rt.vector2New([rt.V.int(0), rt.V.int(1)]), rt.vector2New([rt.V.int(3), rt.V.int(4)])])]))]));
      rt.frameLine(21);
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
