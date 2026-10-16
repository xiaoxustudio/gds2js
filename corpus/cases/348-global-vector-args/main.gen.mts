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
      print(rt.showArgs([rt.V.str("C00|"), rt.typeOf(rt.abs(rt.vector2New([rt.V.float((-1.5)), rt.V.int(2)]))), rt.V.str("|"), rt.abs(rt.vector2New([rt.V.float((-1.5)), rt.V.int(2)]))]));
      rt.frameLine(5);
      print(rt.showArgs([rt.V.str("C01|"), rt.typeOf(rt.abs(rt.vector2iNew([rt.V.int((-1)), rt.V.int(2)]))), rt.V.str("|"), rt.abs(rt.vector2iNew([rt.V.int((-1)), rt.V.int(2)]))]));
      rt.frameLine(6);
      print(rt.showArgs([rt.V.str("C02|"), rt.typeOf(rt.abs(rt.vector3New([rt.V.float((-1.5)), rt.V.int(2), rt.V.int((-3))]))), rt.V.str("|"), rt.abs(rt.vector3New([rt.V.float((-1.5)), rt.V.int(2), rt.V.int((-3))]))]));
      rt.frameLine(7);
      print(rt.showArgs([rt.V.str("C03|"), rt.typeOf(rt.abs(rt.vector3iNew([rt.V.int((-1)), rt.V.int(2), rt.V.int((-3))]))), rt.V.str("|"), rt.abs(rt.vector3iNew([rt.V.int((-1)), rt.V.int(2), rt.V.int((-3))]))]));
      rt.frameLine(8);
      print(rt.showArgs([rt.V.str("C04|"), rt.typeOf(rt.gCeil(rt.vector2New([rt.V.float((-1.5)), rt.V.int(2)]), "auto")), rt.V.str("|"), rt.gCeil(rt.vector2New([rt.V.float((-1.5)), rt.V.int(2)]), "auto")]));
      rt.frameLine(9);
      print(rt.showArgs([rt.V.str("C05|"), rt.typeOf(rt.gCeil(rt.vector2iNew([rt.V.int((-1)), rt.V.int(2)]), "auto")), rt.V.str("|"), rt.gCeil(rt.vector2iNew([rt.V.int((-1)), rt.V.int(2)]), "auto")]));
      rt.frameLine(10);
      print(rt.showArgs([rt.V.str("C06|"), rt.typeOf(rt.gCeil(rt.vector3New([rt.V.float((-1.5)), rt.V.int(2), rt.V.int((-3))]), "auto")), rt.V.str("|"), rt.gCeil(rt.vector3New([rt.V.float((-1.5)), rt.V.int(2), rt.V.int((-3))]), "auto")]));
      rt.frameLine(11);
      print(rt.showArgs([rt.V.str("C07|"), rt.typeOf(rt.gCeil(rt.vector3iNew([rt.V.int((-1)), rt.V.int(2), rt.V.int((-3))]), "auto")), rt.V.str("|"), rt.gCeil(rt.vector3iNew([rt.V.int((-1)), rt.V.int(2), rt.V.int((-3))]), "auto")]));
      rt.frameLine(12);
      print(rt.showArgs([rt.V.str("C08|"), rt.typeOf(rt.gFloor(rt.vector2New([rt.V.float((-1.5)), rt.V.int(2)]), "auto")), rt.V.str("|"), rt.gFloor(rt.vector2New([rt.V.float((-1.5)), rt.V.int(2)]), "auto")]));
      rt.frameLine(13);
      print(rt.showArgs([rt.V.str("C09|"), rt.typeOf(rt.gFloor(rt.vector2iNew([rt.V.int((-1)), rt.V.int(2)]), "auto")), rt.V.str("|"), rt.gFloor(rt.vector2iNew([rt.V.int((-1)), rt.V.int(2)]), "auto")]));
      rt.frameLine(14);
      print(rt.showArgs([rt.V.str("C10|"), rt.typeOf(rt.gFloor(rt.vector3New([rt.V.float((-1.5)), rt.V.int(2), rt.V.int((-3))]), "auto")), rt.V.str("|"), rt.gFloor(rt.vector3New([rt.V.float((-1.5)), rt.V.int(2), rt.V.int((-3))]), "auto")]));
      rt.frameLine(15);
      print(rt.showArgs([rt.V.str("C11|"), rt.typeOf(rt.gFloor(rt.vector3iNew([rt.V.int((-1)), rt.V.int(2), rt.V.int((-3))]), "auto")), rt.V.str("|"), rt.gFloor(rt.vector3iNew([rt.V.int((-1)), rt.V.int(2), rt.V.int((-3))]), "auto")]));
      rt.frameLine(16);
      print(rt.showArgs([rt.V.str("C12|"), rt.typeOf(rt.gRound(rt.vector2New([rt.V.float((-1.5)), rt.V.int(2)]), "auto")), rt.V.str("|"), rt.gRound(rt.vector2New([rt.V.float((-1.5)), rt.V.int(2)]), "auto")]));
      rt.frameLine(17);
      print(rt.showArgs([rt.V.str("C13|"), rt.typeOf(rt.gRound(rt.vector2iNew([rt.V.int((-1)), rt.V.int(2)]), "auto")), rt.V.str("|"), rt.gRound(rt.vector2iNew([rt.V.int((-1)), rt.V.int(2)]), "auto")]));
      rt.frameLine(18);
      print(rt.showArgs([rt.V.str("C14|"), rt.typeOf(rt.gRound(rt.vector3New([rt.V.float((-1.5)), rt.V.int(2), rt.V.int((-3))]), "auto")), rt.V.str("|"), rt.gRound(rt.vector3New([rt.V.float((-1.5)), rt.V.int(2), rt.V.int((-3))]), "auto")]));
      rt.frameLine(19);
      print(rt.showArgs([rt.V.str("C15|"), rt.typeOf(rt.gRound(rt.vector3iNew([rt.V.int((-1)), rt.V.int(2), rt.V.int((-3))]), "auto")), rt.V.str("|"), rt.gRound(rt.vector3iNew([rt.V.int((-1)), rt.V.int(2), rt.V.int((-3))]), "auto")]));
      rt.frameLine(20);
      print(rt.showArgs([rt.V.str("C16|"), rt.typeOf(rt.gSign(rt.vector2New([rt.V.float((-1.5)), rt.V.int(2)]))), rt.V.str("|"), rt.gSign(rt.vector2New([rt.V.float((-1.5)), rt.V.int(2)]))]));
      rt.frameLine(21);
      print(rt.showArgs([rt.V.str("C17|"), rt.typeOf(rt.gSign(rt.vector2iNew([rt.V.int((-1)), rt.V.int(2)]))), rt.V.str("|"), rt.gSign(rt.vector2iNew([rt.V.int((-1)), rt.V.int(2)]))]));
      rt.frameLine(22);
      print(rt.showArgs([rt.V.str("C18|"), rt.typeOf(rt.gSign(rt.vector3New([rt.V.float((-1.5)), rt.V.int(2), rt.V.int((-3))]))), rt.V.str("|"), rt.gSign(rt.vector3New([rt.V.float((-1.5)), rt.V.int(2), rt.V.int((-3))]))]));
      rt.frameLine(23);
      print(rt.showArgs([rt.V.str("C19|"), rt.typeOf(rt.gSign(rt.vector3iNew([rt.V.int((-1)), rt.V.int(2), rt.V.int((-3))]))), rt.V.str("|"), rt.gSign(rt.vector3iNew([rt.V.int((-1)), rt.V.int(2), rt.V.int((-3))]))]));
      rt.frameLine(24);
      print(rt.showArgs([rt.V.str("C20|"), rt.typeOf(rt.gSnapped(rt.vector2New([rt.V.float((-1.5)), rt.V.int(2)]), rt.vector2New([rt.V.int(1), rt.V.int(1)]))), rt.V.str("|"), rt.gSnapped(rt.vector2New([rt.V.float((-1.5)), rt.V.int(2)]), rt.vector2New([rt.V.int(1), rt.V.int(1)]))]));
      rt.frameLine(25);
      print(rt.showArgs([rt.V.str("C21|"), rt.typeOf(rt.gSnapped(rt.vector3New([rt.V.float((-1.5)), rt.V.int(2), rt.V.int((-3))]), rt.vector3New([rt.V.int(1), rt.V.int(1), rt.V.int(1)]))), rt.V.str("|"), rt.gSnapped(rt.vector3New([rt.V.float((-1.5)), rt.V.int(2), rt.V.int((-3))]), rt.vector3New([rt.V.int(1), rt.V.int(1), rt.V.int(1)]))]));
      rt.frameLine(26);
      print(rt.showArgs([rt.V.str("C22|"), rt.typeOf(rt.gLerp(rt.vector2New([rt.V.int((-1)), rt.V.int(0)]), rt.vector2New([rt.V.int(3), rt.V.int(8)]), rt.V.float(0.25))), rt.V.str("|"), rt.gLerp(rt.vector2New([rt.V.int((-1)), rt.V.int(0)]), rt.vector2New([rt.V.int(3), rt.V.int(8)]), rt.V.float(0.25))]));
      rt.frameLine(27);
      print(rt.showArgs([rt.V.str("C23|"), rt.typeOf(rt.gLerp(rt.vector3New([rt.V.int((-1)), rt.V.int(0), rt.V.int(2)]), rt.vector3New([rt.V.int(3), rt.V.int(8), rt.V.int((-2))]), rt.V.float(0.25))), rt.V.str("|"), rt.gLerp(rt.vector3New([rt.V.int((-1)), rt.V.int(0), rt.V.int(2)]), rt.vector3New([rt.V.int(3), rt.V.int(8), rt.V.int((-2))]), rt.V.float(0.25))]));
      rt.frameLine(28);
      print(rt.showArgs([rt.V.str("C24|"), rt.typeOf(rt.gLerp(rt.colorNew([rt.V.int(0), rt.V.int(0), rt.V.int(0), rt.V.int(1)]), rt.colorNew([rt.V.int(1), rt.V.float(0.5), rt.V.float(0.25), rt.V.float(0.5)]), rt.V.float(0.5))), rt.V.str("|"), rt.gLerp(rt.colorNew([rt.V.int(0), rt.V.int(0), rt.V.int(0), rt.V.int(1)]), rt.colorNew([rt.V.int(1), rt.V.float(0.5), rt.V.float(0.25), rt.V.float(0.5)]), rt.V.float(0.5))]));
      rt.frameLine(29);
      print(rt.showArgs([rt.V.str("C25|"), rt.typeOf(rt.gLerp(rt.vector2New([rt.V.int(0), rt.V.int(0)]), rt.vector2New([rt.V.int(4), rt.V.int(8)]), rt.V.float(2.5))), rt.V.str("|"), rt.gLerp(rt.vector2New([rt.V.int(0), rt.V.int(0)]), rt.vector2New([rt.V.int(4), rt.V.int(8)]), rt.V.float(2.5))]));
      rt.frameLine(30);
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
