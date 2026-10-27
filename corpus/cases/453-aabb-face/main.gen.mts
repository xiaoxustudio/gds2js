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
      let a0 = rt.aabbNew([]);
      rt.frameLine(5);
      let a1 = rt.aabbNew([rt.vector3New([rt.V.int(0), rt.V.int(0), rt.V.int(0)]), rt.vector3New([rt.V.int(1), rt.V.int(2), rt.V.int(3)])]);
      rt.frameLine(6);
      print(rt.showArgs([rt.V.str("s01|"), rt.strBuiltin([a0]), rt.V.str("|"), rt.strBuiltin([a1]), rt.V.str("|"), rt.typeOf(a1)]));
      rt.frameLine(7);
      print(rt.showArgs([rt.V.str("s02|"), rt.wrapValue(rt.attribute(a1, "position")), rt.V.str("|"), rt.wrapValue(rt.attribute(a1, "size")), rt.V.str("|"), rt.wrapValue(rt.attribute(a1, "end")), rt.V.str("|"), rt.method(a1, "get_volume", []), rt.V.str("|"), rt.method(a1, "has_volume", []), rt.V.str("|"), rt.method(a0, "has_volume", [])]));
      rt.frameLine(8);
      print(rt.showArgs([rt.V.str("s03|"), rt.strBuiltin([rt.method(a1, "get_center", [])]), rt.V.str("|"), rt.strBuiltin([rt.method(rt.aabbNew([rt.vector3New([rt.V.int(1), rt.V.int(2), rt.V.int(3)]), rt.vector3New([rt.V.int(4), rt.V.int(5), rt.V.int(6)])]), "get_center", [])])]));
      rt.frameLine(9);
      print(rt.showArgs([rt.V.str("s04|"), rt.method(a1, "has_point", [rt.vector3New([rt.V.float(0.5), rt.V.int(1), rt.V.float(1.5)])]), rt.V.str("|"), rt.method(a1, "has_point", [rt.vector3New([rt.V.int(1), rt.V.int(2), rt.V.int(3)])]), rt.V.str("|"), rt.method(a1, "has_point", [rt.vector3New([rt.V.float(1.1), rt.V.int(1), rt.V.int(1)])])]));
      rt.frameLine(10);
      print(rt.showArgs([rt.V.str("s05|"), rt.method(a1, "intersects", [rt.aabbNew([rt.vector3New([rt.V.int(0), rt.V.int(0), rt.V.int(0)]), rt.vector3New([rt.V.int(1), rt.V.int(2), rt.V.int(3)])])]), rt.V.str("|"), rt.method(a1, "intersects", [rt.aabbNew([rt.vector3New([rt.V.float(0.5), rt.V.int(1), rt.V.float(1.5)]), rt.vector3New([rt.V.int(1), rt.V.int(1), rt.V.int(1)])])]), rt.V.str("|"), rt.method(a1, "intersects", [rt.aabbNew([rt.vector3New([rt.V.int(5), rt.V.int(5), rt.V.int(5)]), rt.vector3New([rt.V.int(1), rt.V.int(1), rt.V.int(1)])])])]));
      rt.frameLine(11);
      print(rt.showArgs([rt.V.str("s06|"), rt.strBuiltin([rt.method(a1, "merge", [rt.aabbNew([rt.vector3New([rt.V.int(2), rt.V.int(3), rt.V.int(4)]), rt.vector3New([rt.V.int(1), rt.V.int(1), rt.V.int(1)])])])]), rt.V.str("|"), rt.strBuiltin([rt.method(a1, "expand", [rt.vector3New([rt.V.int(5), rt.V.int(5), rt.V.int(5)])])]), rt.V.str("|"), rt.strBuiltin([rt.method(a1, "expand", [rt.vector3New([rt.V.int((-1)), rt.V.int((-1)), rt.V.int((-1))])])])]));
      rt.frameLine(12);
      print(rt.showArgs([rt.V.str("s07|"), rt.ops.eq(a1, rt.aabbNew([rt.vector3New([rt.V.int(0), rt.V.int(0), rt.V.int(0)]), rt.vector3New([rt.V.int(1), rt.V.int(2), rt.V.int(3)])])), rt.V.str("|"), rt.ops.neq(a1, a0), rt.V.str("|"), rt.method(a1, "is_equal_approx", [rt.aabbNew([rt.vector3New([rt.V.int(0), rt.V.int(0), rt.V.int(0)]), rt.vector3New([rt.V.int(1), rt.V.int(2), rt.V.int(3)])])]), rt.V.str("|"), rt.ops.eq(rt.variantHash([a1]), rt.variantHash([rt.aabbNew([rt.vector3New([rt.V.int(0), rt.V.int(0), rt.V.int(0)]), rt.vector3New([rt.V.int(1), rt.V.int(2), rt.V.int(3)])])]))]));
      rt.frameLine(13);
      print(rt.showArgs([rt.V.str("s08|"), rt.V.str(rt.varToStr(a1)), rt.V.str("|"), rt.ops.eq(rt.strToVar(rt.V.str(rt.varToStr(a1))), a1), rt.V.str("|"), rt.method(rt.gVarToBytes(a1), "size", []), rt.V.str("|"), rt.ops.eq(rt.gBytesToVar(rt.gVarToBytes(a1)), a1)]));
      rt.frameLine(14);
      let arr = rt.V.array(rt.GArray.of([a0, a1]));
      rt.frameLine(15);
      print(rt.showArgs([rt.V.str("s09|"), rt.method(arr, "size", []), rt.V.str("|"), rt.ops.eq(rt.wrapValue(rt.index(arr, rt.V.int(1), "Array[AABB]")), a1), rt.V.str("|"), rt.strBuiltin([rt.wrapValue(rt.index(arr, rt.V.int(0), "Array[AABB]"))])]));
      rt.frameLine(16);
      let d = rt.dictOf([[a1, rt.V.int(1)]]);
      rt.frameLine(17);
      print(rt.showArgs([rt.V.str("s10|"), rt.method(d, "size", []), rt.V.str("|"), rt.method(d, "has", [rt.aabbNew([rt.vector3New([rt.V.int(0), rt.V.int(0), rt.V.int(0)]), rt.vector3New([rt.V.int(1), rt.V.int(2), rt.V.int(3)])])]), rt.V.str("|"), rt.wrapValue(rt.index(d, a1))]));
      rt.frameLine(18);
      let z = rt.aabb(0, 0, 0, 0, 0, 0);
      rt.frameLine(19);
      print(rt.showArgs([rt.V.str("s11|"), rt.strBuiltin([z]), rt.V.str("|"), rt.isType(z, "AABB"), rt.V.str("|"), rt.method(a1, "is_finite", [])]));
      rt.frameLine(20);
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
