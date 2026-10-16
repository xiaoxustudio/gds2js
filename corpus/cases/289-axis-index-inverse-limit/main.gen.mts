// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../packages/runtime/src/runtime/index";
import { print, printJoined, printRaw, printErr, printVerbose, printRich, printDebug, SceneTree } from "../../../tools/harness/scene-tree";

const INF = rt.V.float(Number.POSITIVE_INFINITY);
const NAN = rt.V.float(Number.NaN);

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
      for (let v of rt.iter(rt.V.array(rt.GArray.of([rt.vector2New([rt.V.float(1.5), rt.V.float(2.5)]), rt.vector2New([rt.V.float(2.5), rt.V.float(1.5)]), rt.vector2New([rt.V.int(2), rt.V.int(2)]), rt.vector2New([rt.V.int((-3)), rt.V.int(1)]), rt.vector2New([rt.V.int((-1)), rt.V.int((-3))]), rt.vector2New([rt.V.int(0), rt.V.int(0)]), rt.vector2New([INF, rt.V.int(2)]), rt.vector2New([NAN, rt.V.int(2)]), rt.vector2New([rt.V.int(2), NAN])])))) {
        rt.frameLine(5);
        print(rt.showArgs([rt.V.str("V2|"), rt.method(v, "max_axis_index", []), rt.V.str("|"), rt.method(v, "min_axis_index", []), rt.V.str("|"), rt.typeOf(rt.method(v, "max_axis_index", []))]));
      }
      rt.frameLine(6);
      for (let v of rt.iter(rt.V.array(rt.GArray.of([rt.vector2iNew([rt.V.int(3), rt.V.int(4)]), rt.vector2iNew([rt.V.int(4), rt.V.int(3)]), rt.vector2iNew([rt.V.int(2), rt.V.int(2)]), rt.vector2iNew([rt.V.int((-3)), rt.V.int(1)]), rt.vector2iNew([rt.V.int((-1)), rt.V.int((-3))]), rt.vector2iNew([rt.V.int(0), rt.V.int(0)])])))) {
        rt.frameLine(7);
        print(rt.showArgs([rt.V.str("V2I|"), rt.method(v, "max_axis_index", []), rt.V.str("|"), rt.method(v, "min_axis_index", [])]));
      }
      rt.frameLine(8);
      for (let v of rt.iter(rt.V.array(rt.GArray.of([rt.vector3New([rt.V.int(1), rt.V.int(2), rt.V.int(3)]), rt.vector3New([rt.V.int(3), rt.V.int(2), rt.V.int(1)]), rt.vector3New([rt.V.int(2), rt.V.int(2), rt.V.int(2)]), rt.vector3New([rt.V.int(0), rt.V.int(0), rt.V.int(0)]), rt.vector3New([rt.V.int((-5)), rt.V.int(1), rt.V.int(2)]), rt.vector3New([INF, rt.V.int(0), rt.V.int(0)]), rt.vector3New([NAN, rt.V.int(0), rt.V.int(1)])])))) {
        rt.frameLine(9);
        print(rt.showArgs([rt.V.str("V3|"), rt.method(v, "max_axis_index", []), rt.V.str("|"), rt.method(v, "min_axis_index", []), rt.V.str("|"), rt.method(v, "inverse", [])]));
      }
      rt.frameLine(10);
      for (let v of rt.iter(rt.V.array(rt.GArray.of([rt.vector3iNew([rt.V.int(3), rt.V.int(4), rt.V.int(5)]), rt.vector3iNew([rt.V.int(5), rt.V.int(4), rt.V.int(3)]), rt.vector3iNew([rt.V.int(4), rt.V.int(4), rt.V.int(4)]), rt.vector3iNew([rt.V.int((-1)), rt.V.int((-9)), rt.V.int((-5))]), rt.vector3iNew([rt.V.int(0), rt.V.int(0), rt.V.int(0)])])))) {
        rt.frameLine(11);
        print(rt.showArgs([rt.V.str("V3I|"), rt.method(v, "max_axis_index", []), rt.V.str("|"), rt.method(v, "min_axis_index", [])]));
      }
      rt.frameLine(12);
      for (let v of rt.iter(rt.V.array(rt.GArray.of([rt.vector2New([rt.V.int(3), rt.V.int(4)]), rt.vector2New([rt.V.float(0.5), rt.V.float(0.5)]), rt.vector2New([rt.V.int(0), rt.V.int(0)]), rt.vector2New([rt.V.int((-3)), rt.V.int((-4))])])))) {
        rt.frameLine(13);
        print(rt.showArgs([rt.V.str("LL2|"), rt.method(v, "limit_length", []), rt.V.str("|"), rt.method(v, "limit_length", [rt.V.float(2)]), rt.V.str("|"), rt.method(v, "limit_length", [rt.V.float(0)]), rt.V.str("|"), rt.method(v, "limit_length", [rt.V.float((-1))])]));
      }
      rt.frameLine(14);
      for (let v of rt.iter(rt.V.array(rt.GArray.of([rt.vector3New([rt.V.int(1), rt.V.int(2), rt.V.int(3)]), rt.vector3New([rt.V.int(0), rt.V.int(0), rt.V.int(0)])])))) {
        rt.frameLine(15);
        print(rt.showArgs([rt.V.str("LL3|"), rt.method(v, "limit_length", []), rt.V.str("|"), rt.method(v, "limit_length", [rt.V.float(2)]), rt.V.str("|"), rt.method(v, "limit_length", [rt.V.float(0)]), rt.V.str("|"), rt.method(v, "limit_length", [rt.V.float((-1))])]));
      }
      rt.frameLine(16);
      for (let v of rt.iter(rt.V.array(rt.GArray.of([rt.vector2New([rt.V.float(0.000005), rt.V.float(0)]), rt.vector2New([rt.V.float(0.00002), rt.V.float(0)]), rt.vector3New([rt.V.float(0.000005), rt.V.float(0), rt.V.float(0)]), rt.vector3New([rt.V.float(0.00002), rt.V.float(0), rt.V.float(0)])])))) {
        rt.frameLine(17);
        print(rt.showArgs([rt.V.str("LLS|"), rt.method(v, "limit_length", [rt.V.float(0)]), rt.V.str("|"), rt.method(v, "limit_length", [rt.V.float(1)])]));
      }
      rt.frameLine(18);
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
