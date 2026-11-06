// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "gds2js/runtime";
import { print, printJoined, printRaw, printErr, printVerbose, printRich, printDebug, SceneTree } from "gds2js/host";

export class Main extends SceneTree {
  __gd_fields__() {
    const __gd_frame = rt.frameEnter("Main.gd", "@implicit_new");
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
    const __gd_frame = rt.frameEnter("Main.gd", "_initialize");
    try {
      rt.frameLine(3);
      let p = rt.projectionNew([rt.vector4New([rt.V.float(0.974279), rt.V.int(0), rt.V.int(0), rt.V.int(0)]), rt.vector4New([rt.V.int(0), rt.V.float(1.732051), rt.V.int(0), rt.V.int(0)]), rt.vector4New([rt.V.int(0), rt.V.int(0), rt.V.float((-1.002002)), rt.V.int((-1))]), rt.vector4New([rt.V.int(0), rt.V.int(0), rt.V.float((-0.2002)), rt.V.int(0)])]);
      rt.frameLine(4);
      print(rt.showArgs([rt.V.str("z|"), rt.method(p, "get_z_near", []), rt.V.str("|"), rt.method(p, "get_z_far", [])]));
      rt.frameLine(5);
      print(rt.showArgs([rt.V.str("fov|"), rt.method(p, "get_fov", []), rt.V.str("|"), rt.method(p, "get_fovy", [rt.V.float(60), rt.V.float((16 / 9))])]));
      rt.frameLine(6);
      print(rt.showArgs([rt.V.str("asp|"), rt.method(p, "get_aspect", [])]));
      rt.frameLine(7);
      print(rt.showArgs([rt.V.str("vp|"), rt.method(p, "get_viewport_half_extents", [])]));
      rt.frameLine(8);
      print(rt.showArgs([rt.V.str("fp|"), rt.method(p, "get_far_plane_half_extents", [])]));
      rt.frameLine(9);
      print(rt.showArgs([rt.V.str("ppm|"), rt.method(p, "get_pixels_per_meter", [rt.V.int(10)])]));
      rt.frameLine(10);
      print(rt.showArgs([rt.V.str("lod|"), rt.method(p, "get_lod_multiplier", [])]));
      rt.frameLine(11);
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
rt.registerDictIdentity(__gd_d_Main, null, "", [], {}, (o) => { const s = o as Main; return []; });
rt.registerMethodArities(__gd_d_Main, { "_initialize": [0, 0] });
rt.registerNativeBase(__gd_d_Main, "SceneTree");
rt.registerScriptLabel(__gd_d_Main, "Main.gd");
const __gd_entry = new Main();
try {
  await __gd_entry.run();
} catch (__gd_e) {
  rt.reportRunFailure(__gd_e);
}
