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
      rt.frameLine(9);
      let p = rt.V.object(new Box());
      rt.frameLine(10);
      {
        const _nv = rt.writeProp(rt.attribute(p, "m"), "x", rt.V.int(5));
        if (_nv !== null) rt.writeProp(p, "m", _nv);
      }
      rt.frameLine(11);
      print(rt.showArgs([rt.V.str("u1 "), rt.wrapValue(rt.attribute(p, "m"))]));
      rt.frameLine(12);
      {
        const _nv = rt.writeIdx(rt.attribute(p, "m"), rt.V.int(1), rt.V.int(7));
        if (_nv !== null) rt.writeProp(p, "m", _nv);
      }
      rt.frameLine(13);
      print(rt.showArgs([rt.V.str("u2 "), rt.wrapValue(rt.attribute(p, "m"))]));
      rt.frameLine(14);
      let arr = rt.V.array(rt.GArray.of([p]));
      rt.frameLine(15);
      {
      const _w0 = rt.V.int(0);
        const _nv = rt.writeProp(rt.attribute(rt.index(arr, _w0), "m"), "x", rt.V.int(9));
        if (_nv !== null) rt.writeProp(rt.index(arr, _w0), "m", _nv);
      }
      rt.frameLine(16);
      print(rt.showArgs([rt.V.str("u3 "), rt.wrapValue(rt.attribute(p, "m")), rt.V.str(" "), rt.wrapValue(rt.attribute(rt.wrapValue(rt.index(arr, rt.V.int(0))), "m"))]));
      rt.frameLine(17);
      let d = rt.dictOf([[rt.V.str("k"), p]]);
      rt.frameLine(18);
      {
      const _w0 = rt.V.str("k");
        const _nv = rt.writeProp(rt.attribute(rt.index(d, _w0), "m"), "y", rt.V.int(3));
        if (_nv !== null) rt.writeProp(rt.index(d, _w0), "m", _nv);
      }
      rt.frameLine(19);
      print(rt.showArgs([rt.V.str("u4 "), rt.wrapValue(rt.attribute(p, "m"))]));
      rt.frameLine(20);
      let q = rt.wrapValue(rt.attribute(p, "m"));
      rt.frameLine(21);
      {
        const _nv = rt.writeProp(q, "x", rt.V.int(50));
        if (_nv !== null) q = _nv;
      }
      rt.frameLine(22);
      print(rt.showArgs([rt.V.str("u5 "), rt.wrapValue(rt.attribute(p, "m")), rt.V.str(" "), q]));
      rt.frameLine(23);
      print(rt.showArgs([rt.V.str("u6 "), rt.method(p, "getm", [])]));
      rt.frameLine(24);
      print(rt.showArgs([rt.V.str("u7 "), rt.wrapValue(rt.index(rt.wrapValue(rt.attribute(p, "m")), rt.V.int(0))), rt.V.str(" "), rt.wrapValue(rt.index(rt.wrapValue(rt.attribute(p, "m")), rt.V.int(1))), rt.V.str(" "), rt.wrapValue(rt.attribute(rt.wrapValue(rt.attribute(p, "m")), "y"))]));
      rt.frameLine(25);
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
class Box extends rt.GdScriptObject {
  declare m: rt.Variant;

  __gd_fields__() {
    const __gd_frame = rt.frameEnter("res://main.gd", "@implicit_new");
    try {
      rt.frameLine(4);
      this.m = rt.toVec2(rt.vector2New([rt.V.int(1), rt.V.int(2)]));
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

  getm(): rt.Variant {
    const __gd_frame = rt.frameEnter("res://main.gd", "getm");
    try {
      rt.frameLine(6);
      return this.m;
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return rt.V.nil();
    } finally {
      rt.frameExit(__gd_frame);
    }
  }
  
  override __gdDispatch(name: string, args: rt.Variant[]): rt.Variant | null {
    switch (name) {
      case "getm": return rt.wrapValue(this.getm());
      default: return super.__gdDispatch(name, args);
    }
  }

}
const __gd_d_Box = rt.defineClass(Box, () => new Box(), (o) => o instanceof Box);
rt.nameClass(__gd_d_Box, "Box");
rt.registerFieldTypes(__gd_d_Box, {"m": "Vector2"});
rt.registerScriptProps(__gd_d_Box, ["m"], (o) => { const s = o as Box; return [s.m]; });
rt.registerDictIdentity(__gd_d_Box, "res://main.gd", "Box", ["m"], {}, (o) => { const s = o as Box; return [s.m]; });
rt.registerMethodArities(__gd_d_Box, { "getm": [0, 0] });
rt.registerNativeBase(__gd_d_Box, "RefCounted");

const __gd_entry = new Main();
try {
  await __gd_entry.run();
} catch (__gd_e) {
  rt.reportRunFailure(__gd_e);
}
