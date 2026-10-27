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
      let e = rt.rect2New([rt.V.int(0), rt.V.int(0), rt.V.int(4), rt.V.int(4)]);
      rt.frameLine(5);
      let f = rt.rect2New([rt.V.int(2), rt.V.int(2), rt.V.int(4), rt.V.int(4)]);
      rt.frameLine(6);
      print(rt.showArgs([rt.V.str("q01|"), rt.method(e, "get_area", []), rt.V.str("|"), rt.strBuiltin([rt.method(e, "get_center", [])]), rt.V.str("|"), rt.strBuiltin([rt.method(e, "abs", [])]), rt.V.str("|"), rt.method(e, "is_finite", []), rt.V.str("|"), rt.method(e, "is_equal_approx", [rt.rect2New([rt.V.int(0), rt.V.int(0), rt.V.int(4), rt.V.int(4)])]), rt.V.str("|"), rt.method(e, "is_equal_approx", [f])]));
      rt.frameLine(7);
      print(rt.showArgs([rt.V.str("q02|"), rt.method(e, "has_point", [rt.vector2New([rt.V.int(0), rt.V.int(0)])]), rt.V.str("|"), rt.method(e, "has_point", [rt.vector2New([rt.V.int(4), rt.V.int(4)])]), rt.V.str("|"), rt.method(e, "has_point", [rt.vector2New([rt.V.float(3.9), rt.V.float(3.9)])])]));
      rt.frameLine(8);
      print(rt.showArgs([rt.V.str("q03|"), rt.method(e, "intersects", [f]), rt.V.str("|"), rt.method(e, "intersects", [rt.rect2New([rt.V.int(4), rt.V.int(0), rt.V.int(4), rt.V.int(4)])]), rt.V.str("|"), rt.method(e, "intersects", [rt.rect2New([rt.V.int(1), rt.V.int(1), rt.V.int(1), rt.V.int(1)])])]));
      rt.frameLine(9);
      print(rt.showArgs([rt.V.str("q04|"), rt.method(e, "encloses", [f]), rt.V.str("|"), rt.method(e, "encloses", [rt.rect2New([rt.V.int(1), rt.V.int(1), rt.V.int(1), rt.V.int(1)])]), rt.V.str("|"), rt.method(f, "encloses", [e])]));
      rt.frameLine(10);
      print(rt.showArgs([rt.V.str("q05|"), rt.strBuiltin([rt.method(e, "merge", [f])]), rt.V.str("|"), rt.strBuiltin([rt.method(e, "merge", [rt.rect2New([rt.V.int(8), rt.V.int(8), rt.V.int(1), rt.V.int(1)])])]), rt.V.str("|"), rt.strBuiltin([rt.method(e, "expand", [rt.vector2New([rt.V.int(9), rt.V.int(9)])])]), rt.V.str("|"), rt.strBuiltin([rt.method(e, "expand", [rt.vector2New([rt.V.int(1), rt.V.int(1)])])])]));
      rt.frameLine(11);
      print(rt.showArgs([rt.V.str("q06|"), rt.strBuiltin([rt.method(e, "grow", [rt.V.int(1)])]), rt.V.str("|"), rt.strBuiltin([rt.method(e, "grow", [rt.V.int(0)])]), rt.V.str("|"), rt.strBuiltin([rt.method(e, "grow_individual", [rt.V.int(1), rt.V.int(2), rt.V.int(3), rt.V.int(4)])]), rt.V.str("|"), rt.strBuiltin([rt.method(e, "grow_side", [rt.V.int(0), rt.V.int(1)])]), rt.V.str("|"), rt.strBuiltin([rt.method(e, "grow_side", [rt.V.int(1), rt.V.int(2)])]), rt.V.str("|"), rt.strBuiltin([rt.method(e, "grow_side", [rt.V.int(2), rt.V.int(1)])]), rt.V.str("|"), rt.strBuiltin([rt.method(e, "grow_side", [rt.V.int(3), rt.V.int(2)])])]));
      rt.frameLine(12);
      let ri = rt.rect2iNew([rt.V.int(0), rt.V.int(0), rt.V.int(4), rt.V.int(4)]);
      rt.frameLine(13);
      let rj = rt.rect2iNew([rt.V.int(2), rt.V.int(2), rt.V.int(4), rt.V.int(4)]);
      rt.frameLine(14);
      print(rt.showArgs([rt.V.str("q07|"), rt.method(ri, "get_area", []), rt.V.str("|"), rt.strBuiltin([rt.method(ri, "get_center", [])]), rt.V.str("|"), rt.strBuiltin([rt.method(ri, "abs", [])]), rt.V.str("|"), rt.method(ri, "has_point", [rt.vector2iNew([rt.V.int(0), rt.V.int(0)])]), rt.V.str("|"), rt.method(ri, "has_point", [rt.vector2iNew([rt.V.int(4), rt.V.int(4)])])]));
      rt.frameLine(15);
      print(rt.showArgs([rt.V.str("q08|"), rt.method(ri, "intersects", [rj]), rt.V.str("|"), rt.method(ri, "intersects", [rt.rect2iNew([rt.V.int(9), rt.V.int(9), rt.V.int(1), rt.V.int(1)])]), rt.V.str("|"), rt.method(ri, "encloses", [rt.rect2iNew([rt.V.int(1), rt.V.int(1), rt.V.int(1), rt.V.int(1)])]), rt.V.str("|"), rt.strBuiltin([rt.method(ri, "merge", [rj])]), rt.V.str("|"), rt.strBuiltin([rt.method(ri, "expand", [rt.vector2iNew([rt.V.int(9), rt.V.int(9)])])])]));
      rt.frameLine(16);
      print(rt.showArgs([rt.V.str("q09|"), rt.strBuiltin([rt.method(ri, "grow", [rt.V.int(1)])]), rt.V.str("|"), rt.strBuiltin([rt.method(ri, "grow_individual", [rt.V.int(1), rt.V.int(2), rt.V.int(3), rt.V.int(4)])]), rt.V.str("|"), rt.strBuiltin([rt.method(ri, "grow_side", [rt.V.int(0), rt.V.int(1)])]), rt.V.str("|"), rt.strBuiltin([rt.method(ri, "grow_side", [rt.V.int(3), rt.V.int(2)])])]));
      rt.frameLine(17);
      print(rt.showArgs([rt.V.str("q10|"), rt.strBuiltin([rt.method(rt.rect2iNew([rt.V.int(1), rt.V.int(1), rt.V.int(1), rt.V.int(1)]), "get_center", [])]), rt.V.str("|"), rt.strBuiltin([rt.method(rt.rect2iNew([rt.V.int(1), rt.V.int(1), rt.V.int(3), rt.V.int(3)]), "get_center", [])]), rt.V.str("|"), rt.strBuiltin([rt.method(rt.rect2New([rt.V.int(1), rt.V.int(1), rt.V.int(0), rt.V.int(0)]), "get_center", [])]), rt.V.str("|"), rt.method(rt.rect2New([rt.V.int(1), rt.V.int(1), rt.V.int(0), rt.V.int(0)]), "get_area", [])]));
      rt.frameLine(18);
      let half = rt.rect2New([rt.V.int(1), rt.V.int(2), rt.V.float(3.5), rt.V.float(4.5)]);
      rt.frameLine(19);
      print(rt.showArgs([rt.V.str("q11|"), rt.strBuiltin([rt.method(half, "get_center", [])]), rt.V.str("|"), rt.method(half, "get_area", []), rt.V.str("|"), rt.strBuiltin([rt.method(half, "abs", [])]), rt.V.str("|"), rt.strBuiltin([rt.method(half, "merge", [rt.rect2New([rt.V.int(0), rt.V.int(0), rt.V.int(1), rt.V.int(1)])])])]));
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
