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
      let i = rt.transform3dNew([]);
      rt.frameLine(5);
      let b = rt.basisNew([rt.vector3New([rt.V.int(1), rt.V.int(2), rt.V.int(3)]), rt.vector3New([rt.V.int(4), rt.V.int(5), rt.V.int(6)]), rt.vector3New([rt.V.int(7), rt.V.int(8), rt.V.int(10)])]);
      rt.frameLine(6);
      let t = rt.transform3dNew([b, rt.vector3New([rt.V.int(11), rt.V.int(12), rt.V.int(13)])]);
      rt.frameLine(7);
      let x = rt.transform3dNew([rt.vector3New([rt.V.int(1), rt.V.int(2), rt.V.int(3)]), rt.vector3New([rt.V.int(4), rt.V.int(5), rt.V.int(6)]), rt.vector3New([rt.V.int(7), rt.V.int(8), rt.V.int(10)]), rt.vector3New([rt.V.int(11), rt.V.int(12), rt.V.int(13)])]);
      rt.frameLine(8);
      print(rt.showArgs([rt.V.str("k01|"), rt.strBuiltin([i]), rt.V.str("|"), rt.strBuiltin([t]), rt.V.str("|"), rt.strBuiltin([x]), rt.V.str("|"), rt.typeOf(t), rt.V.str("|"), rt.ops.eq(t, x)]));
      rt.frameLine(9);
      print(rt.showArgs([rt.V.str("k02|"), rt.strBuiltin([rt.wrapValue(rt.attribute(t, "basis"))]), rt.V.str("|"), rt.strBuiltin([rt.wrapValue(rt.attribute(t, "origin"))]), rt.V.str("|"), rt.wrapValue(rt.attribute(rt.wrapValue(rt.attribute(t, "basis")), "x")), rt.V.str("|"), rt.wrapValue(rt.attribute(rt.wrapValue(rt.attribute(t, "origin")), "z"))]));
      rt.frameLine(10);
      let w = rt.transform3dNew([]);
      rt.frameLine(11);
      {
        const _nv = rt.writeProp(w, "basis", b);
        if (_nv !== null) w = _nv;
      }
      rt.frameLine(12);
      {
        const _nv = rt.writeProp(w, "origin", rt.vector3New([rt.V.int(9), rt.V.int(8), rt.V.int(7)]));
        if (_nv !== null) w = _nv;
      }
      rt.frameLine(13);
      print(rt.showArgs([rt.V.str("k03|"), rt.strBuiltin([w]), rt.V.str("|"), rt.strBuiltin([rt.wrapValue(rt.attribute(rt.wrapValue(rt.attribute(w, "basis")), "y"))])]));
      rt.frameLine(14);
      let u = rt.transform3dNew([rt.basisNew([rt.vector3New([rt.V.float(0.6), rt.V.int(0), rt.V.int(0)]), rt.vector3New([rt.V.int(0), rt.V.float(0.8), rt.V.int(0)]), rt.vector3New([rt.V.int(0), rt.V.int(0), rt.V.int(1)])]), rt.vector3New([rt.V.int(1), rt.V.int(2), rt.V.int(3)])]);
      rt.frameLine(15);
      print(rt.showArgs([rt.V.str("k04|"), rt.strBuiltin([rt.ops.mul(t, u)]), rt.V.str("|"), rt.strBuiltin([rt.ops.mul(u, t)]), rt.V.str("|"), rt.strBuiltin([rt.ops.mul(t, rt.vector3New([rt.V.int(1), rt.V.int(2), rt.V.int(3)]))]), rt.V.str("|"), rt.strBuiltin([rt.ops.mul(rt.vector3New([rt.V.int(1), rt.V.int(2), rt.V.int(3)]), t)])]));
      rt.frameLine(16);
      print(rt.showArgs([rt.V.str("k05|"), rt.strBuiltin([rt.method(t, "affine_inverse", [])]), rt.V.str("|"), rt.strBuiltin([rt.ops.eq(rt.ops.mul(rt.method(t, "affine_inverse", []), t), rt.transform3dNew([]))]), rt.V.str("|"), rt.strBuiltin([rt.method(u, "orthonormalized", [])])]));
      rt.frameLine(17);
      print(rt.showArgs([rt.V.str("k06|"), rt.strBuiltin([rt.method(t, "scaled", [rt.vector3New([rt.V.int(2), rt.V.int(3), rt.V.int(4)])])]), rt.V.str("|"), rt.strBuiltin([rt.method(t, "translated", [rt.vector3New([rt.V.int(10), rt.V.int(10), rt.V.int(10)])])])]));
      rt.frameLine(18);
      print(rt.showArgs([rt.V.str("k07|"), rt.strBuiltin([rt.method(rt.transform3dNew([]), "rotated", [rt.vector3New([rt.V.int(0), rt.V.int(1), rt.V.int(0)]), rt.V.float((-1.25))])]), rt.V.str("|"), rt.strBuiltin([rt.method(t, "rotated", [rt.vector3New([rt.V.int(0), rt.V.int(1), rt.V.int(0)]), rt.V.float(0.5)])])]));
      rt.frameLine(19);
      print(rt.showArgs([rt.V.str("k08|"), rt.strBuiltin([rt.wrapValue(rt.attribute(u, "basis"))]), rt.V.str("|"), rt.method(u, "is_finite", []), rt.V.str("|"), rt.ops.eq(t, rt.transform3dNew([b, rt.vector3New([rt.V.int(11), rt.V.int(12), rt.V.int(13)])])), rt.V.str("|"), rt.strBuiltin([rt.basisNew([rt.vector3New([rt.V.int(2), rt.V.int(0), rt.V.int(0)]), rt.vector3New([rt.V.int(0), rt.V.int(3), rt.V.int(0)]), rt.vector3New([rt.V.int(0), rt.V.int(0), rt.V.int(4)])])])]));
      rt.frameLine(20);
      let z = rt.transform3d(1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0);
      rt.frameLine(21);
      print(rt.showArgs([rt.V.str("k09|"), rt.strBuiltin([z]), rt.V.str("|"), rt.isType(z, "Transform3D"), rt.V.str("|"), rt.ops.eq(z, rt.transform3dNew([])), rt.V.str("|"), rt.strBuiltin([rt.wrapValue(rt.attribute(z, "basis"))]), rt.V.str("|"), rt.strBuiltin([rt.wrapValue(rt.attribute(z, "origin"))])]));
      rt.frameLine(22);
      print(rt.showArgs([rt.V.str("k10|"), rt.V.str(rt.varToStr(t)), rt.V.str("|"), rt.ops.eq(rt.strToVar(rt.V.str(rt.varToStr(t))), t), rt.V.str("|"), rt.gVarToBytes(t), rt.V.str("|"), rt.ops.eq(rt.gBytesToVar(rt.gVarToBytes(t)), t)]));
      rt.frameLine(23);
      let arr = rt.V.array(rt.GArray.of([i, t]));
      rt.frameLine(24);
      let d = rt.dictOf([[t, rt.V.int(1)]]);
      rt.frameLine(25);
      print(rt.showArgs([rt.V.str("k11|"), rt.method(arr, "size", []), rt.V.str("|"), rt.ops.eq(rt.wrapValue(rt.index(arr, rt.V.int(0), "Array[Transform3D]")), i), rt.V.str("|"), rt.method(d, "has", [rt.transform3dNew([b, rt.vector3New([rt.V.int(11), rt.V.int(12), rt.V.int(13)])])]), rt.V.str("|"), rt.wrapValue(rt.index(d, t))]));
      rt.frameLine(26);
      print(rt.showArgs([rt.V.str("k12|"), rt.variantHash([t]), rt.V.str("|"), rt.variantHash([u]), rt.V.str("|"), rt.ops.eq(rt.variantHash([t]), rt.variantHash([rt.transform3dNew([b, rt.vector3New([rt.V.int(11), rt.V.int(12), rt.V.int(13)])])])), rt.V.str("|"), rt.variantHash([rt.wrapValue(rt.attribute(t, "basis"))]), rt.V.str("|"), rt.variantHash([rt.wrapValue(rt.attribute(t, "origin"))])]));
      rt.frameLine(27);
      print(rt.showArgs([rt.V.str("k13|"), rt.strBuiltin([rt.V.array(rt.GArray.of([t]))]), rt.V.str("|"), rt.strBuiltin([rt.dictOf([[t, rt.V.int(1)]])]), rt.V.str("|"), rt.ops.eq(rt.transform3dNew([t]), t), rt.V.str("|"), rt.ops.eq(t, rt.V.nil()), rt.V.str("|"), rt.ops.neq(t, rt.V.nil())]));
      rt.frameLine(28);
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
