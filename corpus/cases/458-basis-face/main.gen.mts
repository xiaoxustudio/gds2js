// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../packages/runtime/src/runtime/index";
import { print, printJoined, printRaw, printErr, printVerbose, printRich, printDebug, SceneTree } from "../../../tools/harness/scene-tree";

const PI = rt.V.float(3.141592653589793);

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
      let b0 = rt.basisNew([]);
      rt.frameLine(5);
      let b1 = rt.basisNew([rt.vector3New([rt.V.int(1), rt.V.int(2), rt.V.int(3)]), rt.vector3New([rt.V.int(4), rt.V.int(5), rt.V.int(6)]), rt.vector3New([rt.V.int(7), rt.V.int(8), rt.V.int(10)])]);
      rt.frameLine(6);
      let b2 = rt.basisNew([rt.vector3New([rt.V.int(0), rt.V.int(1), rt.V.int(0)]), rt.ops.div(PI, rt.V.float(2))]);
      rt.frameLine(7);
      print(rt.showArgs([rt.V.str("k01|"), rt.strBuiltin([b0]), rt.V.str("|"), rt.strBuiltin([b1]), rt.V.str("|"), rt.strBuiltin([b2]), rt.V.str("|"), rt.typeOf(b1)]));
      rt.frameLine(8);
      print(rt.showArgs([rt.V.str("k02|"), rt.wrapValue(rt.attribute(b1, "x")), rt.V.str("|"), rt.wrapValue(rt.attribute(b1, "y")), rt.V.str("|"), rt.wrapValue(rt.attribute(b1, "z")), rt.V.str("|"), rt.strBuiltin([rt.basisNew([b1])])]));
      rt.frameLine(9);
      let bb = rt.basisNew([]);
      rt.frameLine(10);
      {
        const _nv = rt.writeProp(bb, "x", rt.vector3New([rt.V.int(9), rt.V.int(9), rt.V.int(9)]));
        if (_nv !== null) bb = _nv;
      }
      rt.frameLine(11);
      {
        const _nv = rt.writeProp(bb, "z", rt.vector3New([rt.V.int(0), rt.V.int(0), rt.V.int(4)]));
        if (_nv !== null) bb = _nv;
      }
      rt.frameLine(12);
      print(rt.showArgs([rt.V.str("k03|"), rt.strBuiltin([bb]), rt.V.str("|"), rt.strBuiltin([rt.basisNew([rt.vector3New([rt.V.int(0), rt.V.int(1), rt.V.int(0)]), rt.V.float(1)])])]));
      rt.frameLine(13);
      let q90 = rt.basisNew([rt.quaternionNew([rt.V.int(0), rt.V.float(0.7071068), rt.V.int(0), rt.V.float(0.7071068)])]);
      rt.frameLine(14);
      let q111 = rt.basisNew([rt.quaternionNew([rt.V.int(1), rt.V.int(1), rt.V.int(1), rt.V.int(1)])]);
      rt.frameLine(15);
      let qs = rt.basisNew([rt.quaternionNew([rt.V.float(0.1), rt.V.float(0.2), rt.V.float(0.3), rt.V.float(0.4)])]);
      rt.frameLine(16);
      print(rt.showArgs([rt.V.str("k04|"), rt.strBuiltin([q90]), rt.V.str("|"), rt.strBuiltin([q111])]));
      rt.frameLine(17);
      print(rt.showArgs([rt.V.str("k05|"), rt.V.str(rt.varToStr(qs)), rt.V.str("|"), rt.strBuiltin([rt.ops.mul(q90, q111)])]));
      rt.frameLine(18);
      print(rt.showArgs([rt.V.str("k06|"), rt.ops.eq(b1, b1), rt.V.str("|"), rt.ops.eq(b1, b0), rt.V.str("|"), rt.ops.neq(b1, b0), rt.V.str("|"), rt.ops.eq(b1, rt.V.nil())]));
      rt.frameLine(19);
      print(rt.showArgs([rt.V.str("k07|"), rt.method(b1, "determinant", []), rt.V.str("|"), rt.method(b0, "determinant", []), rt.V.str("|"), rt.strBuiltin([rt.method(b1, "transposed", [])])]));
      rt.frameLine(20);
      print(rt.showArgs([rt.V.str("k08|"), rt.strBuiltin([rt.method(b1, "inverse", [])]), rt.V.str("|"), rt.V.str(rt.varToStr(rt.method(b1, "inverse", [])))]));
      rt.frameLine(21);
      print(rt.showArgs([rt.V.str("k09|"), rt.strBuiltin([rt.ops.mul(rt.method(b1, "inverse", []), b1)]), rt.V.str("|"), rt.strBuiltin([rt.method(b1, "get_scale", [])]), rt.V.str("|"), rt.strBuiltin([rt.method(b0, "get_scale", [])])]));
      rt.frameLine(22);
      print(rt.showArgs([rt.V.str("k10|"), rt.strBuiltin([rt.method(q90, "rotated", [rt.vector3New([rt.V.int(0), rt.V.int(1), rt.V.int(0)]), rt.V.float(1)])]), rt.V.str("|"), rt.strBuiltin([rt.method(rt.method(q90, "rotated", [rt.vector3New([rt.V.int(0), rt.V.int(1), rt.V.int(0)]), rt.V.float(1)]), "rotated", [rt.vector3New([rt.V.int(0), rt.V.int(1), rt.V.int(0)]), rt.V.float(1)])])]));
      rt.frameLine(23);
      let bx = rt.basisNew([rt.vector3New([rt.V.int(0), rt.V.int(1), rt.V.int(0)]), rt.vector3New([rt.V.int(1), rt.V.int(0), rt.V.int(0)]), rt.vector3New([rt.V.int(0), rt.V.int(0), rt.V.int(2)])]);
      rt.frameLine(24);
      print(rt.showArgs([rt.V.str("k11|"), rt.strBuiltin([rt.ops.mul(b1, bx)]), rt.V.str("|"), rt.strBuiltin([rt.ops.mul(bx, b1)])]));
      rt.frameLine(25);
      print(rt.showArgs([rt.V.str("k12|"), rt.ops.mul(b1, rt.vector3New([rt.V.int(1), rt.V.int(1), rt.V.int(1)])), rt.V.str("|"), rt.ops.mul(b1, rt.vector3New([rt.V.float(0.5), rt.V.float(0.25), rt.V.float(1)])), rt.V.str("|"), rt.strBuiltin([rt.ops.mul(b1, rt.V.float(0.5))])]));
      rt.frameLine(26);
      print(rt.showArgs([rt.V.str("k13|"), rt.strBuiltin([rt.ops.mul(b1, rt.V.int(2))]), rt.V.str("|"), rt.strBuiltin([rt.ops.mul(b1, rt.V.float(2))]), rt.V.str("|"), rt.method(b1, "tdotx", [rt.vector3New([rt.V.float(0.5), rt.V.float(0.25), rt.V.float(1.25)])]), rt.V.str("|"), rt.method(b1, "tdoty", [rt.vector3New([rt.V.int(1), rt.V.int(0), rt.V.int(0)])]), rt.V.str("|"), rt.method(b1, "tdotz", [rt.vector3New([rt.V.int(0), rt.V.int(1), rt.V.int(0)])])]));
      rt.frameLine(27);
      print(rt.showArgs([rt.V.str("k14|"), rt.variantHash([b1]), rt.V.str("|"), rt.variantHash([b0]), rt.V.str("|"), rt.variantHash([qs]), rt.V.str("|"), rt.variantHash([rt.ops.mul(qs, qs)]), rt.V.str("|"), rt.variantHash([rt.basisNew([rt.vector3New([rt.V.int(0), rt.V.int(1), rt.V.int(0)]), rt.V.float(1)])])]));
      rt.frameLine(28);
      print(rt.showArgs([rt.V.str("k15|"), rt.V.str(rt.varToStr(b1)), rt.V.str("|"), rt.ops.eq(rt.strToVar(rt.V.str(rt.varToStr(b1))), b1), rt.V.str("|"), rt.method(rt.gVarToBytes(b1), "size", []), rt.V.str("|"), rt.gVarToBytes(b1)]));
      rt.frameLine(29);
      let arr = rt.V.array(rt.GArray.of([b1, b0]));
      rt.frameLine(30);
      let d = rt.dictOf([[b1, rt.V.int(1)]]);
      rt.frameLine(31);
      print(rt.showArgs([rt.V.str("k16|"), rt.strBuiltin([arr]), rt.V.str("|"), rt.wrapValue(rt.index(d, b1)), rt.V.str("|"), rt.method(arr, "size", [])]));
      rt.frameLine(32);
      let db = rt.basis(1, 0, 0, 0, 1, 0, 0, 0, 1);
      rt.frameLine(33);
      print(rt.showArgs([rt.V.str("k17|"), rt.strBuiltin([db]), rt.V.str("|"), rt.ops.eq(db, rt.basisNew([])), rt.V.str("|"), rt.typeOf(db)]));
      rt.frameLine(34);
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
