// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../packages/runtime/src/runtime/index";
import { print, printJoined, printRaw, printErr, printVerbose, printRich, printDebug, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
    override _initialize(): Promise<void> { return this.__gd__initialize(); }
  async __gd__initialize(): Promise<void> {
    print(rt.showArgs([rt.V.str("C00|"), rt.typeOf(rt.abs(rt.vector2New([rt.V.float((-1.5)), rt.V.int(2)]))), rt.V.str("|"), rt.abs(rt.vector2New([rt.V.float((-1.5)), rt.V.int(2)]))]));
    print(rt.showArgs([rt.V.str("C01|"), rt.typeOf(rt.abs(rt.vector2iNew([rt.V.int((-1)), rt.V.int(2)]))), rt.V.str("|"), rt.abs(rt.vector2iNew([rt.V.int((-1)), rt.V.int(2)]))]));
    print(rt.showArgs([rt.V.str("C02|"), rt.typeOf(rt.abs(rt.vector3New([rt.V.float((-1.5)), rt.V.int(2), rt.V.int((-3))]))), rt.V.str("|"), rt.abs(rt.vector3New([rt.V.float((-1.5)), rt.V.int(2), rt.V.int((-3))]))]));
    print(rt.showArgs([rt.V.str("C03|"), rt.typeOf(rt.abs(rt.vector3iNew([rt.V.int((-1)), rt.V.int(2), rt.V.int((-3))]))), rt.V.str("|"), rt.abs(rt.vector3iNew([rt.V.int((-1)), rt.V.int(2), rt.V.int((-3))]))]));
    print(rt.showArgs([rt.V.str("C04|"), rt.typeOf(rt.gCeil(rt.vector2New([rt.V.float((-1.5)), rt.V.int(2)]), "auto")), rt.V.str("|"), rt.gCeil(rt.vector2New([rt.V.float((-1.5)), rt.V.int(2)]), "auto")]));
    print(rt.showArgs([rt.V.str("C05|"), rt.typeOf(rt.gCeil(rt.vector2iNew([rt.V.int((-1)), rt.V.int(2)]), "auto")), rt.V.str("|"), rt.gCeil(rt.vector2iNew([rt.V.int((-1)), rt.V.int(2)]), "auto")]));
    print(rt.showArgs([rt.V.str("C06|"), rt.typeOf(rt.gCeil(rt.vector3New([rt.V.float((-1.5)), rt.V.int(2), rt.V.int((-3))]), "auto")), rt.V.str("|"), rt.gCeil(rt.vector3New([rt.V.float((-1.5)), rt.V.int(2), rt.V.int((-3))]), "auto")]));
    print(rt.showArgs([rt.V.str("C07|"), rt.typeOf(rt.gCeil(rt.vector3iNew([rt.V.int((-1)), rt.V.int(2), rt.V.int((-3))]), "auto")), rt.V.str("|"), rt.gCeil(rt.vector3iNew([rt.V.int((-1)), rt.V.int(2), rt.V.int((-3))]), "auto")]));
    print(rt.showArgs([rt.V.str("C08|"), rt.typeOf(rt.gFloor(rt.vector2New([rt.V.float((-1.5)), rt.V.int(2)]), "auto")), rt.V.str("|"), rt.gFloor(rt.vector2New([rt.V.float((-1.5)), rt.V.int(2)]), "auto")]));
    print(rt.showArgs([rt.V.str("C09|"), rt.typeOf(rt.gFloor(rt.vector2iNew([rt.V.int((-1)), rt.V.int(2)]), "auto")), rt.V.str("|"), rt.gFloor(rt.vector2iNew([rt.V.int((-1)), rt.V.int(2)]), "auto")]));
    print(rt.showArgs([rt.V.str("C10|"), rt.typeOf(rt.gFloor(rt.vector3New([rt.V.float((-1.5)), rt.V.int(2), rt.V.int((-3))]), "auto")), rt.V.str("|"), rt.gFloor(rt.vector3New([rt.V.float((-1.5)), rt.V.int(2), rt.V.int((-3))]), "auto")]));
    print(rt.showArgs([rt.V.str("C11|"), rt.typeOf(rt.gFloor(rt.vector3iNew([rt.V.int((-1)), rt.V.int(2), rt.V.int((-3))]), "auto")), rt.V.str("|"), rt.gFloor(rt.vector3iNew([rt.V.int((-1)), rt.V.int(2), rt.V.int((-3))]), "auto")]));
    print(rt.showArgs([rt.V.str("C12|"), rt.typeOf(rt.gRound(rt.vector2New([rt.V.float((-1.5)), rt.V.int(2)]), "auto")), rt.V.str("|"), rt.gRound(rt.vector2New([rt.V.float((-1.5)), rt.V.int(2)]), "auto")]));
    print(rt.showArgs([rt.V.str("C13|"), rt.typeOf(rt.gRound(rt.vector2iNew([rt.V.int((-1)), rt.V.int(2)]), "auto")), rt.V.str("|"), rt.gRound(rt.vector2iNew([rt.V.int((-1)), rt.V.int(2)]), "auto")]));
    print(rt.showArgs([rt.V.str("C14|"), rt.typeOf(rt.gRound(rt.vector3New([rt.V.float((-1.5)), rt.V.int(2), rt.V.int((-3))]), "auto")), rt.V.str("|"), rt.gRound(rt.vector3New([rt.V.float((-1.5)), rt.V.int(2), rt.V.int((-3))]), "auto")]));
    print(rt.showArgs([rt.V.str("C15|"), rt.typeOf(rt.gRound(rt.vector3iNew([rt.V.int((-1)), rt.V.int(2), rt.V.int((-3))]), "auto")), rt.V.str("|"), rt.gRound(rt.vector3iNew([rt.V.int((-1)), rt.V.int(2), rt.V.int((-3))]), "auto")]));
    print(rt.showArgs([rt.V.str("C16|"), rt.typeOf(rt.gSign(rt.vector2New([rt.V.float((-1.5)), rt.V.int(2)]))), rt.V.str("|"), rt.gSign(rt.vector2New([rt.V.float((-1.5)), rt.V.int(2)]))]));
    print(rt.showArgs([rt.V.str("C17|"), rt.typeOf(rt.gSign(rt.vector2iNew([rt.V.int((-1)), rt.V.int(2)]))), rt.V.str("|"), rt.gSign(rt.vector2iNew([rt.V.int((-1)), rt.V.int(2)]))]));
    print(rt.showArgs([rt.V.str("C18|"), rt.typeOf(rt.gSign(rt.vector3New([rt.V.float((-1.5)), rt.V.int(2), rt.V.int((-3))]))), rt.V.str("|"), rt.gSign(rt.vector3New([rt.V.float((-1.5)), rt.V.int(2), rt.V.int((-3))]))]));
    print(rt.showArgs([rt.V.str("C19|"), rt.typeOf(rt.gSign(rt.vector3iNew([rt.V.int((-1)), rt.V.int(2), rt.V.int((-3))]))), rt.V.str("|"), rt.gSign(rt.vector3iNew([rt.V.int((-1)), rt.V.int(2), rt.V.int((-3))]))]));
    print(rt.showArgs([rt.V.str("C20|"), rt.typeOf(rt.gSnapped(rt.vector2New([rt.V.float((-1.5)), rt.V.int(2)]), rt.vector2New([rt.V.int(1), rt.V.int(1)]))), rt.V.str("|"), rt.gSnapped(rt.vector2New([rt.V.float((-1.5)), rt.V.int(2)]), rt.vector2New([rt.V.int(1), rt.V.int(1)]))]));
    print(rt.showArgs([rt.V.str("C21|"), rt.typeOf(rt.gSnapped(rt.vector3New([rt.V.float((-1.5)), rt.V.int(2), rt.V.int((-3))]), rt.vector3New([rt.V.int(1), rt.V.int(1), rt.V.int(1)]))), rt.V.str("|"), rt.gSnapped(rt.vector3New([rt.V.float((-1.5)), rt.V.int(2), rt.V.int((-3))]), rt.vector3New([rt.V.int(1), rt.V.int(1), rt.V.int(1)]))]));
    print(rt.showArgs([rt.V.str("C22|"), rt.typeOf(rt.gLerp(rt.vector2New([rt.V.int((-1)), rt.V.int(0)]), rt.vector2New([rt.V.int(3), rt.V.int(8)]), rt.V.float(0.25))), rt.V.str("|"), rt.gLerp(rt.vector2New([rt.V.int((-1)), rt.V.int(0)]), rt.vector2New([rt.V.int(3), rt.V.int(8)]), rt.V.float(0.25))]));
    print(rt.showArgs([rt.V.str("C23|"), rt.typeOf(rt.gLerp(rt.vector3New([rt.V.int((-1)), rt.V.int(0), rt.V.int(2)]), rt.vector3New([rt.V.int(3), rt.V.int(8), rt.V.int((-2))]), rt.V.float(0.25))), rt.V.str("|"), rt.gLerp(rt.vector3New([rt.V.int((-1)), rt.V.int(0), rt.V.int(2)]), rt.vector3New([rt.V.int(3), rt.V.int(8), rt.V.int((-2))]), rt.V.float(0.25))]));
    print(rt.showArgs([rt.V.str("C24|"), rt.typeOf(rt.gLerp(rt.colorNew([rt.V.int(0), rt.V.int(0), rt.V.int(0), rt.V.int(1)]), rt.colorNew([rt.V.int(1), rt.V.float(0.5), rt.V.float(0.25), rt.V.float(0.5)]), rt.V.float(0.5))), rt.V.str("|"), rt.gLerp(rt.colorNew([rt.V.int(0), rt.V.int(0), rt.V.int(0), rt.V.int(1)]), rt.colorNew([rt.V.int(1), rt.V.float(0.5), rt.V.float(0.25), rt.V.float(0.5)]), rt.V.float(0.5))]));
    print(rt.showArgs([rt.V.str("C25|"), rt.typeOf(rt.gLerp(rt.vector2New([rt.V.int(0), rt.V.int(0)]), rt.vector2New([rt.V.int(4), rt.V.int(8)]), rt.V.float(2.5))), rt.V.str("|"), rt.gLerp(rt.vector2New([rt.V.int(0), rt.V.int(0)]), rt.vector2New([rt.V.int(4), rt.V.int(8)]), rt.V.float(2.5))]));
    this.quit();
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
