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
      print(rt.showArgs([rt.V.str("E|0, 1, 0||"), rt.method(rt.vector3New([rt.V.int(0), rt.V.int(1), rt.V.int(0)]), "octahedron_encode", [])]));
      rt.frameLine(5);
      print(rt.showArgs([rt.V.str("E|1, 0, 0||"), rt.method(rt.vector3New([rt.V.int(1), rt.V.int(0), rt.V.int(0)]), "octahedron_encode", [])]));
      rt.frameLine(6);
      print(rt.showArgs([rt.V.str("E|0, 0, 1||"), rt.method(rt.vector3New([rt.V.int(0), rt.V.int(0), rt.V.int(1)]), "octahedron_encode", [])]));
      rt.frameLine(7);
      print(rt.showArgs([rt.V.str("E|1, 1, 1||"), rt.method(rt.vector3New([rt.V.int(1), rt.V.int(1), rt.V.int(1)]), "octahedron_encode", [])]));
      rt.frameLine(8);
      print(rt.showArgs([rt.V.str("E|-1, 0, 0||"), rt.method(rt.vector3New([rt.V.int((-1)), rt.V.int(0), rt.V.int(0)]), "octahedron_encode", [])]));
      rt.frameLine(9);
      print(rt.showArgs([rt.V.str("E|0, 0, -1||"), rt.method(rt.vector3New([rt.V.int(0), rt.V.int(0), rt.V.int((-1))]), "octahedron_encode", [])]));
      rt.frameLine(10);
      print(rt.showArgs([rt.V.str("E|2, 0, 0||"), rt.method(rt.vector3New([rt.V.int(2), rt.V.int(0), rt.V.int(0)]), "octahedron_encode", [])]));
      rt.frameLine(11);
      print(rt.showArgs([rt.V.str("E|0, 2, 0||"), rt.method(rt.vector3New([rt.V.int(0), rt.V.int(2), rt.V.int(0)]), "octahedron_encode", [])]));
      rt.frameLine(12);
      print(rt.showArgs([rt.V.str("E|0, 0, 2||"), rt.method(rt.vector3New([rt.V.int(0), rt.V.int(0), rt.V.int(2)]), "octahedron_encode", [])]));
      rt.frameLine(13);
      print(rt.showArgs([rt.V.str("E|-1, -1, -1||"), rt.method(rt.vector3New([rt.V.int((-1)), rt.V.int((-1)), rt.V.int((-1))]), "octahedron_encode", [])]));
      rt.frameLine(14);
      print(rt.showArgs([rt.V.str("E|1, 2, 3||"), rt.method(rt.vector3New([rt.V.int(1), rt.V.int(2), rt.V.int(3)]), "octahedron_encode", [])]));
      rt.frameLine(15);
      print(rt.showArgs([rt.V.str("E|-1, 2, -3||"), rt.method(rt.vector3New([rt.V.int((-1)), rt.V.int(2), rt.V.int((-3))]), "octahedron_encode", [])]));
      rt.frameLine(16);
      print(rt.showArgs([rt.V.str("E|0.5, 0.5, 0||"), rt.method(rt.vector3New([rt.V.float(0.5), rt.V.float(0.5), rt.V.int(0)]), "octahedron_encode", [])]));
      rt.frameLine(17);
      print(rt.showArgs([rt.V.str("E|0, 0, 0||"), rt.method(rt.vector3New([rt.V.int(0), rt.V.int(0), rt.V.int(0)]), "octahedron_encode", [])]));
      rt.frameLine(18);
      print(rt.showArgs([rt.V.str("E|1, 0, 1||"), rt.method(rt.vector3New([rt.V.int(1), rt.V.int(0), rt.V.int(1)]), "octahedron_encode", [])]));
      rt.frameLine(19);
      print(rt.showArgs([rt.V.str("E|0, 1, 1||"), rt.method(rt.vector3New([rt.V.int(0), rt.V.int(1), rt.V.int(1)]), "octahedron_encode", [])]));
      rt.frameLine(20);
      print(rt.showArgs([rt.V.str("E|1, 1, 0||"), rt.method(rt.vector3New([rt.V.int(1), rt.V.int(1), rt.V.int(0)]), "octahedron_encode", [])]));
      rt.frameLine(21);
      print(rt.showArgs([rt.V.str("E|-0.25, 0.75, 0.5||"), rt.method(rt.vector3New([rt.V.float((-0.25)), rt.V.float(0.75), rt.V.float(0.5)]), "octahedron_encode", [])]));
      rt.frameLine(22);
      print(rt.showArgs([rt.V.str("E|3, -1, 2||"), rt.method(rt.vector3New([rt.V.int(3), rt.V.int((-1)), rt.V.int(2)]), "octahedron_encode", [])]));
      rt.frameLine(23);
      print(rt.showArgs([rt.V.str("E|0.1, 0.2, 0.3||"), rt.method(rt.vector3New([rt.V.float(0.1), rt.V.float(0.2), rt.V.float(0.3)]), "octahedron_encode", [])]));
      rt.frameLine(24);
      print(rt.showArgs([rt.V.str("E|1, -1, 0||"), rt.method(rt.vector3New([rt.V.int(1), rt.V.int((-1)), rt.V.int(0)]), "octahedron_encode", [])]));
      rt.frameLine(25);
      print(rt.showArgs([rt.V.str("E|1, 0, -1||"), rt.method(rt.vector3New([rt.V.int(1), rt.V.int(0), rt.V.int((-1))]), "octahedron_encode", [])]));
      rt.frameLine(26);
      print(rt.showArgs([rt.V.str("E|-1, 0, 1||"), rt.method(rt.vector3New([rt.V.int((-1)), rt.V.int(0), rt.V.int(1)]), "octahedron_encode", [])]));
      rt.frameLine(27);
      print(rt.showArgs([rt.V.str("E|0, -1, 1||"), rt.method(rt.vector3New([rt.V.int(0), rt.V.int((-1)), rt.V.int(1)]), "octahedron_encode", [])]));
      rt.frameLine(28);
      print(rt.showArgs([rt.V.str("E|1000, 1, 1||"), rt.method(rt.vector3New([rt.V.int(1000), rt.V.int(1), rt.V.int(1)]), "octahedron_encode", [])]));
      rt.frameLine(29);
      print(rt.showArgs([rt.V.str("E|1, 1000, 1||"), rt.method(rt.vector3New([rt.V.int(1), rt.V.int(1000), rt.V.int(1)]), "octahedron_encode", [])]));
      rt.frameLine(30);
      print(rt.showArgs([rt.V.str("E|1, 1, 1000||"), rt.method(rt.vector3New([rt.V.int(1), rt.V.int(1), rt.V.int(1000)]), "octahedron_encode", [])]));
      rt.frameLine(31);
      print(rt.showArgs([rt.V.str("E|0.003, 0.7, -0.9||"), rt.method(rt.vector3New([rt.V.float(0.003), rt.V.float(0.7), rt.V.float((-0.9))]), "octahedron_encode", [])]));
      rt.frameLine(32);
      print(rt.showArgs([rt.V.str("E|-7, -3, 5||"), rt.method(rt.vector3New([rt.V.int((-7)), rt.V.int((-3)), rt.V.int(5)]), "octahedron_encode", [])]));
      rt.frameLine(33);
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
