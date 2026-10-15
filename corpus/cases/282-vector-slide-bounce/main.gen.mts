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

  show(tag: rt.Variant, v: rt.Variant): void {
    const __gd_frame = rt.frameEnter("res://main.gd", "show");
    try {
      rt.frameLine(4);
      print(rt.showArgs([tag, rt.V.str("|"), v]));
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return;
    } finally {
      rt.frameExit(__gd_frame);
    }
  }
  
    override _initialize(): Promise<void> { return this.__gd__initialize(); }
  async __gd__initialize(): Promise<void> {
    const __gd_frame = rt.frameEnter("res://main.gd", "_initialize");
    try {
      rt.frameLine(7);
      this.show(rt.V.str("s01|"), rt.method(rt.vector2New([rt.V.int(1), rt.V.int(2)]), "slide", [rt.vector2New([rt.V.int(1), rt.V.int(0)])]));
      rt.frameLine(8);
      this.show(rt.V.str("s02|"), rt.method(rt.vector2New([rt.V.int(1), rt.V.int(2)]), "slide", [rt.vector2New([rt.V.int(0), rt.V.int(1)])]));
      rt.frameLine(9);
      this.show(rt.V.str("s03|"), rt.method(rt.vector2New([rt.V.int(1), rt.V.int(2)]), "slide", [rt.vector2New([rt.V.float(0.6), rt.V.float(0.8)])]));
      rt.frameLine(10);
      this.show(rt.V.str("s04|"), rt.method(rt.vector2New([rt.V.int(1), rt.V.int(2)]), "slide", [rt.vector2New([rt.V.int(2), rt.V.int(0)])]));
      rt.frameLine(11);
      this.show(rt.V.str("s05|"), rt.method(rt.vector2New([rt.V.int(1), rt.V.int(2)]), "slide", [rt.vector2New([rt.V.int(1), rt.V.int(1)])]));
      rt.frameLine(12);
      this.show(rt.V.str("s06|"), rt.method(rt.vector2New([rt.V.int(1), rt.V.int(2)]), "slide", [rt.vector2New([rt.V.int(0), rt.V.int(0)])]));
      rt.frameLine(13);
      this.show(rt.V.str("s07|"), rt.method(rt.vector2New([rt.V.int(1), rt.V.int(2)]), "slide", [rt.vector2New([rt.V.int(1), rt.V.float(0.0316)])]));
      rt.frameLine(14);
      this.show(rt.V.str("s08|"), rt.method(rt.vector2New([rt.V.int(1), rt.V.int(2)]), "slide", [rt.vector2New([rt.V.int(1), rt.V.float(0.032)])]));
      rt.frameLine(15);
      this.show(rt.V.str("s09|"), rt.method(rt.vector2New([rt.V.int((-3)), rt.V.float(0.5)]), "slide", [rt.vector2New([rt.V.int(0), rt.V.int((-1))])]));
      rt.frameLine(16);
      this.show(rt.V.str("b01|"), rt.method(rt.vector2New([rt.V.int(1), rt.V.int(2)]), "bounce", [rt.vector2New([rt.V.int(1), rt.V.int(0)])]));
      rt.frameLine(17);
      this.show(rt.V.str("b02|"), rt.method(rt.vector2New([rt.V.int(1), rt.V.int(2)]), "bounce", [rt.vector2New([rt.V.float(0.6), rt.V.float(0.8)])]));
      rt.frameLine(18);
      this.show(rt.V.str("b03|"), rt.method(rt.vector2New([rt.V.int((-3)), rt.V.float(0.5)]), "bounce", [rt.vector2New([rt.V.int(0), rt.V.int((-1))])]));
      rt.frameLine(19);
      this.show(rt.V.str("b04|"), rt.method(rt.vector2New([rt.V.int(1), rt.V.int(2)]), "bounce", [rt.vector2New([rt.V.int(2), rt.V.int(0)])]));
      rt.frameLine(20);
      this.show(rt.V.str("r01|"), rt.method(rt.vector2New([rt.V.int(1), rt.V.int(2)]), "reflect", [rt.vector2New([rt.V.int(1), rt.V.int(0)])]));
      rt.frameLine(21);
      this.show(rt.V.str("r02|"), rt.method(rt.vector2New([rt.V.int(1), rt.V.int(2)]), "reflect", [rt.vector2New([rt.V.float(0.6), rt.V.float(0.8)])]));
      rt.frameLine(22);
      this.show(rt.V.str("r03|"), rt.method(rt.vector2New([rt.V.int((-3)), rt.V.float(0.5)]), "reflect", [rt.vector2New([rt.V.int(0), rt.V.int((-1))])]));
      rt.frameLine(23);
      this.show(rt.V.str("r04|"), rt.method(rt.vector2New([rt.V.int(0), rt.V.int(0)]), "reflect", [rt.vector2New([rt.V.float(0.6), rt.V.float(0.8)])]));
      rt.frameLine(24);
      this.show(rt.V.str("p01|"), rt.method(rt.vector2New([rt.V.int(1), rt.V.int(2)]), "project", [rt.vector2New([rt.V.int(1), rt.V.int(0)])]));
      rt.frameLine(25);
      this.show(rt.V.str("p02|"), rt.method(rt.vector2New([rt.V.int(1), rt.V.int(2)]), "project", [rt.vector2New([rt.V.float(0.6), rt.V.float(0.8)])]));
      rt.frameLine(26);
      this.show(rt.V.str("p03|"), rt.method(rt.vector2New([rt.V.int(1), rt.V.int(2)]), "project", [rt.vector2New([rt.V.int(2), rt.V.int(0)])]));
      rt.frameLine(27);
      this.show(rt.V.str("p04|"), rt.method(rt.vector2New([rt.V.int(1), rt.V.int(2)]), "project", [rt.vector2New([rt.V.int(1), rt.V.int(1)])]));
      rt.frameLine(28);
      this.show(rt.V.str("p05|"), rt.method(rt.vector2New([rt.V.int(1), rt.V.int(2)]), "project", [rt.vector2New([rt.V.int(0), rt.V.int(0)])]));
      rt.frameLine(29);
      this.show(rt.V.str("p06|"), rt.method(rt.vector2New([rt.V.int(0), rt.V.int(0)]), "project", [rt.vector2New([rt.V.float(0.6), rt.V.float(0.8)])]));
      rt.frameLine(30);
      this.show(rt.V.str("t01|"), rt.method(rt.vector3New([rt.V.int(1), rt.V.int(2), rt.V.int(3)]), "slide", [rt.vector3New([rt.V.int(1), rt.V.int(0), rt.V.int(0)])]));
      rt.frameLine(31);
      this.show(rt.V.str("t02|"), rt.method(rt.vector3New([rt.V.int(1), rt.V.int(2), rt.V.int(3)]), "slide", [rt.vector3New([rt.V.int(0), rt.V.int(0), rt.V.int(1)])]));
      rt.frameLine(32);
      this.show(rt.V.str("t03|"), rt.method(rt.vector3New([rt.V.int(1), rt.V.int(2), rt.V.int(3)]), "slide", [rt.vector3New([rt.V.float(0.6), rt.V.int(0), rt.V.float(0.8)])]));
      rt.frameLine(33);
      this.show(rt.V.str("t04|"), rt.method(rt.vector3New([rt.V.int(1), rt.V.int(2), rt.V.int(3)]), "slide", [rt.vector3New([rt.V.float((-0.6)), rt.V.int(0), rt.V.float(0.8)])]));
      rt.frameLine(34);
      this.show(rt.V.str("t05|"), rt.method(rt.vector3New([rt.V.int(1), rt.V.int(2), rt.V.int(3)]), "slide", [rt.vector3New([rt.V.int(0), rt.V.int(2), rt.V.int(0)])]));
      rt.frameLine(35);
      this.show(rt.V.str("t06|"), rt.method(rt.vector3New([rt.V.int(1), rt.V.int(2), rt.V.int(3)]), "slide", [rt.vector3New([rt.V.int(0), rt.V.int(0), rt.V.int(0)])]));
      rt.frameLine(36);
      this.show(rt.V.str("t07|"), rt.method(rt.vector3New([rt.V.int(0), rt.V.int((-4)), rt.V.int(2)]), "slide", [rt.vector3New([rt.V.int(0), rt.V.int(1), rt.V.int(0)])]));
      rt.frameLine(37);
      this.show(rt.V.str("u01|"), rt.method(rt.vector3New([rt.V.int(1), rt.V.int(2), rt.V.int(3)]), "bounce", [rt.vector3New([rt.V.int(1), rt.V.int(0), rt.V.int(0)])]));
      rt.frameLine(38);
      this.show(rt.V.str("u02|"), rt.method(rt.vector3New([rt.V.int(1), rt.V.int(2), rt.V.int(3)]), "bounce", [rt.vector3New([rt.V.float(0.6), rt.V.int(0), rt.V.float(0.8)])]));
      rt.frameLine(39);
      this.show(rt.V.str("u03|"), rt.method(rt.vector3New([rt.V.int(1), rt.V.int(2), rt.V.int(3)]), "bounce", [rt.vector3New([rt.V.int(1), rt.V.int(1), rt.V.int(1)])]));
      rt.frameLine(40);
      this.show(rt.V.str("u04|"), rt.method(rt.vector3New([rt.V.int(0), rt.V.int((-4)), rt.V.int(2)]), "bounce", [rt.vector3New([rt.V.int(0), rt.V.int(1), rt.V.int(0)])]));
      rt.frameLine(41);
      this.show(rt.V.str("v01|"), rt.method(rt.vector3New([rt.V.int(1), rt.V.int(2), rt.V.int(3)]), "reflect", [rt.vector3New([rt.V.int(1), rt.V.int(0), rt.V.int(0)])]));
      rt.frameLine(42);
      this.show(rt.V.str("v02|"), rt.method(rt.vector3New([rt.V.int(1), rt.V.int(2), rt.V.int(3)]), "reflect", [rt.vector3New([rt.V.int(0), rt.V.int(0), rt.V.int(1)])]));
      rt.frameLine(43);
      this.show(rt.V.str("v03|"), rt.method(rt.vector3New([rt.V.int(1), rt.V.int(2), rt.V.int(3)]), "reflect", [rt.vector3New([rt.V.float(0.6), rt.V.int(0), rt.V.float(0.8)])]));
      rt.frameLine(44);
      this.show(rt.V.str("v04|"), rt.method(rt.vector3New([rt.V.int(1), rt.V.int(2), rt.V.int(3)]), "reflect", [rt.vector3New([rt.V.float((-0.6)), rt.V.int(0), rt.V.float(0.8)])]));
      rt.frameLine(45);
      this.show(rt.V.str("v05|"), rt.method(rt.vector3New([rt.V.int(0), rt.V.int((-4)), rt.V.int(2)]), "reflect", [rt.vector3New([rt.V.int(0), rt.V.int(1), rt.V.int(0)])]));
      rt.frameLine(46);
      this.show(rt.V.str("w01|"), rt.method(rt.vector3New([rt.V.int(1), rt.V.int(2), rt.V.int(3)]), "project", [rt.vector3New([rt.V.int(1), rt.V.int(0), rt.V.int(0)])]));
      rt.frameLine(47);
      this.show(rt.V.str("w02|"), rt.method(rt.vector3New([rt.V.int(1), rt.V.int(2), rt.V.int(3)]), "project", [rt.vector3New([rt.V.int(0), rt.V.int(0), rt.V.int(1)])]));
      rt.frameLine(48);
      this.show(rt.V.str("w03|"), rt.method(rt.vector3New([rt.V.int(1), rt.V.int(2), rt.V.int(3)]), "project", [rt.vector3New([rt.V.float(0.6), rt.V.int(0), rt.V.float(0.8)])]));
      rt.frameLine(49);
      this.show(rt.V.str("w04|"), rt.method(rt.vector3New([rt.V.int(1), rt.V.int(2), rt.V.int(3)]), "project", [rt.vector3New([rt.V.int(0), rt.V.int(2), rt.V.int(0)])]));
      rt.frameLine(50);
      this.show(rt.V.str("w05|"), rt.method(rt.vector3New([rt.V.int(1), rt.V.int(2), rt.V.int(3)]), "project", [rt.vector3New([rt.V.int(1), rt.V.int(1), rt.V.int(1)])]));
      rt.frameLine(51);
      this.show(rt.V.str("w06|"), rt.method(rt.vector3New([rt.V.int(1), rt.V.int(2), rt.V.int(3)]), "project", [rt.vector3New([rt.V.int(0), rt.V.int(0), rt.V.int(0)])]));
      rt.frameLine(52);
      this.show(rt.V.str("x01|"), rt.typeOf(rt.method(rt.vector2New([rt.V.int(1), rt.V.int(2)]), "slide", [rt.vector2New([rt.V.int(1), rt.V.int(0)])])));
      rt.frameLine(53);
      this.show(rt.V.str("x02|"), rt.typeOf(rt.method(rt.vector3New([rt.V.int(1), rt.V.int(2), rt.V.int(3)]), "project", [rt.vector3New([rt.V.int(1), rt.V.int(0), rt.V.int(0)])])));
      rt.frameLine(54);
      this.show(rt.V.str("x03|"), rt.typeOf(rt.method(rt.vector2New([rt.V.int(1), rt.V.int(2)]), "project", [rt.vector2New([rt.V.int(0), rt.V.int(0)])])));
      rt.frameLine(55);
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
      case "show": return rt.wrapValue(this.show(args[0] as rt.Variant, args[1] as rt.Variant));
      case "_initialize": return rt.wrapValue(this.__gd__initialize());
      default: return super.__gdDispatch(name, args);
    }
  }

}

const __gd_d_Main = rt.defineClass(Main, () => new Main(), (o) => o instanceof Main);
rt.registerDictIdentity(__gd_d_Main, "res://main.gd", "", [], {}, (o) => { const s = o as Main; return []; });
rt.registerMethodArities(__gd_d_Main, { "show": [2, 2], "_initialize": [0, 0] });
rt.registerNativeBase(__gd_d_Main, "SceneTree");
rt.registerScriptLabel(__gd_d_Main, "main.gd");
rt.registerScript("res://main.gd", __gd_d_Main);
const __gd_entry = new Main();
try {
  await __gd_entry.run();
} catch (__gd_e) {
  rt.reportRunFailure(__gd_e);
}
