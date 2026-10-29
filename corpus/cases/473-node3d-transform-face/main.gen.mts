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
      let n = rt.method(rt.nativeClass("Node3D"), "new", []);
      rt.frameLine(5);
      print(rt.showArgs([rt.V.str("t|a1|"), rt.strBuiltin([rt.wrapValue(rt.attribute(n, "transform"))]), rt.V.str("|"), rt.strBuiltin([rt.wrapValue(rt.attribute(rt.wrapValue(rt.attribute(n, "transform")), "basis"))]), rt.V.str("|"), rt.strBuiltin([rt.wrapValue(rt.attribute(rt.wrapValue(rt.attribute(n, "transform")), "origin"))])]));
      rt.frameLine(6);
      {
        const _nv = rt.writeProp(n, "position", rt.vector3New([rt.V.int(1), rt.V.int(2), rt.V.int(3)]));
        if (_nv !== null) n = _nv;
      }
      rt.frameLine(7);
      {
        const _nv = rt.writeProp(n, "rotation", rt.vector3New([rt.V.float(0.1), rt.V.float(0.2), rt.V.float(0.3)]));
        if (_nv !== null) n = _nv;
      }
      rt.frameLine(8);
      {
        const _nv = rt.writeProp(n, "scale", rt.vector3New([rt.V.int(2), rt.V.int(2), rt.V.int(2)]));
        if (_nv !== null) n = _nv;
      }
      rt.frameLine(9);
      print(rt.showArgs([rt.V.str("t|a2|"), rt.strBuiltin([rt.wrapValue(rt.attribute(n, "transform"))]), rt.V.str("|"), rt.strBuiltin([rt.wrapValue(rt.attribute(rt.wrapValue(rt.attribute(n, "transform")), "basis"))]), rt.V.str("|"), rt.strBuiltin([rt.wrapValue(rt.attribute(rt.wrapValue(rt.attribute(n, "transform")), "origin"))])]));
      rt.frameLine(10);
      let m = rt.method(rt.nativeClass("Node3D"), "new", []);
      rt.frameLine(11);
      {
        const _nv = rt.writeProp(m, "transform", rt.transform3dNew([rt.basisNew([rt.vector3New([rt.V.int(1), rt.V.int(2), rt.V.int(3)]), rt.vector3New([rt.V.int(4), rt.V.int(5), rt.V.int(6)]), rt.vector3New([rt.V.int(7), rt.V.int(8), rt.V.int(10)])]), rt.vector3New([rt.V.int(11), rt.V.int(12), rt.V.int(13)])]));
        if (_nv !== null) m = _nv;
      }
      rt.frameLine(12);
      print(rt.showArgs([rt.V.str("t|a3|"), rt.strBuiltin([rt.wrapValue(rt.attribute(m, "position"))]), rt.V.str("|"), rt.strBuiltin([rt.wrapValue(rt.attribute(m, "rotation"))]), rt.V.str("|"), rt.strBuiltin([rt.wrapValue(rt.attribute(m, "scale"))]), rt.V.str("|"), rt.strBuiltin([rt.wrapValue(rt.attribute(m, "basis"))]), rt.V.str("|"), rt.strBuiltin([rt.wrapValue(rt.attribute(m, "transform"))])]));
      rt.frameLine(13);
      let q = rt.method(rt.nativeClass("Node3D"), "new", []);
      rt.frameLine(14);
      {
        const _nv = rt.writeProp(q, "transform", rt.transform3dNew([rt.basisNew([rt.vector3New([rt.V.int(0), rt.V.int((-1)), rt.V.int(0)]), rt.vector3New([rt.V.int(1), rt.V.int(0), rt.V.int(0)]), rt.vector3New([rt.V.int(0), rt.V.int(0), rt.V.int(1)])]), rt.vector3New([rt.V.int(1), rt.V.int(2), rt.V.int(3)])]));
        if (_nv !== null) q = _nv;
      }
      rt.frameLine(15);
      print(rt.showArgs([rt.V.str("t|a4|"), rt.strBuiltin([rt.wrapValue(rt.attribute(q, "position"))]), rt.V.str("|"), rt.strBuiltin([rt.wrapValue(rt.attribute(q, "rotation"))]), rt.V.str("|"), rt.strBuiltin([rt.wrapValue(rt.attribute(q, "rotation_degrees"))]), rt.V.str("|"), rt.strBuiltin([rt.wrapValue(rt.attribute(q, "scale"))]), rt.V.str("|"), rt.strBuiltin([rt.wrapValue(rt.attribute(q, "basis"))])]));
      rt.frameLine(16);
      let g = rt.method(rt.nativeClass("Node3D"), "new", []);
      rt.frameLine(17);
      {
        const _nv = rt.writeProp(g, "transform", rt.transform3dNew([rt.basisNew([rt.vector3New([rt.V.int(2), rt.V.int(0), rt.V.int(0)]), rt.vector3New([rt.V.int(0), rt.V.int((-3)), rt.V.int(0)]), rt.vector3New([rt.V.int(0), rt.V.int(0), rt.V.int(4)])]), rt.vector3New([rt.V.int(1), rt.V.int(1), rt.V.int(1)])]));
        if (_nv !== null) g = _nv;
      }
      rt.frameLine(18);
      print(rt.showArgs([rt.V.str("t|a5|"), rt.strBuiltin([rt.wrapValue(rt.attribute(g, "scale"))]), rt.V.str("|"), rt.strBuiltin([rt.wrapValue(rt.attribute(g, "rotation"))]), rt.V.str("|"), rt.strBuiltin([rt.wrapValue(rt.attribute(g, "basis"))])]));
      rt.frameLine(19);
      let s = rt.method(rt.nativeClass("Node3D"), "new", []);
      rt.frameLine(20);
      {
        const _nv = rt.writeProp(s, "transform", rt.transform3dNew([rt.basisNew([rt.vector3New([rt.V.int(2), rt.V.int(1), rt.V.int(0)]), rt.vector3New([rt.V.int(0), rt.V.int(3), rt.V.int(0)]), rt.vector3New([rt.V.int(0), rt.V.int(0), rt.V.int(4)])]), rt.vector3New([rt.V.int(1), rt.V.int(2), rt.V.int(3)])]));
        if (_nv !== null) s = _nv;
      }
      rt.frameLine(21);
      print(rt.showArgs([rt.V.str("t|a6|"), rt.strBuiltin([rt.wrapValue(rt.attribute(s, "rotation"))]), rt.V.str("|"), rt.strBuiltin([rt.wrapValue(rt.attribute(s, "scale"))]), rt.V.str("|"), rt.strBuiltin([rt.wrapValue(rt.attribute(s, "position"))]), rt.V.str("|"), rt.strBuiltin([rt.wrapValue(rt.attribute(s, "rotation_degrees"))])]));
      rt.frameLine(22);
      let c = rt.method(rt.nativeClass("Node3D"), "new", []);
      rt.frameLine(23);
      {
        const _nv = rt.writeProp(c, "transform", rt.transform3dNew([rt.basisNew([rt.vector3New([rt.V.int(0), rt.V.int(0), rt.V.int(1)]), rt.vector3New([rt.V.int(1), rt.V.int(0), rt.V.int(0)]), rt.vector3New([rt.V.int(0), rt.V.int(1), rt.V.int(0)])]), rt.vector3New([rt.V.int(0), rt.V.int(0), rt.V.int(0)])]));
        if (_nv !== null) c = _nv;
      }
      rt.frameLine(24);
      print(rt.showArgs([rt.V.str("t|a7|"), rt.strBuiltin([rt.wrapValue(rt.attribute(c, "rotation"))]), rt.V.str("|"), rt.strBuiltin([rt.wrapValue(rt.attribute(c, "scale"))]), rt.V.str("|"), rt.strBuiltin([rt.wrapValue(rt.attribute(c, "rotation_degrees"))])]));
      rt.frameLine(25);
      let e = rt.method(rt.nativeClass("Node3D"), "new", []);
      rt.frameLine(26);
      {
        const _nv = rt.writeProp(e, "transform", rt.transform3dNew([rt.basisNew([rt.vector3New([rt.V.float(0.5), rt.V.float(0.5), rt.V.float(0.7071068)]), rt.vector3New([rt.V.float((-0.7071068)), rt.V.float(0.7071068), rt.V.float(0)]), rt.vector3New([rt.V.float((-0.5)), rt.V.float((-0.5)), rt.V.float(0.7071068)])]), rt.vector3New([rt.V.int(1), rt.V.int(1), rt.V.int(1)])]));
        if (_nv !== null) e = _nv;
      }
      rt.frameLine(27);
      print(rt.showArgs([rt.V.str("t|a8|"), rt.strBuiltin([rt.wrapValue(rt.attribute(e, "rotation"))]), rt.V.str("|"), rt.strBuiltin([rt.wrapValue(rt.attribute(e, "scale"))]), rt.V.str("|"), rt.strBuiltin([rt.wrapValue(rt.attribute(e, "position"))])]));
      rt.frameLine(28);
      print(rt.showArgs([rt.V.str("t|a9|"), rt.strBuiltin([rt.wrapValue(rt.attribute(n, "global_position"))]), rt.V.str("|"), rt.strBuiltin([rt.wrapValue(rt.attribute(n, "global_rotation"))]), rt.V.str("|"), rt.strBuiltin([rt.wrapValue(rt.attribute(n, "global_rotation_degrees"))]), rt.V.str("|"), rt.strBuiltin([rt.wrapValue(rt.attribute(n, "global_basis"))]), rt.V.str("|"), rt.strBuiltin([rt.method(n, "get_global_transform", [])])]));
      rt.frameLine(29);
      {
        const _nv = rt.writeProp(n, "global_position", rt.vector3New([rt.V.int(4), rt.V.int(5), rt.V.int(6)]));
        if (_nv !== null) n = _nv;
      }
      rt.frameLine(30);
      print(rt.showArgs([rt.V.str("t|a10|"), rt.strBuiltin([rt.wrapValue(rt.attribute(n, "position"))]), rt.V.str("|"), rt.strBuiltin([rt.wrapValue(rt.attribute(n, "transform"))])]));
      rt.frameLine(31);
      let k = rt.method(rt.nativeClass("Node3D"), "new", []);
      rt.frameLine(32);
      print(rt.showArgs([rt.V.str("t|a11|"), rt.isType(k, "Node3D"), rt.V.str("|"), rt.isType(k, "Node"), rt.V.str("|"), rt.isType(k, "Object"), rt.V.str("|"), rt.method(k, "get_class", []), rt.V.str("|"), rt.method(k, "is_class", [rt.V.str("Node3D")])]));
      rt.frameLine(33);
      let tr = rt.wrapValue(rt.attribute(n, "transform"));
      rt.frameLine(34);
      {
        const _nv = rt.writeProp(tr, "origin", rt.vector3New([rt.V.int(7), rt.V.int(8), rt.V.int(9)]));
        if (_nv !== null) tr = _nv;
      }
      rt.frameLine(35);
      {
        const _nv = rt.writeProp(n, "transform", tr);
        if (_nv !== null) n = _nv;
      }
      rt.frameLine(36);
      print(rt.showArgs([rt.V.str("t|a12|"), rt.strBuiltin([rt.wrapValue(rt.attribute(n, "position"))]), rt.V.str("|"), rt.strBuiltin([rt.wrapValue(rt.attribute(n, "rotation"))]), rt.V.str("|"), rt.strBuiltin([rt.wrapValue(rt.attribute(n, "transform"))])]));
      rt.frameLine(37);
      rt.method(n, "free", []);
      rt.frameLine(38);
      rt.method(m, "free", []);
      rt.frameLine(39);
      rt.method(q, "free", []);
      rt.frameLine(40);
      rt.method(g, "free", []);
      rt.frameLine(41);
      rt.method(s, "free", []);
      rt.frameLine(42);
      rt.method(c, "free", []);
      rt.frameLine(43);
      rt.method(e, "free", []);
      rt.frameLine(44);
      rt.method(k, "free", []);
      rt.frameLine(45);
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
